export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthUser {
  jwt: string;
  user: User;
}

export interface Reaction {
  emoji: string;
  users: Array<{ id: number; username: string }>;
}

export interface SocketMessage {
  id: number;
  content: string;
  room: string;
  sender: { id: number; username: string };
  createdAt: string;
  type?: 'message' | 'system';
  systemEvent?: 'join' | 'leave';
  replyTo?: { id: number; content: string; sender: { username: string } } | null;
  reactions?: Record<string, Array<{ id: number; username: string }>>;
  edited?: boolean;
  isPending?: boolean;
  tempId?: string;
}

export interface ActiveUser {
  id: number;
  username: string;
  socketId: string;
  room: string;
  joinedAt: string;
  status?: 'online' | 'away' | 'busy';
}

export interface TypingUser {
  userId: number;
  username: string;
  room: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  messageId: number | null;
  isOwn: boolean;
  content?: string;
}

export interface NotificationSettings {
  sounds: boolean;
  desktop: boolean;
}
