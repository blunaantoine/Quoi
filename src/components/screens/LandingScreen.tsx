'use client'

import Image from 'next/image'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export default function LandingScreen() {
  const { setAuthView } = useAppStore()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/40 animate-float" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-primary/30 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-2.5 h-2.5 rounded-full bg-primary/20 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        {/* Logo & Title */}
        <div className="relative z-10 text-center mb-12 animate-fade-slide-in">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-8">
            <Image
              src="/oqui-logo.png"
              alt="OQUI Logo"
              width={128}
              height={128}
              className="w-full h-full object-contain drop-shadow-[0_0_24px_rgba(209,245,80,0.3)]"
              priority
            />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            O<span className="gradient-text">QUI</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Le réseau social qui connecte les talents aux opportunités
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="relative z-10 w-full max-w-sm space-y-3 animate-fade-slide-in" style={{ animationDelay: '200ms' }}>
          <Button
            onClick={() => setAuthView('signup')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-2xl h-13 text-base gap-2 lime-glow"
          >
            <Sparkles className="w-5 h-5" />
            Créer un compte
          </Button>
          <Button
            onClick={() => setAuthView('login')}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-secondary hover:border-primary/30 font-semibold rounded-2xl h-12 text-base gap-2"
          >
            Se connecter
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Terms */}
        <p className="relative z-10 text-[11px] text-muted-foreground text-center mt-8 max-w-xs leading-relaxed">
          En continuant, vous acceptez nos{' '}
          <span className="text-primary cursor-pointer hover:underline">Conditions d&apos;utilisation</span>{' '}
          et notre{' '}
          <span className="text-primary cursor-pointer hover:underline">Politique de confidentialité</span>
        </p>
      </div>

      {/* Bottom decoration */}
      <div className="px-6 pb-8 pt-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
          <Image src="/oqui-logo.png" alt="OQUI" width={16} height={16} className="opacity-60" />
          <span className="text-xs font-medium">OQUI — L&apos;avenir vous attend</span>
        </div>
      </div>
    </div>
  )
}
