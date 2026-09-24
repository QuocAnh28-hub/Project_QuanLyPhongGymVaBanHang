import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ShopButton, ShopField, ShopPage, ShopRow, checkoutStyles as s } from '@/components/shop-checkout-ui';
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/shop-image';
import { useAuth } from '@/context/AuthContext';
import { checkoutStorageKey, createShopOrder, findCheckoutOrder, getCheckout, type CheckoutInput, type CheckoutPreview } from '@/lib/checkout-api';
import { readLocal, writeLocal } from '@/lib/local-store';
import { formatPrice } from '@/lib/shop-api';

const emptyForm: Omit<CheckoutInput, 'requestKey' | 'cartVersion'> = {
  name: '', phone: '', delivery: 'PICKUP', address: '', note: '', paymentMethod: 'CHUYEN_KHOAN',
};

export default function CheckoutScreen() {
  const { user } = useAuth();
  const accountId = user?.accountId;
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [attempt, setAttempt] = useState<CheckoutInput | null>(null);
  const busy = useRef(false);
  const generation = useRef(0);

  useFocusEffect(useCallback(() => {
    const version = ++generation.current;
    const active = () => generation.current === version;
    setLoading(true); setError(''); setPreview(null); setAttempt(null);
    async function load() {
      if (!accountId) return;
      // Resolve a request whose response was lost before permitting a new order.
      const saved = await readLocal(checkoutStorageKey(accountId));
      const draft: CheckoutInput | null = saved ? JSON.parse(saved) : null;
      if (draft) {
        const existing = await findCheckoutOrder(accountId, draft.requestKey);
        if (!active()) return;
        if (existing) {
          await writeLocal(checkoutStorageKey(accountId), null).catch(() => {});
          if (active()) router.replace({ pathname: '/order-payment', params: { orderId: existing.DonHangID } });
          return;
        }
      }
      const data = await getCheckout(accountId);
      if (!active()) return;
      setPreview(data);
      setForm(draft ? { ...draft } : {
        ...emptyForm, name: data.customer.HoTen || '', phone: data.customer.SoDienThoai || '', address: data.customer.DiaChi || '',
      });
    }
    load().catch(e => { if (active()) setError(e instanceof Error ? e.message : 'Không tải được thanh toán.'); })
      .finally(() => { if (active()) setLoading(false); });
    return () => { generation.current++; };
    // Refresh resolves any previous request before obtaining a new quote.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, reload]));

  function field<K extends keyof typeof emptyForm>(key: K, value: typeof emptyForm[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  async function submit() {
    if (!accountId || !preview || busy.current) return;
    const data: CheckoutInput = attempt || { ...form, requestKey: preview.requestKey, cartVersion: preview.cartVersion };
    if (data.name.trim().length < 2 || !/^(0\d{9}|\+84\d{9})$/.test(data.phone.replace(/\s/g, ''))) {
      setError('Vui lòng nhập họ tên và số điện thoại hợp lệ.'); return;
    }
    if (data.delivery === 'DELIVERY' && data.address.trim().length < 10) {
      setError('Vui lòng nhập đầy đủ địa chỉ giao hàng (ít nhất 10 ký tự).'); return;
    }
    busy.current = true; setSaving(true); setError('');
    const version = generation.current;
    try {
      // Persist before sending; a retry sends exactly the same key and body.
      await writeLocal(checkoutStorageKey(accountId), JSON.stringify(data));
      setAttempt(data);
      const order = await createShopOrder(accountId, data);
      await writeLocal(checkoutStorageKey(accountId), null).catch(() => {});
      if (version === generation.current) router.replace({ pathname: '/order-payment', params: { orderId: order.DonHangID } });
    } catch (e) {
      if (version === generation.current) setError(e instanceof Error ? e.message : 'Không tạo được đơn hàng.');
    } finally { busy.current = false; setSaving(false); }
  }

  const locked = saving || !!attempt;
  const total = preview ? Number(preview.subtotal) + (form.delivery === 'DELIVERY' ? Number(preview.shipping) : 0) : 0;
  return <ShopPage title="THANH TOÁN">
    {!accountId ? <ShopButton title="Đăng nhập để thanh toán" onPress={() => router.push('/login')} />
      : loading ? <ActivityIndicator color="#d9ff00" /> : <>
        {!!error && <Text style={s.error} accessibilityLiveRegion="polite">{error}</Text>}
        {!preview ? <ShopButton title="Thử lại" onPress={() => setReload(n => n + 1)} /> : <>
          <Text style={s.muted}>Giỏ hàng → Thông tin đặt hàng → Thanh toán</Text>
          <View style={s.card}>
            <Text style={s.heading}>Thông tin người nhận</Text>
            <ShopField label="Họ tên" value={form.name} editable={!locked} maxLength={100} onChangeText={v => field('name', v)} />
            <ShopField label="Số điện thoại" value={form.phone} editable={!locked} maxLength={20} keyboardType="phone-pad" onChangeText={v => field('phone', v)} />
            <ShopButton title="Nhận tại QA-Gym" secondary={form.delivery !== 'PICKUP'} disabled={locked} onPress={() => field('delivery', 'PICKUP')} />
            <ShopButton title="Giao đến địa chỉ" secondary={form.delivery !== 'DELIVERY'} disabled={locked} onPress={() => field('delivery', 'DELIVERY')} />
            {form.delivery === 'DELIVERY' && <ShopField label="Địa chỉ giao hàng" value={form.address} editable={!locked} maxLength={255} multiline onChangeText={v => field('address', v)} />}
          </View>
          <View style={s.card}>
            <Text style={s.heading}>Sản phẩm ({preview.items.length})</Text>
            {preview.items.map(item => <View style={s.row} key={item.SanPhamID}>
              <Image source={DEFAULT_PRODUCT_IMAGE} style={s.image} contentFit="contain" />
              <View style={{ flex: 1 }}>
                <Text style={s.text}>{item.TenSanPham}</Text>
                <Text style={s.muted}>{item.SoLuong} {item.DonViTinh} × {formatPrice(Number(item.GiaBan))}</Text>
                <Text style={s.text}>{formatPrice(Number(item.GiaBan) * item.SoLuong)}</Text>
              </View>
            </View>)}
          </View>
          <View style={s.card}>
            <Text style={s.heading}>Phương thức thanh toán</Text>
            <ShopButton title="Chuyển khoản ngân hàng" secondary={form.paymentMethod !== 'CHUYEN_KHOAN'} disabled={locked} onPress={() => field('paymentMethod', 'CHUYEN_KHOAN')} />
            <ShopButton title={form.delivery === 'PICKUP' ? 'Tiền mặt tại quầy' : 'Tiền mặt khi nhận hàng'} secondary={form.paymentMethod !== 'TIEN_MAT'} disabled={locked} onPress={() => field('paymentMethod', 'TIEN_MAT')} />
            <Text style={s.muted}>Đơn hàng được lưu trước. Trạng thái đã thanh toán được cập nhật sau khi xác nhận đã thu tiền.</Text>
            {preview.demoEnabled && <Text style={s.muted}>Chế độ demo: có thể mô phỏng thanh toán ở bước tiếp theo, không thu tiền thật.</Text>}
          </View>
          <ShopField label="Ghi chú (không bắt buộc)" value={form.note} editable={!locked} maxLength={500} multiline onChangeText={v => field('note', v)} />
          <View style={s.card}>
            <ShopRow label="Tiền hàng" value={formatPrice(Number(preview.subtotal))} />
            <ShopRow label="Phí vận chuyển" value={formatPrice(form.delivery === 'DELIVERY' ? Number(preview.shipping) : 0)} />
            <Text style={s.accent}>Tổng: {formatPrice(total)}</Text>
          </View>
          <ShopButton title={saving ? 'Đang tạo đơn hàng...' : attempt ? 'Thử lại yêu cầu đặt hàng' : 'ĐẶT HÀNG & THANH TOÁN'} disabled={saving} onPress={() => void submit()} />
          {!!attempt && <ShopButton title="Kiểm tra lại giỏ hàng / sửa thông tin" secondary disabled={saving} onPress={() => setReload(n => n + 1)} />}
        </>}
        <ShopButton title="Quay lại giỏ hàng" secondary disabled={saving} onPress={() => router.replace('/cart')} />
      </>}
  </ShopPage>;
}
