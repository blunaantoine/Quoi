import { NextRequest, NextResponse } from 'next/server'
import { initiateOtp, verifyOtp, resetPassword } from '@/lib/auth'
import { hashSha256 } from '@/lib/auth'

/**
 * POST /api/v1/auth/forgot-password
 *
 * Actions:
 *  - send:   Generate and send a password reset OTP code
 *  - verify: Verify the OTP code
 *  - reset:  Reset the password after successful OTP verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, code, newPassword } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 })
    }

    // ─── SEND RESET OTP ──────────────────────────────────────────
    if (action === 'send') {
      const result = await initiateOtp(email, 'password_reset')

      if (!result.success) {
        return NextResponse.json({ error: result.message || 'Erreur lors de l\'envoi du code.' }, { status: 400 })
      }

      return NextResponse.json({
        success: result.success,
        message: result.message || 'Code de réinitialisation envoyé.',
        simulated: result.simulated,
        ...(result.simulated && result.plainCode ? { plain_code: result.plainCode } : {}),
      })
    }

    // ─── VERIFY RESET OTP ────────────────────────────────────────
    if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ error: 'Code OTP requis.' }, { status: 400 })
      }

      // Verify OTP without consuming it — it will be consumed during the "reset" step
      const verifyResult = await verifyOtp(email, code, 'password_reset', false)

      if (!verifyResult.valid) {
        return NextResponse.json({ error: verifyResult.error }, { status: 400 })
      }

      return NextResponse.json({
        verified: true,
        message: 'Code vérifié. Vous pouvez maintenant définir un nouveau mot de passe.',
      })
    }

    // ─── RESET PASSWORD ──────────────────────────────────────────
    if (action === 'reset') {
      if (!code || !newPassword) {
        return NextResponse.json({ error: 'Code OTP et nouveau mot de passe requis.' }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Le mot de passe doit avoir au moins 6 caractères.' }, { status: 400 })
      }

      // Verify AND consume the OTP — this is the final step
      const verifyResult = await verifyOtp(email, code, 'password_reset', true)

      if (!verifyResult.valid) {
        return NextResponse.json({ error: verifyResult.error }, { status: 400 })
      }

      const resetResult = await resetPassword(email, newPassword)

      if (!resetResult.success) {
        return NextResponse.json({ error: resetResult.error }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
      })
    }

    return NextResponse.json({ error: 'Action invalide.' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/v1/auth/forgot-password error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
