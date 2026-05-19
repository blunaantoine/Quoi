'use client'

import dynamic from 'next/dynamic'
import {
  Home,
  Newspaper,
  Plus,
  MessageSquare,
  User,
} from 'lucide-react'
import { useAppStore, TabType } from '@/lib/store'

// Dynamic imports for all screen components to reduce initial bundle size
const HomeScreen = dynamic(() => import('@/components/screens/HomeScreen'), { ssr: false })
const NewsScreen = dynamic(() => import('@/components/screens/NewsScreen'), { ssr: false })
const AddScreen = dynamic(() => import('@/components/screens/AddScreen'), { ssr: false })
const MessagesScreen = dynamic(() => import('@/components/screens/MessagesScreen'), { ssr: false })
const ProfileScreen = dynamic(() => import('@/components/screens/ProfileScreen'), { ssr: false })
const NotificationsPanel = dynamic(
  () => import('@/components/oppy/notifications-panel').then((mod) => ({ default: mod.NotificationsPanel })),
  { ssr: false }
)
const SearchOverlay = dynamic(
  () => import('@/components/oppy/search-overlay').then((mod) => ({ default: mod.SearchOverlay })),
  { ssr: false }
)
const AdOverlay = dynamic(
  () => import('@/components/oppy/ad-overlay').then((mod) => ({ default: mod.AdOverlay })),
  { ssr: false }
)

const NAV_ITEMS: { tab: TabType; label: string; icon: typeof Home; isAdd?: boolean }[] = [
  { tab: 'home', label: 'Accueil', icon: Home },
  { tab: 'news', label: 'Actualités', icon: Newspaper },
  { tab: 'add', label: 'Ajouter', icon: Plus, isAdd: true },
  { tab: 'messages', label: 'Messages', icon: MessageSquare },
  { tab: 'profile', label: 'Profil', icon: User },
]

function BottomNav() {
  const { activeTab, setActiveTab, notifications } = useAppStore()
  const unreadMessages = 2 // Mock unread message count

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg">
        <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#333333]/50">
          <div className="flex items-center justify-around px-2 py-1 safe-area-bottom">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.tab
              const Icon = item.icon

              if (item.isAdd) {
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className="flex flex-col items-center justify-center -mt-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#D1F550] flex items-center justify-center shadow-lg shadow-[#D1F550]/25 hover:shadow-[#D1F550]/40 transition-all active:scale-95">
                      <Plus className="w-6 h-6 text-[#0A0A0A]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] mt-1 text-[#A3A3A3] font-medium">
                      {item.label}
                    </span>
                  </button>
                )
              }

              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className="flex flex-col items-center justify-center py-2 px-3 min-w-[56px] relative group"
                >
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-[#D1F550]' : 'text-[#A3A3A3] group-hover:text-white'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {/* Active indicator dot - CSS transition instead of layoutId */}
                    <div
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D1F550] transition-all duration-300 ${
                        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                      }`}
                    />
                    {/* Unread badge */}
                    {item.tab === 'messages' && unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadMessages}
                      </span>
                    )}
                    {item.tab === 'news' && notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D1F550]" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium transition-colors ${
                      isActive ? 'text-[#D1F550]' : 'text-[#A3A3A3] group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

function ScreenRenderer() {
  const { activeTab } = useAppStore()

  const screens: Record<TabType, React.ReactNode> = {
    home: <HomeScreen />,
    news: <NewsScreen />,
    add: <AddScreen />,
    messages: <MessagesScreen />,
    profile: <ProfileScreen />,
  }

  // Home screen manages its own full-height layout (TikTok-style feed)
  // Other screens use standard scrollable layout with bottom padding
  if (activeTab === 'home') {
    return (
      <div
        key={activeTab}
        className="h-[calc(100vh-64px)] animate-fade-in"
      >
        {screens[activeTab]}
      </div>
    )
  }

  return (
    <div
      key={activeTab}
      className="animate-fade-slide-in"
    >
      {screens[activeTab]}
    </div>
  )
}

export default function OppyHome() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Mobile-first container, centered on desktop */}
      <div className="mx-auto max-w-lg min-h-screen relative bg-[#0A0A0A] shadow-2xl shadow-black/50">
        {/* Main content area */}
        <main className="pb-16">
          <ScreenRenderer />
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Overlay components — rendered at top level for proper z-index layering */}
      <NotificationsPanel />
      <SearchOverlay />
      <AdOverlay />
    </div>
  )
}
