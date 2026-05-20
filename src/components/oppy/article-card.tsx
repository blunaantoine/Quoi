'use client';

import Image from 'next/image';
import { Eye, MessageCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from './user-avatar';
import type { Article, EventStatus } from '@/lib/mock-data';

interface ArticleCardProps {
  article: Article;
  className?: string;
}

const statusStyles: Record<EventStatus, string> = {
  'À venir': 'bg-primary/20 text-primary border-primary/40',
  'En cours': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  'Terminé': 'bg-muted/60 text-muted-foreground border-border',
};

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  return (
    <article
      className={cn(
        'flex gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        {/* Top: status + title */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                statusStyles[article.status]
              )}
            >
              {article.status}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {article.date}
            </span>
          </div>

          <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
            {article.title}
          </h3>

          <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {article.excerpt}
          </p>
        </div>

        {/* Bottom: author + stats */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserAvatar user={article.author} size="sm" />
            <span className="text-xs font-medium text-muted-foreground">
              {article.author.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-xs">
              <Eye className="h-3.5 w-3.5" />
              {formatViews(article.views)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs">
              <MessageCircle className="h-3.5 w-3.5" />
              {article.comments}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
