'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-16 text-center',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#262626] border border-[#333333]">
        <Icon className="h-8 w-8 text-[#A3A3A3]" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="max-w-xs text-sm text-[#A3A3A3]">{description}</p>
    </div>
  );
}
