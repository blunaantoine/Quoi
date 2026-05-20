'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import Image from 'next/image'
import { X, ExternalLink } from 'lucide-react'
import { mockAds } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'

// ─── Auto-close countdown duration (seconds) ─────────────────────

const AUTO_CLOSE_SECONDS = 5

// ─── AdOverlay (enhanced) ─────────────────────────────────────────

export function AdOverlay() {
  const { showAdOverlay, setShowAdOverlay, resetAdTimer } = useAppStore()
  const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS)
  const adIndexRef = useRef(Math.floor(Math.random() * mockAds.length))
  const hasOpenedRef = useRef(false)

  const currentAd = mockAds[adIndexRef.current % mockAds.length]

  const handleClose = useCallback(() => {
    setShowAdOverlay(false)
    resetAdTimer()
  }, [setShowAdOverlay, resetAdTimer])

  // Pick a new random ad each time the overlay opens
  if (showAdOverlay && !hasOpenedRef.current) {
    hasOpenedRef.current = true
    adIndexRef.current = Math.floor(Math.random() * mockAds.length)
  }

  if (!showAdOverlay && hasOpenedRef.current) {
    hasOpenedRef.current = false
  }

  // Auto-close countdown
  useEffect(() => {
    if (!showAdOverlay) {
      setCountdown(AUTO_CLOSE_SECONDS)
      return
    }
    setCountdown(AUTO_CLOSE_SECONDS)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showAdOverlay])

  // Close when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && showAdOverlay) {
      handleClose()
    }
  }, [countdown, showAdOverlay, handleClose])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose()
      }
    },
    [handleClose]
  )

  if (!showAdOverlay) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          aria-label="Fermer la publicité"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Countdown indicator ring */}
        <div className="absolute right-3 top-3 z-[5] pointer-events-none">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - countdown / AUTO_CLOSE_SECONDS)}`}
              className="stroke-primary transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>

        {/* Sponsorisé label */}
        <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sponsorisé
        </span>

        {/* Ad image */}
        <div className="relative h-64 w-full sm:h-72">
          <Image
            src={currentAd.image}
            alt={currentAd.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="px-5 pb-5 pt-2">
          <h3 className="mb-1 text-lg font-bold text-foreground">{currentAd.title}</h3>
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
            {currentAd.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Par {currentAd.sponsor}
            </span>

            <a
              href={currentAd.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {currentAd.ctaText}
            </a>
          </div>

          {/* Countdown text */}
          <p className="mt-3 text-center text-[11px] text-muted-foreground/60">
            Fermeture automatique dans {countdown}s
          </p>
        </div>
      </div>
    </div>
  )
}
