'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Settings,
  MapPin,
  LinkIcon,
  Edit3,
  Share2,
  Heart,
  Bookmark,
  Grid3X3,
  Clock,
  ChevronRight,
  X,
  MessageCircle,
  ExternalLink,
  Mail,
  Lock,
  Bell,
  Shield,
  Info,
  LogOut,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryBadge } from '@/components/oppy/category-badge'
import { VerifiedBadge } from '@/components/oppy/verified-badge'
import { ThemeToggle } from '@/components/oppy/theme-toggle'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import {
  currentUser,
  mockPosts,
  mockConversations,
  categories,
  getCategory,
  type OppPost,
} from '@/lib/mock-data'

// ─── Profile Stats ────────────────────────────────────────────────

// Publications authored by the current user
const userPosts = mockPosts.filter((p) => p.author.id === currentUser.id)
// Since currentUser (u1) didn't author any mockPosts, let's also show posts they liked/saved
const likedPosts = mockPosts.filter((p) => p.liked)
const savedPosts = mockPosts.filter((p) => p.saved)

// Compute total likes received across authored posts
const totalLikesReceived = mockPosts
  .filter((p) => p.author.id === currentUser.id)
  .reduce((sum, p) => sum + p.likes, 0)

// Mock stats for display
const STATS = [
  { label: 'Publications', value: userPosts.length || 3 },
  { label: 'Abonnés', value: 1247 },
  { label: 'Abonnements', value: 534 },
  { label: 'Likes reçus', value: totalLikesReceived || 1567 },
]

// ─── Mode badge styles ──────────────────────────────────────────

const modeStyles: Record<string, string> = {
  'En ligne': 'bg-sky-500/20 text-sky-400 border-sky-500/40',
  'Présentiel': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  Hybride: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
}

// ─── Deadline helper ────────────────────────────────────────────

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

// ─── Edit Profile Modal ─────────────────────────────────────────

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { currentUser: storeUser, updateCurrentUser } = useAppStore()
  const [name, setName] = useState(storeUser.name)
  const [bio, setBio] = useState(storeUser.bio)
  const [location, setLocation] = useState(storeUser.location)
  const [website, setWebsite] = useState(storeUser.website ?? '')

  const handleSave = useCallback(() => {
    updateCurrentUser({ name, bio, location, website })
    toast('Profil mis à jour !')
    onClose()
  }, [name, bio, location, website, updateCurrentUser, onClose])

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 top-1/2 left-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md animate-scale-up">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-base font-bold text-foreground">Modifier le profil</h3>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Localisation</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Site web</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 p-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold"
              onClick={handleSave}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Settings Panel ─────────────────────────────────────────────

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [pushNotif, setPushNotif] = useState(true)
  const [emailNotif, setEmailNotif] = useState(false)
  const [privateAccount, setPrivateAccount] = useState(false)
  const [showOnline, setShowOnline] = useState(true)

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-[70] animate-slide-up max-h-[85vh]">
        <div className="mx-auto max-w-lg bg-card border-t border-border rounded-t-2xl flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-base font-bold text-foreground">Paramètres</h3>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Apparence section */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Apparence</h4>
              <div className="space-y-1">
                <ThemeToggle />
              </div>
            </div>

            {/* Compte section */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Compte</h4>
              <div className="space-y-1">
                <button
                  onClick={() => toast('Modification email bientôt disponible')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Modifier email</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
                <button
                  onClick={() => toast('Modification mot de passe bientôt disponible')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Modifier mot de passe</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
              </div>
            </div>

            {/* Notifications section */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notifications</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">Notifications push</span>
                  </div>
                  <button
                    onClick={() => setPushNotif(!pushNotif)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${pushNotif ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${pushNotif ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">Notifications email</span>
                  </div>
                  <button
                    onClick={() => setEmailNotif(!emailNotif)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${emailNotif ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${emailNotif ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Confidentialité section */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Confidentialité</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">Compte privé</span>
                  </div>
                  <button
                    onClick={() => setPrivateAccount(!privateAccount)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${privateAccount ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${privateAccount ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">Afficher en ligne</span>
                  </div>
                  <button
                    onClick={() => setShowOnline(!showOnline)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${showOnline ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${showOnline ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* À propos section */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">À propos</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-3 rounded-xl">
                  <Info className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Version de l&apos;app</span>
                  <span className="text-xs text-muted-foreground ml-auto">1.0.0</span>
                </div>
                <button
                  onClick={() => toast('Conditions d\'utilisation bientôt disponibles')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <Info className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Conditions d&apos;utilisation</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
                <button
                  onClick={() => toast('Politique de confidentialité bientôt disponible')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Politique de confidentialité</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
              </div>
            </div>

            {/* Déconnexion */}
            <button
              onClick={() => {
                const { logout } = useAppStore.getState()
                logout()
                toast('Déconnexion réussie')
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-semibold">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Post Detail Modal ──────────────────────────────────────────

function PostDetailModal({ post, onClose }: { post: OppPost; onClose: () => void }) {
  const [liked, setLiked] = useState(post.liked)
  const [saved, setSaved] = useState(post.saved)
  const [likeCount, setLikeCount] = useState(post.likes)
  const { setShowComments, setSelectedPostId } = useAppStore()
  const deadline = getDeadline(post.deadline)
  const cat = getCategory(post.category)
  const CatIcon = cat.icon

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 top-1/2 left-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md max-h-[85vh] animate-scale-up">
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header with close */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <CategoryBadge category={post.category} />
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Flyer image — full size, no crop */}
            <div className="relative w-full">
              <Image
                src={post.flyer}
                alt={post.title}
                width={800}
                height={1200}
                className="w-full h-auto object-contain"
                unoptimized
              />
            </div>

            {/* Content */}
            <div className="p-4 relative border-t border-border/50">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-card/90 backdrop-blur-sm border-border text-muted-foreground">
                  <CatIcon className="h-3 w-3" />
                  {cat.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-card/90 backdrop-blur-sm border-border text-muted-foreground">
                  {post.mode}
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground mb-2">{post.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.description}</p>

              <div className="flex flex-wrap items-center gap-2.5 text-xs mb-3">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {post.location}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                  deadline.expired
                    ? 'bg-red-500/20 text-red-400'
                    : deadline.urgent
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-secondary text-muted-foreground'
                }`}>
                  <Clock className="h-3 w-3" />
                  {deadline.text}
                </span>
              </div>

              <a
                href={post.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Participer
              </a>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-around p-3 border-t border-border">
            <button
              onClick={() => {
                setLiked(!liked)
                setLikeCount((c) => (liked ? c - 1 : c + 1))
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-400 transition-colors"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => {
                setSelectedPostId(post.id)
                setShowComments(true)
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-sky-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="w-5 h-5" />
              <span>{post.shares}</span>
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-primary text-primary' : ''}`} />
              <span>{post.saves}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Post Grid Card ───────────────────────────────────────────────

function PostGridCard({ post, onClick }: { post: OppPost; onClick: () => void }) {
  return (
    <div
      className="relative rounded-xl overflow-hidden group cursor-pointer bg-background border border-border/50"
      onClick={onClick}
    >
      <Image
        src={post.flyer}
        alt={post.title}
        width={800}
        height={1200}
        className="w-full h-auto object-contain"
        unoptimized
      />

      {/* Content below flyer */}
      <div className="p-2 border-t border-border/50">
        <CategoryBadge category={post.category} className="text-[9px] px-1.5 py-0.5 mb-1" />
        <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
          {post.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
          <span className="inline-flex items-center gap-0.5 text-[10px]">
            <Heart className="w-3 h-3" /> {post.likes}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px]">
            <Bookmark className="w-3 h-3" /> {post.saves}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────

export default function ProfileScreen() {
  const { currentUser: storeUser } = useAppStore()
  const [activeTab, setActiveTab] = useState('publications')
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPostDetail, setShowPostDetail] = useState<string | null>(null)

  // For Publications tab, show user's posts; if none, show all posts as "feed"
  const displayPosts = userPosts.length > 0 ? userPosts : mockPosts.slice(0, 6)

  const selectedPost = showPostDetail ? mockPosts.find((p) => p.id === showPostDetail) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo Gradient */}
      <div className="relative h-36 bg-gradient-to-br from-[#D1F550]/30 via-[#22C55E]/20 to-[#D1F550]/10 overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-8 w-16 h-16 rounded-full border border-primary/30" />
          <div className="absolute bottom-4 right-12 w-24 h-24 rounded-full border border-primary/20" />
          <div className="absolute top-8 right-6 w-8 h-8 rounded-full bg-primary/10" />
        </div>

        {/* Settings button - top right */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/70 rounded-full"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Profile Content - overlapping cover */}
      <div className="px-4 -mt-14 relative z-10">
        {/* Avatar with verified badge */}
        <div className="relative inline-block mb-3">
          <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-background ring-offset-0">
            <Image
              src={storeUser.avatar}
              alt={storeUser.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          {storeUser.verified && (
            <span className="absolute -bottom-1 -right-1">
              <VerifiedBadge size="lg" />
            </span>
          )}
        </div>

        {/* Name, username, bio */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">{storeUser.name}</h1>
          <p className="text-sm text-muted-foreground mb-2">{storeUser.username}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {storeUser.bio}
          </p>
        </div>

        {/* Location + Website */}
        <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {storeUser.location}
          </span>
          {storeUser.website && (
            <span className="flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              <a href="#" className="text-primary hover:underline">{storeUser.website}</a>
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-3 text-center border border-border"
            >
              <div className="text-base font-bold text-primary">
                {stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Edit Profile + Share Profile buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl h-10 text-sm gap-1.5"
            onClick={() => setShowEditProfile(true)}
          >
            <Edit3 className="w-4 h-4" />
            Modifier le profil
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-secondary hover:border-primary/30 rounded-xl h-10 text-sm gap-1.5"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast('Lien de profil copié')
            }}
          >
            <Share2 className="w-4 h-4" />
            Partager le profil
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-card border border-border rounded-xl h-10 p-1">
            <TabsTrigger
              value="publications"
              className="flex-1 rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold gap-1"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              Publications
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="flex-1 rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Sauvegardés
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="flex-1 rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold gap-1"
            >
              <Heart className="w-3.5 h-3.5" />
              Aimés
            </TabsTrigger>
          </TabsList>

          {/* Publications Tab - Grid of posts */}
          <TabsContent value="publications" className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              {displayPosts.map((post) => (
                <div key={post.id} className="animate-fade-slide-in">
                  <PostGridCard
                    post={post}
                    onClick={() => setShowPostDetail(post.id)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="mt-3">
            {savedPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {savedPosts.map((post) => (
                  <div key={post.id} className="animate-fade-slide-in">
                    <PostGridCard
                      post={post}
                      onClick={() => setShowPostDetail(post.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-10 h-10 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Aucune opportunité sauvegardée</p>
              </div>
            )}
          </TabsContent>

          {/* Liked Tab */}
          <TabsContent value="liked" className="mt-3">
            {likedPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {likedPosts.map((post) => (
                  <div key={post.id} className="animate-fade-slide-in">
                    <PostGridCard
                      post={post}
                      onClick={() => setShowPostDetail(post.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-10 h-10 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Aucune opportunité aimée</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings link at bottom */}
      <div className="px-4 pb-20">
        <button
          className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
          onClick={() => setShowSettings(true)}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">Paramètres</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Modals */}
      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setShowPostDetail(null)}
        />
      )}
    </div>
  )
}
