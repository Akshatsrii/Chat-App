import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'NexusChat — Real-Time Conversations',
  description: 'A production-grade real-time chat application built with Next.js, Strapi & Socket.io',
  keywords: ['chat', 'real-time', 'messaging', 'rooms'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080b14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#161d2e',
                  color: '#c9d8f0',
                  border: '1px solid #1e2d45',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#080b14' },
                },
                error: {
                  iconTheme: { primary: '#f43f5e', secondary: '#080b14' },
                },
                duration: 3000,
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
