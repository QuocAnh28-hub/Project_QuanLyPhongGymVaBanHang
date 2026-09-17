import { readLocal, writeLocal } from '@/lib/local-store';
import { getActiveMembership } from '@/lib/membership';
import { checkAccess, getPackageById } from '@/lib/packages';

export type CheckInStatus = 'in_progress' | 'completed';
export type CheckInRecord = {
  id: string; userId: string; membershipId: string; clubId: string; clubName: string; area: string;
  checkInAt: string; checkOutAt?: string; status: CheckInStatus; gate?: string; activity?: string;
};
export type CheckInToken = { userId: string; membershipId: string; token: string; issuedAt: string; expiresAt: string; kind: 'member' | 'guest' };
export type MonthlyCheckInSummary = { totalSessions: number; totalDurationMinutes: number; streak: number; mostVisitedClub: string | null; attendanceByDay: number[] };

const RECORDS = 'qa-gym-check-ins';
export const CHECK_IN_TOKEN_SECONDS = 45;

async function allRecords() { return JSON.parse(await readLocal(RECORDS) ?? '[]') as CheckInRecord[]; }
export async function getCheckInHistory(userId: string) { return (await allRecords()).filter(row => row.userId === userId).sort((a, b) => b.checkInAt.localeCompare(a.checkInAt)); }
export async function getCurrentSession(userId: string) { return (await getCheckInHistory(userId)).find(row => row.status === 'in_progress' && !row.checkOutAt) ?? null; }
export async function createCheckIn(input: Omit<CheckInRecord, 'id' | 'status' | 'checkInAt'>) {
  const permission = await validateCheckIn(input.userId, input.membershipId);
  if (permission !== 'OK') throw new Error(permission);
  const rows = await allRecords();
  const row: CheckInRecord = { ...input, id: `QA-CI-${Date.now().toString(36).toUpperCase()}`, status: 'in_progress', checkInAt: new Date().toISOString() };
  await writeLocal(RECORDS, JSON.stringify([row, ...rows])); return row;
}
export async function validateCheckIn(userId: string, membershipId: string, now = new Date()) {
  const membership = await getActiveMembership(userId);
  if (!membership || membership.id !== membershipId || membership.expiryDate < `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`) return 'MEMBERSHIP_INACTIVE' as const;
  return checkAccess(getPackageById(membership.packageId), now);
}
export async function completeCheckIn(userId: string, id: string) {
  const rows = await allRecords(); const checkOutAt = new Date().toISOString();
  const row = rows.find(item => item.id === id && item.userId === userId); if (!row) return null;
  const updated: CheckInRecord = { ...row, checkOutAt, status: 'completed' };
  await writeLocal(RECORDS, JSON.stringify(rows.map(item => item.id === id && item.userId === userId ? updated : item))); return updated;
}
export function generateCheckInToken(userId: string, membershipId: string, kind: CheckInToken['kind'] = 'member', now = new Date()): CheckInToken {
  const expiresAt = new Date(now.getTime() + CHECK_IN_TOKEN_SECONDS * 1000);
  // ponytail: unsigned offline token; replace this function with a server-signed token before connecting a real turnstile.
  const random = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  return { userId, membershipId, kind, token: `${kind}.${random}`, issuedAt: now.toISOString(), expiresAt: expiresAt.toISOString() };
}
export function encodeCheckInToken(value: CheckInToken) { return JSON.stringify({ v: 1, ...value }); }
export function recordDurationMinutes(record: CheckInRecord, now = new Date()) { return Math.max(0, Math.floor(((record.checkOutAt ? new Date(record.checkOutAt) : now).getTime() - new Date(record.checkInAt).getTime()) / 60000)); }
export function getMonthlyCheckInSummary(records: CheckInRecord[], month: Date, now = new Date()): MonthlyCheckInSummary {
  const rows = records.filter(row => { const date = new Date(row.checkInAt); return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth(); });
  const clubs = new Map<string, number>(); const days = new Set<number>();
  rows.forEach(row => { clubs.set(row.clubName, (clubs.get(row.clubName) ?? 0) + 1); days.add(new Date(row.checkInAt).getDate()); });
  const orderedDays = [...days].sort((a, b) => a - b); let streak = 0; let current = 0; let previous = -2;
  orderedDays.forEach(day => { current = day === previous + 1 ? current + 1 : 1; streak = Math.max(streak, current); previous = day; });
  return { totalSessions: rows.length, totalDurationMinutes: rows.reduce((sum, row) => sum + recordDurationMinutes(row, now), 0), streak, mostVisitedClub: [...clubs].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null, attendanceByDay: orderedDays };
}
