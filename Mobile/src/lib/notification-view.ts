import type { Notification, NotificationCategory } from './notifications';

export type NotificationFilter = 'all' | NotificationCategory;
export type NotificationSort = 'newest' | 'oldest' | 'unread';
export function selectNotifications(rows: Notification[], filter: NotificationFilter, sort: NotificationSort) {
  return rows.filter(row => filter === 'all' || row.category === filter).sort((a, b) => sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : sort === 'unread' ? Number(!!a.readAt) - Number(!!b.readAt) || b.createdAt.localeCompare(a.createdAt) : b.createdAt.localeCompare(a.createdAt));
}
export function formatRelativeTime(value: string, now = new Date()) { const minutes = Math.max(0, Math.floor((now.getTime() - new Date(value).getTime()) / 60000)); if (minutes < 1) return 'Vừa xong'; if (minutes < 60) return `${minutes} phút trước`; if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`; if (minutes < 2880) return 'Hôm qua'; return new Date(value).toLocaleDateString('vi-VN'); }
