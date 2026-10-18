import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getOwnedMemberships, getRegistrationDetail, type ActivationMode, type RegistrationDetail } from '@/lib/membership-api';
import { createPackagePayment, getPaymentByRegistration } from '@/lib/payment-api';
import { formatVND } from '@/lib/package-logic';
import type { PaymentMethod } from '@/lib/membership';

export default function PackageResumeScreen() {
  const { registrationId } = useLocalSearchParams<{ registrationId?: string }>();
  const id = Number(registrationId);
  const { user } = useAuth();
  const accountId = user?.accountId;
  const [row, setRow] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('vietqr');
  const [mode, setMode] = useState<ActivationMode | null>(null);
  const [hasMembership, setHasMembership] = useState(false);
  const [version, setVersion] = useState(0);
  const lock = useRef(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    setRow(null); setLoading(true); setError(''); setMode(null);
    (async () => {
      if (!accountId) throw new Error('Vui lòng đăng nhập để tiếp tục đăng ký.');
      if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Mã đăng ký không hợp lệ.');
      const [registration, payment, owned] = await Promise.all([
        getRegistrationDetail(id), getPaymentByRegistration(id), getOwnedMemberships(accountId),
      ]);
      if (!active) return;
      if (payment && ['PENDING','SUCCESS'].includes(payment.TrangThaiThanhToan)) {
        router.replace({ pathname: '/package-payment', params: { paymentId: String(payment.ThanhToanID) } });
        return;
      }
      if (registration.TrangThai !== 'PENDING' || payment?.TrangThaiThanhToan === 'CANCELLED') throw new Error('Đăng ký này không còn chờ thanh toán.');
      const ownsPackage = !!owned.current || owned.upcoming.length > 0;
      setHasMembership(ownsPackage);
      setMode(ownsPackage ? null : 'QUEUE_AFTER_CURRENT');
      setRow(registration);
    })().catch(e => { if (active) setError(e instanceof Error ? e.message : 'Không tải được đăng ký.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accountId, id, version]));
  function chooseMode(value: ActivationMode) {
    if (value === 'QUEUE_AFTER_CURRENT') { setMode(value); return; }
    const warning = 'Thời gian còn lại của gói hiện tại sẽ không được cộng sang gói mới. Chưa hỗ trợ hoàn tiền tự động.';
    if (Platform.OS === 'web') { if (globalThis.confirm(warning)) setMode(value); }
    else Alert.alert('Kích hoạt gói mới ngay?', warning, [
      { text: 'Hủy', style: 'cancel' }, { text: 'Xác nhận', onPress: () => setMode(value) },
    ]);
  }
  async function continuePayment() {
    if (!row || !mode || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      // Reuse an existing payment, including one created on another device.
      const existing = await getPaymentByRegistration(row.DangKyID);
      if (existing?.TrangThaiThanhToan === 'CANCELLED') throw new Error('Thanh toán đã bị hủy.');
      const payment = existing && ['PENDING','SUCCESS'].includes(existing.TrangThaiThanhToan)
        ? existing : await createPackagePayment({ registrationId: row.DangKyID, paymentMethod: method, activationMode: mode });
      router.replace({ pathname: '/package-payment', params: { paymentId: String(payment.ThanhToanID) } });
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tiếp tục thanh toán.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>
    <Pressable disabled={busy} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}><Text style={s.back}>← Quay lại</Text></Pressable>
    <Text style={s.title}>Tiếp tục đăng ký</Text>
    <Text style={s.note}>Thông tin gói đã được lưu. Bạn có thể hoàn tất thanh toán cho đăng ký này.</Text>
    {loading && <Text style={s.note}>Đang tải đăng ký…</Text>}
    {!!error && <View style={s.errorBox}><Text style={s.error}>{error}</Text>{!row && <Pressable onPress={() => setVersion(v => v + 1)}><Text style={s.back}>Thử lại</Text></Pressable>}</View>}
    {row && <>
      <View style={s.card}><Text style={s.package}>{row.TenGoi}</Text><Text style={s.note}>Đăng ký #{row.DangKyID} · {row.SoThang} tháng{row.ThangTang ? ` + ${row.ThangTang} tháng tặng` : ''}</Text><Text style={s.amount}>{formatVND(Number(row.GiaThanhToan))}</Text><Text style={s.note}>Ngày dự kiến bắt đầu: {row.NgayBatDau}</Text></View>
      {hasMembership && <View style={s.card}><Text style={s.heading}>Thời điểm kích hoạt</Text><Text style={s.note}>Chọn thời điểm sử dụng trước khi tiếp tục thanh toán.</Text>{([
        ['QUEUE_AFTER_CURRENT','Sau các gói hiện tại'],['REPLACE_NOW','Kích hoạt ngay, thay gói hiện tại'],
      ] as const).map(([value,label]) => <Pressable key={value} disabled={busy} onPress={() => chooseMode(value)} style={[s.choice,mode === value && s.selected]} accessibilityRole="radio" accessibilityState={{ checked: mode === value }}><Text style={s.text}>{label}</Text></Pressable>)}</View>}
      <View style={s.card}><Text style={s.heading}>Phương thức thanh toán</Text>{([
        ['vietqr','Chuyển khoản'],['card','Thẻ'],['pos','Thanh toán tại quầy'],
      ] as const).map(([value,label]) => <Pressable key={value} disabled={busy} onPress={() => setMethod(value)} style={[s.choice,method === value && s.selected]} accessibilityRole="radio" accessibilityState={{ checked: method === value }}><Text style={s.text}>{label}</Text></Pressable>)}</View>
      <Pressable disabled={busy || !mode} onPress={() => void continuePayment()} style={[s.primary,(busy || !mode) && s.disabled]} accessibilityRole="button"><Text style={s.primaryText}>{busy ? 'Đang xử lý…' : 'Tiếp tục thanh toán'}</Text></Pressable>
    </>}
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111316' }, content: { padding: 20, paddingBottom: 40, gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  back: { color: '#c3f400', paddingVertical: 8, fontWeight: '600' }, title: { color: '#e2e2e6', fontSize: 25, fontWeight: '800' },
  note: { color: '#aeb59e', fontSize: 13, lineHeight: 20 }, text: { color: '#e2e2e6', fontSize: 14 },
  card: { padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#343b36', backgroundColor: '#1a1c1f', gap: 12 },
  package: { color: '#e2e2e6', fontSize: 19, fontWeight: '700' }, heading: { color: '#e2e2e6', fontSize: 15, fontWeight: '700' }, amount: { color: '#c3f400', fontSize: 24, fontWeight: '700' },
  choice: { padding: 14, borderWidth: 1, borderColor: '#343b36', borderRadius: 8, backgroundColor: '#282a2d' }, selected: { borderColor: '#c3f400', backgroundColor: '#29321f' },
  primary: { padding: 16, borderRadius: 10, backgroundColor: '#c3f400', alignItems: 'center' }, primaryText: { color: '#161e00', fontSize: 14, fontWeight: '700' }, disabled: { opacity: .45 },
  errorBox: { padding: 14, borderRadius: 10, backgroundColor: '#3a2323', gap: 8 }, error: { color: '#ffb4ab', lineHeight: 20 },
});
