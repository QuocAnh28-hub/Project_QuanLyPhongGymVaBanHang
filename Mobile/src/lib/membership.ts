import { readLocal, writeLocal } from '@/lib/local-store';
import { addCalendarMonths, localDate, parseLocalDate, type Pricing } from '@/lib/package-logic';
import { getPackageById } from '@/lib/packages';
import { getStudentVerification } from '@/lib/student-verification';
export type PaymentMethod = 'vietqr' | 'card' | 'wallet' | 'pos';
export type GiftSnapshot = { id: string; name: string; detail: string; quantity: number };
export type MembershipEnrollment = {
  id: string; userId: string; packageId: string; packageName: string; durationMonths: number; bonusMonths: number; accessDurationMonths: number;
  memberName: string; phone: string; email: string; activationDate: string; expiryDate: string; homeClubId: string;
  baseAmount: number; originalAmount: number; membershipDiscount: number; discountAmount: number; voucherCode: string | null; voucherDiscount: number; fees: number; finalAmount: number;
  paymentMethod: PaymentMethod; status: 'pending_payment' | 'active' | 'expired' | 'cancelled'; paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled'; membershipStatus: 'pending_activation' | 'active' | 'expired' | 'frozen' | 'cancelled'; renewalOf?: string; createdAt: string; termsAcceptedAt: string; gifts: GiftSnapshot[];
  monthlyPrice: number; totalPrice: number; startDate: string;
};
export type EnrollmentInput = Omit<MembershipEnrollment, 'id' | 'status' | 'paymentStatus' | 'membershipStatus' | 'originalAmount' | 'discountAmount' | 'createdAt' | 'expiryDate' | 'accessDurationMonths' | 'monthlyPrice' | 'totalPrice' | 'startDate'> & Pricing;
const ENROLLMENTS = 'qa-gym-memberships'; const FAVORITES = 'qa-gym-package-favorites';
export async function getFavorite(userId: string, packageId: string) { const ids: string[] = JSON.parse(await readLocal(FAVORITES) ?? '[]'); return ids.includes(`${userId}:${packageId}`); }
export async function setFavorite(userId: string, packageId: string, favorite: boolean) { const ids: string[] = JSON.parse(await readLocal(FAVORITES) ?? '[]'); const key = `${userId}:${packageId}`; await writeLocal(FAVORITES, JSON.stringify(favorite ? [...new Set([...ids, key])] : ids.filter(id => id !== key))); }
export async function getEnrollments(userId: string) { const rows: MembershipEnrollment[] = JSON.parse(await readLocal(ENROLLMENTS) ?? '[]'); return rows.filter(row => row.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export async function getActiveMembership(userId: string) { return (await getEnrollments(userId)).find(row => (row.membershipStatus ?? row.status) === 'active' && row.paymentStatus === 'paid' && row.expiryDate >= localDate(new Date()) && row.activationDate <= localDate(new Date())) ?? null; }
export async function getEnrollment(userId: string, id: string) { return (await getEnrollments(userId)).find(row => row.id === id) ?? null; }
export async function createEnrollment(input: EnrollmentInput) {
  const item = getPackageById(input.packageId);
  if (!item || item.availability !== 'active' || !item.durations.some(option => option.months === input.durationMonths)) throw new Error('Gói tập hoặc thời hạn không khả dụng.');
  if (item.requiresStudentVerification) {
    const proof = await getStudentVerification(input.userId);
    if (proof?.status !== 'verified' || proof.expiryDate < localDate(new Date())) throw new Error('Thẻ HSSV chưa được xác minh hoặc đã hết hạn.');
  }
  const rows: MembershipEnrollment[] = JSON.parse(await readLocal(ENROLLMENTS) ?? '[]');
  const activation = parseLocalDate(input.activationDate); if (!activation) throw new Error('Invalid activation date');
  const now = new Date(); const accessDurationMonths = input.durationMonths + input.bonusMonths;
  const existing = rows.find(row => row.userId === input.userId && row.packageId === input.packageId && row.durationMonths === input.durationMonths && row.status === 'pending_payment');
  if (existing) {
    const updated: MembershipEnrollment = { ...existing, ...input, originalAmount: input.baseAmount, discountAmount: input.membershipDiscount, paymentStatus: 'pending', membershipStatus: 'pending_activation', accessDurationMonths, expiryDate: localDate(addCalendarMonths(activation, accessDurationMonths)), monthlyPrice: Math.round(input.finalAmount / input.durationMonths), totalPrice: input.finalAmount, startDate: input.activationDate };
    await writeLocal(ENROLLMENTS, JSON.stringify(rows.map(row => row.id === existing.id ? updated : row))); return updated;
  }
  const row: MembershipEnrollment = { ...input, id: `QA-MEM-${localDate(now).replace(/-/g, '')}-${Date.now().toString(36).toUpperCase()}-${(rows.length + 1).toString(36).toUpperCase()}`, originalAmount: input.baseAmount, discountAmount: input.membershipDiscount, accessDurationMonths, expiryDate: localDate(addCalendarMonths(activation, accessDurationMonths)), status: 'pending_payment', paymentStatus: 'pending', membershipStatus: 'pending_activation', createdAt: now.toISOString(), monthlyPrice: Math.round(input.finalAmount / input.durationMonths), totalPrice: input.finalAmount, startDate: input.activationDate };
  await writeLocal(ENROLLMENTS, JSON.stringify([row, ...rows])); return row;
}
