export const diamondDurations = [
  { months: 3, bonusMonths: 0, baseAmount: 5550000, packagePromotion: 780000, monthlyPrice: 1590000, originalMonthlyPrice: 1850000, totalPrice: 4770000, discountLabel: 'Tiết kiệm 14%', subtitle: 'Cơ bản' },
  { months: 6, bonusMonths: 0, baseAmount: 11100000, packagePromotion: 2580000, monthlyPrice: 1420000, originalMonthlyPrice: 1850000, totalPrice: 8520000, discountLabel: 'Giảm 23%', subtitle: 'Bán chạy' },
  { months: 12, bonusMonths: 2, baseAmount: 15480000, packagePromotion: 4490000, monthlyPrice: 915833, originalMonthlyPrice: 1290000, totalPrice: 10990000, discountLabel: 'Giảm 4.490.000₫ + Tặng 2th', subtitle: '+ Tặng 2 tháng', badge: 'HOT DEAL' },
] as const;
export type DurationOption = { months: number; bonusMonths: number; baseAmount: number; packagePromotion: number; monthlyPrice: number; originalMonthlyPrice: number; totalPrice: number; discountLabel: string; subtitle: string; badge?: string };
export type Voucher = { code: string; type: 'fixed'; value: number; active: boolean; validFrom?: string; validUntil?: string; minimumAmount?: number };
export const vouchers: readonly Voucher[] = [{ code: 'NEONGYM2026', type: 'fixed', value: 500000, active: true }];
export type Pricing = { baseAmount: number; membershipDiscount: number; voucherCode: string | null; voucherDiscount: number; fees: number; subtotal: number; finalAmount: number };
export const formatVND = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)}₫`;
export const periodLabel = (option: DurationOption) => option.bonusMonths ? `Gói ${option.months} tháng + ${option.bonusMonths} tháng tặng` : `Gói thanh toán ${option.months} tháng`;
export const getDuration = (months: number) => diamondDurations.find(option => option.months === months) ?? null;
export function findVoucher(input: string, subtotal: number, now = new Date()) {
  const code = input.trim().toUpperCase(); const voucher = vouchers.find(item => item.code === code);
  if (!code) return { voucher: null, error: 'Vui lòng nhập mã voucher.' };
  if (!voucher || !voucher.active) return { voucher: null, error: 'Mã voucher không hợp lệ.' };
  const today = localDate(now);
  if ((voucher.validFrom && today < voucher.validFrom) || (voucher.validUntil && today > voucher.validUntil)) return { voucher: null, error: 'Mã voucher đã hết hạn hoặc chưa có hiệu lực.' };
  if (voucher.minimumAmount && subtotal < voucher.minimumAmount) return { voucher: null, error: `Đơn hàng tối thiểu ${formatVND(voucher.minimumAmount)}.` };
  return { voucher, error: '' };
}
export function calculatePrice(option: DurationOption, voucher: Voucher | null = null): Pricing {
  const subtotal = Math.max(0, option.baseAmount - option.packagePromotion); const voucherDiscount = voucher ? Math.min(voucher.value, subtotal) : 0; const fees = 0;
  return { baseAmount: option.baseAmount, membershipDiscount: option.packagePromotion, voucherCode: voucher?.code ?? null, voucherDiscount, fees, subtotal, finalAmount: Math.max(0, subtotal - voucherDiscount + fees) };
}
export function validateMemberForm(form: { name: string; phone: string; email: string; activationDate: string; homeClubId: string }, today = new Date()) {
  const errors: Partial<Record<keyof typeof form, string>> = {}; const name = form.name.trim(); const phone = form.phone.replace(/\s/g, '');
  if (name.length < 2) errors.name = 'Vui lòng nhập họ tên hợp lệ.';
  if (!/^(?:\+84|0)\d{9}$/.test(phone)) errors.phone = 'Số điện thoại không hợp lệ.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Email không hợp lệ.';
  const activation = parseLocalDate(form.activationDate); const min = startOfDay(today); const max = new Date(min); max.setDate(max.getDate() + 30);
  if (!activation || activation < min || activation > max) errors.activationDate = 'Ngày kích hoạt phải nằm trong 30 ngày tới.';
  if (!form.homeClubId) errors.homeClubId = 'Vui lòng chọn câu lạc bộ chính.';
  return errors;
}
export function addCalendarMonths(date: Date, months: number) { const day = date.getDate(); const first = new Date(date.getFullYear(), date.getMonth() + months, 1); const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate(); first.setDate(Math.min(day, lastDay)); return first; }
export function localDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function parseLocalDate(value: string) { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value); if (!match) return null; const date = new Date(+match[1], +match[2] - 1, +match[3]); return localDate(date) === value ? date : null; }
export function startOfDay(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
