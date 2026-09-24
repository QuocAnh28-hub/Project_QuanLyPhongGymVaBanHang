import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ShopButton, ShopField, ShopPage, ShopRow, checkoutStyles as s } from '@/components/shop-checkout-ui';
import { useAuth } from '@/context/AuthContext';
import { getShopOrders, orderStatus, paymentStatus } from '@/lib/checkout-api';
import { formatPrice } from '@/lib/shop-api';

export default function OrdersScreen() {
  const { user } = useAuth();
  const accountId = user?.accountId;
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getShopOrders>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [reload, setReload] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setOrders([]); setLoading(!!accountId); setError('');
    if (accountId) getShopOrders(accountId).then(rows => { if (active) setOrders(rows); })
      .catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // Manual refresh reloads the same account's orders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, reload]));
  const visible = useMemo(() => orders.filter(order =>
    (!pendingOnly || order.TrangThaiThanhToan === 'PENDING') && String(order.DonHangID).includes(search.trim().replace(/^#/, '')),
  ), [orders, pendingOnly, search]);

  return <ShopPage title="ĐƠN HÀNG CỦA TÔI">
    {!accountId ? <ShopButton title="Đăng nhập để xem đơn hàng" onPress={() => router.push('/login')} /> : <>
      <ShopField label="Tìm theo mã đơn hàng" value={search} onChangeText={setSearch} keyboardType="number-pad" />
      <ShopButton title={pendingOnly ? 'Đang lọc: Chờ thanh toán' : 'Hiển thị: Tất cả đơn hàng'} secondary onPress={() => setPendingOnly(v => !v)} />
      {loading ? <ActivityIndicator color="#d9ff00" /> : error ? <Text style={s.error}>{error}</Text> : <>
        {!visible.length && <Text style={s.muted}>Chưa có đơn hàng phù hợp.</Text>}
        {visible.map(order => <View key={order.DonHangID} style={s.card}>
          <Text style={s.heading}>Đơn hàng #{order.DonHangID}</Text>
          <Text style={s.muted}>{new Date(order.NgayDat).toLocaleString('vi-VN')}</Text>
          <ShopRow label="Đơn hàng" value={orderStatus[order.TrangThai] || order.TrangThai} />
          <ShopRow label="Thanh toán" value={paymentStatus[order.TrangThaiThanhToan] || order.TrangThaiThanhToan} />
          <Text style={s.accent}>{formatPrice(Number(order.TongTien))}</Text>
          <ShopButton title={order.TrangThaiThanhToan === 'PENDING' ? 'Xem & thanh toán' : 'Xem chi tiết / hóa đơn'} onPress={() => router.push({ pathname: '/order-payment', params: { orderId: order.DonHangID } })} />
        </View>)}
      </>}
      <ShopButton title="Tải lại đơn hàng" secondary disabled={loading} onPress={() => setReload(n => n + 1)} />
    </>}
    <ShopButton title="Tiếp tục mua sắm" onPress={() => router.replace('/product')} />
  </ShopPage>;
}
