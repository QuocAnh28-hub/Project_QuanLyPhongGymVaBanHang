import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, getNotificationPreferences, markAllNotificationsRead, markNotificationRead, updateNotificationPreferences, type Notification, type NotificationPreferences } from '@/lib/notification-api';

const settings: [keyof Omit<NotificationPreferences, 'TaiKhoanID'>, string][] = [
  ['PushEnabled', 'Push (chưa hỗ trợ gửi)'], ['EmailEnabled', 'Email (chưa hỗ trợ gửi)'],
  ['SmsEnabled', 'SMS (chưa hỗ trợ gửi)'], ['PtReminderEnabled', 'Nhắc lịch PT'],
  ['PromotionEnabled', 'Ưu đãi'], ['TransactionEnabled', 'Giao dịch'], ['SystemEnabled', 'Hệ thống'],
];

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Notification[] | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const load = useCallback(async () => {
    if (!user?.accountId) return;
    try {
      const [items, options] = await Promise.all([getNotifications(user.accountId), getNotificationPreferences(user.accountId)]);
      setRows(items); setPrefs(options); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Không tải được thông báo'); }
  }, [user?.accountId]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  async function read(row: Notification) {
    try { await markNotificationRead(row.ThongBaoID); await load(); }
    catch (e) { Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không đánh dấu đã đọc được'); }
    let payload: Record<string, unknown> | null = null;
    try { payload = typeof row.ActionPayload === 'string' ? JSON.parse(row.ActionPayload) : row.ActionPayload; } catch { /* Keep the notification readable. */ }
    if (row.ActionType === 'MEMBERSHIP') router.push('/membership-detail');
    else if (row.ActionType === 'PT' && payload?.ThuePTID) router.push('/pt-schedule');
  }
  async function readAll() {
    if (!user?.accountId) return;
    try { await markAllNotificationsRead(user.accountId); await load(); }
    catch (e) { Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không đánh dấu đã đọc được'); }
  }
  async function toggle(key: keyof Omit<NotificationPreferences, 'TaiKhoanID'>, value: boolean) {
    if (!user?.accountId) return;
    try { setPrefs(await updateNotificationPreferences(user.accountId, { [key]: value })); }
    catch (e) { Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không lưu được cài đặt'); }
  }
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>
    <Pressable onPress={() => router.back()}><Text style={s.link}>‹ QUAY LẠI</Text></Pressable>
    <Text style={s.title}>THÔNG BÁO</Text>
    <View style={s.actions}><Pressable onPress={readAll}><Text style={s.link}>Đánh dấu tất cả đã đọc</Text></Pressable><Pressable onPress={() => setShowSettings(!showSettings)}><Text style={s.link}>Cài đặt</Text></Pressable></View>
    {showSettings && prefs ? <View style={s.card}>{settings.map(([key, label]) => <View key={key} style={s.setting}><Text style={s.body}>{label}</Text><Switch value={!!prefs[key]} onValueChange={value => toggle(key, value)} /></View>)}</View> : null}
    {error ? <Pressable onPress={load}><Text style={s.error}>{error} · Chạm để thử lại</Text></Pressable> : rows === null ? <Text style={s.muted}>Đang tải...</Text> : rows.length === 0 ? <Text style={s.muted}>Chưa có thông báo.</Text> : rows.map(row => <Pressable key={row.ThongBaoID} style={[s.card, !row.NgayDoc && s.unread]} onPress={() => read(row)}>
      <Text style={s.category}>{row.DanhMuc} · {new Date(row.NgayTao).toLocaleString('vi-VN')}</Text>
      <Text style={s.heading}>{row.TieuDe}</Text><Text style={s.body}>{row.NoiDung}</Text>
      {!row.NgayDoc ? <Text style={s.link}>Chưa đọc</Text> : null}
    </Pressable>)}
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101210' }, content: { width: '100%', maxWidth: 540, alignSelf: 'center', padding: 18, gap: 12 },
  title: { color: '#f0f4ec', fontSize: 24, fontWeight: '900' }, link: { color: '#d9ff00', fontWeight: '800' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, card: { backgroundColor: '#202522', borderRadius: 10, padding: 14, gap: 7 },
  unread: { borderLeftWidth: 3, borderLeftColor: '#d9ff00' }, heading: { color: '#fff', fontWeight: '800', fontSize: 15 },
  body: { color: '#d4ded1', flexShrink: 1 }, category: { color: '#aebaaa', fontSize: 11 }, muted: { color: '#aebaaa' },
  error: { color: '#ff9f9f' }, setting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
});
