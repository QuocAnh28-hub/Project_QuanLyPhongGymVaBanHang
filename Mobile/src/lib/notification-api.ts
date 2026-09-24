import { baseUrl } from './account-api';

export type Notification = {
  ThongBaoID: number; TaiKhoanID: number; Loai: string; DanhMuc: string;
  TieuDe: string; NoiDung: string; DoUuTien: string;
  ActionType: string | null; ActionPayload: Record<string, unknown> | string | null;
  NgayTao: string; NgayDoc: string | null;
};
export type NotificationPreferences = {
  TaiKhoanID: number; PushEnabled: boolean; EmailEnabled: boolean;
  SmsEnabled: boolean; PtReminderEnabled: boolean; PromotionEnabled: boolean;
  TransactionEnabled: boolean; SystemEnabled: boolean;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}/thongbao${path}`, options);
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || 'Không thể xử lý thông báo');
  return result as T;
}
export const getNotifications = (accountId: number) => request<Notification[]>(`/account/${accountId}`);
export const markNotificationRead = (id: number) => request<void>(`/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = (accountId: number) => request<void>(`/account/${accountId}/read-all`, { method: 'POST' });
export const getNotificationPreferences = (accountId: number) => request<NotificationPreferences>(`/preferences/account/${accountId}`);
export const updateNotificationPreferences = (accountId: number, patch: Partial<Omit<NotificationPreferences, 'TaiKhoanID'>>) => request<NotificationPreferences>(`/preferences/account/${accountId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
