import { createHash, randomInt } from 'crypto'
import { db } from '@/lib/db'
import { sendOtpEmail } from '@/lib/email'

// ─── OTP Configuration ─────────────────────────────────────────────

const OTP_EXPIRY_MINUTES = 5
const OTP_LENGTH = 6

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure numeric OTP code.
 */
export function createOtp(length: number = OTP_LENGTH): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += randomInt(0, 10).toString()
  }
  return code
}

/**
 * Hash a string with SHA-256.
 */
export function hashSha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

// ─── In-memory store for demo/simulation mode ───────────────────────
// When DB is not available, we store OTPs in memory

const memoryOtpStore = new Map<string, { codeHash: string; expiresAt: Date; purpose: string }>()

// ─── Send OTP ───────────────────────────────────────────────────────

// ─── Blocked email domains ─────────────────────────────────────────────
// Common test/fake domains that should not receive OTP emails

const BLOCKED_DOMAINS = [
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'fake.com',
  'invalid.com',
  'localhost',
  'localhost.com',
]

/**
 * Check if an email domain is valid (not a known fake/test domain).
 */
function isEmailDomainValid(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  if (BLOCKED_DOMAINS.includes(domain)) return false
  return true
}

interface SendOtpResult {
  success: boolean
  plainCode?: string  // Only included in simulation mode
  message?: string
  simulated?: boolean
}

/**
 * Generate and send an OTP code for a given email and purpose.
 * Returns the plain code only in simulation mode.
 * Rejects known fake/test email domains.
 */
export async function initiateOtp(
  email: string,
  purpose: 'login' | 'email_verification' | 'password_reset'
): Promise<SendOtpResult> {
  // Validate email domain
  if (!isEmailDomainValid(email)) {
    return {
      success: false,
      message: 'Veuillez utiliser une adresse email valide (domaine non autorisé).',
    }
  }
  const code = createOtp()
  const codeHash = hashSha256(code)
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000)

  // Try to store in database
  try {
    // Invalidate any previous unused OTPs for this email+purpose
    await db.otpCode.updateMany({
      where: { email, purpose, isUsed: false },
      data: { isUsed: true },
    })

    await db.otpCode.create({
      data: {
        email,
        codeHash,
        purpose,
        expiresAt,
      },
    })
  } catch {
    // Fallback to in-memory store
    const key = `${email}:${purpose}`
    memoryOtpStore.set(key, { codeHash, expiresAt, purpose })
  }

  // Send the email
  const emailResult = await sendOtpEmail({
    to: email,
    code,
    purpose,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  })

  const isSimulation = emailResult.simulated

  return {
    success: true,
    plainCode: isSimulation ? code : undefined,
    message: isSimulation
      ? emailResult.message
      : `Code OTP envoyé à ${email}`,
    simulated: isSimulation,
  }
}

// ─── Verify OTP ─────────────────────────────────────────────────────

interface VerifyOtpResult {
  valid: boolean
  error?: string
}

/**
 * Verify an OTP code entered by the user.
 * If `consume` is false, the OTP is checked but NOT marked as used.
 * This is useful for multi-step flows like password reset where the OTP
 * needs to be verified first, then used again when actually resetting.
 */
export async function verifyOtp(
  email: string,
  code: string,
  purpose: 'login' | 'email_verification' | 'password_reset',
  consume: boolean = true
): Promise<VerifyOtpResult> {
  const codeHash = hashSha256(code)
  const now = new Date()

  // Try database first
  try {
    const otpRecord = await db.otpCode.findFirst({
      where: {
        email,
        purpose,
        isUsed: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      return { valid: false, error: 'Code expiré ou invalide. Demandez un nouveau code.' }
    }

    if (otpRecord.codeHash !== codeHash) {
      return { valid: false, error: 'Code incorrect. Veuillez réessayer.' }
    }

    // Mark as used only if consume is true
    if (consume) {
      await db.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      })
    }

    return { valid: true }
  } catch {
    // Fallback to in-memory store
    const key = `${email}:${purpose}`
    const stored = memoryOtpStore.get(key)

    if (!stored) {
      return { valid: false, error: 'Code expiré ou invalide. Demandez un nouveau code.' }
    }

    if (stored.expiresAt < now) {
      memoryOtpStore.delete(key)
      return { valid: false, error: 'Code expiré. Demandez un nouveau code.' }
    }

    if (stored.codeHash !== codeHash) {
      return { valid: false, error: 'Code incorrect. Veuillez réessayer.' }
    }

    if (consume) {
      memoryOtpStore.delete(key)
    }
    return { valid: true }
  }
}

// ─── Complete OTP Login ─────────────────────────────────────────────

interface CompleteOtpLoginResult {
  success: boolean
  user?: {
    id: string
    email: string
    username: string
    displayName: string
    avatar: string
    isVerified: boolean
    role: string
  }
  token?: string
  error?: string
}

/**
 * After OTP verification, fetch the user and generate a session token.
 */
export async function completeOtpLogin(email: string): Promise<CompleteOtpLoginResult> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      include: { profile: true },
    })

    if (!user) {
      return { success: false, error: 'Aucun compte trouvé avec cet email.' }
    }

    if (!user.isActive || user.isBanned) {
      return { success: false, error: 'Compte désactivé ou banni.' }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.profile?.displayName || user.username,
        avatar: user.profile?.avatar || '',
        isVerified: user.isVerified,
        role: user.role,
      },
      token: `token_${user.id}_${Date.now()}`,
    }
  } catch {
    // Demo fallback
    return {
      success: true,
      user: {
        id: 'demo_user',
        email,
        username: email.split('@')[0],
        displayName: email.split('@')[0],
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
        isVerified: false,
        role: 'user',
      },
      token: `demo_token_${Date.now()}`,
    }
  }
}

// ─── Reset Password After OTP ───────────────────────────────────────

interface ResetPasswordResult {
  success: boolean
  error?: string
}

/**
 * Reset a user's password after OTP verification for password_reset purpose.
 */
export async function resetPassword(email: string, newPassword: string): Promise<ResetPasswordResult> {
  const hashedPassword = hashSha256(newPassword)

  try {
    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return { success: false, error: 'Aucun compte trouvé avec cet email.' }
    }

    await db.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la réinitialisation.' }
  }
}
