import { NextRequest, NextResponse } from 'next/server'
import { initiateOtp, verifyOtp } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * POST /api/v1/auth/verify-email
 *
 * Actions:
 *  - send:   Send an email verification OTP to a newly registered user
 *  - verify: Verify the OTP code and mark user as verified
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, code } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 })
    }

    // ─── SEND VERIFICATION OTP ──────────────────────────────────
    if (action === 'send') {
      const result = await initiateOtp(email, 'email_verification')

      if (!result.success) {
        return NextResponse.json({ error: result.message || 'Erreur lors de l\'envoi du code.' }, { status: 400 })
      }

      return NextResponse.json({
        success: result.success,
        message: result.message || 'Code de vérification envoyé.',
        simulated: result.simulated,
        ...(result.simulated && result.plainCode ? { plain_code: result.plainCode } : {}),
      })
    }

    // ─── VERIFY EMAIL OTP ───────────────────────────────────────
    if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ error: 'Code OTP requis.' }, { status: 400 })
      }

      const verifyResult = await verifyOtp(email, code, 'email_verification')

      if (!verifyResult.valid) {
        return NextResponse.json({ error: verifyResult.error }, { status: 400 })
      }

      // Mark user as verified in database
      try {
        await db.user.update({
          where: { email },
          data: { isVerified: true },
        })
      } catch {
        // If DB not available, just continue
      }

      return NextResponse.json({
        verified: true,
        message: 'Email vérifié avec succès.',
      })
    }

    return NextResponse.json({ error: 'Action invalide.' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/v1/auth/verify-email error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
