import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { AuthUser, RegisterPayload, LoginPayload, Message } from '@/types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${STRAPI_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor — attach JWT
  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get('jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — handle auth errors
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        Cookies.remove('jwt');
        Cookies.remove('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiInstance();

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthUser> => {
    const { data } = await api.post<AuthUser>('/auth/local/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthUser> => {
    const { data } = await api.post<AuthUser>('/auth/local', payload);
    return data;
  },

  me: async (): Promise<AuthUser['user']> => {
    const { data } = await api.get('/users/me');
    return data;
  },
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const messagesApi = {
  getByRoom: async (room: string, page = 1, pageSize = 50): Promise<Message[]> => {
    const { data } = await api.get('/messages', {
      params: {
        filters: { room: { $eq: room } },
        populate: ['sender'],
        sort: ['createdAt:asc'],
        pagination: { page, pageSize },
      },
    });
    return data.data.map((item: { id: number; attributes: Omit<Message, 'id'> }) => ({
      id: item.id,
      ...item.attributes,
      sender: item.attributes.sender,
    }));
  },

  create: async (content: string, room: string): Promise<Message> => {
    const { data } = await api.post('/messages', {
      data: { content, room },
    });
    return data.data;
  },
};

// ─── Rooms ───────────────────────────────────────────────────────────────────

export const DEFAULT_ROOMS = [
  { id: 'general', name: 'General', description: 'General discussion for everyone' },
  { id: 'tech', name: 'Tech', description: 'Technology and development talk' },
  { id: 'random', name: 'Random', description: 'Off-topic conversations' },
  { id: 'announcements', name: 'Announcements', description: 'Important updates and news' },
];
