import { baseUrl } from './account-api';

export async function changePassword(accountId: number, current: string, next: string): Promise<void> {
  const response = await fetch(`${baseUrl}/taikhoan/${accountId}/change-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ MatKhauHienTai: current, MatKhauMoi: next }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || 'Không đổi được mật khẩu');
}
