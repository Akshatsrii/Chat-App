'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hash, LogOut, Plus, X, Wifi, WifiOff, Settings, ChevronDown, Volume2, VolumeX, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { DEFAULT_ROOMS } from '@/lib/rooms';
import { getInitials, getUserColor, cn } from '@/lib/utils';

// ── Purple & black palette ─────────────────────────────────────────────────
const PURPLE = {
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#4c1d95',
  950: '#2e1065',
};
const BLACK  = '#0a0a0f';
const PANEL  = '#0f0f17';
const PANEL2 = '#16161f';
const BORDER = '#2a1f3d';
const TEXT   = '#e2d9f3';
const SUBTLE = '#9d8ec4';
const MUTED  = '#5c4f7a';
const EMERALD = '#34d399';
const ROSE    = '#f43f5e';
// ──────────────────────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { joinRoom, leaveRoom, currentRoom, isConnected, connectionQuality, activeUsers, notifications, toggleSound, unreadCounts } = useSocket();
  const router = useRouter();
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const handleJoin = (roomId: string) => {
    if (currentRoom === roomId) return;
    joinRoom(roomId);
    onMobileClose();
  };

  const handleCustomJoin = () => {
    const name = customName.trim().toLowerCase().replace(/\s+/g, '-');
    if (name.length < 2) { toast.error('Room name too short'); return; }
    joinRoom(name);
    setCustomName(''); setShowCustom(false);
    onMobileClose();
  };

  const handleLogout = () => {
    leaveRoom();
    logout();
    toast.success('Signed out');
    router.push('/auth/login');
  };

  const { bg: avatarBg, text: avatarText } = user ? getUserColor(user.username) : { bg: PURPLE[600], text: '#fff' };
  const initials = user ? getInitials(user.username) : '??';

  const qualityColor = {
    excellent: EMERALD,
    good: '#f59e0b',
    poor: ROSE,
    offline: MUTED,
  }[connectionQuality];

  const qualityLabel = {
    excellent: 'LIVE',
    good: 'GOOD',
    poor: 'POOR',
    offline: 'OFFLINE',
  }[connectionQuality];

  const content = (
    <div
      className="flex flex-col h-full w-72"
      style={{ background: PANEL, borderRight: `1px solid ${BORDER}` }}
    >
      {/* Top accent line — purple gradient */}
      <div
        className="h-px w-full shrink-0"
        style={{ background: `linear-gradient(90deg, transparent, ${PURPLE[500]}, transparent)` }}
      />

      {/* Header */}
      <div className="p-4 shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative"
              style={{ background: `linear-gradient(135deg, ${PURPLE[500]}, ${PURPLE[800]})` }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 5v6l-7 4L1 11V5L8 1z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              {isConnected && (
                <div
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 animate-pulse"
                  style={{ background: qualityColor, borderColor: PANEL }}
                />
              )}
            </div>
            <span
              className="font-display font-extrabold text-base tracking-tight"
              style={{ color: PURPLE[200] }}
            >
              NexusChat
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="btn-icon"
              data-tooltip={notifications.sounds ? 'Mute sounds' : 'Enable sounds'}
              style={{ color: SUBTLE }}
            >
              {notifications.sounds
                ? <Volume2 size={14} />
                : <VolumeX size={14} style={{ color: ROSE }} />}
            </button>

            {/* Connection pill */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full font-mono text-[10px] font-bold"
              style={{ background: `${qualityColor}18`, color: qualityColor }}
            >
              {isConnected ? <Wifi size={9} /> : <WifiOff size={9} />}
              {qualityLabel}
            </div>

            {/* Mobile close */}
            <button
              onClick={onMobileClose}
              className="lg:hidden btn-icon ml-1"
              style={{ color: SUBTLE }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-3 mb-2">
          <p
            className="text-[10px] font-mono uppercase tracking-widest px-2 mb-1"
            style={{ color: MUTED }}
          >
            Channels
          </p>
          <div className="space-y-0.5">
            {DEFAULT_ROOMS.map((room, idx) => {
              const isActive = currentRoom === room.id;
              const count = activeUsers.filter((u) => u.room === room.id).length;
              const unread = unreadCounts[room.id] || 0;
              const isHovered = hoveredRoom === room.id;

              return (
                <button
                  key={room.id}
                  onClick={() => handleJoin(room.id)}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group relative"
                  style={{
                    animationDelay: `${idx * 60}ms`,
                    background: isActive
                      ? `${PURPLE[900]}80`
                      : isHovered ? `${PURPLE[950]}60` : 'transparent',
                    border: isActive
                      ? `1px solid ${PURPLE[700]}60`
                      : '1px solid transparent',
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                      style={{ background: PURPLE[500] }}
                    />
                  )}

                  <span className="text-base shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {room.icon}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate transition-colors"
                      style={{
                        color: isActive
                          ? PURPLE[300]
                          : isHovered ? TEXT : SUBTLE,
                      }}
                    >
                      {room.name}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: MUTED }}>
                      {room.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {count > 0 && (
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                        style={{
                          background: isActive ? `${PURPLE[700]}40` : `${PURPLE[950]}80`,
                          color: isActive ? PURPLE[300] : MUTED,
                        }}
                      >
                        {count}
                      </span>
                    )}
                    {unread > 0 && !isActive && (
                      <span
                        className="unread-badge"
                        style={{ background: PURPLE[600], color: '#fff' }}
                      >
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom rooms */}
        <div
          className="px-3 mt-3"
          style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '12px' }}
        >
          <p
            className="text-[10px] font-mono uppercase tracking-widest px-2 mb-2"
            style={{ color: MUTED }}
          >
            Custom
          </p>
          {showCustom ? (
            <div className="px-1 pb-1 animate-fade-in-scale">
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Hash
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: MUTED }}
                  />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCustomJoin();
                      if (e.key === 'Escape') setShowCustom(false);
                    }}
                    placeholder="room-name"
                    autoFocus
                    className="w-full pl-7 pr-3 py-2 rounded-lg text-xs font-mono"
                    style={{
                      background: BLACK,
                      border: `1px solid ${BORDER}`,
                      color: TEXT,
                      outline: 'none',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = PURPLE[600])}
                    onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
                  />
                </div>
                <button
                  onClick={handleCustomJoin}
                  className="px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors"
                  style={{
                    background: `${PURPLE[900]}`,
                    color: PURPLE[300],
                    border: `1px solid ${PURPLE[700]}`,
                  }}
                >
                  Join
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full flex items-center justify-start gap-2.5 text-sm py-2.5 px-3 rounded-xl transition-all duration-200"
              style={{ color: SUBTLE, background: 'transparent' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${PURPLE[950]}60`;
                e.currentTarget.style.color = PURPLE[300];
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = SUBTLE;
              }}
            >
              <Plus size={14} /> Join custom room
            </button>
          )}
        </div>
      </div>

      {/* User footer */}
      <div
        className="p-3 shrink-0"
        style={{ borderTop: `1px solid ${BORDER}`, background: `${BLACK}cc` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: PURPLE[700], color: '#fff' }}
            >
              {initials}
            </div>
            <div
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: EMERALD, borderColor: PANEL }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: PURPLE[200] }}>
              {user?.username}
            </p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: EMERALD }} />
              <p className="text-[11px] font-mono truncate" style={{ color: EMERALD }}>Online</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              className="btn-icon"
              data-tooltip="Settings"
              style={{ color: SUBTLE }}
              onMouseEnter={e => (e.currentTarget.style.color = PURPLE[300])}
              onMouseLeave={e => (e.currentTarget.style.color = SUBTLE)}
            >
              <Settings size={14} />
            </button>
            <button
              onClick={handleLogout}
              className="btn-icon"
              data-tooltip="Sign out"
              style={{ color: SUBTLE }}
              onMouseEnter={e => (e.currentTarget.style.color = ROSE)}
              onMouseLeave={e => (e.currentTarget.style.color = SUBTLE)}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex shrink-0">{content}</div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 backdrop-blur-sm animate-fade-in"
            style={{ background: `${BLACK}cc` }}
            onClick={onMobileClose}
          />
          <div className="relative z-10 flex animate-slide-in-left">{content}</div>
        </div>
      )}
    </>
  );
}