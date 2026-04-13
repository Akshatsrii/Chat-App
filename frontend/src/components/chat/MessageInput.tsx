'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Smile, X, Reply, Paperclip, Mic } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSocket } from '@/contexts/SocketContext';
import { cn, truncate } from '@/lib/utils';

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

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [content]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const iconBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#4a4060',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px',
    borderRadius: '7px',
    transition: 'color 0.15s, background 0.15s',
    flexShrink: 0,
  };

  return (
    <div className="space-y-2" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Reply preview */}
      {replyTarget && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(124,58,237,0.07)',
            border: '1px solid rgba(124,58,237,0.18)',
          }}
        >
          <Reply size={13} style={{ color: '#a78bfa', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <span
              className="text-xs font-semibold"
              style={{ color: '#a78bfa', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Replying to @{replyTarget.sender.username || '…'}
            </span>
            <p
              className="text-xs truncate"
              style={{ color: '#5c5870', fontFamily: "'JetBrains Mono', monospace" }}
            >
              {truncate(replyTarget.content, 80)}
            </p>
          </div>
          <button
            onClick={() => setReplyTarget(null)}
            style={{ ...iconBtnStyle, width: '22px', height: '22px' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4a4060'; }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Input container */}
      <div
        className="flex items-end gap-2 px-3 py-2.5 rounded-xl transition-all duration-200"
        style={{
          background: '#0f0f18',
          border: isFocused
            ? '1px solid rgba(124,58,237,0.5)'
            : '1px solid rgba(124,58,237,0.15)',
          boxShadow: isFocused
            ? '0 0 0 3px rgba(124,58,237,0.08)'
            : 'none',
        }}
      >
        {/* Attachment */}
        <button
          style={iconBtnStyle}
          className="mb-0.5"
          onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#4a4060'; e.currentTarget.style.background = 'none'; }}
        >
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
          className="flex-1 resize-none bg-transparent py-1 outline-none leading-relaxed"
          style={{
            color: '#e9e6f4',
            fontSize: '14px',
            maxHeight: 180,
            minHeight: 24,
            fontFamily: "'Inter', sans-serif",
            border: 'none',
          }}
        />

        <div className="flex items-center gap-1 shrink-0 mb-0.5">
          {/* Char counter */}
          {isNearLimit && (
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                color: remaining < 50 ? '#f87171' : '#fbbf24',
                transition: 'color 0.2s',
              }}
            >
              {remaining}
            </span>
          )}

          {/* Emoji */}
          <div className="relative" ref={emojiRef}>
            <button
              style={{
                ...iconBtnStyle,
                color: showEmoji ? '#a78bfa' : '#4a4060',
                background: showEmoji ? 'rgba(124,58,237,0.12)' : 'none',
              }}
              onClick={() => setShowEmoji((p) => !p)}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
              onMouseLeave={(e) => {
                if (!showEmoji) {
                  e.currentTarget.style.color = '#4a4060';
                  e.currentTarget.style.background = 'none';
                }
              }}
            >
              <Smile size={17} />
            </button>
            {showEmoji && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
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

          {/* Voice */}
          <button
            style={iconBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4a4060'; e.currentTarget.style.background = 'none'; }}
          >
            <Mic size={17} />
          </button>

          {/* Send */}
          <button
            onClick={submit}
            disabled={!canSend}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 shrink-0"
            style={{
              background: canSend ? '#7c3aed' : 'rgba(124,58,237,0.08)',
              color: canSend ? '#fff' : '#3a3750',
              cursor: canSend ? 'pointer' : 'not-allowed',
              border: canSend ? 'none' : '1px solid rgba(124,58,237,0.1)',
              transform: canSend ? 'scale(1)' : 'scale(0.95)',
              boxShadow: canSend ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { if (canSend) e.currentTarget.style.background = '#6d28d9'; }}
            onMouseLeave={(e) => { if (canSend) e.currentTarget.style.background = '#7c3aed'; }}
            onMouseDown={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(0.93)'; }}
            onMouseUp={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Send size={15} style={{ marginLeft: 1 }} />
          </button>
        </div>
      </div>

      {/* Shortcut hints */}
      <p
        className="text-[10px] text-center"
        style={{ color: '#2e2b3d', fontFamily: "'JetBrains Mono', monospace" }}
      >
        <kbd
          className="px-1 py-0.5 rounded text-[9px]"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#5c5070' }}
        >
          Enter
        </kbd>{' '}
        to send ·{' '}
        <kbd
          className="px-1 py-0.5 rounded text-[9px]"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#5c5070' }}
        >
          Shift+Enter
        </kbd>{' '}
        for new line ·{' '}
        <kbd
          className="px-1 py-0.5 rounded text-[9px]"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#5c5070' }}
        >
          Esc
        </kbd>{' '}
        to cancel reply
      </p>
    </div>
  );
}