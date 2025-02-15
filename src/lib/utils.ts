import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomEmail(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result}@gmail.com`;
}

export function formatDate(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}