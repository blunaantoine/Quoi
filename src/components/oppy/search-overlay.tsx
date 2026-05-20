'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import {
  X,
  Search,
  Clock,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Bookmark,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  mockPosts,
  mockArticles,
  categories,
  getCategory,
  type OppPost,
  type Article,
} from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'

// ─── Recent searches (mock) ───────────────────────────────────────

const RECENT_SEARCHES = ['Bourse Canada', 'Stage Dakar', 'Formation IA']

// ─── SearchOverlay ────────────────────────────────────────────────

export function SearchOverlay() {
  const { showSearch, setShowSearch } = useAppStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const close = useCallback(() => {
    setShowSearch(false)
    setQuery('')
  }, [setShowSearch])

  // Close on Escape key
  useEffect(() => {
    if (!showSearch) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showSearch, close])

  // Auto-focus input
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showSearch])

  // Search results: matching posts and articles
  const results = useMemo(() => {
    if (!query.trim()) return { posts: [] as OppPost[], articles: [] as Article[] }
    const q = query.toLowerCase()
    const posts = mockPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
    const articles = mockArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q)
    )
    return { posts, articles }
  }, [query])

  const hasResults = results.posts.length > 0 || results.articles.length > 0
  const isSearching = query.trim().length > 0

  if (!showSearch) return null

  return (
    <div className="fixed inset-0 z-[80] bg-background flex flex-col animate-fade-in">
      {/* ── Header with search input ── */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher des opportunités, articles..."
              className="w-full pl-10 pr-4 bg-card border border-border text-foreground placeholder:text-muted-foreground rounded-xl h-11 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <button
            onClick={close}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Fermer la recherche"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {!isSearching ? (
          <div className="px-4 py-4 space-y-6">
            {/* Recent searches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Recherches récentes
                </h3>
              </div>
              <div className="space-y-1">
                {RECENT_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                  >
                    <Clock className="w-4 h-4 shrink-0 text-muted-foreground/60" />
                    <span>{term}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Trending categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Catégories populaires
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => setQuery(cat.label)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]',
                        cat.color,
                        cat.textColor,
                        cat.borderColor
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-5">
            {hasResults ? (
              <>
                {/* Matching posts */}
                {results.posts.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Opportunités ({results.posts.length})
                    </h3>
                    <div className="space-y-2">
                      {results.posts.map((post) => {
                        const cat = getCategory(post.category)
                        const CatIcon = cat.icon
                        return (
                          <div
                            key={post.id}
                            className="flex gap-3 rounded-xl bg-card border border-border p-3 hover:border-primary/30 transition-colors cursor-pointer animate-fade-slide-in"
                          >
                            <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={post.flyer}
                                alt={post.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <CatIcon className={cn('w-3 h-3', cat.textColor)} />
                                <span className={cn('text-[10px] font-semibold', cat.textColor)}>
                                  {cat.label}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground truncate">
                                {post.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  {post.location}
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Matching articles */}
                {results.articles.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Articles ({results.articles.length})
                    </h3>
                    <div className="space-y-2">
                      {results.articles.map((article) => (
                        <div
                          key={article.id}
                          className="flex gap-3 rounded-xl bg-card border border-border p-3 hover:border-primary/30 transition-colors cursor-pointer animate-fade-slide-in"
                        >
                          <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={article.image}
                              alt={article.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {article.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-muted-foreground">
                                {article.views.toLocaleString('fr-FR')} vues
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {article.comments} commentaires
                              </span>
                            </div>
                          </div>
                          <Bookmark className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* No results */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-3">
                  <Search className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Aucun résultat</p>
                <p className="text-xs text-muted-foreground max-w-[250px]">
                  Aucune opportunité ou article ne correspond à &ldquo;{query}&rdquo;. Essayez d&apos;autres mots-clés.
                </p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-4 rounded-full bg-card border border-border px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary transition-colors"
                >
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
