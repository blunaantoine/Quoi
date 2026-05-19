'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  ArrowLeft,
  Check,
  CheckCheck,
  BadgeCheck,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  mockConversations,
  mockUsers,
  currentUser,
  type Conversation,
  type Message,
} from '@/lib/mock-data'
import {
  getSocket,
  joinConversation,
  leaveConversation,
  sendMessage,
  emitTypingStart,
  emitTypingStop,
  onNewMessage,
  onPresenceUpdate,
  onTypingStart,
  onTypingStop,
  type ChatMessage,
  type PresenceUpdate,
  type TypingData,
} from '@/lib/socket'

// ─── Helpers ──────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)

  if (diffDays === 0) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    return days[d.getDay()]
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Chat View ────────────────────────────────────────────────────

function ChatView({
  conversation,
  onBack,
}: {
  conversation: Conversation
  onBack: () => void
}) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>(conversation.messages)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUserName, setTypingUserName] = useState('')
  const [isParticipantOnline, setIsParticipantOnline] = useState(conversation.participant.online ?? false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  // Initialize socket and join conversation
  useEffect(() => {
    const socket = getSocket()

    // Join the conversation room
    const joinRoom = () => {
      if (socket.connected) {
        joinConversation(conversation.id, currentUser.id, currentUser.name)
      } else {
        socket.on('connect', () => {
          joinConversation(conversation.id, currentUser.id, currentUser.name)
        })
      }
    }
    joinRoom()

    // ── Listen for new messages ────────────────────────────────
    const offNewMessage = onNewMessage((msg: ChatMessage) => {
      if (msg.conversationId === conversation.id) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === msg.id)) return prev
          return [
            ...prev,
            {
              id: msg.id,
              senderId: msg.senderId,
              text: msg.text,
              timestamp: msg.timestamp,
            },
          ]
        })
      }
    })

    // ── Listen for typing indicators ──────────────────────────
    const offTypingStart = onTypingStart((data: TypingData) => {
      if (data.conversationId === conversation.id && data.userId !== currentUser.id) {
        setIsTyping(true)
        setTypingUserName(data.userName || '')
      }
    })

    const offTypingStop = onTypingStop((data: TypingData) => {
      if (data.conversationId === conversation.id && data.userId !== currentUser.id) {
        setIsTyping(false)
        setTypingUserName('')
      }
    })

    // ── Listen for presence updates ───────────────────────────
    const offPresenceUpdate = onPresenceUpdate((data: PresenceUpdate) => {
      if (data.conversationId === conversation.id) {
        const participantOnline = data.onlineUsers.includes(conversation.participant.id)
        setIsParticipantOnline(participantOnline)
      }
    })

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      leaveConversation(conversation.id, currentUser.id)
      offNewMessage()
      offTypingStart()
      offTypingStop()
      offPresenceUpdate()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [conversation.id, conversation.participant.id])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // ── Typing indicator logic ──────────────────────────────────
  const handleInputChange = useCallback((value: string) => {
    setMessage(value)

    // Emit typing start if not already typing
    if (!isTypingRef.current && value.trim()) {
      isTypingRef.current = true
      emitTypingStart(conversation.id, currentUser.id, currentUser.name)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false
        emitTypingStop(conversation.id, currentUser.id)
      }
    }, 2000)

    // If message is cleared, stop typing immediately
    if (!value.trim()) {
      isTypingRef.current = false
      emitTypingStop(conversation.id, currentUser.id)
    }
  }, [conversation.id])

  // ── Send message ────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!message.trim()) return

    // Send via socket
    sendMessage(conversation.id, currentUser.id, message)

    // Stop typing indicator
    if (isTypingRef.current) {
      isTypingRef.current = false
      emitTypingStop(conversation.id, currentUser.id)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    setMessage('')
    inputRef.current?.focus()
  }, [message, conversation.id])

  const participant = conversation.participant

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Chat Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#333333]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="h-8 w-8 rounded-full bg-[#262626] flex items-center justify-center text-[#A3A3A3] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="relative">
              <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-[#333333]">
                <Image
                  src={participant.avatar}
                  alt={participant.name}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              {isParticipantOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#0A0A0A]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-semibold text-white">{participant.name}</h3>
                {participant.verified && (
                  <BadgeCheck className="w-4 h-4 text-[#D1F550]" />
                )}
              </div>
              <span className="text-xs text-[#A3A3A3]">
                {isTyping
                  ? 'en train d\'écrire...'
                  : isParticipantOnline
                    ? 'En ligne'
                    : 'Hors ligne'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#A3A3A3] hover:text-white hover:bg-[#262626]">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#A3A3A3] hover:text-white hover:bg-[#262626]">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#A3A3A3] hover:text-white hover:bg-[#262626]">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.map((msg, idx) => {
          const isSent = msg.senderId === currentUser.id
          const isLastInGroup =
            idx === messages.length - 1 || messages[idx + 1]?.senderId !== msg.senderId

          return (
            <div
              key={msg.id}
              className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-fade-slide-in`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isSent
                    ? 'bg-[#D1F550] text-[#0A0A0A] rounded-br-md'
                    : 'bg-[#1A1A1A] text-white border border-[#333333] rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {isLastInGroup && (
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isSent ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span
                      className={`text-[10px] ${
                        isSent ? 'text-[#0A0A0A]/60' : 'text-[#A3A3A3]'
                      }`}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </span>
                    {isSent && (
                      idx < messages.length - 1 ? (
                        <CheckCheck className="w-3 h-3 text-[#0A0A0A]/60" />
                      ) : (
                        <Check className="w-3 h-3 text-[#0A0A0A]/60" />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-slide-in">
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#A3A3A3] rounded-full animate-typing-dot-1" />
                  <span className="w-1.5 h-1.5 bg-[#A3A3A3] rounded-full animate-typing-dot-2" />
                  <span className="w-1.5 h-1.5 bg-[#A3A3A3] rounded-full animate-typing-dot-3" />
                </div>
                <span className="text-xs text-[#A3A3A3] ml-1">
                  {typingUserName ? `${typingUserName} écrit` : 'en train d\'écrire'}...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-0 bg-[#0A0A0A] border-t border-[#333333] px-4 py-3 pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#A3A3A3] hover:text-white hover:bg-[#262626] shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Écrire un message..."
              className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-full h-10 pr-10 focus:border-[#D1F550]/60"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-[#A3A3A3] hover:text-white"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="h-10 w-10 rounded-full bg-[#D1F550] text-[#0A0A0A] hover:bg-[#B8D940] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────

export default function MessagesScreen() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    new Set(mockUsers.filter((u) => u.online).map((u) => u.id))
  )

  // Listen for presence updates from socket on the main screen too
  useEffect(() => {
    const socket = getSocket()

    const offPresenceUpdate = onPresenceUpdate((data: PresenceUpdate) => {
      setOnlineUserIds(new Set(data.onlineUsers))
    })

    return () => {
      offPresenceUpdate()
    }
  }, [])

  // Online users — merge mock data with real-time socket data
  const onlineUsers = useMemo(() => {
    return mockUsers.filter((u) => onlineUserIds.has(u.id))
  }, [onlineUserIds])

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return mockConversations
    const q = searchQuery.toLowerCase()
    return mockConversations.filter(
      (c) =>
        c.participant.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const totalUnread = mockConversations.reduce((acc, c) => acc + c.unread, 0)

  // Show chat view when conversation selected
  if (selectedConversation) {
    return (
      <ChatView
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#333333]/50">
        <div className="px-4 pt-4 pb-3">
          {/* Title + Unread badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#D1F550]" />
              <h1 className="text-xl font-bold text-white">Messages</h1>
            </div>
            {totalUnread > 0 && (
              <span className="bg-[#D1F550] text-[#0A0A0A] text-xs font-bold px-2.5 py-1 rounded-full">
                {totalUnread} nouveaux
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="pl-9 bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-10 focus:border-[#D1F550]/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-[#333333] flex items-center justify-center text-[#A3A3A3] hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Online Now */}
      <div className="px-4 py-3 border-b border-[#333333]/30">
        <h3 className="text-xs font-medium text-[#A3A3A3] mb-2">
          En ligne maintenant
          <span className="ml-1.5 text-[#22C55E]">({onlineUsers.length})</span>
        </h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {onlineUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                const conv = mockConversations.find(
                  (c) => c.participant.id === user.id
                )
                if (conv) setSelectedConversation(conv)
              }}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-[#D1F550] ring-offset-2 ring-offset-[#0A0A0A]">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#0A0A0A]" />
              </div>
              <span className="text-[10px] text-[#A3A3A3] max-w-[60px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="px-4 pb-24">
        <h3 className="text-xs font-medium text-[#A3A3A3] mt-3 mb-2">
          Conversations récentes
        </h3>
        <div className="space-y-1">
          {filteredConversations.map((conv) => {
            const p = conv.participant
            const isOnline = onlineUserIds.has(p.id)
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1A1A1A] transition-colors text-left active:bg-[#262626] animate-fade-slide-in"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-[#333333]">
                    <Image
                      src={p.avatar}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#0A0A0A]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-white truncate flex items-center gap-1">
                      {p.name}
                      {p.verified && (
                        <BadgeCheck className="w-4 h-4 text-[#D1F550] shrink-0" />
                      )}
                    </span>
                    <span className="text-xs text-[#A3A3A3] shrink-0 ml-2">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#A3A3A3] truncate pr-2">
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#D1F550] text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}

          {filteredConversations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#A3A3A3] text-sm">Aucune conversation trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
