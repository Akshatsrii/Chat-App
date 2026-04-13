'use strict';

const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true },
    users: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String },
      },
    ],
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    room: {
      type: String,
      required: [true, 'Room is required'],
      trim: true,
      lowercase: true,
      maxlength: [60, 'Room name too long'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });

// ── Statics ───────────────────────────────────────────────────────────────────
messageSchema.statics.getRecentByRoom = async function (room, limit = 60) {
  const msgs = await this.find({ room, deleted: { $ne: true } })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('sender', 'id username')
    .populate({
      path: 'replyTo',
      select: 'id content sender',
      populate: { path: 'sender', select: 'id username' },
    })
    .lean();

  return msgs.map(formatMessage);
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatMessage(m) {
  const reactionsObj = {};
  (m.reactions || []).forEach(({ emoji, users }) => {
    reactionsObj[emoji] = users.map((u) => ({ id: u.userId?.toString(), username: u.username }));
  });

  return {
    id: m._id.toString(),
    content: m.content,
    room: m.room,
    edited: m.edited,
    sender: {
      id: m.sender?._id?.toString() || m.sender?.toString(),
      username: m.sender?.username || '',
    },
    createdAt: m.createdAt,
    reactions: reactionsObj,
    replyTo: m.replyTo
      ? {
          id: m.replyTo._id?.toString(),
          content: m.replyTo.content,
          sender: { username: m.replyTo.sender?.username || '' },
        }
      : null,
  };
}

messageSchema.statics.formatMessage = formatMessage;

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
