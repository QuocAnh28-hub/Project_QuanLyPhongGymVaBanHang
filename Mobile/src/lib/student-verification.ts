import { readLocal, writeLocal } from '@/lib/local-store';

export type StudentVerification = { userId: string; schoolName: string; studentId: string; expiryDate: string; imageFront?: string; status: 'pending' | 'verified' | 'rejected' };
const KEY = 'qa-gym-student-verifications';
export async function getStudentVerification(userId: string): Promise<StudentVerification | null> {
  const rows: StudentVerification[] = JSON.parse(await readLocal(KEY) ?? '[]');
  return rows.find(row => row.userId === userId) ?? null;
}
export async function requestStudentVerification(input: Omit<StudentVerification, 'status'>) {
  if (!input.schoolName.trim() || !input.studentId.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.expiryDate) || input.expiryDate < new Date().toISOString().slice(0, 10)) throw new Error('Thông tin thẻ HSSV không hợp lệ hoặc đã hết hạn.');
  const rows: StudentVerification[] = JSON.parse(await readLocal(KEY) ?? '[]');
  const request = { ...input, status: 'pending' as const };
  await writeLocal(KEY, JSON.stringify([request, ...rows.filter(row => row.userId !== input.userId)]));
  return request;
}
