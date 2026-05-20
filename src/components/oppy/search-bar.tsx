'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher…',
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        'relative flex items-center rounded-full bg-[#262626] border border-[#333333] focus-within:border-[#D1F550]/60 transition-colors',
        className
      )}
    >
      <Search className="ml-3.5 h-4 w-4 shrink-0 text-[#A3A3A3]" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full bg-transparent px-3 text-sm text-white placeholder:text-[#A3A3A3] outline-none"
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#333333] text-[#A3A3A3] hover:bg-[#444444] hover:text-white transition-colors"
          aria-label="Effacer la recherche"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
