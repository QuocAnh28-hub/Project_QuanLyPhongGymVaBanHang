import { readLocal, writeLocal } from '@/lib/local-store';
import { getEnrollments } from '@/lib/membership';

export type NotificationCategory = 'schedule' | 'promotion' | 'transaction' | 'system';
export type NotificationType = 'pt_reminder' | 'voucher' | 'points_reward' | 'facility' | 'membership_payment' | 'product' | 'membership_expiry' | 'checkin' | 'order' | 'system';
export type NotificationAction = 'shop' | 'pt' | 'reschedule' | 'invoice' | 'membership' | 'renewal' | 'orders' | 'voucher';
export type Notification = { id: string; userId: string; type: NotificationType; category: NotificationCategory; title: string; message: string; createdAt: string; readAt?: string; priority: 'normal' | 'high'; badge?: string; actionType?: NotificationAction; actionPayload?: Record<string, string>; metadata?: Record<string, string | number> };
export type NotificationPreferences = { userId: string; pushEnabled: boolean; emailEnabled: boolean; smsEnabled: boolean; ptReminderEnabled: boolean; promotionEnabled: boolean; transactionEnabled: boolean; systemEnabled: boolean };
const key = (userId: string) => `qa-gym-notifications:${userId}`;
const prefsKey = (userId: string) => `qa-gym-notification-preferences:${userId}`;
const listeners = new Set<(userId: string) => void>();
export function subscribeNotifications(listener: (userId: string) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function emit(userId: string) { listeners.forEach(listener => listener(userId)); }

// ponytail: local development inbox; replace these functions with API calls when notifications sync across devices.
const starter = (userId: string): Notification[] => {
  const now = Date.now();
  return [
    { id: 'welcome-facility', userId, type: 'facility', category: 'system', title: 'Khu VIP Recovery / Cryo Plunge mở lại', message: 'Khu Recovery đã hoàn tất bảo dưỡng. Xem quy định sử dụng và thông tin câu lạc bộ trước khi đến.', createdAt: new Date(now - 86400000).toISOString(), priority: 'normal', badge: 'CƠ SỞ VẬT CHẤT' },
    { id: 'welcome-product', userId, type: 'product', category: 'promotion', title: 'Ra mắt Pre-Workout mới tại QA Pro Shop', message: 'Khám phá dòng Pre-Workout mới và các sản phẩm bổ trợ tại QA Pro Shop.', createdAt: new Date(now - 2 * 86400000).toISOString(), priority: 'normal', badge: 'SẢN PHẨM MỚI', actionType: 'shop' },
  ];
};
async function read(userId: string): Promise<Notification[]> {
  const saved = await readLocal(key(userId));
  if (saved !== null) return JSON.parse(saved);
  const rows = starter(userId);
  await writeLocal(key(userId), JSON.stringify(rows));
  return rows;
}
async function write(userId: string, rows: Notification[]) { await writeLocal(key(userId), JSON.stringify(rows)); emit(userId); }
export async function createNotification(input: Omit<Notification, 'id' | 'createdAt' | 'priority'> & { id?: string; createdAt?: string; priority?: Notification['priority'] }) {
  if (!input.userId) throw new Error('Notification userId is required');
  const rows = await read(input.userId);
  const row: Notification = { ...input, id: input.id ?? `qa-notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: input.createdAt ?? new Date().toISOString(), priority: input.priority ?? 'normal' };
  if (rows.some(item => item.id === row.id)) return rows.find(item => item.id === row.id)!;
  await write(input.userId, [row, ...rows]); return row;
}
async function syncMembership(userId: string) {
  const orders = await getEnrollments(userId);
  const rows = await read(userId);
  const seen = new Set(rows.map(row => row.id));
  const added: Notification[] = [];
  for (const order of orders) {
    const id = `membership-${order.paymentStatus ?? 'pending'}-${order.id}`;
    if (!seen.has(id)) added.push({ id, userId, type: 'membership_payment', category: 'transaction', title: order.paymentStatus === 'paid' ? `Xác nhận ${order.renewalOf ? 'gia hạn' : 'đăng ký'} thành công ${order.packageName}` : `Chờ thanh toán ${order.packageName}`, message: order.paymentStatus === 'paid' ? `Thanh toán ${order.finalAmount.toLocaleString('vi-VN')}đ đã được xác nhận.` : `Đơn ${order.id} đang chờ thanh toán. Gói tập chưa được kích hoạt.`, createdAt: order.createdAt, priority: 'high', badge: order.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN', actionType: 'invoice', actionPayload: { orderId: order.id }, metadata: { amount: order.finalAmount, paymentMethod: order.paymentMethod } });
    const days = Math.ceil((new Date(`${order.expiryDate}T00:00:00`).getTime() - Date.now()) / 86400000);
    const expiryId = `expiry-${order.id}`;
    if ((order.membershipStatus ?? order.status) === 'active' && days >= 0 && days <= 7 && !seen.has(expiryId)) added.push({ id: expiryId, userId, type: 'membership_expiry', category: 'system', title: `Gói ${order.packageName} sắp hết hạn`, message: `Còn ${days} ngày sử dụng. Gia hạn để tiếp tục tập luyện.`, createdAt: new Date().toISOString(), priority: 'high', badge: 'SẮP HẾT HẠN', actionType: 'renewal', actionPayload: { packageId: order.packageId, membershipId: order.id } });
  }
  if (orders.some(order => order.packageId === 'diamond-all-access' && order.paymentStatus === 'paid' && (order.membershipStatus ?? order.status) === 'active') && !seen.has('diamond-voucher')) added.push({ id: 'diamond-voucher', userId, type: 'voucher', category: 'promotion', title: 'VOUCHER VIP DIAMOND: Giảm 20% toàn bộ Whey Isolate & BCAA', message: 'Ưu đãi độc quyền cho hội viên Diamond tại QA Pro Shop. Vui lòng kiểm tra điều kiện sử dụng tại quầy trước khi thanh toán.', createdAt: new Date().toISOString(), priority: 'high', badge: 'ƯU ĐÃI ĐỘC QUYỀN', actionType: 'shop', actionPayload: { code: 'DIAMOND-BDAY20' } });
  if (added.length) await write(userId, [...added, ...rows]);
}
export async function getNotifications(userId: string) { if (!userId) return []; await syncMembership(userId); return read(userId); }
export async function getUnreadCount(userId: string) { return (await getNotifications(userId)).filter(row => !row.readAt).length; }
export async function markAsRead(userId: string, notificationId: string) { const rows = await read(userId); const now = new Date().toISOString(); await write(userId, rows.map(row => row.id === notificationId && !row.readAt ? { ...row, readAt: now } : row)); }
export async function markAllAsRead(userId: string) { const rows = await read(userId); const now = new Date().toISOString(); await write(userId, rows.map(row => row.readAt ? row : { ...row, readAt: now })); }
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> { const saved = await readLocal(prefsKey(userId)); return saved ? JSON.parse(saved) : { userId, pushEnabled: false, emailEnabled: true, smsEnabled: true, ptReminderEnabled: true, promotionEnabled: true, transactionEnabled: true, systemEnabled: true }; }
export async function updateNotificationPreferences(userId: string, patch: Partial<Omit<NotificationPreferences, 'userId'>>) { const next = { ...await getNotificationPreferences(userId), ...patch, userId }; await writeLocal(prefsKey(userId), JSON.stringify(next)); emit(userId); return next; }
export async function requestPtReschedule(userId: string, notificationId: string) { const key = `qa-gym-pt-reschedule-requests:${userId}`; const rows: { notificationId: string; status: 'pending'; createdAt: string }[] = JSON.parse(await readLocal(key) ?? '[]'); if (rows.some(row => row.notificationId === notificationId)) return; await writeLocal(key, JSON.stringify([{ notificationId, status: 'pending', createdAt: new Date().toISOString() }, ...rows])); }
