'use client';

import { useState, useEffect } from 'react';
import { Menu, Zap, Shield, Globe, Users, MessageSquare, Hash } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_ROOMS } from '@/lib/rooms';

interface WelcomeScreenProps {
  onMenuClick: () => void;
}

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{value.toLocaleString()}</>;
}

export default function WelcomeScreen({ onMenuClick }: WelcomeScreenProps) {
  const { joinRoom, activeUsers, isConnected } = useSocket();
  const { user } = useAuth();
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const totalOnline = activeUsers.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(13,21,32,0.8)' }}>
        <button onClick={onMenuClick} className="btn-icon">
          <Menu size={18} />
        </button>
        <span className="font-display font-bold text-base text-text-bright">NexusChat</span>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto relative" style={{ background: 'var(--color-void)' }}>
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        {/* Glow orbs */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-5" style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-5" style={{ background: 'radial-gradient(circle, #9966ff 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 flex flex-col gap-12">

          {/* Hero */}
          <div className="text-center animate-fade-in-up">
            {/* Animated logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center animate-float"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(153,102,255,0.12))',
                    border: '1px solid rgba(0,212,255,0.2)',
                    boxShadow: '0 0 40px rgba(0,212,255,0.1), 0 0 80px rgba(153,102,255,0.05)',
                  }}
                >
                  <svg width="44" height="44" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L15 5v6l-7 4L1 11V5L8 1z" stroke="url(#g)" strokeWidth="1.2" strokeLinejoin="round" />
                    <circle cx="8" cy="8" r="2.5" fill="url(#g)" opacity="0.6" />
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="16" y2="16">
                        <stop stopColor="#00d4ff" />
                        <stop offset="1" stopColor="#9966ff" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Online pulse ring */}
                {isConnected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full animate-pulse" style={{ background: 'var(--color-emerald)', boxShadow: '0 0 10px var(--color-emerald)' }} />
                  </div>
                )}
              </div>
            </div>

            <h1 className="font-display text-5xl font-extrabold text-text-bright mb-4 leading-tight">
              Welcome back,{' '}
              <span className="gradient-text">{user?.username}</span> 👋
            </h1>
            <p className="text-text-dim text-lg leading-relaxed max-w-md mx-auto">
              Pick a channel and start connecting with people in real time.
            </p>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-150">
            {[
              { icon: Users, label: 'Online now', value: totalOnline, color: '#00e5a0' },
              { icon: MessageSquare, label: 'Channels', value: DEFAULT_ROOMS.length, color: '#00d4ff' },
              { icon: Zap, label: 'Real-time', value: isConnected ? 1 : 0, suffix: isConnected ? 'LIVE' : 'OFF', color: isConnected ? '#00e5a0' : '#ff3366' },
            ].map(({ icon: Icon, label, value, suffix, color }) => (
              <div key={label} className="flex flex-col items-center p-4 rounded-2xl text-center" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                <Icon size={18} className="mb-2" style={{ color }} />
                <p className="text-xl font-display font-bold" style={{ color }}>
                  {suffix ?? <AnimatedCounter target={value} />}
                </p>
                <p className="text-[11px] font-mono uppercase tracking-wide mt-0.5" style={{ color: 'var(--color-subtle)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Channel quick-join grid */}
          <div className="animate-fade-in-up delay-225">
            <div className="flex items-center gap-2 mb-4">
              <Hash size={14} style={{ color: 'var(--color-subtle)' }} />
              <p className="text-[11px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>Quick Join</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEFAULT_ROOMS.map((room, idx) => {
                const membersHere = activeUsers.filter((u) => u.room === room.id).length;
                const isHovered = hoveredRoom === room.id;

                return (
                  <button
                    key={room.id}
                    onClick={() => joinRoom(room.id)}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    className="group flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 animate-fade-in-up"
                    style={{
                      animationDelay: `${300 + idx * 60}ms`,
                      background: isHovered ? `${room.color}10` : 'rgba(13,21,32,0.6)',
                      border: `1px solid ${isHovered ? room.color + '30' : 'var(--color-border)'}`,
                      transform: isHovered ? 'translateY(-2px)' : undefined,
                      boxShadow: isHovered ? `0 8px 24px ${room.color}15` : 'none',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${room.color}12`, border: `1px solid ${room.color}20` }}
                    >
                      {room.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[15px] font-semibold transition-colors" style={{ color: isHovered ? room.color : 'var(--color-text-bright)' }}>
                          #{room.name}
                        </p>
                        {membersHere > 0 && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: `${room.color}15` }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: room.color }} />
                            <span className="text-[10px] font-mono" style={{ color: room.color }}>{membersHere}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[12px] truncate" style={{ color: 'var(--color-subtle)' }}>{room.description}</p>
                    </div>

                    {/* Arrow */}
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0" style={{ color: room.color }}>
                      →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-in-up delay-300 pb-8">
            {[
              { icon: Zap, label: 'Real-time with Socket.io' },
              { icon: Shield, label: 'JWT Authentication' },
              { icon: Globe, label: 'Multi-room' },
              { icon: MessageSquare, label: 'Message history' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }}
              >
                <Icon size={12} style={{ color: 'var(--color-cyan)' }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
