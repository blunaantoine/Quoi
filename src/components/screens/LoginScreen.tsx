'use client'

import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Mail, Lock, LogIn, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export default function LoginScreen() {
  const { setAuthView, setLoggedIn } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
        return
      }

      toast('Connexion réussie ! 🎉')
      setLoggedIn(true)
    } catch {
      // If API fails, allow demo login
      toast('Connexion en mode démo')
      setLoggedIn(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    toast('Connexion démo activée ! 🚀')
    setLoggedIn(true)
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
      <div className="flex-1 px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Bon retour ! 👋
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
              onClick={() => toast('Réinitialisation bientôt disponible')}
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
          🚀 Essayer en mode démo
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
    </div>
  )
}
