'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Settings,
  MapPin,
  LinkIcon,
  Edit3,
  Share2,
  BadgeCheck,
  Heart,
  Bookmark,
  Grid3X3,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryBadge } from '@/components/oppy/category-badge'
import {
  currentUser,
  mockPosts,
  mockConversations,
  categories,
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

// ─── Post Grid Card ───────────────────────────────────────────────

function PostGridCard({ post }: { post: OppPost }) {
  return (
    <div className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer">
      <Image
        src={post.flyer}
        alt={post.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/20 to-transparent" />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <CategoryBadge category={post.category} className="text-[9px] px-1.5 py-0.5 mb-1.5" />
        <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
          {post.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 text-[#A3A3A3]">
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
  const [activeTab, setActiveTab] = useState('publications')

  // For Publications tab, show user's posts; if none, show all posts as "feed"
  const displayPosts = userPosts.length > 0 ? userPosts : mockPosts.slice(0, 6)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Cover Photo Gradient */}
      <div className="relative h-36 bg-gradient-to-br from-[#D1F550]/30 via-[#22C55E]/20 to-[#D1F550]/10 overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-8 w-16 h-16 rounded-full border border-[#D1F550]/30" />
          <div className="absolute bottom-4 right-12 w-24 h-24 rounded-full border border-[#D1F550]/20" />
          <div className="absolute top-8 right-6 w-8 h-8 rounded-full bg-[#D1F550]/10" />
        </div>

        {/* Settings button - top right */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-[#0A0A0A]/50 backdrop-blur-sm text-white hover:bg-[#0A0A0A]/70 rounded-full"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Profile Content - overlapping cover */}
      <div className="px-4 -mt-14 relative z-10">
        {/* Avatar with verified badge */}
        <div className="relative inline-block mb-3">
          <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-[#0A0A0A] ring-offset-0">
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          {currentUser.verified && (
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-[#D1F550] w-7 h-7">
              <BadgeCheck className="w-5 h-5 text-[#0A0A0A]" strokeWidth={3} />
            </span>
          )}
        </div>

        {/* Name, username, bio */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
          <p className="text-sm text-[#A3A3A3] mb-2">@{currentUser.name.toLowerCase().replace(/\s/g, '_')}</p>
          <p className="text-sm text-[#A3A3A3] leading-relaxed">
            Étudiante passionnée par les opportunités africaines 🌍 | Tech & Innovation | Dakar 🇸🇳
          </p>
        </div>

        {/* Location + Website */}
        <div className="flex items-center gap-3 mb-4 text-xs text-[#A3A3A3]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#D1F550]" />
            Dakar, Sénégal
          </span>
          <span className="flex items-center gap-1">
            <LinkIcon className="w-3.5 h-3.5 text-[#D1F550]" />
            <a href="#" className="text-[#D1F550] hover:underline">oppy.sn/amina</a>
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#1A1A1A] rounded-xl p-3 text-center border border-[#333333]"
            >
              <div className="text-base font-bold text-[#D1F550]">
                {stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value}
              </div>
              <div className="text-[10px] text-[#A3A3A3] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Edit Profile + Share Profile buttons */}
        <div className="flex gap-2 mb-4">
          <Button className="flex-1 bg-[#D1F550] text-[#0A0A0A] hover:bg-[#B8D940] font-semibold rounded-xl h-10 text-sm gap-1.5">
            <Edit3 className="w-4 h-4" />
            Modifier le profil
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-[#333333] text-white hover:bg-[#262626] hover:border-[#D1F550]/30 rounded-xl h-10 text-sm gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            Partager le profil
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl h-10 p-1">
            <TabsTrigger
              value="publications"
              className="flex-1 rounded-lg text-xs data-[state=active]:bg-[#D1F550] data-[state=active]:text-[#0A0A0A] data-[state=active]:font-semibold gap-1"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              Publications
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="flex-1 rounded-lg text-xs data-[state=active]:bg-[#D1F550] data-[state=active]:text-[#0A0A0A] data-[state=active]:font-semibold gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Sauvegardés
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="flex-1 rounded-lg text-xs data-[state=active]:bg-[#D1F550] data-[state=active]:text-[#0A0A0A] data-[state=active]:font-semibold gap-1"
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
                  <PostGridCard post={post} />
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
                    <PostGridCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-10 h-10 text-[#333333] mx-auto mb-2" />
                <p className="text-[#A3A3A3] text-sm">Aucune opportunité sauvegardée</p>
              </div>
            )}
          </TabsContent>

          {/* Liked Tab */}
          <TabsContent value="liked" className="mt-3">
            {likedPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {likedPosts.map((post) => (
                  <div key={post.id} className="animate-fade-slide-in">
                    <PostGridCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-10 h-10 text-[#333333] mx-auto mb-2" />
                <p className="text-[#A3A3A3] text-sm">Aucune opportunité aimée</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings link at bottom */}
      <div className="px-4 pb-20">
        <button className="w-full flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl border border-[#333333] hover:border-[#D1F550]/30 transition-colors">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-[#A3A3A3]" />
            <span className="text-sm text-white font-medium">Paramètres</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
        </button>
      </div>
    </div>
  )
}
