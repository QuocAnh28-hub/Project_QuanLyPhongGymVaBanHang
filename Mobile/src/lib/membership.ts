import { readLocal, writeLocal } from '@/lib/local-store';
import { addCalendarMonths, localDate, type DurationOption } from '@/lib/package-logic';

export type MembershipEnrollment = {
  id: string; userId: string; packageId: string; packageName: string;
  durationMonths: number; bonusMonths: number; monthlyPrice: number; totalPrice: number;
  startDate: string; expiryDate: string; status: 'pending_payment' | 'active' | 'expired' | 'cancelled'; createdAt: string;
};
const ENROLLMENTS = 'qa-gym-memberships';
const FAVORITES = 'qa-gym-package-favorites';

export async function getFavorite(packageId: string) {
  const ids: string[] = JSON.parse(await readLocal(FAVORITES) ?? '[]');
  return ids.includes(packageId);
}
export async function setFavorite(packageId: string, favorite: boolean) {
  const ids: string[] = JSON.parse(await readLocal(FAVORITES) ?? '[]');
  await writeLocal(FAVORITES, JSON.stringify(favorite ? [...new Set([...ids, packageId])] : ids.filter(id => id !== packageId)));
}
export async function getEnrollments(userId: string) {
  const rows: MembershipEnrollment[] = JSON.parse(await readLocal(ENROLLMENTS) ?? '[]');
  return rows.filter(row => row.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function createEnrollment(userId: string, packageId: string, packageName: string, option: DurationOption) {
  const rows: MembershipEnrollment[] = JSON.parse(await readLocal(ENROLLMENTS) ?? '[]');
  const existing = rows.find(row => row.userId === userId && row.packageId === packageId && row.durationMonths === option.months && row.status === 'pending_payment');
  if (existing) return existing;
  const now = new Date();
  const date = localDate(now);
  const row: MembershipEnrollment = {
    id: `QA-MEM-${date.replace(/-/g, '')}-${Date.now().toString(36).toUpperCase()}-${(rows.length + 1).toString(36).toUpperCase()}`,
    userId, packageId, packageName, durationMonths: option.months, bonusMonths: option.bonusMonths,
    monthlyPrice: option.monthlyPrice, totalPrice: option.totalPrice,
    startDate: date, expiryDate: localDate(addCalendarMonths(now, option.months + option.bonusMonths)),
    status: 'pending_payment', createdAt: now.toISOString(),
  };
  await writeLocal(ENROLLMENTS, JSON.stringify([row, ...rows]));
  return row;
}
