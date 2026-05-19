'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Sparkles,
  CheckCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockNotifications, type Notification } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'

// ─── Icon map for notification types ──────────────────────────────

const notifIconMap: Record<Notification['type'], { icon: typeof Heart; color: string; bg: string }> = {
  like: { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/20' },
  comment: { icon: MessageCircle, color: 'text-sky-400', bg: 'bg-sky-500/20' },
  follow: { icon: UserPlus, color: 'text-[#D1F550]', bg: 'bg-[#D1F550]/20' },
  mention: { icon: AtSign, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  opportunity: { icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/20' },
}

// ─── Filter tabs ──────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all', label: 'Tout' },
  { key: 'like', label: 'Likes' },
  { key: 'comment', label: 'Commentaires' },
  { key: 'follow', label: 'Abonnés' },
  { key: 'opportunity', label: 'Opportunités' },
] as const

type FilterKey = (typeof FILTER_TABS)[number]['key']

// ─── Time ago helper ──────────────────────────────────────────────

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

// ─── NotificationsPanel ───────────────────────────────────────────

export function NotificationsPanel() {
  const { showNotifications, setShowNotifications } = useAppStore()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const close = useCallback(() => setShowNotifications(false), [setShowNotifications])

  const filteredNotifs = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return (
    <AnimatePresence>
      {showNotifications && (
        <>
          {/* Dark overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Slide-in panel from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-[#0A0A0A] border-l border-[#333333] shadow-2xl flex flex-col"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#333333]">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[#D1F550] text-[10px] font-bold text-[#0A0A0A] px-1.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 rounded-full bg-[#1A1A1A] border border-[#333333] px-3 py-1.5 text-[11px] font-semibold text-[#D1F550] hover:bg-[#262626] transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={close}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A] border border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#262626] transition-colors"
                  aria-label="Fermer les notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Filter tabs ── */}
            <div className="flex gap-1 px-4 py-3 border-b border-[#333333]/50 overflow-x-auto no-scrollbar">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0',
                    filter === tab.key
                      ? 'bg-[#D1F550] text-[#0A0A0A]'
                      : 'bg-[#1A1A1A] text-[#A3A3A3] border border-[#333333] hover:border-[#D1F550]/30 hover:text-[#D1F550]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Notifications list ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {filteredNotifs.length > 0 ? (
                <div className="divide-y divide-[#333333]/30">
                  {filteredNotifs.map((notif, index) => {
                    const cfg = notifIconMap[notif.type]
                    const Icon = cfg.icon

                    return (
                      <motion.button
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        onClick={() => markAsRead(notif.id)}
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#1A1A1A]/80',
                          !notif.read && 'bg-[#1A1A1A]/40'
                        )}
                      >
                        {/* Icon / avatar */}
                        <div className="relative shrink-0">
                          {notif.user ? (
                            <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-[#333333]">
                              <Image
                                src={notif.user.avatar}
                                alt={notif.user.name}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', cfg.bg)}>
                              <Icon className={cn('w-5 h-5', cfg.color)} />
                            </div>
                          )}
                          {/* Type icon overlay */}
                          {notif.user && (
                            <div className={cn(
                              'absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0A0A0A]',
                              cfg.bg
                            )}>
                              <Icon className={cn('w-3 h-3', cfg.color)} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm leading-snug',
                            notif.read ? 'text-[#A3A3A3]' : 'text-white font-medium'
                          )}>
                            {notif.description}
                          </p>
                          <span className="mt-0.5 block text-[11px] text-[#A3A3A3]/70">
                            {timeAgo(notif.timestamp)}
                          </span>
                        </div>

                        {/* Unread dot */}
                        {!notif.read && (
                          <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D1F550]" />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] border border-[#333333] flex items-center justify-center mb-3">
                    <CheckCheck className="w-7 h-7 text-[#A3A3A3]" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Aucune notification</p>
                  <p className="text-xs text-[#A3A3A3]">
                    {filter !== 'all'
                      ? `Aucune notification de type ${FILTER_TABS.find((t) => t.key === filter)?.label?.toLowerCase()}`
                      : 'Vous êtes à jour !'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
