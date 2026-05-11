import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const formatDate = (date: string | Date): string => dayjs(date).format('MMM D, YYYY h:mm A');
export const formatRelative = (date: string | Date): string => dayjs(date).fromNow();
export const formatShort = (date: string | Date): string => dayjs(date).format('MMM D');

export const platformColor = (platform: string): string => ({
  facebook: 'bg-blue-600',
  instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
  tiktok: 'bg-gray-900',
}[platform] || 'bg-gray-500');

export const platformIcon = (platform: string): string => ({
  facebook: '📘',
  instagram: '📸',
  tiktok: '🎵',
}[platform] || '🌐');

export interface StatusBadge {
  color: string;
  label: string;
}

export const statusBadge = (status: string): StatusBadge => ({
  scheduled: { color: 'bg-yellow-100 text-yellow-800', label: 'Scheduled' },
  published:  { color: 'bg-green-100 text-green-800',  label: 'Published' },
  failed:     { color: 'bg-red-100 text-red-800',      label: 'Failed' },
  draft:      { color: 'bg-gray-100 text-gray-800',    label: 'Draft' },
}[status] || { color: 'bg-gray-100 text-gray-800', label: status });

export const truncate = (text: string | undefined | null, len = 80): string =>
  text && text.length > len ? text.substring(0, len) + '...' : (text || '');

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
