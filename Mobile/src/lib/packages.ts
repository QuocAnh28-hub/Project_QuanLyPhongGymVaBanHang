import { diamondPackage } from '@/constants/package-detail';
import { diamondDurations } from '@/lib/package-logic';

export type PrivilegeCode = 'CHECKIN_24_7' | 'GROUP_X' | 'YOGA' | 'SAUNA' | 'PT_SESSION' | 'INBODY' | 'GUEST_PASS' | 'SMART_LOCKER' | 'DETOX' | 'PRO_SHOP_DISCOUNT';
export type Availability = 'active' | 'inactive' | 'sold_out' | 'coming_soon';
export type PackageDuration = { months: number; bonusMonths: number; baseAmount: number; packagePromotion: number; monthlyPrice: number; originalMonthlyPrice: number; totalPrice: number; discountLabel: string; subtitle: string; badge?: string };
export type GymPackage = {
  id: string; name: string; tier: string; description: string; hero: typeof diamondPackage.hero;
  durations: readonly PackageDuration[]; rating: number; reviewCount: string;
  privileges: readonly { id: string; code?: PrivilegeCode; icon: string; title: string; badge: string; description: string; accent: string; included?: number; resetPeriod?: 'month' | 'membership' }[];
  classes: readonly (typeof diamondPackage.classes)[number][]; reviews: readonly (typeof diamondPackage.reviews)[number][]; policies: readonly (typeof diamondPackage.policies)[number][];
  accessHours?: { from: string; to: string }; availability: Availability; requiresStudentVerification?: boolean; popular?: boolean;
};

function durations(monthly: number): PackageDuration[] {
  return [1, 3, 6, 12].map(months => {
    const discount = months === 12 ? 300000 : months === 6 ? 100000 : months === 3 ? 30000 : 0;
    const baseAmount = monthly * months;
    const totalPrice = baseAmount - discount;
    return { months, bonusMonths: 0, baseAmount, packagePromotion: discount, monthlyPrice: Math.round(totalPrice / months), originalMonthlyPrice: monthly, totalPrice, discountLabel: discount ? `Tiết kiệm ${discount.toLocaleString('vi-VN')}đ` : 'Giá chuẩn', subtitle: discount ? 'Ưu đãi' : 'Linh hoạt' };
  });
}
const privilege = (id: string, code: PrivilegeCode | undefined, title: string, description = title, badge = '') => ({ id, code, title, description, badge, icon: 'checkmark-circle-outline', accent: 'lime' });
const shared = { hero: require('../../assets/auth/login/gym-hero.jpg') as typeof diamondPackage.hero, rating: 0, reviewCount: 'Chưa có đánh giá', classes: [], reviews: [], policies: [] } as const;
export const packages: readonly GymPackage[] = [
  { ...shared, id: 'silver-pass', name: 'Silver Pass - Khởi Đầu', tier: 'SILVER PASS', description: 'Gói tập cơ bản cho người mới bắt đầu.', durations: durations(490000), availability: 'active', accessHours: { from: '08:00', to: '16:00' }, privileges: [privilege('hours', undefined, 'Tập 08:00 - 16:00'), privilege('gym', undefined, 'Phòng tập tạ máy & cardio'), privilege('locker', 'SMART_LOCKER', 'Tủ đồ cá nhân'), privilege('shower', undefined, 'Phòng tắm')] },
  { ...shared, id: 'gold-vip', name: 'Gold VIP - Phổ Biến Nhất', tier: 'GOLD VIP', description: 'Tập giờ mở rộng cùng các lớp nhóm và tiện ích phục hồi.', durations: durations(815000), availability: 'active', popular: true, accessHours: { from: '06:00', to: '22:00' }, privileges: [privilege('hours', undefined, 'Tập 06:00 - 22:00'), privilege('group', 'GROUP_X', 'Group-X'), privilege('yoga', 'YOGA', 'Yoga'), privilege('sauna', 'SAUNA', 'Sauna'), privilege('inbody', 'INBODY', 'InBody')] },
  { ...diamondPackage, durations: [{ months: 1, bonusMonths: 0, baseAmount: 1850000, packagePromotion: 0, monthlyPrice: 1850000, originalMonthlyPrice: 1850000, totalPrice: 1850000, discountLabel: 'Giá chuẩn', subtitle: 'Linh hoạt' }, ...diamondDurations], availability: 'active', privileges: [...diamondPackage.privileges.map(p => ({ ...p, code: ({ clubs: 'CHECKIN_24_7', pt: 'PT_SESSION', inbody: 'INBODY', companion: 'GUEST_PASS', sauna: 'SAUNA', daily: 'DETOX', shop: 'PRO_SHOP_DISCOUNT' } as Record<string, PrivilegeCode>)[p.id], included: p.id === 'pt' ? 3 : p.id === 'companion' ? 4 : undefined, resetPeriod: p.id === 'companion' ? 'month' as const : 'membership' as const })), privilege('group', 'GROUP_X', 'Group-X & Yoga'), privilege('yoga', 'YOGA', 'Yoga'), privilege('locker', 'SMART_LOCKER', 'Smart Locker')] },
  { ...shared, id: 'student-pass', name: 'Gói Student / HSSV', tier: 'STUDENT', description: 'Ưu đãi dành cho học sinh, sinh viên có thẻ còn hiệu lực.', durations: durations(350000), availability: 'active', requiresStudentVerification: true, accessHours: { from: '08:00', to: '17:00' }, privileges: [privilege('hours', undefined, 'Tập 08:00 - 17:00'), privilege('gym', undefined, 'Phòng tập tạ máy & cardio'), privilege('locker', 'SMART_LOCKER', 'Tủ đồ cá nhân')] },
];
export const getPackageById = (id: string) => packages.find(item => item.id === id) ?? null;
export const getPackagePrice = (id: string, months: number) => {
  const option = getPackageById(id)?.durations.find(row => row.months === months);
  return option ? { monthlyPrice: option.monthlyPrice, originalPrice: option.baseAmount, totalPrice: option.totalPrice, discountAmount: option.packagePromotion, discountPercent: Math.round(option.packagePromotion / option.baseAmount * 100), bonusMonths: option.bonusMonths } : null;
};
export function checkAccess(item: GymPackage | null, now = new Date()): 'OK' | 'OUTSIDE_ACCESS_HOURS' | 'PACKAGE_UNAVAILABLE' {
  if (!item || item.availability !== 'active') return 'PACKAGE_UNAVAILABLE';
  if (!item.accessHours || item.privileges.some(p => p.code === 'CHECKIN_24_7')) return 'OK';
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return time >= item.accessHours.from && time <= item.accessHours.to ? 'OK' : 'OUTSIDE_ACCESS_HOURS';
}
