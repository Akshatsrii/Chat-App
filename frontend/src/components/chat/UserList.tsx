'use client';

import { useState } from 'react';
import { Crown, Clock } from 'lucide-react';
import { ActiveUser } from '@/types';
import { getInitials, getUserColor, formatRelativeTime } from '@/lib/utils';

interface UserListProps {
  users: ActiveUser[];
  currentUserId: number;
}

function UserCard({ user, isCurrentUser, idx }: { user: ActiveUser; isCurrentUser: boolean; idx: number }) {
  const [hovered, setHovered] = useState(false);
  const { bg, text } = getUserColor(user.username);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 animate-fade-in-up"
        style={{
          animationDelay: `${idx * 50}ms`,
          background: isCurrentUser
            ? 'rgba(0,212,255,0.05)'
            : hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
          border: isCurrentUser ? '1px solid rgba(0,212,255,0.1)' : '1px solid transparent',
        }}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: bg, color: text }}
          >
            {getInitials(user.username)}
          </div>
          <div className="status-dot online" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-medium truncate" style={{ color: isCurrentUser ? 'var(--color-cyan)' : 'var(--color-text-dim)' }}>
              {user.username}
            </p>
            {isCurrentUser && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--color-cyan)' }}>
                you
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-emerald)' }} />
            <p className="text-[10px] font-mono" style={{ color: 'var(--color-emerald)' }}>Online</p>
          </div>
        </div>
      </div>

      {/* Hover tooltip card */}
      {hovered && !isCurrentUser && (
        <div
          className="absolute left-full top-0 ml-2 z-50 w-44 p-3 rounded-xl animate-fade-in-scale"
          style={{
            background: 'var(--color-panel-2)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Mini avatar */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: bg, color: text }}>
              {getInitials(user.username)}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-bright">{user.username}</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-emerald)' }} />
                <span className="text-[10px] font-mono" style={{ color: 'var(--color-emerald)' }}>Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-subtle)' }}>
            <Clock size={10} />
            <span>Joined {formatRelativeTime(user.joinedAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserList({ users, currentUserId }: UserListProps) {
  const sorted = [...users].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        width: 200,
        borderLeft: '1px solid var(--color-border)',
        background: 'rgba(13,21,32,0.6)',
      }}
    >
      {/* Header */}
      <div className="px-3 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-emerald)', boxShadow: '0 0 6px var(--color-emerald)', animation: 'glow-pulse 2s ease infinite' }} />
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-dim)' }}>
            {users.length} Online
          </p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5">
        {sorted.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-[12px]" style={{ color: 'var(--color-subtle)' }}>No users yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {sorted.map((u, idx) => (
              <UserCard
                key={u.socketId}
                user={u}
                isCurrentUser={u.id === currentUserId}
                idx={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
