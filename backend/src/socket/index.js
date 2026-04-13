'use strict';

const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Message = require('../models/Message');
const logger = require('../utils/logger');

// ── In-memory state ───────────────────────────────────────────────────────────
/** socketId → { id, username, room, joinedAt } */
const activeUsers = new Map();

/** room → Map<userId, { username, timer }> */
const typingUsers = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────
function sanitizeRoom(name) {
  return String(name || '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '').slice(0, 60);
}

function getRoomUsers(room) {
  return [...activeUsers.values()]
    .filter((u) => u.room === room)
    .map(({ id, username, socketId, room: r, joinedAt }) => ({ id, username, socketId, room: r, joinedAt }));
}

function getRoomTyping(room) {
  const map = typingUsers.get(room);
  if (!map) return [];
  return [...map.values()].map(({ userId, username }) => ({ userId, username, room }));
}

function clearTyping(io, room, userId) {
  const map = typingUsers.get(room);
  if (!map) return;
  const entry = map.get(userId);
  if (entry?.timer) clearTimeout(entry.timer);
  map.delete(userId);
  if (map.size === 0) typingUsers.delete(room);
  io.to(room).emit('chat:typing-users', getRoomTyping(room));
}

// ── Setup ─────────────────────────────────────────────────────────────────────
function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        process.env.FRONTEND_URL || 'http://localhost:3000',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Auth middleware ─────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token missing'));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error('Invalid token'));
    const user = await User.findById(decoded.id).select('id username').lean();
    if (!user) return next(new Error('User not found'));
    socket.user = { id: user._id.toString(), username: user.username };
    next();
  });

  // ── Connection ──────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { user } = socket;
    logger.info(`[Socket] ${user.username} connected (${socket.id})`);

    // Latency ping
    socket.on('ping', (cb) => { if (typeof cb === 'function') cb(); });

    // ── Join Room ─────────────────────────────────────────────────────────────
    socket.on('chat:join-room', async ({ room }) => {
      const roomId = sanitizeRoom(room);
      if (!roomId) return;

      // Leave previous room
      const prev = activeUsers.get(socket.id);
      if (prev?.room) {
        socket.leave(prev.room);
        clearTyping(io, prev.room, user.id);
        io.to(prev.room).emit('chat:user-left', { username: user.username, userId: user.id, room: prev.room });
        io.to(prev.room).emit('chat:active-users', getRoomUsers(prev.room));
      }

      socket.join(roomId);
      activeUsers.set(socket.id, { id: user.id, username: user.username, socketId: socket.id, room: roomId, joinedAt: new Date().toISOString() });

      // Load history
      try {
        const history = await Message.getRecentByRoom(roomId, 60);
        socket.emit('chat:message-history', history);
      } catch (err) {
        logger.error('[Socket] History error:', err);
        socket.emit('chat:message-history', []);
      }

      io.to(roomId).emit('chat:user-joined', { username: user.username, userId: user.id, room: roomId });
      io.to(roomId).emit('chat:active-users', getRoomUsers(roomId));
    });

    // ── Send Message ──────────────────────────────────────────────────────────
    socket.on('chat:send-message', async ({ content, room, replyToId }) => {
      const roomId = sanitizeRoom(room);
      const trimmed = String(content || '').trim();
      if (!trimmed || trimmed.length > 2000 || !roomId) return;

      const userData = activeUsers.get(socket.id);
      if (!userData || userData.room !== roomId) {
        return socket.emit('chat:error', { message: 'You are not in this room' });
      }

      try {
        const createData = { content: trimmed, room: roomId, sender: user.id };
        if (replyToId) createData.replyTo = replyToId;

        const msg = await Message.create(createData);

        const populated = await Message.findById(msg._id)
          .populate('sender', 'id username')
          .populate({ path: 'replyTo', select: 'id content sender', populate: { path: 'sender', select: 'id username' } })
          .lean();

        clearTyping(io, roomId, user.id);

        io.to(roomId).emit('chat:new-message', {
          id: populated._id.toString(),
          content: populated.content,
          room: populated.room,
          sender: { id: populated.sender?._id?.toString() || user.id, username: populated.sender?.username || user.username },
          createdAt: populated.createdAt,
          reactions: {},
          replyTo: populated.replyTo ? {
            id: populated.replyTo._id?.toString(),
            content: populated.replyTo.content,
            sender: { username: populated.replyTo.sender?.username || '' },
          } : null,
        });
      } catch (err) {
        logger.error('[Socket] Send error:', err);
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    // ── Typing ────────────────────────────────────────────────────────────────
    socket.on('chat:typing-start', ({ room }) => {
      const roomId = sanitizeRoom(room);
      if (!roomId) return;
      if (!typingUsers.has(roomId)) typingUsers.set(roomId, new Map());
      const map = typingUsers.get(roomId);
      const existing = map.get(user.id);
      if (existing?.timer) clearTimeout(existing.timer);
      const timer = setTimeout(() => clearTyping(io, roomId, user.id), 4000);
      map.set(user.id, { userId: user.id, username: user.username, timer });
      io.to(roomId).emit('chat:typing-users', getRoomTyping(roomId));
    });

    socket.on('chat:typing-stop', ({ room }) => {
      const roomId = sanitizeRoom(room);
      if (roomId) clearTyping(io, roomId, user.id);
    });

    // ── Reactions ─────────────────────────────────────────────────────────────
    socket.on('chat:add-reaction', async ({ messageId, emoji, room }) => {
      const roomId = sanitizeRoom(room);
      if (!messageId || !emoji || !roomId) return;

      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        const existing = msg.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          const idx = existing.users.findIndex((u) => u.userId?.toString() === user.id);
          if (idx !== -1) {
            existing.users.splice(idx, 1);
            if (existing.users.length === 0) {
              msg.reactions = msg.reactions.filter((r) => r.emoji !== emoji);
            }
          } else {
            existing.users.push({ userId: user.id, username: user.username });
          }
        } else {
          msg.reactions.push({ emoji, users: [{ userId: user.id, username: user.username }] });
        }

        await msg.save();

        const reactionsObj = {};
        msg.reactions.forEach(({ emoji: e, users }) => {
          reactionsObj[e] = users.map((u) => ({ id: u.userId?.toString(), username: u.username }));
        });

        io.to(roomId).emit('chat:reaction-updated', { messageId: messageId.toString(), reactions: reactionsObj });
      } catch (err) {
        logger.error('[Socket] Reaction error:', err);
      }
    });

    // ── Edit Message ──────────────────────────────────────────────────────────
    socket.on('chat:edit-message', async ({ messageId, content, room }) => {
      const roomId = sanitizeRoom(room);
      const trimmed = String(content || '').trim();
      if (!messageId || !trimmed || !roomId) return;

      try {
        const msg = await Message.findById(messageId).populate('sender', 'id username');
        if (!msg || msg.sender?._id?.toString() !== user.id) {
          return socket.emit('chat:error', { message: 'Cannot edit this message' });
        }

        msg.content = trimmed;
        msg.edited = true;
        msg.editedAt = new Date();
        await msg.save();

        io.to(roomId).emit('chat:message-updated', {
          id: msg._id.toString(),
          content: msg.content,
          edited: true,
          room: roomId,
          sender: { id: msg.sender?._id?.toString(), username: msg.sender?.username },
          createdAt: msg.createdAt,
        });
      } catch (err) {
        logger.error('[Socket] Edit error:', err);
        socket.emit('chat:error', { message: 'Failed to edit message' });
      }
    });

    // ── Delete Message ────────────────────────────────────────────────────────
    socket.on('chat:delete-message', async ({ messageId, room }) => {
      const roomId = sanitizeRoom(room);
      if (!messageId || !roomId) return;

      try {
        const msg = await Message.findById(messageId).populate('sender', 'id');
        if (!msg || msg.sender?._id?.toString() !== user.id) {
          return socket.emit('chat:error', { message: 'Cannot delete this message' });
        }

        // Soft delete
        msg.deleted = true;
        await msg.save();

        io.to(roomId).emit('chat:message-deleted', { id: msg._id.toString() });
      } catch (err) {
        logger.error('[Socket] Delete error:', err);
        socket.emit('chat:error', { message: 'Failed to delete message' });
      }
    });

    // ── Leave Room ────────────────────────────────────────────────────────────
    socket.on('chat:leave-room', ({ room }) => {
      const roomId = sanitizeRoom(room);
      if (!roomId) return;
      socket.leave(roomId);
      clearTyping(io, roomId, user.id);
      activeUsers.delete(socket.id);
      io.to(roomId).emit('chat:user-left', { username: user.username, userId: user.id, room: roomId });
      io.to(roomId).emit('chat:active-users', getRoomUsers(roomId));
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const userData = activeUsers.get(socket.id);
      if (userData?.room) {
        clearTyping(io, userData.room, user.id);
        io.to(userData.room).emit('chat:user-left', { username: user.username, userId: user.id, room: userData.room });
        io.to(userData.room).emit('chat:active-users', getRoomUsers(userData.room));
      }
      activeUsers.delete(socket.id);
      logger.info(`[Socket] ${user.username} disconnected`);
    });

    socket.on('error', (err) => logger.error(`[Socket] Error ${user.username}:`, err));
  });

  logger.info('[Socket.io] Server initialized ✓');
  return io;
}

module.exports = { setupSocket };
