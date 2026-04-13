'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/chat');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;
  if (isAuthenticated) return null;

  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}>

      {/* Ambient glow blobs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.6 }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.5 }}
      />

      {/* Branding panel (desktop) */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
        style={{ borderRight: '1px solid rgba(124,58,237,0.12)' }}
      >
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#7c3aed' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 5v6l-7 4L1 11V5L8 1z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ color: '#f3f0ff' }}>
              NexusChat
            </span>
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold leading-tight" style={{ color: '#f3f0ff', letterSpacing: '-0.03em' }}>
              Real-time
              <br />
              <span style={{ color: '#a78bfa' }}>conversations.</span>
              <br />
              Redefined.
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: '#6b6880' }}>
              Join chat rooms, connect with people, and experience messaging built for the modern web.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: '⚡', label: 'Real-time messaging with Socket.io' },
            { icon: '🔒', label: 'Secure JWT authentication' },
            { icon: '🌐', label: 'Multiple chat rooms' },
            { icon: '👥', label: 'Live user presence' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 text-sm" style={{ color: '#8b8699' }}>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                {f.icon}
              </div>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Decorative subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Auth content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}