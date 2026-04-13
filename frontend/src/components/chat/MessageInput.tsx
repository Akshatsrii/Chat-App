'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Smile, X, Reply, Paperclip, Mic } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSocket } from '@/contexts/SocketContext';
import { cn, truncate } from '@/lib/utils';

// Lazy-load emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface MessageInputProps {
  roomName: string;
}

const MAX_LENGTH = 2000;

export default function MessageInput({ roomName }: MessageInputProps) {
  const { sendMessage, startTyping, stopTyping, replyTarget, setReplyTarget } = useSocket();
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [content]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus on reply
  useEffect(() => {
    if (replyTarget) textareaRef.current?.focus();
  }, [replyTarget]);

  const handleTypingSignal = useCallback(() => {
    if (!isTypingRef.current) { isTypingRef.current = true; startTyping(); }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      stopTyping();
    }, 2000);
  }, [startTyping, stopTyping]);

  const submit = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setContent('');
    isTypingRef.current = false;
    stopTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    textareaRef.current?.focus();
  }, [content, sendMessage, stopTyping]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    if (e.key === 'Escape' && replyTarget) setReplyTarget(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > MAX_LENGTH) return;
    setContent(val);
    if (val.trim()) handleTypingSignal();
    else { isTypingRef.current = false; stopTyping(); }
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = content.slice(0, start) + emojiData.emoji + content.slice(end);
    setContent(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
    }, 0);
  };

  const remaining = MAX_LENGTH - content.length;
  const isNearLimit = remaining < 200;
  const canSend = content.trim().length > 0;

  return (
    <div className="space-y-2">
      {/* Reply preview */}
      {replyTarget && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl animate-slide-in-up" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)' }}>
          <Reply size={13} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-cyan)' }}>Replying to @{replyTarget.sender.username || '…'}</span>
            <p className="text-xs truncate" style={{ color: 'var(--color-subtle)' }}>{truncate(replyTarget.content, 80)}</p>
          </div>
          <button onClick={() => setReplyTarget(null)} className="btn-icon w-6 h-6 shrink-0">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Input container */}
      <div
        className="flex items-end gap-2 px-3 py-2.5 rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(10,13,22,0.7)',
          border: isFocused
            ? '1px solid rgba(0,212,255,0.4)'
            : '1px solid var(--color-border)',
          boxShadow: isFocused ? '0 0 0 3px rgba(0,212,255,0.06), 0 0 24px rgba(0,212,255,0.06)' : 'none',
        }}
      >
        {/* Attachment button */}
        <button className="btn-icon shrink-0 mb-0.5" data-tooltip="Attach file (coming soon)">
          <Paperclip size={17} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`Message #${roomName} · Shift+Enter for new line`}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm leading-relaxed py-1 outline-none font-body"
          style={{ color: 'var(--color-text-bright)', maxHeight: 180, minHeight: 24 }}
        />

        <div className="flex items-center gap-1 shrink-0 mb-0.5">
          {/* Char counter */}
          {isNearLimit && (
            <span className="text-[11px] font-mono transition-colors" style={{ color: remaining < 50 ? 'var(--color-rose)' : 'var(--color-amber)' }}>
              {remaining}
            </span>
          )}

          {/* Emoji picker button */}
          <div className="relative" ref={emojiRef}>
            <button
              className={cn('btn-icon', showEmoji ? 'active' : '')}
              onClick={() => setShowEmoji((p) => !p)}
              data-tooltip="Emoji"
            >
              <Smile size={17} />
            </button>
            {showEmoji && (
              <div className="absolute bottom-full right-0 mb-2 z-50 animate-fade-in-scale">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={'dark' as unknown as import('emoji-picker-react').Theme}
                  width={320}
                  height={380}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>

          {/* Voice message button */}
          <button className="btn-icon" data-tooltip="Voice message (coming soon)">
            <Mic size={17} />
          </button>

          {/* Send button */}
          <button
            onClick={submit}
            disabled={!canSend}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 shrink-0"
            style={{
              background: canSend ? 'linear-gradient(135deg, var(--color-cyan-dim), var(--color-cyan))' : 'var(--color-surface)',
              color: canSend ? 'var(--color-void)' : 'var(--color-muted)',
              cursor: canSend ? 'pointer' : 'not-allowed',
              transform: canSend ? undefined : 'scale(0.95)',
              boxShadow: canSend ? '0 4px 16px rgba(0,212,255,0.25)' : 'none',
            }}
            data-tooltip="Send (Enter)"
          >
            <Send size={15} style={{ marginLeft: 1 }} />
          </button>
        </div>
      </div>

      {/* Shortcut hint */}
      <p className="text-[10px] text-center font-mono" style={{ color: 'var(--color-muted)' }}>
        <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>Enter</kbd> to send ·{' '}
        <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>Shift+Enter</kbd> for new line ·{' '}
        <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>Esc</kbd> to cancel reply
      </p>
    </div>
  );
}
