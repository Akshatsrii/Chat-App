import { Room } from '@/types';

export const DEFAULT_ROOMS: Room[] = [
  { id: 'general', name: 'General', description: 'Open discussion for everyone', icon: '💬', color: '#00d4ff' },
  { id: 'tech', name: 'Tech', description: 'Code, tools & dev talk', icon: '⚡', color: '#9966ff' },
  { id: 'random', name: 'Random', description: 'Off-topic & fun stuff', icon: '🎲', color: '#ffb800' },
  { id: 'announcements', name: 'Announcements', description: 'Important updates', icon: '📢', color: '#00e5a0' },
  { id: 'design', name: 'Design', description: 'UI/UX & creative work', icon: '🎨', color: '#ff33aa' },
];
