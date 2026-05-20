import nodemailer from 'nodemailer'

const GMAIL_USER = process.env.GMAIL_USER || ''
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || ''

// Reusable Gmail SMTP transporter
const transporter = GMAIL_USER && GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    })
  : null

interface SendOtpOptions {
  to: string
  code: string
  purpose: 'login' | 'email_verification' | 'password_reset'
  expiresInMinutes?: number
}

const SUBJECT_MAP: Record<string, string> = {
  login: 'Votre code de connexion OQUI',
  email_verification: 'Vérifiez votre adresse email — OQUI',
  password_reset: 'Réinitialisez votre mot de passe — OQUI',
}

const PURPOSE_LABEL: Record<string, string> = {
  login: 'connexion',
  email_verification: 'vérification de votre adresse email',
  password_reset: 'réinitialisation de votre mot de passe',
}

/**
 * Send an OTP code via email using Gmail SMTP.
 * If Gmail credentials are not configured, the function runs in simulation mode
 * and returns { simulated: true } instead of actually sending the email.
 */
export async function sendOtpEmail({ to, code, purpose, expiresInMinutes = 5 }: SendOtpOptions) {
  const subject = SUBJECT_MAP[purpose] || 'Votre code OQUI'
  const purposeLabel = PURPOSE_LABEL[purpose] || 'authentification'

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0A; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #D1F550 0%, #a8d926 100%); padding: 24px 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #0A0A0A; letter-spacing: -0.5px;">
          O<span style="color: #0A0A0A;">QUI</span>
        </h1>
      </div>

      <!-- Body -->
      <div style="padding: 32px; color: #f0f0f0;">
        <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">
          Bonjour,
        </p>
        <p style="margin: 0 0 24px; font-size: 14px; color: #a0a0a0; line-height: 1.6;">
          Vous avez demandé un code pour ${purposeLabel}. Voici votre code de vérification :
        </p>

        <!-- OTP Code -->
        <div style="background: #1a1a2e; border: 2px dashed #D1F550; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #D1F550; font-family: 'Courier New', monospace;">
            ${code}
          </span>
        </div>

        <p style="margin: 0 0 8px; font-size: 13px; color: #a0a0a0;">
          Ce code est valable pendant <strong style="color: #D1F550;">${expiresInMinutes} minutes</strong>.
        </p>
        <p style="margin: 0 0 0; font-size: 13px; color: #a0a0a0;">
          Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #111; padding: 16px 32px; text-align: center; border-top: 1px solid #1a1a2e;">
        <p style="margin: 0; font-size: 11px; color: #666;">
          OQUI — Le réseau social qui connecte les talents aux opportunités
        </p>
      </div>
    </div>
  `

  // Simulation mode: Gmail not configured
  if (!transporter) {
    console.log(`[OTP SIMULATION] Code for ${to}: ${code} (${purpose})`)
    return { simulated: true, message: 'Email non envoyé (mode simulation). Code affiché dans l\'app.' }
  }

  // Real email sending
  try {
    const info = await transporter.sendMail({
      from: `"OQUI" <${GMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    })

    console.log(`[OTP EMAIL] Sent to ${to} — MessageId: ${info.messageId}`)
    return { simulated: false, messageId: info.messageId }
  } catch (error) {
    console.error('[OTP EMAIL] Failed to send:', error)
    // Fall back to simulation if email fails
    return { simulated: true, message: 'Erreur d\'envoi, code affiché dans l\'app.' }
  }
}
