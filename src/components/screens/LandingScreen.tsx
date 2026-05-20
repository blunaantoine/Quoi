'use client'

import Image from 'next/image'
import { useAppStore } from '@/lib/store'

export default function LandingScreen() {
  const { setAuthView } = useAppStore()

  return (
    <div className="min-h-screen bg-[#C8E84D] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-16 animate-fade-slide-in">
        {/* Logo in a slightly lighter square container */}
        <div className="w-36 h-36 rounded-3xl bg-[#D4F26A] flex items-center justify-center mb-4 shadow-sm">
          <Image
            src="/oqui-logo.png"
            alt="OQUI Logo"
            width={120}
            height={120}
            className="object-contain"
            priority
          />
        </div>

        {/* Brand text */}
        <h1 className="text-4xl font-black text-black tracking-tight">
          OQUI
        </h1>
      </div>

      {/* Buttons Section */}
      <div className="w-full max-w-sm space-y-3 animate-fade-slide-in" style={{ animationDelay: '150ms' }}>
        {/* Google Login Button */}
        <button
          onClick={() => setAuthView('login')}
          className="w-full flex items-center justify-center gap-3 bg-white rounded-2xl h-13 px-6 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Continuer avec Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-black/15" />
          <span className="text-xs text-black/40 font-medium">ou</span>
          <div className="flex-1 h-px bg-black/15" />
        </div>

        {/* Créer un compte - Black button */}
        <button
          onClick={() => setAuthView('signup')}
          className="w-full flex items-center justify-center bg-black text-white rounded-2xl h-13 px-6 shadow-md hover:bg-gray-900 transition-all active:scale-[0.98] font-semibold text-sm"
        >
          Créer un compte
        </button>

        {/* Se connecter - Outlined button */}
        <button
          onClick={() => setAuthView('login')}
          className="w-full flex items-center justify-center bg-transparent border-2 border-black text-black rounded-2xl h-13 px-6 hover:bg-black/5 transition-all active:scale-[0.98] font-semibold text-sm"
        >
          Se connecter
        </button>
      </div>

      {/* Terms */}
      <p className="text-[11px] text-black/50 text-center mt-8 max-w-xs leading-relaxed animate-fade-slide-in" style={{ animationDelay: '300ms' }}>
        En continuant, vous acceptez nos{' '}
        <span className="text-black/70 underline cursor-pointer">Conditions d&apos;utilisation</span>{' '}
        et notre{' '}
        <span className="text-black/70 underline cursor-pointer">Politique de confidentialité</span>
      </p>
    </div>
  )
}
