import { create } from 'zustand'

export type TabType = 'home' | 'news' | 'add' | 'messages' | 'profile'

export interface User {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  location: string
  followers: number
  following: number
  opportunities: number
  verified: boolean
}

export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'opportunity' | 'message'
  user: string
  message: string
  timestamp: Date
  read: boolean
}

interface AppState {
  // Navigation
  activeTab: TabType
  setActiveTab: (tab: TabType) => void

  // User
  currentUser: User

  // Notifications
  notifications: Notification[]
  unreadCount: number
  markNotificationRead: (id: string) => void
  markAllRead: () => void

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  isSearchOpen: boolean
  setSearchOpen: (open: boolean) => void

  // UI State
  showAdOverlay: boolean
  setShowAdOverlay: (show: boolean) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
  isCreatingPost: boolean
  setCreatingPost: (creating: boolean) => void

  // Overlay panels
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
  showSearch: boolean
  setShowSearch: (show: boolean) => void

  // Ad timer
  adTimer: number
  resetAdTimer: () => void

  // Conversations
  selectedConversationId: string | null
  setSelectedConversationId: (id: string | null) => void

  // Feed category filter
  feedCategory: string
  setFeedCategory: (cat: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Current User
  currentUser: {
    id: '1',
    name: 'Marie Dupont',
    username: '@marie_dupont',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=marie&backgroundColor=D1F550',
    bio: 'Chasseuse d\'opportunités | Tech & Innovation | Paris 🇫🇷',
    location: 'Paris, France',
    followers: 1247,
    following: 534,
    opportunities: 23,
    verified: true,
  },

  // Notifications
  notifications: [
    {
      id: '1',
      type: 'opportunity',
      user: 'TechCorp',
      message: 'Nouvelle opportunité matching votre profil: Développeur Full-Stack',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
    {
      id: '2',
      type: 'like',
      user: 'Pierre Martin',
      message: 'a aimé votre publication',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: '3',
      type: 'follow',
      user: 'Sophie Laurent',
      message: 'a commencé à vous suivre',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
    },
    {
      id: '4',
      type: 'comment',
      user: 'Lucas Bernard',
      message: 'a commenté: "Super opportunité, je postule!"',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      read: true,
    },
    {
      id: '5',
      type: 'message',
      user: 'StartupXYZ',
      message: 'vous a envoyé un message',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      read: true,
    },
  ],
  unreadCount: 3,
  markNotificationRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  // UI State
  showAdOverlay: false,
  setShowAdOverlay: (show) => set({ showAdOverlay: show }),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  isCreatingPost: false,
  setCreatingPost: (creating) => set({ isCreatingPost: creating }),

  // Overlay panels
  showNotifications: false,
  setShowNotifications: (show) => set({ showNotifications: show }),
  showSearch: false,
  setShowSearch: (show) => set({ showSearch: show }),

  // Ad timer
  adTimer: 0,
  resetAdTimer: () => set({ adTimer: 0 }),

  // Conversations
  selectedConversationId: null,
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),

  // Feed category filter
  feedCategory: 'all',
  setFeedCategory: (cat) => set({ feedCategory: cat }),
}))
