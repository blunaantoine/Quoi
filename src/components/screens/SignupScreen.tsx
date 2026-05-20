'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

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

  const handleSignup = async () => {
    // Validation
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
        return
      }

      toast('Compte créé avec succès ! 🎉')
      setLoggedIn(true)
    } catch {
      // If API fails, allow demo signup
      toast('Compte démo créé ! 🚀')
      setLoggedIn(true)
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Rejoignez-nous ! 🚀
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Créez votre compte et accédez à des milliers d&apos;opportunités
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          {/* Display Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Marie Dupont"
                className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 pl-11 focus:border-primary/60"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Nom d&apos;utilisateur
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="marie_dupont"
                className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 pl-11 focus:border-primary/60"
              />
            </div>
            {username && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Votre profil : oqui.app/{username}
              </p>
            )}
          </div>

          {/* Email */}
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
              />
            </div>
          </div>

          {/* Password */}
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                        i <= strength.level ? strength.color : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Force : <span className="font-medium">{strength.text}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 pl-11 focus:border-primary/60"
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
                  ? 'bg-primary border-primary'
                  : 'border-border bg-card'
              }`}
            >
              {acceptTerms && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              J&apos;accepte les{' '}
              <span className="text-primary font-medium">Conditions d&apos;utilisation</span>{' '}
              et la{' '}
              <span className="text-primary font-medium">Politique de confidentialité</span>
            </p>
          </button>
        </div>

        {/* Signup Button */}
        <Button
          onClick={handleSignup}
          disabled={isLoading || !acceptTerms}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-2xl h-12 text-base gap-2 lime-glow disabled:opacity-50 disabled:cursor-not-allowed"
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
        </Button>

        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <button
              onClick={() => setAuthView('login')}
              className="text-primary hover:underline font-semibold"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
