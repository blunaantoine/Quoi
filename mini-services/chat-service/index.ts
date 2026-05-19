import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ─── Types ────────────────────────────────────────────────────────

interface OnlineUser {
  socketId: string
  userId: string
  userName: string
}

interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  text: string
  timestamp: string
}

// ─── State ────────────────────────────────────────────────────────

// Track online users per conversation: conversationId -> Set of userIds
const conversationUsers = new Map<string, Set<string>>()

// Track socket -> user mapping
const socketUserMap = new Map<string, OnlineUser>()

// Track typing state: conversationId -> Set of userIds currently typing
const typingUsers = new Map<string, Set<string>>()

const generateId = () => Math.random().toString(36).substring(2, 11)

// ─── Helpers ──────────────────────────────────────────────────────

function getOnlineUsers(conversationId: string): string[] {
  const users = conversationUsers.get(conversationId)
  return users ? Array.from(users) : []
}

// ─── Connection Handler ───────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Chat] Connected: ${socket.id}`)

  // ── Join Conversation ─────────────────────────────────────────
  socket.on('join_conversation', (data: { conversationId: string; userId: string; userName: string }) => {
    const { conversationId, userId, userName } = data

    // Store user mapping
    socketUserMap.set(socket.id, { socketId: socket.id, userId, userName })

    // Join the socket.io room for this conversation
    socket.join(`conv_${conversationId}`)

    // Track online users
    if (!conversationUsers.has(conversationId)) {
      conversationUsers.set(conversationId, new Set())
    }
    conversationUsers.get(conversationId)!.add(userId)

    // Broadcast presence update
    io.to(`conv_${conversationId}`).emit('presence_update', {
      conversationId,
      onlineUsers: getOnlineUsers(conversationId),
    })

    console.log(`[Chat] ${userName} (${userId}) joined conversation ${conversationId}`)
  })

  // ── Leave Conversation ────────────────────────────────────────
  socket.on('leave_conversation', (data: { conversationId: string; userId: string }) => {
    const { conversationId, userId } = data

    socket.leave(`conv_${conversationId}`)

    // Remove from online tracking
    const convUsers = conversationUsers.get(conversationId)
    if (convUsers) {
      convUsers.delete(userId)
      if (convUsers.size === 0) {
        conversationUsers.delete(conversationId)
      }
    }

    // Remove typing state
    const typers = typingUsers.get(conversationId)
    if (typers) {
      typers.delete(userId)
      if (typers.size === 0) {
        typingUsers.delete(conversationId)
      }
    }

    // Broadcast presence update
    io.to(`conv_${conversationId}`).emit('presence_update', {
      conversationId,
      onlineUsers: getOnlineUsers(conversationId),
    })

    // Broadcast typing stop
    io.to(`conv_${conversationId}`).emit('typing_stop', {
      conversationId,
      userId,
    })

    console.log(`[Chat] User ${userId} left conversation ${conversationId}`)
  })

  // ── Send Message ──────────────────────────────────────────────
  socket.on('send_message', (data: { conversationId: string; senderId: string; text: string }) => {
    const { conversationId, senderId, text } = data

    const message: ChatMessage = {
      id: generateId(),
      conversationId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
    }

    // Broadcast to all users in the conversation room (including sender for confirmation)
    io.to(`conv_${conversationId}`).emit('new_message', message)

    // Auto-stop typing for sender after sending a message
    const typers = typingUsers.get(conversationId)
    if (typers) {
      typers.delete(senderId)
      io.to(`conv_${conversationId}`).emit('typing_stop', {
        conversationId,
        userId: senderId,
      })
    }

    console.log(`[Chat] Message in ${conversationId} from ${senderId}: ${text.substring(0, 50)}...`)
  })

  // ── Typing Start ──────────────────────────────────────────────
  socket.on('typing_start', (data: { conversationId: string; userId: string; userName: string }) => {
    const { conversationId, userId, userName } = data

    if (!typingUsers.has(conversationId)) {
      typingUsers.set(conversationId, new Set())
    }
    typingUsers.get(conversationId)!.add(userId)

    // Broadcast to others in the conversation
    socket.to(`conv_${conversationId}`).emit('typing_start', {
      conversationId,
      userId,
      userName,
    })

    console.log(`[Chat] ${userName} is typing in ${conversationId}`)
  })

  // ── Typing Stop ───────────────────────────────────────────────
  socket.on('typing_stop', (data: { conversationId: string; userId: string }) => {
    const { conversationId, userId } = data

    const typers = typingUsers.get(conversationId)
    if (typers) {
      typers.delete(userId)
      if (typers.size === 0) {
        typingUsers.delete(conversationId)
      }
    }

    // Broadcast to others in the conversation
    socket.to(`conv_${conversationId}`).emit('typing_stop', {
      conversationId,
      userId,
    })
  })

  // ── Message Read ──────────────────────────────────────────────
  socket.on('message_read', (data: { conversationId: string; userId: string; messageIds: string[] }) => {
    const { conversationId, userId, messageIds } = data

    // Broadcast read receipt to others in the conversation
    socket.to(`conv_${conversationId}`).emit('message_read', {
      conversationId,
      userId,
      messageIds,
      readAt: new Date().toISOString(),
    })

    console.log(`[Chat] User ${userId} read ${messageIds.length} messages in ${conversationId}`)
  })

  // ── Disconnect ────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const userInfo = socketUserMap.get(socket.id)

    if (userInfo) {
      const { userId, userName } = userInfo

      // Remove from all conversation tracking
      for (const [convId, users] of conversationUsers.entries()) {
        if (users.has(userId)) {
          users.delete(userId)
          if (users.size === 0) {
            conversationUsers.delete(convId)
          }

          // Broadcast presence update
          io.to(`conv_${convId}`).emit('presence_update', {
            conversationId: convId,
            onlineUsers: getOnlineUsers(convId),
          })

          // Remove typing state
          const typers = typingUsers.get(convId)
          if (typers) {
            typers.delete(userId)
            io.to(`conv_${convId}`).emit('typing_stop', {
              conversationId: convId,
              userId,
            })
          }
        }
      }

      socketUserMap.delete(socket.id)
      console.log(`[Chat] ${userName} (${userId}) disconnected`)
    } else {
      console.log(`[Chat] Disconnected: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`[Chat] Socket error (${socket.id}):`, error)
  })
})

// ─── Start Server ─────────────────────────────────────────────────

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[Chat] OPPY Chat Service running on port ${PORT}`)
})

// ─── Graceful Shutdown ────────────────────────────────────────────

process.on('SIGTERM', () => {
  console.log('[Chat] Received SIGTERM, shutting down...')
  io.disconnectSockets()
  httpServer.close(() => {
    console.log('[Chat] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Chat] Received SIGINT, shutting down...')
  io.disconnectSockets()
  httpServer.close(() => {
    console.log('[Chat] Server closed')
    process.exit(0)
  })
})
