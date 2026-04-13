'use strict';

const Message = require('../models/Message');
const logger = require('../utils/logger');

// ── GET /api/messages ─────────────────────────────────────────────────────────
// Supports Strapi-style query: ?filters[room][$eq]=general&pagination[pageSize]=50
async function getMessages(req, res, next) {
  try {
    const room = req.query?.filters?.room?.['$eq'] || req.query?.room || 'general';
    const pageSize = parseInt(req.query?.pagination?.pageSize || '50', 10);
    const page = parseInt(req.query?.pagination?.page || '1', 10);

    const sanitizedRoom = String(room).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    const skip = (page - 1) * pageSize;

    const [messages, total] = await Promise.all([
      Message.find({ room: sanitizedRoom, deleted: { $ne: true } })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(pageSize)
        .populate('sender', 'id username')
        .populate({
          path: 'replyTo',
          select: 'id content sender',
          populate: { path: 'sender', select: 'id username' },
        })
        .lean(),
      Message.countDocuments({ room: sanitizedRoom, deleted: { $ne: true } }),
    ]);

    // Return in Strapi-compatible format for frontend compatibility
    const data = messages.map((m) => ({
      id: m._id.toString(),
      attributes: {
        content: m.content,
        room: m.room,
        edited: m.edited,
        createdAt: m.createdAt,
        sender: { data: { id: m.sender?._id?.toString(), attributes: { username: m.sender?.username } } },
      },
    }));

    res.json({
      data,
      meta: {
        pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/messages ────────────────────────────────────────────────────────
async function createMessage(req, res, next) {
  try {
    const { content, room } = req.body?.data || req.body || {};

    if (!content?.trim()) {
      return res.status(400).json({ error: { status: 400, name: 'BadRequest', message: 'Content is required' } });
    }
    if (!room?.trim()) {
      return res.status(400).json({ error: { status: 400, name: 'BadRequest', message: 'Room is required' } });
    }

    const sanitizedRoom = String(room).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');

    const message = await Message.create({
      content: content.trim(),
      room: sanitizedRoom,
      sender: req.user._id,
    });

    // Broadcast via Socket.io if available
    const io = req.app.get('io');
    if (io) {
      const populated = await Message.findById(message._id)
        .populate('sender', 'id username')
        .lean();
      io.to(sanitizedRoom).emit('chat:new-message', {
        id: populated._id.toString(),
        content: populated.content,
        room: populated.room,
        sender: { id: populated.sender?._id?.toString(), username: populated.sender?.username },
        createdAt: populated.createdAt,
        reactions: {},
        replyTo: null,
      });
    }

    res.status(201).json({ data: { id: message._id.toString(), ...message.toObject() } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMessages, createMessage };
