import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatSalary = (min?: number, max?: number, currency = 'USD'): string => {
  if (!min && !max) return 'Salary not disclosed';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
};

export const timeAgo = (date: string): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export const jobTypeBadgeColor = (type: string): string => {
  const map: Record<string, string> = {
    'full-time':  'bg-blue-100 text-blue-700',
    'part-time':  'bg-purple-100 text-purple-700',
    'contract':   'bg-amber-100 text-amber-700',
    'internship': 'bg-pink-100 text-pink-700',
    'remote':     'bg-emerald-100 text-emerald-700',
  };
  return map[type] ?? 'bg-slate-100 text-slate-600';
};

export const experienceBadgeColor = (level: string): string => {
  const map: Record<string, string> = {
    entry:     'bg-green-100 text-green-700',
    mid:       'bg-blue-100 text-blue-700',
    senior:    'bg-orange-100 text-orange-700',
    lead:      'bg-red-100 text-red-700',
    executive: 'bg-purple-100 text-purple-700',
  };
  return map[level] ?? 'bg-slate-100 text-slate-600';
};

export const statusBadgeColor = (status: string): string => {
  const map: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-700',
    reviewing:  'bg-blue-100 text-blue-700',
    shortlisted:'bg-emerald-100 text-emerald-700',
    rejected:   'bg-red-100 text-red-700',
    hired:      'bg-brand-100 text-brand-700',
  };
  return map[status] ?? 'bg-slate-100 text-slate-600';
};

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

export const truncate = (str: string, n: number) => str.length > n ? str.slice(0, n) + '…' : str;

export const getInitials = (name: string): string =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
