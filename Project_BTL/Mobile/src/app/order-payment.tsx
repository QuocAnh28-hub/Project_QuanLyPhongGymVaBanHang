import BackendImage from '@/components/backend-image';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import {
  ShopButton,
  ShopPage,
  ShopRow,
  checkoutStyles as s,
} from '@/components/shop-checkout-ui';
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/shop-image';
import { useAuth } from '@/context/AuthContext';
import {
  getShopOrder,
  orderStatus,
  paymentStatus,
  type ShopOrder,
} from '@/lib/checkout-api';
import { formatPrice } from '@/lib/shop-api';

export default function OrderPaymentScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { user } = useAuth();
  const accountId = user?.accountId;
  const id = Number(orderId);
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let timer: ReturnType<typeof setTimeout> | undefined;
      setLoading(true);
      setOrder(null);
      setError('');
      async function load() {
        try {
          if (!accountId || !Number.isSafeInteger(id) || id <= 0)
            throw new Error('Đơn hàng không hợp lệ.');
          const data = await getShopOrder(accountId, id);
          if (!active) return;
          setOrder(data);
          setError('');
          if (data.TrangThaiThanhToan === 'PENDING')
            timer = setTimeout(() => void load(), 5000);
        } catch (e) {
          if (active)
            setError(
              e instanceof Error ? e.message : 'Không tải được đơn hàng.'
            );
        } finally {
          if (active) setLoading(false);
        }
      }
      void load();
      return () => {
        active = false;
        clearTimeout(timer);
      };
      // Manual retry must restart polling even when order/account IDs stay the same.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId, id, reload])
  );

  async function copy() {
    if (!order) return;
    try {
      await Clipboard.setStringAsync(
        `QAGYM DH${order.DonHangID} TT${order.ThanhToanID}`
      );
      setNotice('Đã sao chép nội dung chuyển khoản.');
    } catch {
      setNotice(
        'Không sao chép được. Vui lòng nhập nội dung hiển thị bên dưới.'
      );
    }
  }
  const success = order?.TrangThaiThanhToan === 'SUCCESS';
  const pending = !error && order?.TrangThai === 'PENDING' && order?.TrangThaiThanhToan === 'PENDING';
  return (
    <ShopPage title="THANH TOÁN ĐƠN HÀNG">
      {loading && <ActivityIndicator color="#d9ff00" />}
      {!!error && <Text style={s.error}>{error}</Text>}
      {order && (
        <>
          <Text style={s.accent}>
            {success
              ? 'Thanh toán thành công'
              : paymentStatus[order.TrangThaiThanhToan] ||
                order.TrangThaiThanhToan}
          </Text>
          <Text style={s.muted}>
            {success
              ? `Đã ghi nhận thanh toán và lập hóa đơn. Đơn hàng: ${orderStatus[order.TrangThai] || order.TrangThai}.`
              : pending ? 'Đơn hàng đã được lưu. Vui lòng hoàn tất thanh toán theo phương thức đã chọn.' : `Đơn hàng: ${orderStatus[order.TrangThai] || order.TrangThai}.`}
          </Text>
          <View style={s.card}>
            <ShopRow label="Mã đơn hàng" value={`#${order.DonHangID}`} />
            <ShopRow label="Mã thanh toán" value={`#${order.ThanhToanID}`} />
            {order.HoaDonID != null && (
              <ShopRow label="Mã hóa đơn" value={`#${order.HoaDonID}`} />
            )}
            <ShopRow
              label="Đơn hàng"
              value={orderStatus[order.TrangThai] || order.TrangThai}
            />
            <ShopRow
              label="Người nhận"
              value={`${order.TenNguoiNhan} • ${order.SoDienThoai}`}
            />
            <ShopRow
              label="Nhận hàng"
              value={
                order.CachNhan === 'PICKUP'
                  ? 'Tại QA-Gym'
                  : order.DiaChiGiaoHang || ''
              }
            />
            <ShopRow
              label="Phương thức"
              value={
                order.PhuongThucThanhToan === 'TIEN_MAT'
                  ? 'Tiền mặt'
                  : 'Chuyển khoản'
              }
            />
            <ShopRow
              label="Phí vận chuyển"
              value={formatPrice(Number(order.PhiVanChuyen))}
            />
            <Text style={s.accent}>{formatPrice(Number(order.TongTien))}</Text>
            {!!order.GhiChu && (
              <Text style={s.muted}>Ghi chú: {order.GhiChu}</Text>
            )}
          </View>
          {pending &&
            !order.paymentBlockReason &&
            order.PhuongThucThanhToan === 'CHUYEN_KHOAN' && (
              <View style={s.card}>
                <Text style={s.heading}>Chuyển khoản cho QA-Gym</Text>
                {order.transfer ? <>
                  <View style={{ alignItems:'center',paddingVertical:12 }}>
                    <QRCode value={order.transfer.qrPayload} size={240} backgroundColor="white" color="black" quietZone={12} />
                  </View>
                  <ShopRow label="Số tài khoản" value={order.transfer.accountNo} />
                  <ShopRow label="Người nhận" value={order.transfer.accountName} />
                </> : <Text style={s.error}>Chưa cấu hình tài khoản nhận tiền. Vui lòng liên hệ nhân viên QA-Gym trước khi chuyển khoản.</Text>}
                <Text style={s.muted}>
                  Nhập đúng số tiền {formatPrice(Number(order.TongTien))} và nội
                  dung:
                </Text>
                <Text style={s.heading}>
                  QAGYM DH{order.DonHangID} TT{order.ThanhToanID}
                </Text>
                <ShopButton
                  title="Sao chép nội dung"
                  secondary
                  onPress={() => void copy()}
                />
                {!!notice && <Text style={s.muted}>{notice}</Text>}
                <Text style={s.muted}>
                  Sau khi chuyển khoản, vui lòng chờ phòng gym đối soát. Trang
                  tự cập nhật trạng thái thanh toán.
                </Text>
              </View>
            )}
          {!!order.paymentBlockReason && <Text style={s.error}>{order.paymentBlockReason}</Text>}
          {pending && !order.paymentBlockReason && order.PhuongThucThanhToan === 'TIEN_MAT' && (
            <Text style={s.text}>
              {order.CachNhan === 'PICKUP'
                ? 'Thanh toán tại quầy QA-Gym và cung cấp mã đơn hàng.'
                : 'Thanh toán bằng tiền mặt khi nhận hàng. Nhân viên sẽ xác nhận sau khi thu tiền.'}
            </Text>
          )}
          <View style={s.card}>
            <Text style={s.heading}>Chi tiết đơn hàng</Text>
            {order.items.map((item) => (
              <View key={item.SanPhamID} style={s.row}>
                <BackendImage
                  value={item.HinhAnh}
                  fallback={DEFAULT_PRODUCT_IMAGE}
                  style={s.image}
                  contentFit="contain"
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.text}>{item.TenSanPham}</Text>
                  <Text style={s.muted}>
                    {item.SoLuong} × {formatPrice(Number(item.DonGia))}
                  </Text>
                  <Text style={s.text}>
                    {formatPrice(Number(item.ThanhTien))}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      <ShopButton
        title="Tải lại trạng thái"
        secondary
        disabled={loading}
        onPress={() => setReload((n) => n + 1)}
      />
      <ShopButton
        title="Xem đơn hàng của tôi"
        onPress={() => router.replace('/orders')}
      />
      <ShopButton
        title="Tiếp tục mua sắm"
        secondary
        onPress={() => router.replace('/product')}
      />
    </ShopPage>
  );
}
