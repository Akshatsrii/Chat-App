'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import ChatRoom from './ChatRoom';
import WelcomeScreen from './WelcomeScreen';
import { useSocket } from '@/contexts/SocketContext';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function ChatShell() {
  const { currentRoom } = useSocket();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      className="flex h-full w-full overflow-hidden relative"
      style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute top-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-8%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Particle layer */}
      <ParticleBackground />

      {/* App shell */}
      <div className="relative z-10 flex w-full h-full min-h-0">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {currentRoom ? (
            <ChatRoom onMenuClick={() => setMobileSidebarOpen(true)} />
          ) : (
            <WelcomeScreen onMenuClick={() => setMobileSidebarOpen(true)} />
          )}
        </div>
      </div>
    </div>
  );
}