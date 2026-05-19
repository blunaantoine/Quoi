'use client';

import { cn } from '@/lib/utils';
import { getCategory, type CategorySlug } from '@/lib/mock-data';

interface CategoryBadgeProps {
  category: CategorySlug;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const cat = getCategory(category);
  const Icon = cat.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        cat.color,
        cat.textColor,
        cat.borderColor,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {cat.label}
    </span>
  );
}
