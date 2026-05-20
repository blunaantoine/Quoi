'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * TikTok-style verification badge — blue circle (#20D5EC) with white checkmark.
 * Identical to TikTok's certified account badge.
 */

export type VerifiedBadgeSize = 'xs' | 'sm' | 'md' | 'lg'

interface VerifiedBadgeProps {
  size?: VerifiedBadgeSize
  className?: string
}

const sizeMap: Record<VerifiedBadgeSize, { container: string; icon: string; shadow: string }> = {
  xs: { container: 'h-3.5 w-3.5', icon: 'h-2 w-2', shadow: 'shadow-[0_0_6px_rgba(32,213,236,0.25)]' },
  sm: { container: 'h-4 w-4', icon: 'h-2.5 w-2.5', shadow: 'shadow-[0_0_8px_rgba(32,213,236,0.3)]' },
  md: { container: 'h-5 w-5', icon: 'h-3 w-3', shadow: 'shadow-[0_0_8px_rgba(32,213,236,0.3)]' },
  lg: { container: 'h-7 w-7', icon: 'h-4 w-4', shadow: 'shadow-[0_0_12px_rgba(32,213,236,0.4)]' },
}

export function VerifiedBadge({ size = 'sm', className }: VerifiedBadgeProps) {
  const s = sizeMap[size]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0',
        // Premium gradient instead of flat blue
        'bg-gradient-to-br from-[#20D5EC] to-[#1BA8C4]',
        // Subtle glow shadow
        s.shadow,
        // White ring/border effect
        'ring-1 ring-white/20',
        s.container,
        className
      )}
    >
      <Check
        className={cn('text-white', s.icon)}
        strokeWidth={3}
      />
    </span>
  )
}
