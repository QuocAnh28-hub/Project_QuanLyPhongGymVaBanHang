import { authenticatedFetch, baseUrl } from '@/lib/account-api';
export type StudentVerification = {
  userId: string; schoolName: string; studentId: string; expiryDate: string;
  status: 'pending' | 'verified' | 'rejected';
};
type Row = { TenTruong: string; MaHSSV: string; expiryDate: string; TrangThai: 'PENDING' | 'VERIFIED' | 'REJECTED' };
async function request<T>(body?: object): Promise<T> {
  const res = await authenticatedFetch(`${baseUrl}/member-requests/student/me`, {
    method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data as T;
}
export async function getStudentVerification(userId: string): Promise<StudentVerification | null> {
  const row = await request<Row | null>();
  return row ? { userId, schoolName: row.TenTruong, studentId: row.MaHSSV, expiryDate: row.expiryDate,
    status: row.TrangThai.toLowerCase() as StudentVerification['status'] } : null;
}
export async function requestStudentVerification(input: Omit<StudentVerification, 'status'>) {
  await request({ TenTruong: input.schoolName, MaHSSV: input.studentId, NgayHetHan: input.expiryDate });
  return { ...input, status: 'pending' as const };
}
