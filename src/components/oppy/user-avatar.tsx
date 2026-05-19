'use client';

import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OppUser } from '@/lib/mock-data';

export type AvatarSize = 'sm' | 'md' | 'lg';

interface UserAvatarProps {
  user: OppUser;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { ring: string; img: number; badge: number; online: string }> = {
  sm: { ring: 'h-8 w-8', img: 32, badge: 10, online: 'h-2.5 w-2.5 border-[1.5px]' },
  md: { ring: 'h-10 w-10', img: 40, badge: 14, online: 'h-3 w-3 border-2' },
  lg: { ring: 'h-14 w-14', img: 56, badge: 18, online: 'h-3.5 w-3.5 border-2' },
};

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const s = sizeMap[size];

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {/* Avatar ring */}
      <div
        className={cn(
          'relative rounded-full ring-2 ring-[#333333] overflow-hidden',
          s.ring
        )}
      >
        <Image
          src={user.avatar}
          alt={user.name}
          width={s.img}
          height={s.img}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>

      {/* Verified badge */}
      {user.verified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[#D1F550]"
          style={{ width: s.badge, height: s.badge }}
        >
          <BadgeCheck
            style={{ width: s.badge - 2, height: s.badge - 2 }}
            className="text-[#0A0A0A]"
            strokeWidth={3}
          />
        </span>
      )}

      {/* Online indicator */}
      {user.online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-emerald-500 border-[#1A1A1A]',
            s.online
          )}
        />
      )}
    </div>
  );
}
