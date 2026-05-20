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
  X,
  UserCircle,
  Shield,
  Flag,
  Camera,
  FileText,
  MapPin,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  mockConversations,
  mockUsers,
  currentUser,
  type Conversation,
  type Message,
} from '@/lib/mock-data'
import { VerifiedBadge } from '@/components/oppy/verified-badge'
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

// ─── Emoji picker data ────────────────────────────────────────────

const EMOJI_LIST = ['😀', '❤️', '🔥', '👍', '🎉', '💯', '✨', '🚀', '💪', '🙌', '😂', '🥳']

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
  const [showChatMenu, setShowChatMenu] = useState(false)
  const [showAttachSheet, setShowAttachSheet] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowChatMenu(false)
      }
    }
    if (showChatMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showChatMenu])

  // ── Typing indicator logic ──────────────────────────────────
  const handleInputChange = useCallback((value: string) => {
    setMessage(value)
    setShowEmojiPicker(false)

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

  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }, [])

  const participant = conversation.participant

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="relative">
              <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-border">
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
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-background" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-semibold text-foreground">{participant.name}</h3>
                {participant.verified && (
                  <VerifiedBadge size="sm" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {isTyping
                  ? 'en train d\'écrire...'
                  : isParticipantOnline
                    ? 'En ligne'
                    : 'Hors ligne'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={() => toast('Appel vocal bientôt disponible')}
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={() => toast('Appel vidéo bientôt disponible')}
            >
              <Video className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={() => setShowChatMenu(!showChatMenu)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {/* Chat Menu Dropdown */}
            {showChatMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-2xl z-50 animate-fade-slide-in overflow-hidden"
              >
                <button
                  onClick={() => {
                    toast('Profil bientôt disponible')
                    setShowChatMenu(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-muted-foreground" />
                  Voir le profil
                </button>
                <button
                  onClick={() => {
                    toast(`Bloquer ${participant.name} ?`, {
                      action: {
                        label: 'Bloquer',
                        onClick: () => toast('Utilisateur bloqué'),
                      },
                    })
                    setShowChatMenu(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-secondary transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Bloquer
                </button>
                <button
                  onClick={() => {
                    toast('Signalement envoyé')
                    setShowChatMenu(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-secondary transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  Signaler
                </button>
              </div>
            )}
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
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card text-foreground border border-border rounded-bl-md'
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
                        isSent ? 'text-primary-foreground/60' : 'text-muted-foreground'
                      }`}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </span>
                    {isSent && (
                      idx < messages.length - 1 ? (
                        <CheckCheck className="w-3 h-3 text-primary-foreground/60" />
                      ) : (
                        <Check className="w-3 h-3 text-primary-foreground/60" />
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
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot-1" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot-2" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot-3" />
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  {typingUserName ? `${typingUserName} écrit` : 'en train d\'écrire'}...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="bg-card border-t border-border p-3 animate-fade-slide-in">
          <div className="flex flex-wrap gap-2 justify-center">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="h-10 w-10 flex items-center justify-center text-xl hover:bg-secondary rounded-lg transition-colors active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attach Sheet */}
      {showAttachSheet && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/40"
            onClick={() => setShowAttachSheet(false)}
          />
          <div className="absolute inset-x-0 bottom-0 z-[56] bg-card border-t border-border rounded-t-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Joindre</h4>
              <button
                onClick={() => setShowAttachSheet(false)}
                className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  toast('Envoi de photo bientôt disponible')
                  setShowAttachSheet(false)
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <Camera className="w-6 h-6 text-primary" />
                <span className="text-xs text-muted-foreground">Photo</span>
              </button>
              <button
                onClick={() => {
                  toast('Envoi de document bientôt disponible')
                  setShowAttachSheet(false)
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <FileText className="w-6 h-6 text-primary" />
                <span className="text-xs text-muted-foreground">Document</span>
              </button>
              <button
                onClick={() => {
                  toast('Partage de localisation bientôt disponible')
                  setShowAttachSheet(false)
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <MapPin className="w-6 h-6 text-primary" />
                <span className="text-xs text-muted-foreground">Localisation</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Input Bar */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3 pb-4 z-30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0"
            onClick={() => {
              setShowAttachSheet(!showAttachSheet)
              setShowEmojiPicker(false)
            }}
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
              className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-full h-10 pr-10 focus:border-primary/60"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker)
                setShowAttachSheet(false)
              }}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 pt-4 pb-3">
          {/* Title + Unread badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
            </div>
            {totalUnread > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                {totalUnread} nouveaux
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 focus:border-primary/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Online Now */}
      <div className="px-4 py-3 border-b border-border/30">
        <h3 className="text-xs font-medium text-muted-foreground mb-2">
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
                <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-background">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-background" />
              </div>
              <span className="text-[10px] text-muted-foreground max-w-[60px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="px-4 pb-24">
        <h3 className="text-xs font-medium text-muted-foreground mt-3 mb-2">
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
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-card transition-colors text-left active:bg-secondary animate-fade-slide-in"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-border">
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
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                      {p.name}
                      {p.verified && (
                        <VerifiedBadge size="sm" />
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate pr-2">
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
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
              <p className="text-muted-foreground text-sm">Aucune conversation trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
