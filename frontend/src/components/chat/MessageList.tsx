'use client';

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Copy, Reply, Trash2, Edit3, Smile, Pin, MoreHorizontal, Check } from 'lucide-react';
import { SocketMessage } from '@/types';
import { getInitials, getUserColor, formatMessageTime, formatMessageDate, highlightText, cn, truncate } from '@/lib/utils';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '💯'];

interface MessageListProps {
  messages: SocketMessage[];
  searchQuery: string;
}

interface ContextMenu {
  visible: boolean; x: number; y: number;
  messageId: number; isOwn: boolean; content: string;
}

function SystemMessage({ msg }: { msg: SocketMessage }) {
  return (
    <div className="flex justify-center my-2">
      <div className="system-message">
        <span>{msg.systemEvent === 'join' ? '→' : '←'}</span>
        <span>{msg.content}</span>
      </div>
    </div>
  );
}

function DateDivider({ dateStr }: { dateStr: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
      <span className="text-[11px] font-mono px-3 py-1 rounded-full" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
        {formatMessageDate(dateStr)}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  );
}

interface BubbleProps {
  msg: SocketMessage;
  isOwn: boolean;
  isConsecutive: boolean;
  searchQuery: string;
  onContextMenu: (e: React.MouseEvent, msg: SocketMessage) => void;
  onReaction: (msgId: number, emoji: string) => void;
  onReply: (msg: SocketMessage) => void;
  currentUserId: number;
}

function MessageBubble({ msg, isOwn, isConsecutive, searchQuery, onContextMenu, onReaction, onReply, currentUserId }: BubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const { bg: avatarBg, text: avatarText } = getUserColor(msg.sender.username);
  const initials = getInitials(msg.sender.username);
  const color = avatarBg;

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success('Copied!', { duration: 1500 });
  };

  const highlightedContent = searchQuery
    ? highlightText(msg.content, searchQuery)
    : null;

  const reactionEntries = msg.reactions ? Object.entries(msg.reactions) : [];

  return (
    <div className={cn('flex message-wrapper', isOwn ? 'justify-end' : 'items-start gap-2.5', isConsecutive ? 'mt-0.5' : 'mt-4')}>
      {/* Avatar */}
      {!isOwn && (
        <div className="shrink-0 mt-1" style={{ width: 32 }}>
          {!isConsecutive ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: avatarBg, color: avatarText }}>
              {initials}
            </div>
          ) : null}
        </div>
      )}

      <div className={cn('flex flex-col max-w-[72%]', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender name + time */}
        {!isConsecutive && (
          <div className={cn('flex items-center gap-2 mb-1.5', isOwn ? 'flex-row-reverse' : '')}>
            <span className="text-[13px] font-semibold" style={{ color: isOwn ? 'var(--color-cyan)' : color }}>{isOwn ? 'You' : msg.sender.username}</span>
            <span className="text-[11px] font-mono" style={{ color: 'var(--color-subtle)' }}>{formatMessageTime(msg.createdAt)}</span>
            {msg.edited && <span className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>(edited)</span>}
          </div>
        )}

        {/* Reply context */}
        {msg.replyTo && (
          <div className={cn('mb-1.5 max-w-full', isOwn ? 'self-end' : 'self-start')}>
            <div className="reply-bar opacity-70 cursor-pointer hover:opacity-100 transition-opacity rounded-lg" style={{ maxWidth: '280px' }}>
              <Reply size={12} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold" style={{ color: 'var(--color-cyan)' }}>@{msg.replyTo.sender.username}</span>
                <p className="text-[12px] truncate" style={{ color: 'var(--color-subtle)' }}>{truncate(msg.replyTo.content, 60)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className="relative group">
          {/* Message actions */}
          <div className={cn('message-actions', isOwn ? '' : 'left-side')}>
            <button className="btn-icon w-7 h-7" onClick={() => setShowReactionPicker((p) => !p)} data-tooltip="React"><Smile size={13} /></button>
            <button className="btn-icon w-7 h-7" onClick={() => onReply(msg)} data-tooltip="Reply"><Reply size={13} /></button>
            <button className="btn-icon w-7 h-7" onClick={handleCopy} data-tooltip="Copy">{copied ? <Check size={13} style={{ color: 'var(--color-emerald)' }} /> : <Copy size={13} />}</button>
            <button className="btn-icon w-7 h-7" onClick={(e) => onContextMenu(e, msg)} data-tooltip="More"><MoreHorizontal size={13} /></button>
          </div>

          {/* Quick emoji picker */}
          {showReactionPicker && (
            <div
              className={cn('absolute bottom-full mb-1 flex gap-1 p-2 rounded-xl z-20 animate-fade-in-scale', isOwn ? 'right-0' : 'left-0')}
              style={{ background: 'var(--color-panel-2)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-float)' }}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onReaction(msg.id, emoji); setShowReactionPicker(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-base transition-all hover:scale-125 hover:bg-white/5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div
            className={cn(
              isOwn ? 'bubble-own' : 'bubble-other',
              'px-4 py-2.5 text-sm leading-relaxed break-words animate-message-pop',
              msg.isPending ? 'opacity-60' : ''
            )}
            style={isOwn ? { background: `linear-gradient(135deg, ${color}bb, ${color})`, color: avatarText } : { color: 'var(--color-text)' }}
            onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, msg); }}
          >
            {highlightedContent ? (
              <span dangerouslySetInnerHTML={{ __html: highlightedContent }} />
            ) : (
              msg.content
            )}
            {isConsecutive && (
              <span className="ml-2 text-[10px] font-mono opacity-50">{formatMessageTime(msg.createdAt)}</span>
            )}
          </div>
        </div>

        {/* Reactions */}
        {reactionEntries.length > 0 && (
          <div className={cn('flex flex-wrap gap-1 mt-1.5', isOwn ? 'justify-end' : 'justify-start')}>
            {reactionEntries.map(([emoji, users]) => {
              const hasReacted = users.some((u) => u.id === currentUserId);
              return (
                <button
                  key={emoji}
                  className={cn('reaction-btn animate-reaction-pop', hasReacted ? 'active' : '')}
                  onClick={() => onReaction(msg.id, emoji)}
                >
                  <span>{emoji}</span>
                  <span className="text-[11px] font-mono">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessageList({ messages, searchQuery }: MessageListProps) {
  const { user } = useAuth();
  const { addReaction, setReplyTarget, deleteMessage } = useSocket();
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, msg: SocketMessage) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, messageId: msg.id, isOwn: msg.sender.id === user?.id, content: msg.content });
  }, [user?.id]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter by search
  const displayMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter((m) => m.type === 'system' || m.content.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Array<{ key: string; messages: SocketMessage[] }> = [];
    displayMessages.forEach((msg) => {
      const key = format(new Date(msg.createdAt), 'yyyy-MM-dd');
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.messages.push(msg);
      else groups.push({ key, messages: [msg] });
    });
    return groups;
  }, [displayMessages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center animate-fade-in-up">
        <div className="text-5xl mb-4 animate-float">💬</div>
        <p className="font-display font-bold text-text-bright text-lg mb-2">No messages yet</p>
        <p className="text-subtle text-sm">Be the first to say something!</p>
      </div>
    );
  }

  if (displayMessages.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 animate-fade-in-up">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-text-dim">No results for &ldquo;{searchQuery}&rdquo;</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0 pb-2">
        {grouped.map(({ key, messages: dayMsgs }) => (
          <div key={key}>
            <DateDivider dateStr={`${key}T12:00:00`} />
            {dayMsgs.map((msg, idx) => {
              if (msg.type === 'system') return <SystemMessage key={msg.id} msg={msg} />;
              const prev = dayMsgs.slice(0, idx).reverse().find((m) => m.type !== 'system');
              const isConsecutive = !!prev && prev.sender.id === msg.sender.id
                && new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000;
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.sender.id === user?.id}
                  isConsecutive={isConsecutive}
                  searchQuery={searchQuery}
                  onContextMenu={handleContextMenu}
                  onReaction={addReaction}
                  onReply={(m) => setReplyTarget({ id: m.id, content: m.content, sender: { username: m.sender.username } })}
                  currentUserId={user?.id ?? 0}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu?.visible && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 160) }}
        >
          <div className="context-menu-item" onClick={() => { setReplyTarget({ id: contextMenu.messageId, content: contextMenu.content, sender: { username: '' } }); setContextMenu(null); }}>
            <Reply size={14} /> Reply
          </div>
          <div className="context-menu-item" onClick={() => { navigator.clipboard.writeText(contextMenu.content); toast.success('Copied!', { duration: 1500 }); setContextMenu(null); }}>
            <Copy size={14} /> Copy text
          </div>
          <div className="context-menu-item" onClick={() => { setContextMenu(null); }}>
            <Pin size={14} /> Pin message
          </div>
          {contextMenu.isOwn && (
            <>
              <div className="context-menu-divider" />
              <div className="context-menu-item danger" onClick={() => { deleteMessage(contextMenu.messageId); setContextMenu(null); }}>
                <Trash2 size={14} /> Delete
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
