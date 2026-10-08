import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import BackendImage from '@/components/backend-image';
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/shop-image';
import {
  ShopButton,
  ShopField,
  ShopPage,
  checkoutStyles as s,
} from '@/components/shop-checkout-ui';
import { useAuth } from '@/context/AuthContext';
import { getShopOrders, orderStatus, paymentStatus } from '@/lib/checkout-api';
import { formatPrice, searchKey } from '@/lib/shop-api';

export default function OrdersScreen() {
  const { user } = useAuth();
  const accountId = user?.accountId;
  const [orders, setOrders] = useState<
    Awaited<ReturnType<typeof getShopOrders>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [reload, setReload] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setOrders([]);
      setLoading(!!accountId);
      setError('');
      if (accountId)
        getShopOrders(accountId)
          .then((rows) => {
            if (active) setOrders(rows);
          })
          .catch((e) => {
            if (active) setError(e.message);
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      return () => {
        active = false;
      };
      // Manual refresh reloads the same account's orders.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId, reload])
  );
  const visible = useMemo(
    () =>
      orders.filter(
        (order) =>
          (!pendingOnly || (order.TrangThai === 'PENDING' && order.TrangThaiThanhToan === 'PENDING')) &&
          searchKey(`${order.DonHangID} ${order.items.map(item=>item.TenSanPham).join(' ')}`).includes(searchKey(search.trim().replace(/^#/, '')))
      ),
    [orders, pendingOnly, search]
  );

  return (
    <ShopPage title="ĐƠN HÀNG CỦA TÔI">
      {!accountId ? (
        <ShopButton
          title="Đăng nhập để xem đơn hàng"
          onPress={() => router.push('/login')}
        />
      ) : (
        <>
          <ShopField
            label="Tìm đơn hàng"
            placeholder="Mã đơn hoặc tên sản phẩm…"
            value={search}
            onChangeText={setSearch}
          />
          <View style={styles.filters}>
            {[false,true].map(pending=><Pressable key={String(pending)} accessibilityRole="button" accessibilityState={{selected:pendingOnly===pending}}
              style={[styles.filter,pendingOnly===pending&&styles.filterSelected]} onPress={()=>setPendingOnly(pending)}>
              <Text style={[styles.filterText,pendingOnly===pending&&styles.filterTextSelected]}>{pending?'Chờ thanh toán':'Tất cả đơn'}</Text>
            </Pressable>)}
          </View>
          {loading ? (
            <ActivityIndicator color="#d9ff00" />
          ) : error ? (
            <Text style={s.error}>{error}</Text>
          ) : (
            <>
              {!visible.length && (
                <Text style={s.muted}>Chưa có đơn hàng phù hợp.</Text>
              )}
              {visible.map((order) => (
                <View key={order.DonHangID} style={s.card}>
                  <View style={styles.topRow}>
                    <View style={{flex:1}}>
                      <Text style={styles.orderId}>Đơn #{order.DonHangID}</Text>
                      <Text style={styles.date}>{new Date(order.NgayDat).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</Text>
                    </View>
                    <Text style={[styles.badge,order.TrangThai==='COMPLETED'?styles.done:order.TrangThai==='CANCELLED'?styles.cancelled:styles.waiting]}>{orderStatus[order.TrangThai]||order.TrangThai}</Text>
                  </View>
                  {order.items.slice(0,2).map(item=><View style={styles.productRow} key={item.SanPhamID}>
                    <BackendImage value={item.HinhAnh} fallback={DEFAULT_PRODUCT_IMAGE} style={styles.productImage} contentFit="contain" />
                    <View style={{flex:1,gap:4}}>
                      <Text style={styles.productName} numberOfLines={2}>{item.TenSanPham}</Text>
                      <Text style={s.muted}>{item.SoLuong} {item.DonViTinh} × {formatPrice(Number(item.DonGia))}</Text>
                      <Text style={styles.lineAmount}>{formatPrice(Number(item.ThanhTien))}</Text>
                    </View>
                  </View>)}
                  {order.items.length>2&&<Text style={s.muted}>+ {order.items.length-2} sản phẩm khác · Xem trong chi tiết đơn</Text>}
                  <View style={styles.summary}>
                    <View style={{flex:1,gap:4}}>
                      <Text style={s.muted}>{order.items.reduce((sum,item)=>sum+item.SoLuong,0)} sản phẩm · {order.CachNhan==='PICKUP'?'Nhận tại quầy':'Giao tận nơi'}</Text>
                      <Text style={[styles.payment,order.TrangThaiThanhToan==='SUCCESS'&&styles.paid]}>{paymentStatus[order.TrangThaiThanhToan]||order.TrangThaiThanhToan}</Text>
                    </View>
                    <View style={{alignItems:'flex-end',gap:3}}>
                      <Text style={styles.date}>Tổng thanh toán</Text>
                      <Text style={styles.total}>{formatPrice(Number(order.TongTien))}</Text>
                    </View>
                  </View>
                  <ShopButton
                    title={
                      order.TrangThai === 'PENDING' && order.TrangThaiThanhToan === 'PENDING'
                        ? 'Tiếp tục thanh toán'
                        : order.HoaDonID ? 'Xem chi tiết / hóa đơn' : 'Xem chi tiết đơn'
                    }
                    secondary={order.TrangThai !== 'PENDING' || order.TrangThaiThanhToan !== 'PENDING'}
                    onPress={() =>
                      router.push({
                        pathname: '/order-payment',
                        params: { orderId: order.DonHangID },
                      })
                    }
                  />
                </View>
              ))}
            </>
          )}
          <ShopButton
            title="Tải lại đơn hàng"
            secondary
            disabled={loading}
            onPress={() => setReload((n) => n + 1)}
          />
        </>
      )}
      <ShopButton
        title="Tiếp tục mua sắm"
        onPress={() => router.replace('/product')}
      />
    </ShopPage>
  );
}
const styles=StyleSheet.create({
  filters:{flexDirection:'row',gap:10},
  filter:{flex:1,paddingVertical:11,borderRadius:20,alignItems:'center',backgroundColor:'#222a2c',borderWidth:1,borderColor:'#394346'},
  filterSelected:{backgroundColor:'#d9ff00',borderColor:'#d9ff00'},
  filterText:{color:'#c4cec4',fontSize:13,fontWeight:'600'},filterTextSelected:{color:'#182000'},
  topRow:{flexDirection:'row',alignItems:'center',gap:10,paddingBottom:12,borderBottomWidth:1,borderBottomColor:'#313a3d'},
  orderId:{color:'#eff5e8',fontSize:15,fontWeight:'700'},date:{color:'#94a29a',fontSize:11,marginTop:4},
  badge:{fontSize:11,fontWeight:'600',paddingHorizontal:9,paddingVertical:6,borderRadius:8,overflow:'hidden'},
  done:{color:'#54dca5',backgroundColor:'#1f3c31'},waiting:{color:'#e8d88c',backgroundColor:'#393521'},cancelled:{color:'#b6bfba',backgroundColor:'#33393b'},
  productRow:{flexDirection:'row',gap:12,alignItems:'center'},productImage:{width:72,height:72,borderRadius:10,backgroundColor:'#141a1c'},
  productName:{fontSize:14,fontWeight:'600',color:'#eff5e8',lineHeight:20},lineAmount:{color:'#d8e3d8',fontSize:13,fontWeight:'600'},
  summary:{flexDirection:'row',alignItems:'center',gap:12,paddingTop:12,borderTopWidth:1,borderTopColor:'#313a3d'},
  payment:{fontSize:12,color:'#b9c3bb'},paid:{color:'#54dca5'},total:{fontSize:19,fontWeight:'700',color:'#d9ff00'},
});
