import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getEnrollments, type MembershipEnrollment } from '@/lib/membership';
import { formatVND } from '@/lib/package-logic';

export default function TransactionHistoryScreen() {
  const { user } = useAuth(); const [orders, setOrders] = useState<MembershipEnrollment[] | null>(null); const [error, setError] = useState('');
  useFocusEffect(useCallback(() => { let live = true; if (user) getEnrollments(user.email).then(rows => { if (live) setOrders(rows); }).catch(() => { if (live) setError('Không thể tải lịch sử giao dịch.'); }); else setOrders([]); return () => { live = false; }; }, [user]));
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><Pressable onPress={() => router.back()}><Text style={s.back}>‹ QUAY LẠI</Text></Pressable><Text style={s.title}>Lịch sử giao dịch gói tập</Text>{error ? <Text style={s.muted}>{error}</Text> : orders === null ? <Text style={s.muted}>Đang tải lịch sử...</Text> : !orders.length ? <Text style={s.muted}>Chưa có giao dịch gói tập.</Text> : orders.map(order => <Pressable key={order.id} style={s.card} onPress={() => router.push({ pathname: '/package-payment', params: { orderId: order.id } })}><View style={s.row}><Text style={s.name}>{order.renewalOf ? 'Gia hạn' : 'Đăng ký'} {order.packageName}</Text><Text style={s.amount}>{formatVND(order.finalAmount)}</Text></View><Text style={s.muted}>{order.id} · {new Date(order.createdAt).toLocaleDateString('vi-VN')}</Text><Text style={s.status}>{order.paymentStatus === 'paid' ? 'Đã thanh toán' : order.paymentStatus === 'failed' ? 'Thanh toán thất bại' : 'Chờ thanh toán'}</Text></Pressable>)}</ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#0d1011' }, content: { width: '100%', maxWidth: 540, alignSelf: 'center', padding: 16, gap: 12 }, back: { color: '#d9ff00', fontSize: 11, fontWeight: '900' }, title: { color: '#e9f0e5', fontSize: 19, fontWeight: '900', marginBottom: 8 }, card: { backgroundColor: '#1b2022', borderRadius: 9, padding: 13, gap: 8 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, name: { color: '#e9f0e5', fontSize: 12, fontWeight: '800', flex: 1 }, amount: { color: '#d9ff00', fontSize: 12, fontWeight: '900' }, muted: { color: '#929d92', fontSize: 10 }, status: { color: '#d9ff00', fontSize: 10, fontWeight: '700' } });
