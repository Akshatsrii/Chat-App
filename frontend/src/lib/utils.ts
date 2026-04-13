import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageTime(dateStr: string): string {
  return format(new Date(dateStr), 'HH:mm');
}

export function formatMessageDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function getInitials(username: string): string {
  return username.split(/[\s_-]/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

const AVATAR_COLORS = [
  { bg: '#00d4ff', text: '#060810' },
  { bg: '#00e5a0', text: '#060810' },
  { bg: '#9966ff', text: '#ffffff' },
  { bg: '#ffb800', text: '#060810' },
  { bg: '#ff3366', text: '#ffffff' },
  { bg: '#ff6633', text: '#ffffff' },
  { bg: '#ff33aa', text: '#ffffff' },
  { bg: '#00cccc', text: '#060810' },
];

export function getUserColor(username: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getUserColorHex(username: string): string {
  return getUserColor(username).bg;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

export function groupByDate(messages: Array<{ createdAt: string }>) {
  const groups: Record<string, typeof messages> = {};
  messages.forEach((msg) => {
    const key = format(new Date(msg.createdAt), 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
  });
  return groups;
}

export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch { /* silence */ }
}

export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str;
}
