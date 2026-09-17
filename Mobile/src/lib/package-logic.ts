export const diamondDurations = [
  { months: 3, bonusMonths: 0, monthlyPrice: 1590000, originalMonthlyPrice: 1850000, totalPrice: 4770000, discountLabel: 'Tiết kiệm 14%', subtitle: 'Cơ bản' },
  { months: 6, bonusMonths: 0, monthlyPrice: 1420000, originalMonthlyPrice: 1850000, totalPrice: 8520000, discountLabel: 'Giảm 23%', subtitle: 'Bán chạy' },
  { months: 12, bonusMonths: 2, monthlyPrice: 1290000, originalMonthlyPrice: 1850000, totalPrice: 15480000, discountLabel: 'Giảm 35% + Tặng 2th', subtitle: '+ Tặng 2 tháng', badge: 'HOT DEAL' },
] as const;
export type DurationOption = (typeof diamondDurations)[number];
export const formatVND = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)}₫`;
export const periodLabel = (option: DurationOption) => option.bonusMonths ? `Gói ${option.months} tháng + ${option.bonusMonths} tháng tặng` : `Gói thanh toán ${option.months} tháng`;
export function addCalendarMonths(date: Date, months: number) {
  const day = date.getDate();
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  first.setDate(Math.min(day, lastDay));
  return first;
}
export function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
