'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ExternalLink,
  MapPin,
  Clock,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryBadge } from './category-badge';
import { UserAvatar } from './user-avatar';
import { VerifiedBadge } from './verified-badge';
import type { OppPost } from '@/lib/mock-data';

interface OppCardProps {
  post: OppPost;
  className?: string;
}

// ─── Deadline countdown ───────────────────────────────────────────

function useDeadline(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { text: 'Expiré', urgent: true };
  const days = Math.floor(diff / 86_400_000);
  if (days > 30) {
    const months = Math.floor(days / 30);
    return { text: `${months} mois`, urgent: false };
  }
  if (days > 0) return { text: `${days}j`, urgent: days <= 5 };
  const hours = Math.floor(diff / 3_600_000);
  if (hours > 0) return { text: `${hours}h`, urgent: true };
  const mins = Math.floor(diff / 60_000);
  return { text: `${mins}m`, urgent: true };
}

// ─── Tag badges ───────────────────────────────────────────────────

const tagConfig: Record<string, { icon: typeof Sparkles; color: string; textColor: string }> = {
  Nouveau: { icon: Sparkles, color: 'bg-primary/20', textColor: 'text-primary' },
  Urgent: { icon: Zap, color: 'bg-red-500/20', textColor: 'text-red-400' },
  Vérifié: { icon: CheckCircle2, color: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
};

// ─── Mode badge colors ────────────────────────────────────────────

const modeStyles: Record<string, string> = {
  'En ligne': 'bg-sky-500/20 text-sky-400 border-sky-500/40',
  'Présentiel': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  Hybride: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
};

// ─── Component ────────────────────────────────────────────────────

export function OppCard({ post, className }: OppCardProps) {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  const deadline = useDeadline(post.deadline);

  // Double-tap to like
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTapRef.current = now;
  }, [liked]);

  const toggleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLiked((prev) => {
        setLikeCount((c) => (prev ? c - 1 : c + 1));
        return !prev;
      });
    },
    []
  );

  const toggleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved((prev) => !prev);
  }, []);

  return (
    <div
      className={cn(
        'relative h-full w-full select-none overflow-y-auto bg-background',
        className
      )}
      onClick={handleTap}
    >
      {/* ── Flyer image — full size, no crop ── */}
      <div className="relative w-full" style={{ minHeight: '50vh' }}>
        <Image
          src={post.flyer}
          alt={post.title}
          width={800}
          height={1200}
          className="w-full h-auto object-contain"
          priority
          unoptimized
        />
      </div>

      {/* ── Double-tap heart animation (CSS) ── */}
      {showHeart && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center animate-heart-pop">
          <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-lg" />
        </div>
      )}

      {/* ── Info panel below flyer ── */}
      <div className="relative z-10 bg-background border-t border-border/50">
        {/* Top row: tags */}
        <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
          {post.tags.map((tag) => {
            const cfg = tagConfig[tag];
            const TagIcon = cfg.icon;
            return (
              <span
                key={tag}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[11px] font-semibold',
                  cfg.color,
                  cfg.textColor
                )}
              >
                <TagIcon className="h-3 w-3" />
                {tag}
              </span>
            );
          })}
        </div>

        {/* Title */}
        <h2 className="px-4 pt-2 text-lg font-bold leading-snug text-foreground line-clamp-2">
          {post.title}
        </h2>

        {/* Description */}
        <p className="px-4 pt-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {post.description}
        </p>

        {/* Category + Mode + Location + Deadline */}
        <div className="px-4 pt-3 flex flex-wrap items-center gap-2">
          <CategoryBadge category={post.category} />
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
              modeStyles[post.mode]
            )}
          >
            {post.mode}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {post.location}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              deadline.urgent
                ? 'bg-red-500/20 text-red-400'
                : 'bg-secondary text-muted-foreground'
            )}
          >
            <Clock className="h-3 w-3" />
            {deadline.text}
          </span>
        </div>

        {/* Author + Action buttons row */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">
            <UserAvatar user={post.author} size="sm" />
            <span className="text-sm font-medium text-foreground truncate">
              {post.author.name}
            </span>
            {post.author.verified && (
              <VerifiedBadge size="sm" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLike}
              className="flex flex-col items-center gap-0.5 active:scale-80 transition-transform"
              aria-label={liked ? 'Retirer le like' : 'Aimer'}
            >
              <Heart
                className={cn(
                  'h-6 w-6 transition-colors',
                  liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                )}
              />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {likeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-0.5"
              aria-label="Commenter"
            >
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {post.comments}
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-0.5"
              aria-label="Partager"
            >
              <Share2 className="h-6 w-6 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {post.shares}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleSave}
              className="flex flex-col items-center gap-0.5 active:scale-80 transition-transform"
              aria-label={saved ? 'Retirer des favoris' : 'Enregistrer'}
            >
              <Bookmark
                className={cn(
                  'h-6 w-6 transition-colors',
                  saved ? 'fill-primary text-primary' : 'text-muted-foreground'
                )}
              />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {post.saves}
              </span>
            </button>
          </div>
        </div>

        {/* CTA button */}
        <div className="px-4 pb-4">
          <a
            href={post.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Voir l&apos;opportunité
          </a>
        </div>
      </div>
    </div>
  );
}
