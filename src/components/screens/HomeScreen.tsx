'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import {
  Zap,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  BadgeCheck,
  X,
  Copy,
  Send,
  ThumbsUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  mockPosts,
  mockComments,
  categories,
  getCategory,
  currentUser as currentOppUser,
  type OppPost,
  type CategorySlug,
  type Comment,
} from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'

// ─── Deadline countdown hook ────────────────────────────────────

function getDeadline(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return { text: 'Expiré', urgent: true, expired: true }
  const days = Math.floor(diff / 86_400_000)
  if (days > 30) {
    const months = Math.floor(days / 30)
    return { text: `${months} mois restants`, urgent: false, expired: false }
  }
  if (days > 0) return { text: `${days} jours restants`, urgent: days <= 5, expired: false }
  const hours = Math.floor(diff / 3_600_000)
  if (hours > 0) return { text: `${hours}h restantes`, urgent: true, expired: false }
  const mins = Math.floor(diff / 60_000)
  return { text: `${mins}min restantes`, urgent: true, expired: false }
}

// ─── Tag badge config ───────────────────────────────────────────

const tagConfig: Record<string, { icon: typeof Sparkles; color: string; textColor: string }> = {
  Nouveau: { icon: Sparkles, color: 'bg-[#D1F550]/20', textColor: 'text-[#D1F550]' },
  Urgent: { icon: Zap, color: 'bg-red-500/20', textColor: 'text-red-400' },
  Vérifié: { icon: CheckCircle2, color: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
}

// ─── Mode badge styles ──────────────────────────────────────────

const modeStyles: Record<string, string> = {
  'En ligne': 'bg-sky-500/20 text-sky-400 border-sky-500/40',
  'Présentiel': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  Hybride: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
}

// ─── Format number compactly ────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// ─── Time ago helper for comments ───────────────────────────────

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`
  return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ─── Share Sheet Component ───────────────────────────────────────

function ShareSheet() {
  const { showShareSheet, setShowShareSheet } = useAppStore()

  const shareOptions = [
    {
      icon: Copy,
      label: 'Copier le lien',
      action: () => {
        navigator.clipboard.writeText(window.location.href)
        toast('Lien copié !')
        setShowShareSheet(false)
      },
    },
    {
      icon: Share2,
      label: 'Partager sur WhatsApp',
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank')
        setShowShareSheet(false)
      },
    },
    {
      icon: Share2,
      label: 'Partager sur Twitter/X',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')
        setShowShareSheet(false)
      },
    },
    {
      icon: Share2,
      label: 'Partager sur Facebook',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
        setShowShareSheet(false)
      },
    },
    {
      icon: Send,
      label: 'Partager par email',
      action: () => {
        window.open(`mailto:?subject=${encodeURIComponent('Découvrez cette opportunité sur OPPY')}&body=${encodeURIComponent(window.location.href)}`)
        setShowShareSheet(false)
      },
    },
  ]

  if (!showShareSheet) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setShowShareSheet(false)}
      />
      <div className="fixed inset-x-0 bottom-0 z-[70] animate-slide-up">
        <div className="mx-auto max-w-lg bg-[#1A1A1A] border-t border-[#333333] rounded-t-2xl p-5 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Partager</h3>
            <button
              onClick={() => setShowShareSheet(false)}
              className="h-8 w-8 rounded-full bg-[#262626] flex items-center justify-center text-[#A3A3A3] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {shareOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.label}
                  onClick={option.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#262626] transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-[#0A0A0A] border border-[#333333] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#D1F550]" />
                  </div>
                  <span className="text-sm font-medium text-white">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Comment Panel Component ─────────────────────────────────────

function CommentPanel() {
  const { showComments, setShowComments, selectedPostId } = useAppStore()
  const [commentText, setCommentText] = useState('')
  const [addedComments, setAddedComments] = useState<Comment[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Derive comments from mock data + locally added comments
  const comments = useMemo(() => {
    if (!selectedPostId) return []
    return [
      ...mockComments.filter((c) => c.postId === selectedPostId),
      ...addedComments.filter((c) => c.postId === selectedPostId),
    ]
  }, [selectedPostId, addedComments])

  const handleSubmit = useCallback(() => {
    if (!commentText.trim() || !selectedPostId) return
    const newComment: Comment = {
      id: `cm_new_${Date.now()}`,
      postId: selectedPostId,
      author: currentOppUser,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
    }
    setAddedComments((prev) => [...prev, newComment])
    setCommentText('')
    toast('Commentaire ajouté !')
    inputRef.current?.focus()
  }, [commentText, selectedPostId])

  if (!showComments || !selectedPostId) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setShowComments(false)}
      />
      <div className="fixed inset-x-0 bottom-0 z-[70] animate-slide-up">
        <div className="mx-auto max-w-lg bg-[#1A1A1A] border-t border-[#333333] rounded-t-2xl flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#333333]">
            <h3 className="text-base font-bold text-white">
              Commentaires ({comments.length})
            </h3>
            <button
              onClick={() => setShowComments(false)}
              className="h-8 w-8 rounded-full bg-[#262626] flex items-center justify-center text-[#A3A3A3] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 animate-fade-slide-in">
                  <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden ring-1 ring-[#333333]">
                    <Image
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">
                        {comment.author.name}
                      </span>
                      {comment.author.verified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-[#D1F550]" strokeWidth={3} />
                      )}
                      <span className="text-[11px] text-[#A3A3A3] ml-auto">
                        {timeAgo(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-[#A3A3A3] leading-relaxed mt-0.5">
                      {comment.text}
                    </p>
                    <button className="flex items-center gap-1 mt-1 text-[#A3A3A3] hover:text-[#D1F550] transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[11px]">{comment.likes}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-[#333333] mx-auto mb-2" />
                <p className="text-sm text-[#A3A3A3]">Aucun commentaire pour le moment</p>
                <p className="text-xs text-[#A3A3A3]/70 mt-1">Soyez le premier à commenter !</p>
              </div>
            )}
          </div>

          {/* Comment input */}
          <div className="p-3 border-t border-[#333333] flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden ring-1 ring-[#333333]">
              <Image
                src={currentOppUser.avatar}
                alt={currentOppUser.name}
                width={32}
                height={32}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Écrire un commentaire..."
              className="flex-1 bg-[#0A0A0A] border border-[#333333] rounded-full px-4 py-2 text-sm text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#D1F550]/50 transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={!commentText.trim()}
              className="h-8 w-8 rounded-full bg-[#D1F550] flex items-center justify-center text-[#0A0A0A] disabled:opacity-40 disabled:cursor-not-allowed shrink-0 hover:bg-[#c5e840] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── FeedCard Component ─────────────────────────────────────────

function FeedCard({ post }: { post: OppPost }) {
  const [liked, setLiked] = useState(post.liked)
  const [saved, setSaved] = useState(post.saved)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [commentCount, setCommentCount] = useState(post.comments)
  const [following, setFollowing] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const lastTapRef = useRef(0)
  const { setShowComments, setSelectedPostId, setShowShareSheet } = useAppStore()

  const deadline = getDeadline(post.deadline)
  const cat = getCategory(post.category)
  const CatIcon = cat.icon

  // Double-tap to like
  const handleTap = useCallback(() => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      if (!liked) {
        setLiked(true)
        setLikeCount((c) => c + 1)
      }
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 800)
    }
    lastTapRef.current = now
  }, [liked])

  const toggleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setLiked((prev) => {
        setLikeCount((c) => (prev ? c - 1 : c + 1))
        return !prev
      })
    },
    []
  )

  const toggleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved((prev) => !prev)
  }, [])

  const handleComment = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPostId(post.id)
    setShowComments(true)
  }, [post.id, setSelectedPostId, setShowComments])

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowShareSheet(true)
  }, [setShowShareSheet])

  return (
    <div
      className="relative h-full w-full select-none overflow-hidden bg-[#0A0A0A] scroll-snap-align-start"
      onClick={handleTap}
    >
      {/* ── Flyer background ── */}
      <Image
        src={post.flyer}
        alt={post.title}
        fill
        className="object-cover"
        priority
        unoptimized
      />

      {/* ── Gradient overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-[#0A0A0A]/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-transparent to-transparent" />

      {/* ── Top tags row ── */}
      <div className="absolute left-4 right-16 top-4 z-10 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => {
          const cfg = tagConfig[tag]
          const TagIcon = cfg.icon
          return (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm',
                cfg.color,
                cfg.textColor
              )}
            >
              <TagIcon className="h-3 w-3" />
              {tag}
            </span>
          )
        })}
      </div>

      {/* ── Double-tap heart animation ── */}
      {showHeart && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center animate-heart-pop">
          <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-lg" />
        </div>
      )}

      {/* ── Bottom content ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-5">
        <div className="flex gap-3">
          {/* Left: text content */}
          <div className="flex-1 min-w-0">
            {/* Category + Mode row */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm',
                  cat.color,
                  cat.textColor,
                  cat.borderColor
                )}
              >
                <CatIcon className="h-3.5 w-3.5" />
                {cat.label}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm',
                  modeStyles[post.mode]
                )}
              >
                {post.mode}
              </span>
            </div>

            {/* Title */}
            <h2 className="mb-1 text-lg font-bold leading-snug text-white line-clamp-2 drop-shadow-lg">
              {post.title}
            </h2>

            {/* Description */}
            <p className="mb-3 text-sm leading-relaxed text-[#A3A3A3] line-clamp-2">
              {post.description}
            </p>

            {/* Location + Deadline */}
            <div className="mb-3 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1 text-[#A3A3A3]">
                <MapPin className="h-3.5 w-3.5" />
                {post.location}
              </span>

              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
                  deadline.expired
                    ? 'bg-red-500/20 text-red-400'
                    : deadline.urgent
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-[#262626] text-[#A3A3A3]'
                )}
              >
                <Clock className="h-3 w-3" />
                {deadline.text}
              </span>
            </div>

            {/* Participer button */}
            <a
              href={post.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D1F550] px-4 py-1.5 text-xs font-semibold text-[#0A0A0A] hover:bg-[#c5e840] transition-colors shadow-lg shadow-[#D1F550]/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Participer
            </a>

            {/* Author row with Suivre button */}
            <div className="mt-3 flex items-center gap-2">
              <div className="relative h-8 w-8 shrink-0 rounded-full ring-2 ring-[#333333] overflow-hidden">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium text-white">
                {post.author.name}
              </span>
              {post.author.verified && (
                <BadgeCheck className="h-4 w-4 text-[#D1F550]" strokeWidth={3} />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFollowing((prev) => !prev)
                }}
                className={cn(
                  'ml-auto rounded-full px-3 py-1 text-[11px] font-semibold transition-all',
                  following
                    ? 'bg-[#262626] text-[#A3A3A3] border border-[#333333]'
                    : 'bg-[#D1F550] text-[#0A0A0A] hover:bg-[#c5e840]'
                )}
              >
                {following ? 'Suivi' : 'Suivre'}
              </button>
            </div>
          </div>

          {/* Right: action bar */}
          <div className="flex flex-col items-center gap-5 pt-2">
            {/* Like */}
            <button
              type="button"
              onClick={toggleLike}
              className="flex flex-col items-center gap-0.5 active:scale-80 transition-transform"
              aria-label={liked ? 'Retirer le like' : 'Aimer'}
            >
              <Heart
                className={cn(
                  'h-7 w-7 transition-colors drop-shadow-lg',
                  liked ? 'fill-red-500 text-red-500' : 'text-white'
                )}
              />
              <span className="text-[11px] font-semibold text-white drop-shadow">
                {formatCount(likeCount)}
              </span>
            </button>

            {/* Comment */}
            <button
              type="button"
              onClick={handleComment}
              className="flex flex-col items-center gap-0.5"
              aria-label="Commenter"
            >
              <MessageCircle className="h-7 w-7 text-white drop-shadow-lg" />
              <span className="text-[11px] font-semibold text-white drop-shadow">
                {formatCount(commentCount)}
              </span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="flex flex-col items-center gap-0.5"
              aria-label="Partager"
            >
              <Share2 className="h-7 w-7 text-white drop-shadow-lg" />
              <span className="text-[11px] font-semibold text-white drop-shadow">
                {formatCount(post.shares)}
              </span>
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={toggleSave}
              className="flex flex-col items-center gap-0.5 active:scale-80 transition-transform"
              aria-label={saved ? 'Retirer des favoris' : 'Enregistrer'}
            >
              <Bookmark
                className={cn(
                  'h-7 w-7 transition-colors drop-shadow-lg',
                  saved ? 'fill-[#D1F550] text-[#D1F550]' : 'text-white'
                )}
              />
              <span className="text-[11px] font-semibold text-white drop-shadow">
                {formatCount(post.saves)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main HomeScreen ────────────────────────────────────────────

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<CategorySlug | 'all'>('all')
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const filteredPosts = useMemo(() => {
    let posts = mockPosts
    if (activeCategory !== 'all') {
      posts = posts.filter((p) => p.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      )
    }
    return posts
  }, [activeCategory, searchQuery])

  // Reset scroll position when filter changes
  const handleCategoryChange = useCallback(
    (slug: CategorySlug | 'all') => {
      setActiveCategory(slug)
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    []
  )

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0A0A0A]">
      {/* ── Sticky header overlay ── */}
      <div className="absolute inset-x-0 top-0 z-30 pointer-events-none">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-2 animate-slide-down">
              <div className="w-8 h-8 rounded-lg bg-[#D1F550] flex items-center justify-center shadow-lg shadow-[#D1F550]/20">
                <Zap className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">
                OPP<span className="text-[#D1F550]">Y</span>
              </h1>
            </div>
          </div>

          <button
            className="pointer-events-auto h-9 w-9 rounded-full bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333333]/50 flex items-center justify-center text-[#A3A3A3] hover:text-white hover:bg-[#262626] transition-colors animate-slide-down active:scale-90"
            onClick={() => setShowSearch(!showSearch)}
            style={{ animationDelay: '0.1s' }}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar (expandable) */}
        <div
          className={`overflow-hidden pointer-events-auto transition-all duration-200 ${
            showSearch ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="text"
                placeholder="Rechercher des opportunités..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 bg-[#1A1A1A]/90 backdrop-blur-sm border border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-10 text-sm focus:outline-none focus:border-[#D1F550]/50 focus:ring-1 focus:ring-[#D1F550]/20 transition-all"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* ── Category filter pills ── */}
        <div
          className="pointer-events-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar animate-slide-down"
          style={{ animationDelay: '0.15s' }}
        >
          {/* All pill */}
          <button
            onClick={() => handleCategoryChange('all')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shrink-0',
              activeCategory === 'all'
                ? 'bg-[#D1F550] text-[#0A0A0A] border-[#D1F550] shadow-lg shadow-[#D1F550]/20'
                : 'bg-[#1A1A1A]/80 backdrop-blur-sm text-[#A3A3A3] border-[#333333]/50 hover:border-[#D1F550]/30 hover:text-[#D1F550]'
            )}
          >
            Tout
          </button>

          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.slug
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shrink-0 backdrop-blur-sm',
                  isActive
                    ? 'bg-[#D1F550] text-[#0A0A0A] border-[#D1F550] shadow-lg shadow-[#D1F550]/20'
                    : 'bg-[#1A1A1A]/80 text-[#A3A3A3] border-[#333333]/50 hover:border-[#D1F550]/30 hover:text-[#D1F550]'
                )}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Fade gradient at bottom of header */}
        <div className="h-4 bg-gradient-to-b from-[#0A0A0A]/60 to-transparent pointer-events-none" />
      </div>

      {/* ── Vertical snap scroll feed ── */}
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-scroll"
        style={{
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="w-full animate-fade-in"
              style={{
                height: 'calc(100vh - 64px)',
                scrollSnapAlign: 'start',
              }}
            >
              <FeedCard post={post} />
            </div>
          ))
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center px-8"
            style={{ height: 'calc(100vh - 64px)' }}
          >
            <div className="animate-fade-slide-in">
              <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#333333] flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#A3A3A3]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Aucune opportunité</h3>
              <p className="text-sm text-[#A3A3A3]">
                {searchQuery
                  ? 'Aucun résultat pour votre recherche. Essayez d\'autres mots-clés.'
                  : 'Aucune opportunité dans cette catégorie pour le moment.'}
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all')
                  setSearchQuery('')
                }}
                className="mt-4 rounded-full bg-[#D1F550] px-5 py-2 text-sm font-semibold text-[#0A0A0A] hover:bg-[#c5e840] transition-colors"
              >
                Voir toutes les opportunités
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Overlays ── */}
      <CommentPanel />
      <ShareSheet />
    </div>
  )
}
