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
    <div className="relative flex h-screen overflow-hidden bg-void bg-grid">
      {/* Ambient glow blobs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-8 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Branding panel (desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 border-r border-border relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 rounded-lg bg-cyan flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 5v6l-7 4L1 11V5L8 1z" stroke="#080b14" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-text-bright tracking-tight">
              NexusChat
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="font-display text-5xl font-extrabold leading-tight text-text-bright">
              Real-time
              <br />
              <span className="gradient-text">conversations.</span>
              <br />
              Redefined.
            </h1>
            <p className="text-text-dim text-lg leading-relaxed">
              Join chat rooms, connect with people, and experience messaging built for the modern web.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '⚡', label: 'Real-time messaging with Socket.io' },
            { icon: '🔒', label: 'Secure JWT authentication' },
            { icon: '🌐', label: 'Multiple chat rooms' },
            { icon: '👥', label: 'Live user presence' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 text-sm text-text-dim">
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>

      {/* Auth content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
