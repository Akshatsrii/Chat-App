'use client';

import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket, SOCKET_EVENTS } from '@/lib/socket';
import { SocketMessage, ActiveUser, TypingUser, NotificationSettings } from '@/types';
import { useAuth } from './AuthContext';
import { playNotificationSound, generateTempId } from '@/lib/utils';

interface ReplyTarget {
  id: number;
  content: string;
  sender: { username: string };
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  currentRoom: string | null;
  messages: SocketMessage[];
  activeUsers: ActiveUser[];
  typingUsers: TypingUser[];
  replyTarget: ReplyTarget | null;
  searchQuery: string;
  notifications: NotificationSettings;
  unreadCounts: Record<string, number>;
  joinRoom: (room: string) => void;
  leaveRoom: () => void;
  sendMessage: (content: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  addReaction: (messageId: number, emoji: string) => void;
  editMessage: (messageId: number, newContent: string) => void;
  deleteMessage: (messageId: number) => void;
  setReplyTarget: (target: ReplyTarget | null) => void;
  setSearchQuery: (q: string) => void;
  toggleSound: () => void;
  clearUnread: (room: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('offline');
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationSettings>({ sounds: true, desktop: false });
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  useEffect(() => { currentRoomRef.current = currentRoom; }, [currentRoom]);

  useEffect(() => {
    if (!token) return;
    const s = getSocket(token);
    socketRef.current = s;

    s.on('connect', () => {
      setIsConnected(true);
      setConnectionQuality('excellent');
    });
    s.on('disconnect', () => {
      setIsConnected(false);
      setConnectionQuality('offline');
      setCurrentRoom(null);
    });
    s.on('connect_error', () => setConnectionQuality('poor'));

    s.on(SOCKET_EVENTS.MESSAGE_HISTORY, (history: SocketMessage[]) => {
      setMessages(history);
    });

    s.on(SOCKET_EVENTS.NEW_MESSAGE, (msg: SocketMessage) => {
      setMessages((prev) => {
        // Replace pending message if tempId matches
        if (msg.sender.id === user?.id) {
          const pendingIdx = prev.findIndex((m) => m.isPending && m.content === msg.content);
          if (pendingIdx !== -1) {
            const next = [...prev];
            next[pendingIdx] = { ...msg, isPending: false };
            return next;
          }
        }
        return [...prev, msg];
      });

      // Notification for other users' messages
      if (msg.sender.id !== user?.id) {
        if (notifications.sounds && msg.type !== 'system') {
          playNotificationSound();
        }
        if (currentRoomRef.current !== msg.room) {
          setUnreadCounts((prev) => ({ ...prev, [msg.room]: (prev[msg.room] || 0) + 1 }));
        }
      }
    });

    s.on(SOCKET_EVENTS.MESSAGE_UPDATED, (updated: SocketMessage) => {
      setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, ...updated } : m));
    });

    s.on(SOCKET_EVENTS.MESSAGE_DELETED, ({ id }: { id: number }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    s.on(SOCKET_EVENTS.REACTION_UPDATED, ({ messageId, reactions }: { messageId: number; reactions: SocketMessage['reactions'] }) => {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, reactions } : m));
    });

    s.on(SOCKET_EVENTS.ACTIVE_USERS, (users: ActiveUser[]) => setActiveUsers(users));

    s.on(SOCKET_EVENTS.TYPING_USERS, (users: TypingUser[]) => {
      setTypingUsers(users.filter((u) => u.userId !== user?.id));
    });

    s.on(SOCKET_EVENTS.USER_JOINED, (data: { username: string; userId: number; room: string }) => {
      if (data.userId === user?.id) return;
      const sysMsg: SocketMessage = {
        id: Date.now(),
        content: `${data.username} joined the room`,
        room: data.room,
        sender: { id: 0, username: 'system' },
        createdAt: new Date().toISOString(),
        type: 'system',
        systemEvent: 'join',
      };
      setMessages((prev) => [...prev, sysMsg]);
    });

    s.on(SOCKET_EVENTS.USER_LEFT, (data: { username: string; userId: number; room: string }) => {
      if (data.userId === user?.id) return;
      const sysMsg: SocketMessage = {
        id: Date.now() + 1,
        content: `${data.username} left the room`,
        room: data.room,
        sender: { id: 0, username: 'system' },
        createdAt: new Date().toISOString(),
        type: 'system',
        systemEvent: 'leave',
      };
      setMessages((prev) => [...prev, sysMsg]);
    });

    // Ping to measure connection quality
    pingIntervalRef.current = setInterval(() => {
      if (!s.connected) { setConnectionQuality('offline'); return; }
      const start = Date.now();
      s.emit('ping', () => {
        const latency = Date.now() - start;
        if (latency < 100) setConnectionQuality('excellent');
        else if (latency < 300) setConnectionQuality('good');
        else setConnectionQuality('poor');
      });
    }, 10000);

    return () => {
      s.off('connect'); s.off('disconnect'); s.off('connect_error');
      s.off(SOCKET_EVENTS.MESSAGE_HISTORY); s.off(SOCKET_EVENTS.NEW_MESSAGE);
      s.off(SOCKET_EVENTS.MESSAGE_UPDATED); s.off(SOCKET_EVENTS.MESSAGE_DELETED);
      s.off(SOCKET_EVENTS.REACTION_UPDATED); s.off(SOCKET_EVENTS.ACTIVE_USERS);
      s.off(SOCKET_EVENTS.TYPING_USERS); s.off(SOCKET_EVENTS.USER_JOINED);
      s.off(SOCKET_EVENTS.USER_LEFT);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [token, user?.id, notifications.sounds]);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setIsConnected(false); setCurrentRoom(null);
      setMessages([]); setActiveUsers([]);
    }
  }, [token]);

  const joinRoom = useCallback((room: string) => {
    if (!socketRef.current) return;
    setMessages([]); setActiveUsers([]); setTypingUsers([]);
    setReplyTarget(null); setSearchQuery('');
    socketRef.current.emit(SOCKET_EVENTS.JOIN_ROOM, { room });
    setCurrentRoom(room);
    setUnreadCounts((prev) => ({ ...prev, [room]: 0 }));
  }, []);

  const leaveRoom = useCallback(() => {
    if (!socketRef.current || !currentRoom) return;
    socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, { room: currentRoom });
    setCurrentRoom(null); setMessages([]); setActiveUsers([]); setTypingUsers([]);
  }, [currentRoom]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !currentRoom || !content.trim() || !user) return;
    const tempId = generateTempId();
    const optimistic: SocketMessage = {
      id: Date.now(),
      tempId,
      content: content.trim(),
      room: currentRoom,
      sender: { id: user.id, username: user.username },
      createdAt: new Date().toISOString(),
      isPending: true,
      replyTo: replyTarget ? { id: replyTarget.id, content: replyTarget.content, sender: { username: replyTarget.sender.username } } : null,
    };
    setMessages((prev) => [...prev, optimistic]);
    socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      content: content.trim(),
      room: currentRoom,
      replyToId: replyTarget?.id ?? null,
    });
    setReplyTarget(null);
  }, [currentRoom, user, replyTarget]);

  const startTyping = useCallback(() => {
    if (!socketRef.current || !currentRoom) return;
    socketRef.current.emit(SOCKET_EVENTS.TYPING_START, { room: currentRoom });
  }, [currentRoom]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !currentRoom) return;
    socketRef.current.emit(SOCKET_EVENTS.TYPING_STOP, { room: currentRoom });
  }, [currentRoom]);

  const addReaction = useCallback((messageId: number, emoji: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(SOCKET_EVENTS.ADD_REACTION, { messageId, emoji, room: currentRoom });
  }, [currentRoom]);

  const editMessage = useCallback((messageId: number, newContent: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(SOCKET_EVENTS.EDIT_MESSAGE, { messageId, content: newContent, room: currentRoom });
  }, [currentRoom]);

  const deleteMessage = useCallback((messageId: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit(SOCKET_EVENTS.DELETE_MESSAGE, { messageId, room: currentRoom });
  }, [currentRoom]);

  const toggleSound = () => setNotifications((p) => ({ ...p, sounds: !p.sounds }));

  const clearUnread = useCallback((room: string) => {
    setUnreadCounts((p) => ({ ...p, [room]: 0 }));
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current, isConnected, connectionQuality,
      currentRoom, messages, activeUsers, typingUsers,
      replyTarget, searchQuery, notifications, unreadCounts,
      joinRoom, leaveRoom, sendMessage, startTyping, stopTyping,
      addReaction, editMessage, deleteMessage,
      setReplyTarget, setSearchQuery, toggleSound, clearUnread,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
