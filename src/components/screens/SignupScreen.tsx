'use client'

import { useState, useCallback, useRef } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AtSign,
  UserPlus,
  Loader2,
  Check,
  ShieldCheck,
  Copy,
  RefreshCw,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// ─── OTP Input Component ─────────────────────────────────────────────

function OtpInput({ length = 6, onComplete }: { length?: number; onComplete: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newValues = [...values]
    newValues[index] = value.slice(-1)
    setValues(newValues)
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    if (newValues.every((v) => v !== '')) {
      onComplete(newValues.join(''))
    }
  }, [values, length, onComplete])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }, [values])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (paste.length === length) {
      const newValues = paste.split('')
      setValues(newValues)
      onComplete(paste)
      inputRefs.current[length - 1]?.focus()
    }
  }, [length, onComplete])

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-13 rounded-xl bg-white/80 border border-black/10 text-center text-lg font-bold text-black focus:border-black/30 focus:ring-1 focus:ring-black/10 outline-none transition-all"
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}

// ─── Main Signup Screen ─────────────────────────────────────────────

export default function SignupScreen() {
  const { setAuthView, setLoggedIn } = useAppStore()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Email verification OTP state
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { level: 1, text: 'Faible', color: 'bg-red-500' }
    if (score <= 2) return { level: 2, text: 'Moyen', color: 'bg-amber-500' }
    if (score <= 3) return { level: 3, text: 'Bon', color: 'bg-sky-500' }
    return { level: 4, text: 'Fort', color: 'bg-green-500' }
  }

  const strength = getPasswordStrength()

  // Countdown timer for OTP resend
  const startCountdown = useCallback(() => {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // Step 1: Register account, then send email verification OTP
  const handleSignup = async () => {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      toast('Veuillez remplir tous les champs')
      return
    }

    if (username.length < 3) {
      toast('Le nom d\'utilisateur doit avoir au moins 3 caractères')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et _')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Adresse email invalide')
      return
    }

    // Check for obviously fake email domains
    const blockedDomains = ['example.com', 'example.org', 'test.com', 'fake.com']
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain && blockedDomains.includes(domain)) {
      toast('Veuillez utiliser une adresse email valide')
      return
    }

    if (password.length < 6) {
      toast('Le mot de passe doit avoir au moins 6 caractères')
      return
    }

    if (password !== confirmPassword) {
      toast('Les mots de passe ne correspondent pas')
      return
    }

    if (!acceptTerms) {
      toast('Veuillez accepter les conditions d\'utilisation')
      return
    }

    setIsLoading(true)
    try {
      // Step 1: Create the account
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email,
          username,
          password,
          displayName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast(data.error || 'Erreur lors de l\'inscription')
        setIsLoading(false)
        return
      }

      // Step 2: Send email verification OTP
      await sendVerificationOtp()
    } catch {
      // If API fails, still try OTP
      await sendVerificationOtp()
    }
  }

  // Send email verification OTP
  const sendVerificationOtp = async () => {
    try {
      const otpResponse = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email }),
      })
      const otpData = await otpResponse.json()

      if (!otpResponse.ok) {
        toast(otpData.error || 'Erreur lors de l\'envoi du code')
        setIsLoading(false)
        return
      }

      if (otpData.plain_code) {
        setSimulatedCode(otpData.plain_code)
      } else {
        setSimulatedCode(null)
        toast('Code de vérification envoyé à votre adresse email')
      }

      setShowOtpVerification(true)
      startCountdown()
    } catch {
      toast('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify email OTP
  const handleVerifyOtp = async (code: string) => {
    setIsVerifying(true)
    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, code }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast(data.error || 'Code invalide')
        return
      }

      toast('Email vérifié avec succès')
      setLoggedIn(true)
    } catch {
      toast('Erreur de vérification')
    } finally {
      setIsVerifying(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return
    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email }),
      })
      const data = await response.json()

      if (data.plain_code) {
        setSimulatedCode(data.plain_code)
      } else {
        setSimulatedCode(null)
        toast('Nouveau code envoyé')
      }

      startCountdown()
    } catch {
      toast('Erreur de renvoi')
    }
  }

  // ─── OTP Verification Step ──────────────────────────────────────
  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-[#C8E84D] flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => {
              setShowOtpVerification(false)
              setSimulatedCode(null)
            }}
            className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8">
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-black/70" />
            </div>
            <h1 className="text-3xl font-extrabold text-black mb-2">
              Vérification email
            </h1>
            <p className="text-black/60 text-sm leading-relaxed">
              Entrez le code à 6 chiffres envoyé à <span className="text-black font-medium">{email}</span>
            </p>
          </div>

          {/* Simulation mode: show code */}
          {simulatedCode && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 space-y-2">
              <p className="text-xs text-amber-400 font-medium text-center">
                Mode simulation — Code OTP
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-bold text-amber-300 tracking-[0.3em] font-mono">
                  {simulatedCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(simulatedCode)
                    toast('Code copié')
                  }}
                  className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <OtpInput onComplete={handleVerifyOtp} />
          </div>

          {isVerifying && (
            <div className="flex justify-center py-3">
              <Loader2 className="w-6 h-6 animate-spin text-black" />
            </div>
          )}

          {/* Resend */}
          <div className="flex justify-center">
            <button
              onClick={handleResendOtp}
              disabled={countdown > 0 || isVerifying}
              className="text-sm text-black hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {countdown > 0 ? `Renvoyer le code dans ${countdown}s` : 'Renvoyer le code'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Signup Form ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#C8E84D] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => setAuthView('landing')}
          className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-black mb-2">
            Rejoignez-nous
          </h1>
          <p className="text-black/60 text-sm leading-relaxed">
            Créez votre compte et accédez à des milliers d&apos;opportunités
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          {/* Display Name */}
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black/40" />
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Marie Dupont"
                className="bg-white/80 border-black/10 text-black placeholder:text-black/40 rounded-xl h-12 pl-11 focus:border-black/30 focus:ring-1 focus:ring-black/10"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">
              Nom d&apos;utilisateur
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black/40" />
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="marie_dupont"
                className="bg-white/80 border-black/10 text-black placeholder:text-black/40 rounded-xl h-12 pl-11 focus:border-black/30 focus:ring-1 focus:ring-black/10"
              />
            </div>
            {username && (
              <p className="text-[11px] text-black/40 mt-1">
                Votre profil : oqui.app/{username}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black/40" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="bg-white/80 border-black/10 text-black placeholder:text-black/40 rounded-xl h-12 pl-11 focus:border-black/30 focus:ring-1 focus:ring-black/10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black/40" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/80 border-black/10 text-black placeholder:text-black/40 rounded-xl h-12 pl-11 pr-11 focus:border-black/30 focus:ring-1 focus:ring-black/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= strength.level ? strength.color : 'bg-black/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-black/40">
                  Force : <span className="font-medium text-black/60">{strength.text}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black/40" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/80 border-black/10 text-black placeholder:text-black/40 rounded-xl h-12 pl-11 focus:border-black/30 focus:ring-1 focus:ring-black/10"
              />
              {confirmPassword && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {password === confirmPassword ? (
                    <Check className="w-4.5 h-4.5 text-green-500" />
                  ) : (
                    <span className="text-xs text-red-400">✗</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          <button
            type="button"
            onClick={() => setAcceptTerms(!acceptTerms)}
            className="flex items-start gap-3 w-full text-left"
          >
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                acceptTerms
                  ? 'bg-black border-black'
                  : 'border-black/30 bg-white/50'
              }`}
            >
              {acceptTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <p className="text-xs text-black/60 leading-relaxed">
              J&apos;accepte les{' '}
              <span className="text-black font-medium">Conditions d&apos;utilisation</span>{' '}
              et la{' '}
              <span className="text-black font-medium">Politique de confidentialité</span>
            </p>
          </button>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          disabled={isLoading || !acceptTerms}
          className="w-full bg-black text-white rounded-2xl h-13 shadow-md hover:bg-gray-900 font-bold text-base gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Création du compte...
            </span>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Créer mon compte
            </>
          )}
        </button>

        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-sm text-black/60">
            Déjà un compte ?{' '}
            <button
              onClick={() => setAuthView('login')}
              className="text-black hover:underline font-semibold"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
