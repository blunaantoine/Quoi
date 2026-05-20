import { NextRequest, NextResponse } from 'next/server'
import { initiateOtp, verifyOtp, completeOtpLogin } from '@/lib/auth'

/**
 * POST /api/v1/auth/otp
 *
 * Actions:
 *  - send:   Generate and send an OTP code to the user's email
 *  - verify: Verify the OTP code entered by the user and complete login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, code, purpose: rawPurpose } = body

    const purpose = rawPurpose || 'login'

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 })
    }

    // ─── SEND OTP ─────────────────────────────────────────────────
    if (action === 'send') {
      const result = await initiateOtp(email, purpose)

      return NextResponse.json({
        success: result.success,
        message: result.message,
        simulated: result.simulated,
        // Include plain_code only in simulation mode (Gmail not configured)
        ...(result.simulated && result.plainCode ? { plain_code: result.plainCode } : {}),
      })
    }

    // ─── VERIFY OTP ───────────────────────────────────────────────
    if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ error: 'Code OTP requis.' }, { status: 400 })
      }

      const verifyResult = await verifyOtp(email, code, purpose)

      if (!verifyResult.valid) {
        return NextResponse.json({ error: verifyResult.error }, { status: 400 })
      }

      // If the purpose is login, also complete the login flow
      if (purpose === 'login') {
        const loginResult = await completeOtpLogin(email)

        if (!loginResult.success) {
          return NextResponse.json({ error: loginResult.error }, { status: 400 })
        }

        return NextResponse.json({
          verified: true,
          user: loginResult.user,
          token: loginResult.token,
        })
      }

      // For other purposes (email_verification, password_reset), just confirm verification
      return NextResponse.json({
        verified: true,
        message: 'Code vérifié avec succès.',
      })
    }

    return NextResponse.json({ error: 'Action invalide. Utilisez "send" ou "verify".' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/v1/auth/otp error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
