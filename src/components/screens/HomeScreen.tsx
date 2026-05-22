'use client'

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import Image from 'next/image'
import {
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
  Zap,
  X,
  Copy,
  Send,
  ThumbsUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { VerifiedBadge } from '@/components/oppy/verified-badge'
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
  Nouveau: { icon: Sparkles, color: 'bg-primary/20', textColor: 'text-primary' },
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
        window.open(`mailto:?subject=${encodeURIComponent('Découvrez cette opportunité sur OQUI')}&body=${encodeURIComponent(window.location.href)}`)
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
        <div className="mx-auto max-w-lg bg-card border-t border-border rounded-t-2xl p-5 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">Partager</h3>
            <button
              onClick={() => setShowShareSheet(false)}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
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
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{option.label}</span>
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
  const {
    showComments,
    setShowComments,
    selectedPostId,
    userComments,
    addComment,
    likedCommentIds,
    toggleCommentLike,
  } = useAppStore()
  const [commentText, setCommentText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Combine mock comments + user-added comments from global store
  const comments = useMemo(() => {
    if (!selectedPostId) return []
    return [
      ...mockComments.filter((c) => c.postId === selectedPostId),
      ...userComments.filter((c) => c.postId === selectedPostId),
    ]
  }, [selectedPostId, userComments])

  // Auto-scroll to bottom when new comment is added
  useEffect(() => {
    if (showComments && scrollRef.current) {
      // Small delay to let the new comment render
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 100)
    }
  }, [comments.length, showComments])

  // Focus input when panel opens
  useEffect(() => {
    if (showComments) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [showComments])

  const handleSubmit = useCallback(() => {
    if (!commentText.trim() || !selectedPostId || isSubmitting) return

    setIsSubmitting(true)
    const newComment: Comment = {
      id: `cm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      postId: selectedPostId,
      author: currentOppUser,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
    }

    // Add to global store (persists across open/close)
    addComment(newComment)
    setCommentText('')
    toast.success('Commentaire ajouté !')

    // Re-focus input for rapid commenting
    setTimeout(() => {
      inputRef.current?.focus()
      setIsSubmitting(false)
    }, 50)
  }, [commentText, selectedPostId, isSubmitting, addComment])

  const handleClose = useCallback(() => {
    setShowComments(false)
  }, [setShowComments])

  if (!showComments || !selectedPostId) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-[70] animate-slide-up">
        <div className="mx-auto max-w-lg bg-card border-t border-border rounded-t-2xl flex flex-col max-h-[75vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <h3 className="text-base font-bold text-foreground">
              Commentaires ({comments.length})
            </h3>
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Comments list */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[120px]">
            {comments.length > 0 ? (
              comments.map((comment) => {
                const isLiked = likedCommentIds.has(comment.id)
                const isUserComment = comment.id.startsWith('cm_')
                const displayLikes = comment.likes + (isLiked && !isUserComment ? 1 : 0)

                return (
                  <div key={comment.id} className="flex gap-3 animate-fade-slide-in">
                    <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden ring-1 ring-border">
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
                        <span className="text-sm font-semibold text-foreground">
                          {comment.author.name}
                        </span>
                        {comment.author.verified && (
                          <VerifiedBadge size="xs" />
                        )}
                        <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
                          {timeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed mt-0.5 break-words">
                        {comment.text}
                      </p>
                      <button
                        onClick={() => toggleCommentLike(comment.id)}
                        className={cn(
                          'flex items-center gap-1 mt-1 transition-colors',
                          isLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                        )}
                      >
                        <ThumbsUp className={cn('w-3 h-3', isLiked && 'fill-primary')} />
                        <span className="text-[11px]">{displayLikes > 0 ? displayLikes : ''}</span>
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Aucun commentaire</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Soyez le premier à réagir !</p>
              </div>
            )}
          </div>

          {/* Comment input */}
          <div className="p-3 border-t border-border flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden ring-1 ring-border">
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="Écrire un commentaire..."
              className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              disabled={isSubmitting}
            />
            <button
              onClick={handleSubmit}
              disabled={!commentText.trim() || isSubmitting}
              className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed shrink-0 hover:bg-primary/90 transition-colors active:scale-90"
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
  const [following, setFollowing] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const lastTapRef = useRef(0)
  const { setShowComments, setSelectedPostId, setShowShareSheet, getCommentCount } = useAppStore()

  // Derive comment count from global store (updates when comments are added)
  const commentCount = useAppStore((s) => s.getCommentCount(post.id, post.comments))

  const deadline = getDeadline(post.deadline)
  const cat = getCategory(post.category)
  const CatIcon = cat.icon

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
      className="relative w-full select-none bg-card rounded-2xl overflow-hidden shadow-sm border border-border/40"
      onClick={handleTap}
    >
      {/* ── Flyer image — full size, no crop, no dark overlay ── */}
      <div className="relative w-full">
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

      {/* ── Double-tap heart animation ── */}
      {showHeart && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center animate-heart-pop">
          <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-lg" />
        </div>
      )}

      {/* ── Info panel below flyer ── */}
      <div className="relative z-10 bg-card px-4 pt-3 pb-4">
        {/* Top row: tags */}
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => {
            const cfg = tagConfig[tag]
            const TagIcon = cfg.icon
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
            )
          })}
        </div>

        {/* Title */}
        <h2 className="pt-2 text-lg font-bold leading-snug text-foreground line-clamp-2">
          {post.title}
        </h2>

        {/* Description */}
        <p className="pt-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {post.description}
        </p>

        {/* Category + Mode + Location + Deadline */}
        <div className="pt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
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
              deadline.expired
                ? 'bg-red-500/20 text-red-400'
                : deadline.urgent
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-secondary text-muted-foreground'
            )}
          >
            <Clock className="h-3 w-3" />
            {deadline.text}
          </span>
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-border/50" />

        {/* Author + Follow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative h-8 w-8 shrink-0 rounded-full ring-2 ring-border overflow-hidden">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <span className="text-sm font-medium text-foreground truncate">
              {post.author.name}
            </span>
            {post.author.verified && (
              <VerifiedBadge size="sm" />
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setFollowing((prev) => !prev)
            }}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-semibold transition-all',
              following
                ? 'bg-secondary text-muted-foreground border border-border'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {following ? 'Suivi' : 'Suivre'}
          </button>
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-border/50" />

        {/* Action buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Like */}
            <button
              type="button"
              onClick={toggleLike}
              className="flex items-center gap-1.5 active:scale-90 transition-transform"
              aria-label={liked ? 'Retirer le like' : 'Aimer'}
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors',
                  liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                )}
              />
              <span className={cn(
                'text-xs font-semibold transition-colors',
                liked ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {formatCount(likeCount)}
              </span>
            </button>

            {/* Comment */}
            <button
              type="button"
              onClick={handleComment}
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
              aria-label="Commenter"
            >
              <MessageCircle className={cn(
                'h-5 w-5 transition-colors',
                commentCount > 0 ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-xs font-semibold transition-colors',
                commentCount > 0 ? 'text-primary' : 'text-muted-foreground'
              )}>
                {formatCount(commentCount)}
              </span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
              aria-label="Partager"
            >
              <Share2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">
                {formatCount(post.shares)}
              </span>
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={toggleSave}
              className="flex items-center gap-1.5 active:scale-90 transition-transform"
              aria-label={saved ? 'Retirer des favoris' : 'Enregistrer'}
            >
              <Bookmark
                className={cn(
                  'h-5 w-5 transition-colors',
                  saved ? 'fill-primary text-primary' : 'text-muted-foreground'
                )}
              />
              <span className={cn(
                'text-xs font-semibold transition-colors',
                saved ? 'text-primary' : 'text-muted-foreground'
              )}>
                {formatCount(post.saves)}
              </span>
            </button>
          </div>

          {/* Participer button */}
          <a
            href={post.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Participer
          </a>
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
    <div className="relative h-[calc(100vh-64px)] w-full flex flex-col bg-background">
      {/* ── Solid header (not overlapping) ── */}
      <div className="shrink-0 bg-background border-b border-border/30">
        {/* Logo + Search row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <img
              src="/oqui-logo.png"
              alt="OQUI"
              className="h-8 w-auto object-contain"
            />
          </div>

          <button
            className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-90"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar (expandable) */}
        <div
          className={`overflow-hidden transition-all duration-200 ${
            showSearch ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher des opportunités..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 bg-card border border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* ── Category filter pills ── */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleCategoryChange('all')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shrink-0',
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-primary'
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
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shrink-0',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-primary'
                )}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Vertical scroll feed ── */}
      <div
        ref={scrollRef}
        className="flex-1 w-full overflow-y-scroll px-3"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {filteredPosts.length > 0 ? (
          <div className="flex flex-col gap-4 py-4 pb-20">
            {filteredPosts.map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center px-8"
            style={{ height: 'calc(100vh - 64px)' }}
          >
            <div className="animate-fade-slide-in">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Aucune opportunité</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'Aucun résultat pour votre recherche. Essayez d\'autres mots-clés.'
                  : 'Aucune opportunité dans cette catégorie pour le moment.'}
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all')
                  setSearchQuery('')
                }}
                className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
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
