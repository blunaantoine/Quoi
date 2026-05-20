import { io, type Socket } from 'socket.io-client'

// ─── Types ────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  text: string
  timestamp: string
}

export interface PresenceUpdate {
  conversationId: string
  onlineUsers: string[]
}

export interface TypingData {
  conversationId: string
  userId: string
  userName?: string
}

export interface ReadReceipt {
  conversationId: string
  userId: string
  messageIds: string[]
  readAt: string
}

export type SocketEventMap = {
  new_message: (message: ChatMessage) => void
  presence_update: (data: PresenceUpdate) => void
  typing_start: (data: TypingData) => void
  typing_stop: (data: TypingData) => void
  message_read: (data: ReadReceipt) => void
}

// ─── Singleton Socket ─────────────────────────────────────────────

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    // IMPORTANT: Use XTransformPort query param, NOT port in URL
    // Path must be '/' for Caddy to forward correctly
    socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket!.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
    })
  }

  return socket
}

// ─── Event Emitters ───────────────────────────────────────────────

export function joinConversation(conversationId: string, userId: string, userName: string) {
  const s = getSocket()
  s.emit('join_conversation', { conversationId, userId, userName })
}

export function leaveConversation(conversationId: string, userId: string) {
  const s = getSocket()
  s.emit('leave_conversation', { conversationId, userId })
}

export function sendMessage(conversationId: string, senderId: string, text: string) {
  const s = getSocket()
  s.emit('send_message', { conversationId, senderId, text })
}

export function emitTypingStart(conversationId: string, userId: string, userName: string) {
  const s = getSocket()
  s.emit('typing_start', { conversationId, userId, userName })
}

export function emitTypingStop(conversationId: string, userId: string) {
  const s = getSocket()
  s.emit('typing_stop', { conversationId, userId })
}

export function emitMessageRead(conversationId: string, userId: string, messageIds: string[]) {
  const s = getSocket()
  s.emit('message_read', { conversationId, userId, messageIds })
}

// ─── Event Listeners ──────────────────────────────────────────────

export function onNewMessage(callback: SocketEventMap['new_message']) {
  const s = getSocket()
  s.on('new_message', callback)
  return () => s.off('new_message', callback)
}

export function onPresenceUpdate(callback: SocketEventMap['presence_update']) {
  const s = getSocket()
  s.on('presence_update', callback)
  return () => s.off('presence_update', callback)
}

export function onTypingStart(callback: SocketEventMap['typing_start']) {
  const s = getSocket()
  s.on('typing_start', callback)
  return () => s.off('typing_start', callback)
}

export function onTypingStop(callback: SocketEventMap['typing_stop']) {
  const s = getSocket()
  s.on('typing_stop', callback)
  return () => s.off('typing_stop', callback)
}

export function onMessageRead(callback: SocketEventMap['message_read']) {
  const s = getSocket()
  s.on('message_read', callback)
  return () => s.off('message_read', callback)
}

// ─── Connection Status ────────────────────────────────────────────

export function isConnected(): boolean {
  return socket?.connected ?? false
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
