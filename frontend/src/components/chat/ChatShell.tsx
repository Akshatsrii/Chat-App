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
    <div className="flex h-screen overflow-hidden bg-void relative">
      {/* Particle layer */}
      <ParticleBackground />

      {/* App shell */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
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
