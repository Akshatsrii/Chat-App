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
  const roomColor = roomInfo?.color ?? '#7c3aed';
  const roomIcon = roomInfo?.icon ?? '💬';
  const roomDesc = roomInfo?.description ?? '';

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom) scrollToBottom();
  }, [messages, scrollToBottom]);

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

  const typingText = (() => {
    const names = typingUsers.map((u) => u.username);
    if (!names.length) return null;
    if (names.length === 1) return `${names[0]} is typing`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
    return `${names.length} people are typing`;
  })();

  const qualityColor = {
    excellent: '#86efac',
    good:      '#fbbf24',
    poor:      '#f87171',
    offline:   '#4a4460',
  }[connectionQuality];

  const iconBtn = (active = false): React.CSSProperties => ({
    background: active ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.07)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: '8px',
    padding: '6px',
    color: active ? '#a78bfa' : '#8b84a3',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{
            borderBottom: '1px solid rgba(124,58,237,0.12)',
            background: 'rgba(10,10,15,0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Mobile menu */}
          <button
            onClick={onMenuClick}
            className="lg:hidden shrink-0"
            style={iconBtn()}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; e.currentTarget.style.color = '#a78bfa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.07)'; e.currentTarget.style.color = '#8b84a3'; }}
          >
            <Menu size={18} />
          </button>

          {/* Room identity */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
              style={{ background: `${roomColor}18`, border: `1px solid ${roomColor}35` }}
            >
              {roomIcon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  className="text-sm leading-none"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    color: '#f3f0ff',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {roomName}
                </h2>
                <div
                  className="w-1.5 h-1.5 rounded-full hidden sm:block"
                  style={{ background: qualityColor }}
                />
              </div>
              {roomDesc && (
                <p
                  className="text-[11px] truncate hidden sm:block mt-0.5"
                  style={{
                    color: '#5c5870',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {roomDesc}
                </p>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Online count */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs cursor-default"
              style={{
                background: 'rgba(124,58,237,0.08)',
                color: '#a78bfa',
                border: '1px solid rgba(124,58,237,0.15)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#7c3aed' }}
              />
              {activeUsers.length} online
            </div>

            {/* Search */}
            {showSearch ? (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: '#0f0f18',
                  border: '1px solid rgba(124,58,237,0.35)',
                  boxShadow: '0 0 0 3px rgba(124,58,237,0.08)',
                }}
              >
                <Search size={13} style={{ color: '#6b5fa0' }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={localSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                  placeholder="Search messages…"
                  style={{
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    width: '140px',
                    color: '#e9e6f4',
                    fontFamily: "'Inter', sans-serif",
                    border: 'none',
                  }}
                />
                {localSearch && (
                  <button
                    onClick={() => handleSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a4060', display: 'flex', padding: '2px' }}
                  >
                    <X size={11} />
                  </button>
                )}
                <button
                  onClick={closeSearch}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a4060', display: 'flex', padding: '2px' }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                style={iconBtn(showSearch)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; e.currentTarget.style.color = '#a78bfa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.07)'; e.currentTarget.style.color = '#8b84a3'; }}
              >
                <Search size={16} />
              </button>
            )}

            {/* Toggle user list */}
            <button
              onClick={() => setShowUsers((p) => !p)}
              className="hidden md:flex"
              style={iconBtn(showUsers)}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; e.currentTarget.style.color = '#a78bfa'; }}
              onMouseLeave={(e) => {
                if (!showUsers) {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.07)';
                  e.currentTarget.style.color = '#8b84a3';
                }
              }}
            >
              <Users size={16} />
              <ChevronRight
                size={11}
                style={{ transform: showUsers ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
              />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-2 relative"
          style={{
            background: '#0a0a0f',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(124,58,237,0.2) transparent',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative z-10">
            <MessageList messages={messages} searchQuery={searchQuery} />
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-28 right-6 z-20 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: '#0f0f18',
              border: '1px solid rgba(124,58,237,0.25)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              color: '#a78bfa',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            ↓
          </button>
        )}

        {/* ── Typing indicator ── */}
        <div className="px-4 h-7 flex items-center shrink-0">
          {typingText && (
            <div className="flex items-center gap-2">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#5c5870',
                }}
              >
                {typingText}
              </span>
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div
          className="px-4 pb-4 pt-2 shrink-0"
          style={{
            borderTop: '1px solid rgba(124,58,237,0.1)',
            background: 'rgba(10,10,15,0.7)',
          }}
        >
          <MessageInput roomName={roomName.toLowerCase()} />
        </div>
      </div>

      {/* ── User list ── */}
      {showUsers && (
        <div
          className="hidden md:flex shrink-0"
          style={{ borderLeft: '1px solid rgba(124,58,237,0.1)' }}
        >
          <UserList users={activeUsers} currentUserId={user?.id ?? 0} />
        </div>
      )}
    </div>
  );
}