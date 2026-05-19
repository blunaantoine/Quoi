'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  Bell,
  Eye,
  MessageCircle,
  Clock,
  ArrowRight,
  Search,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/oppy/user-avatar'
import { mockArticles, type Article, type EventStatus } from '@/lib/mock-data'

// ─── Status styles ────────────────────────────────────────────────

const statusStyles: Record<EventStatus, { bg: string; text: string; border: string }> = {
  'À venir': { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/40' },
  'En cours': { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/40' },
  'Terminé': { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/40' },
}

// ─── Filter pills ─────────────────────────────────────────────────

type FilterKey = 'Tout' | EventStatus
const FILTERS: FilterKey[] = ['Tout', 'À venir', 'En cours', 'Terminé']

// ─── Helpers ──────────────────────────────────────────────────────

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Article Card ─────────────────────────────────────────────────

function ArticleCard({ article }: { article: Article }) {
  const s = statusStyles[article.status]

  return (
    <article className="group animate-fade-slide-in">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#333333] overflow-hidden hover:border-[#D1F550]/30 transition-all active:scale-[0.98] cursor-pointer">
        {/* Image thumbnail */}
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />

          {/* Status badge overlay */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text} ${s.border}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {article.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title + Excerpt */}
          <h3 className="font-semibold text-white text-[15px] leading-snug mb-1.5 line-clamp-2 group-hover:text-[#D1F550] transition-colors">
            {article.title}
          </h3>
          <p className="text-[#A3A3A3] text-sm leading-relaxed mb-3 line-clamp-2">
            {article.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-2.5 mb-3">
            <UserAvatar user={article.author} size="sm" />
            <span className="text-xs font-medium text-[#A3A3A3]">
              {article.author.name}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[#A3A3A3]">
              <span className="inline-flex items-center gap-1 text-xs">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(article.date)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs">
                <Eye className="h-3.5 w-3.5" />
                {formatViews(article.views)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                {article.comments}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-[#D1F550] hover:text-[#D1F550] hover:bg-[#D1F550]/10 gap-1"
            >
              Lire
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────

export default function NewsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('Tout')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredArticles = useMemo(() => {
    let items = mockArticles

    // Filter by status
    if (activeFilter !== 'Tout') {
      items = items.filter((a) => a.status === activeFilter)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q)
      )
    }

    return items
  }, [activeFilter, searchQuery])

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#333333]/50">
        <div className="px-4 pt-4 pb-3">
          {/* Title + Bell */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">Actualités</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-[#A3A3A3] hover:text-white hover:bg-[#262626] relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D1F550] rounded-full" />
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeFilter === filter
                    ? 'bg-[#D1F550] text-[#0A0A0A]'
                    : 'bg-[#1A1A1A] border border-[#333333] text-[#A3A3A3] hover:border-[#D1F550]/30 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full h-10 pl-9 pr-9 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm text-white placeholder:text-[#A3A3A3] outline-none focus:border-[#D1F550]/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-[#333333] flex items-center justify-center text-[#A3A3A3] hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Articles Feed */}
      <div className="px-4 pb-24 pt-3 space-y-3">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-[#A3A3A3] text-sm">Aucun article trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
