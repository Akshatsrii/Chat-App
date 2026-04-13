import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:1337';

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const SOCKET_EVENTS = {
  JOIN_ROOM: 'chat:join-room',
  LEAVE_ROOM: 'chat:leave-room',
  SEND_MESSAGE: 'chat:send-message',
  TYPING_START: 'chat:typing-start',
  TYPING_STOP: 'chat:typing-stop',
  ADD_REACTION: 'chat:add-reaction',
  REMOVE_REACTION: 'chat:remove-reaction',
  EDIT_MESSAGE: 'chat:edit-message',
  DELETE_MESSAGE: 'chat:delete-message',
  NEW_MESSAGE: 'chat:new-message',
  MESSAGE_UPDATED: 'chat:message-updated',
  MESSAGE_DELETED: 'chat:message-deleted',
  USER_JOINED: 'chat:user-joined',
  USER_LEFT: 'chat:user-left',
  ACTIVE_USERS: 'chat:active-users',
  TYPING_USERS: 'chat:typing-users',
  REACTION_UPDATED: 'chat:reaction-updated',
  ERROR: 'chat:error',
  MESSAGE_HISTORY: 'chat:message-history',
} as const;
