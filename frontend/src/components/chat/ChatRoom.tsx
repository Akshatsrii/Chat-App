'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Hash, Users, Menu, ChevronRight, Search, X, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import { DEFAULT_ROOMS } from '@/lib/rooms';
import { cn } from '@/lib/utils';

interface ChatRoomProps {
  onMenuClick: () => void;
}

export default function ChatRoom({ onMenuClick }: ChatRoomProps) {
  const { currentRoom, messages, activeUsers, typingUsers, isConnected, connectionQuality, searchQuery, setSearchQuery } = useSocket();
  const { user } = useAuth();
  const [showUsers, setShowUsers] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const roomInfo = DEFAULT_ROOMS.find((r) => r.id === currentRoom);
  const roomName = roomInfo?.name ?? currentRoom ?? '';
  const roomColor = roomInfo?.color ?? '#00d4ff';
  const roomIcon = roomInfo?.icon ?? '💬';
  const roomDesc = roomInfo?.description ?? '';

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll on new messages if near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom) scrollToBottom();
  }, [messages, scrollToBottom]);

  // Track scroll position for scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handler = () => {
      const fromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollBtn(fromBottom > 200);
    };
    container.addEventListener('scroll', handler, { passive: true });
    return () => container.removeEventListener('scroll', handler);
  }, []);

  // Focus search input when shown
  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  const handleSearch = (val: string) => {
    setLocalSearch(val);
    setSearchQuery(val);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setLocalSearch('');
    setSearchQuery('');
  };

  // Typing indicator text
  const typingText = (() => {
    const names = typingUsers.map((u) => u.username);
    if (!names.length) return null;
    if (names.length === 1) return `${names[0]} is typing`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
    return `${names.length} people are typing`;
  })();

  const qualityColor = { excellent: '#00e5a0', good: '#ffb800', poor: '#ff3366', offline: '#5a7299' }[connectionQuality];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{
            borderBottom: '1px solid var(--color-border)',
            background: 'rgba(13,21,32,0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Mobile menu */}
          <button onClick={onMenuClick} className="lg:hidden btn-icon shrink-0">
            <Menu size={18} />
          </button>

          {/* Room identity */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
              style={{ background: `${roomColor}18`, border: `1px solid ${roomColor}30` }}
            >
              {roomIcon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-text-bright leading-none">{roomName}</h2>
                <div className="w-1.5 h-1.5 rounded-full hidden sm:block" style={{ background: qualityColor }} />
              </div>
              {roomDesc && <p className="text-[11px] truncate hidden sm:block" style={{ color: 'var(--color-subtle)' }}>{roomDesc}</p>}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Online count */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-default"
              style={{ background: 'rgba(0,229,160,0.06)', color: 'var(--color-emerald)', border: '1px solid rgba(0,229,160,0.12)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-emerald)', animation: 'glow-pulse 2s ease infinite' }} />
              {activeUsers.length} online
            </div>

            {/* Search */}
            {showSearch ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg animate-fade-in-scale" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-bright)' }}>
                <Search size={13} style={{ color: 'var(--color-subtle)' }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={localSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                  placeholder="Search messages…"
                  className="bg-transparent outline-none text-sm font-body w-36"
                  style={{ color: 'var(--color-text-bright)' }}
                />
                {localSearch && (
                  <button onClick={() => handleSearch('')} className="btn-icon w-5 h-5">
                    <X size={11} />
                  </button>
                )}
                <button onClick={closeSearch} className="btn-icon w-6 h-6">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)} className={cn('btn-icon', showSearch ? 'active' : '')} data-tooltip="Search messages">
                <Search size={16} />
              </button>
            )}

            {/* Toggle user list */}
            <button
              onClick={() => setShowUsers((p) => !p)}
              className={cn('btn-icon hidden md:flex', showUsers ? 'active' : '')}
              data-tooltip="Members"
            >
              <Users size={16} />
              <ChevronRight size={11} style={{ transform: showUsers ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
            </button>
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-2 messages-scroll relative"
          style={{ background: 'var(--color-void)' }}
        >
          {/* Subtle grid */}
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="relative z-10">
            <MessageList messages={messages} searchQuery={searchQuery} />
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-28 right-6 z-20 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold animate-fade-in-scale"
            style={{
              background: 'var(--color-panel-2)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              color: 'var(--color-cyan)',
            }}
          >
            ↓
          </button>
        )}

        {/* ── Typing indicator ─────────────────────────────────────────────── */}
        <div className="px-4 h-7 flex items-center shrink-0">
          {typingText && (
            <div className="flex items-center gap-2 animate-fade-in-up">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span className="text-[11px] font-mono" style={{ color: 'var(--color-subtle)' }}>
                {typingText}
              </span>
            </div>
          )}
        </div>

        {/* ── Input ─────────────────────────────────────────────────────────── */}
        <div className="px-4 pb-4 pt-1 shrink-0" style={{ borderTop: '1px solid var(--color-border)', background: 'rgba(13,21,32,0.6)' }}>
          <MessageInput roomName={roomName.toLowerCase()} />
        </div>
      </div>

      {/* ── User list ────────────────────────────────────────────────────────── */}
      {showUsers && (
        <div className="hidden md:flex shrink-0 animate-slide-in-right">
          <UserList users={activeUsers} currentUserId={user?.id ?? 0} />
        </div>
      )}
    </div>
  );
}
