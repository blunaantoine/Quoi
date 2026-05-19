'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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

  return (
    <AnimatePresence>
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[80] bg-[#0A0A0A] flex flex-col"
        >
          {/* ── Header with search input ── */}
          <div className="border-b border-[#333333] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher des opportunités, articles..."
                  className="w-full pl-10 pr-4 bg-[#1A1A1A] border border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-11 text-sm focus:outline-none focus:border-[#D1F550]/50 focus:ring-1 focus:ring-[#D1F550]/20 transition-all"
                />
              </div>
              <button
                onClick={close}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1A1A1A] border border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#262626] transition-colors"
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
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#A3A3A3]" />
                      Recherches récentes
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {RECENT_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                      >
                        <Clock className="w-4 h-4 shrink-0 text-[#A3A3A3]/60" />
                        <span>{term}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending categories */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#D1F550]" />
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
                        <h3 className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-3">
                          Opportunités ({results.posts.length})
                        </h3>
                        <div className="space-y-2">
                          {results.posts.map((post) => {
                            const cat = getCategory(post.category)
                            const CatIcon = cat.icon
                            return (
                              <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 rounded-xl bg-[#1A1A1A] border border-[#333333] p-3 hover:border-[#D1F550]/30 transition-colors cursor-pointer"
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
                                  <p className="text-sm font-medium text-white truncate">
                                    {post.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-1 text-[11px] text-[#A3A3A3]">
                                      <MapPin className="w-3 h-3" />
                                      {post.location}
                                    </span>
                                  </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-1" />
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Matching articles */}
                    {results.articles.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-3">
                          Articles ({results.articles.length})
                        </h3>
                        <div className="space-y-2">
                          {results.articles.map((article) => (
                            <motion.div
                              key={article.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-3 rounded-xl bg-[#1A1A1A] border border-[#333333] p-3 hover:border-[#D1F550]/30 transition-colors cursor-pointer"
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
                                <p className="text-sm font-medium text-white line-clamp-1">
                                  {article.title}
                                </p>
                                <p className="text-xs text-[#A3A3A3] line-clamp-1 mt-0.5">
                                  {article.excerpt}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[11px] text-[#A3A3A3]">
                                    {article.views.toLocaleString('fr-FR')} vues
                                  </span>
                                  <span className="text-[11px] text-[#A3A3A3]">
                                    {article.comments} commentaires
                                  </span>
                                </div>
                              </div>
                              <Bookmark className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-1" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* No results */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] border border-[#333333] flex items-center justify-center mb-3">
                      <Search className="w-7 h-7 text-[#A3A3A3]" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">Aucun résultat</p>
                    <p className="text-xs text-[#A3A3A3] max-w-[250px]">
                      Aucune opportunité ou article ne correspond à &ldquo;{query}&rdquo;. Essayez d&apos;autres mots-clés.
                    </p>
                    <button
                      onClick={() => setQuery('')}
                      className="mt-4 rounded-full bg-[#1A1A1A] border border-[#333333] px-4 py-2 text-xs font-semibold text-[#D1F550] hover:bg-[#262626] transition-colors"
                    >
                      Effacer la recherche
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
