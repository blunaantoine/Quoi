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
import { useAppStore } from '@/lib/store'

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

// ─── Article Detail Modal ────────────────────────────────────────

function ArticleDetailModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const s = statusStyles[article.status]

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 top-1/2 left-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md max-h-[85vh] animate-scale-up">
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header with close */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-foreground hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Full image */}
            <div className="relative h-52 w-full">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

              {/* Status badge */}
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
            <div className="p-5 -mt-4 relative">
              <h2 className="text-lg font-bold text-foreground mb-2 leading-snug">{article.title}</h2>

              {/* Author info */}
              <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-border">
                <UserAvatar user={article.author} size="sm" />
                <div>
                  <span className="text-sm font-medium text-foreground block">{article.author.name}</span>
                  <span className="text-xs text-muted-foreground">{article.author.role}</span>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-muted-foreground mb-4">
                <span className="inline-flex items-center gap-1 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(article.date)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs">
                  <Eye className="h-3.5 w-3.5" />
                  {formatViews(article.views)} vues
                </span>
                <span className="inline-flex items-center gap-1 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {article.comments} commentaires
                </span>
              </div>

              {/* Excerpt */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-medium">
                {article.excerpt}
              </p>

              {/* Full text (using excerpt as full text for mock) */}
              <div className="text-sm text-muted-foreground/80 leading-relaxed space-y-3">
                <p>{article.excerpt}</p>
                <p>
                  Cette analyse approfondie met en lumière les tendances clés et les perspectives
                  d&apos;avenir pour les étudiants et professionnels francophones. Les données recueillies
                  démontrent une évolution significative du paysage des opportunités.
                </p>
                <p>
                  Les experts s&apos;accordent à dire que cette dynamique positive devrait se maintenir
                  dans les mois à venir, offrant ainsi de nouvelles perspectives pour les acteurs
                  engagés dans ces secteurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Article Card ─────────────────────────────────────────────────

function ArticleCard({
  article,
  onLire,
}: {
  article: Article
  onLire: () => void
}) {
  const s = statusStyles[article.status]

  return (
    <article className="group animate-fade-slide-in">
      <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all active:scale-[0.98] cursor-pointer">
        {/* Image thumbnail */}
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

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
          <h3 className="font-semibold text-foreground text-[15px] leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
            {article.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-2.5 mb-3">
            <UserAvatar user={article.author} size="sm" />
            <span className="text-xs font-medium text-muted-foreground">
              {article.author.name}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-muted-foreground">
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
              className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onLire()
              }}
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
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const { setShowNotifications } = useAppStore()

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
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 pt-4 pb-3">
          {/* Title + Bell */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Actualités</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
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
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full h-10 pl-9 pr-9 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
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
            <ArticleCard
              key={article.id}
              article={article}
              onLire={() => setSelectedArticle(article)}
            />
          ))
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground text-sm">Aucun article trouvé</p>
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  )
}
