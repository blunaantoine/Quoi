'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useSyncExternalStore } from 'react'

// Hook to safely detect client-side mounting without triggering lint warnings
function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useHasMounted()

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return (
      <div className="flex items-center justify-between p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5" />
          <span className="text-sm text-foreground">Apparence</span>
        </div>
        <div className="relative w-11 h-6 rounded-full bg-muted" />
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <div className="flex items-center justify-between p-3 rounded-xl">
      <div className="flex items-center gap-3">
        {isDark ? (
          <Moon className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Sun className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="text-sm text-foreground">
          Mode {isDark ? 'sombre' : 'clair'}
        </span>
      </div>
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`relative w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-primary'}`}
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform flex items-center justify-center ${
            isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-primary-foreground" />
          ) : (
            <Sun className="w-3 h-3 text-primary" />
          )}
        </span>
      </button>
    </div>
  )
}
