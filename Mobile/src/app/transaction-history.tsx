import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getTransactionHistory, type Transaction } from '@/lib/transaction-api';

type Filter = 'ALL' | 'PACKAGE' | 'PRODUCT_ORDER';
const statusText: Record<string, string> = { PENDING: 'Đang chờ', SUCCESS: 'Thanh toán thành công', FAILED: 'Thanh toán thất bại', CANCELLED: 'Đã hủy', CONFIRMED: 'Đã xác nhận', PROCESSING: 'Đang xử lý', COMPLETED: 'Đã hoàn tất đơn' };
const methodText: Record<string, string> = { TIEN_MAT: 'Tiền mặt', CHUYEN_KHOAN: 'Chuyển khoản', THE: 'Thẻ' };

export default function TransactionHistoryScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Transaction[] | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [error, setError] = useState('');
  useFocusEffect(useCallback(() => {
    let live = true;
    if (user?.accountId) getTransactionHistory(user.accountId).then(items => { if (live) { setRows(items); setError(''); } }).catch(() => { if (live) setError('Không tải được lịch sử giao dịch.'); });
    else setRows([]);
    return () => { live = false; };
  }, [user?.accountId]));
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>
    <Pressable onPress={() => router.back()}><Text style={s.back}>‹ QUAY LẠI</Text></Pressable>
    <Text style={s.title}>LỊCH SỬ GIAO DỊCH</Text>
    <View style={s.filters}>{([['ALL', 'Tất cả'], ['PACKAGE', 'Gói tập'], ['PRODUCT_ORDER', 'Sản phẩm']] as const).map(([key, label]) => <Pressable key={key} onPress={() => setFilter(key)} style={[s.filter, filter === key && s.selected]}><Text style={s.filterText}>{label}</Text></Pressable>)}</View>
    {error ? <Text style={s.muted}>{error}</Text> : rows === null ? <Text style={s.muted}>Đang tải...</Text> : rows.filter(row => filter === 'ALL' || row.type === filter).length === 0 ? <Text style={s.muted}>Chưa có giao dịch.</Text> : rows.filter(row => filter === 'ALL' || row.type === filter).map(row => <Pressable key={row.id} style={s.card} onPress={() => row.type === 'PACKAGE' ? router.push({ pathname: '/package-payment', params: { paymentId: row.referenceId } }) : router.push('/orders')}>
      <View style={s.row}><Text style={s.name}>{row.title}</Text><Text style={s.amount}>{Number(row.amount).toLocaleString('vi-VN')}đ</Text></View>
      <Text style={s.muted}>{row.type === 'PACKAGE' ? 'Gói tập' : 'Đơn sản phẩm'} · {new Date(row.date).toLocaleString('vi-VN')}</Text>
      <Text style={s.status}>{statusText[row.status] || row.status}</Text>
      {row.paymentMethod ? <Text style={s.muted}>Phương thức: {methodText[row.paymentMethod] || row.paymentMethod}</Text> : null}
    </Pressable>)}
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1011' }, content: { width: '100%', maxWidth: 540, alignSelf: 'center', padding: 16, gap: 12 },
  back: { color: '#d9ff00', fontWeight: '900' }, title: { color: '#e9f0e5', fontSize: 20, fontWeight: '900' },
  filters: { flexDirection: 'row', gap: 8 }, filter: { padding: 10, backgroundColor: '#282d2a', borderRadius: 8 }, selected: { backgroundColor: '#607000' }, filterText: { color: '#fff' },
  card: { backgroundColor: '#1b2022', borderRadius: 9, padding: 13, gap: 8 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { color: '#e9f0e5', fontSize: 13, fontWeight: '800', flex: 1 }, amount: { color: '#d9ff00', fontSize: 13, fontWeight: '900' },
  muted: { color: '#929d92', fontSize: 11 }, status: { color: '#d9ff00', fontSize: 11, fontWeight: '700' },
});
