'use client'

import { useState, useRef, useCallback } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  Loader2,
  ShieldCheck,
  KeyRound,
  Copy,
  RefreshCw,
  ArrowRight,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if all filled
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
          className="w-11 h-13 rounded-xl bg-card border border-border text-center text-lg font-bold text-foreground focus:border-primary/60 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}

// ─── Forgot Password Dialog ─────────────────────────────────────────

function ForgotPasswordDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'email' | 'otp' | 'new_password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for resend
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

  const handleSendOtp = useCallback(async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Veuillez entrer une adresse email valide')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast(data.error || 'Erreur lors de l\'envoi')
        return
      }

      if (data.plain_code) {
        setSimulatedCode(data.plain_code)
      } else {
        setSimulatedCode(null)
        toast('Code envoyé à votre adresse email')
      }

      setStep('otp')
      startCountdown()
    } catch {
      toast('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }, [email, startCountdown])

  const handleVerifyOtp = useCallback(async (code: string) => {
    setOtpCode(code)
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, code }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast(data.error || 'Code invalide')
        return
      }

      setStep('new_password')
    } catch {
      toast('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }, [email])

  const handleResetPassword = useCallback(async () => {
    if (newPassword.length < 6) {
      toast('Le mot de passe doit avoir au moins 6 caractères')
      return
    }
    if (newPassword !== confirmPassword) {
      toast('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', email, code: otpCode, newPassword }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast(data.error || 'Erreur lors de la réinitialisation')
        return
      }

      setStep('success')
      toast('Mot de passe réinitialisé avec succès')
    } catch {
      toast('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }, [email, otpCode, newPassword, confirmPassword])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-x-0 top-1/2 left-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md animate-scale-up">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Mot de passe oublié</h3>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Step: Email */}
            {step === 'email' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Entrez l&apos;adresse email associée à votre compte. Nous vous enverrons un code de vérification.
                </p>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 pl-11 focus:border-primary/60"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  />
                </div>
                <Button
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl h-11 gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  Envoyer le code
                </Button>
              </div>
            )}

            {/* Step: OTP */}
            {step === 'otp' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Entrez le code à 6 chiffres envoyé à <span className="text-foreground font-medium">{email}</span>
                </p>

                {/* Simulation mode: show code */}
                {simulatedCode && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-2">
                    <p className="text-xs text-amber-400 font-medium text-center">
                      Mode simulation — Code OTP
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-amber-300 tracking-widest">{simulatedCode}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(simulatedCode)
                          toast('Code copié')
                        }}
                        className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <OtpInput onComplete={handleVerifyOtp} />

                {isLoading && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={countdown > 0 ? undefined : handleSendOtp}
                    disabled={countdown > 0 || isLoading}
                    className="text-xs text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step: New Password */}
            {step === 'new_password' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Code vérifié. Définissez votre nouveau mot de passe.
                </p>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 pl-11 pr-11 focus:border-primary/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 pl-11 focus:border-primary/60"
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                  />
                </div>
                <Button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl h-11 gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Réinitialiser
                </Button>
              </div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-foreground">Mot de passe réinitialisé</h4>
                <p className="text-sm text-muted-foreground">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <Button
                  onClick={onClose}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl h-11 gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main Login Screen ─────────────────────────────────────────────

export default function LoginScreen() {
  const { setAuthView, setLoggedIn } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // OTP verification state
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Forgot password dialog
  const [showForgotPassword, setShowForgotPassword] = useState(false)

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

  // Step 1: Login with email + password
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast('Veuillez remplir tous les champs')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast(data.error || 'Erreur de connexion')
        setIsLoading(false)
        return
      }

      // After successful password check, send OTP
      await sendLoginOtp()
    } catch {
      // If API fails, send OTP in demo mode
      await sendLoginOtp()
    }
  }

  // Step 2: Send OTP for login verification
  const sendLoginOtp = async () => {
    try {
      const otpResponse = await fetch('/api/v1/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email, purpose: 'login' }),
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
        toast('Code OTP envoyé à votre adresse email')
      }

      setShowOtpStep(true)
      startCountdown()
    } catch {
      toast('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Verify OTP and complete login
  const handleVerifyOtp = async (code: string) => {
    setIsVerifying(true)
    try {
      const response = await fetch('/api/v1/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, code, purpose: 'login' }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast(data.error || 'Code invalide')
        return
      }

      toast('Connexion réussie')
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
      const response = await fetch('/api/v1/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email, purpose: 'login' }),
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

  // Demo login
  const handleDemoLogin = () => {
    toast('Connexion démo activée')
    setLoggedIn(true)
  }

  // ─── OTP Verification Step ──────────────────────────────────────
  if (showOtpStep) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => {
              setShowOtpStep(false)
              setSimulatedCode(null)
            }}
            className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8">
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              Vérification
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Entrez le code à 6 chiffres envoyé à <span className="text-foreground font-medium">{email}</span>
            </p>
          </div>

          {/* Simulation mode: show code in yellow box */}
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
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Resend */}
          <div className="flex justify-center">
            <button
              onClick={handleResendOtp}
              disabled={countdown > 0 || isVerifying}
              className="text-sm text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {countdown > 0 ? `Renvoyer le code dans ${countdown}s` : 'Renvoyer le code'}
            </button>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Skip verification (demo) */}
          <Button
            onClick={handleDemoLogin}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-secondary hover:border-primary/30 font-semibold rounded-2xl h-11 text-sm"
          >
            Passer en mode démo
          </Button>
        </div>
      </div>
    )
  }

  // ─── Login Form ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => setAuthView('landing')}
          className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Bon retour
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Connectez-vous pour découvrir les meilleures opportunités
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 pl-11 focus:border-primary/60"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 pl-11 pr-11 focus:border-primary/60"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </div>

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-2xl h-12 text-base gap-2 lime-glow disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Connexion...
            </span>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Se connecter
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Demo Login */}
        <Button
          onClick={handleDemoLogin}
          variant="outline"
          className="w-full border-border text-foreground hover:bg-secondary hover:border-primary/30 font-semibold rounded-2xl h-11 text-sm"
        >
          Essayer en mode démo
        </Button>

        {/* Sign up link */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <button
              onClick={() => setAuthView('signup')}
              className="text-primary hover:underline font-semibold"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotPassword && (
        <ForgotPasswordDialog onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  )
}
