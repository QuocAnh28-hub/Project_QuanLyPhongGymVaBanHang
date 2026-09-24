import { Platform } from 'react-native';

export type ApiAccount = { TaiKhoanID: number; Email: string; MatKhau: string; VaiTro: string; TrangThai: string };

// Set EXPO_PUBLIC_API_URL to the computer's LAN address when using a physical phone.
export const baseUrl = (process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')).replace(/\/$/, '');

export async function getAccounts(): Promise<ApiAccount[]> {
  try {
    const response = await fetch(`${baseUrl}/taikhoan`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error('Dữ liệu trả về không phải danh sách tài khoản');
    return data as ApiAccount[];
  } catch (error) {
    throw new Error(`Không đọc được ${baseUrl}/taikhoan: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getAccount(id: number): Promise<ApiAccount | null> {
  const response = await fetch(`${baseUrl}/taikhoan/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('API_UNAVAILABLE');
  return response.json() as Promise<ApiAccount>;
}

export function isActiveCustomer(account: ApiAccount): boolean {
  return account.VaiTro === 'CUSTOMER' && account.TrangThai === 'ACTIVE';
}

export async function registerAccount(account: { name: string; email: string; phone: string; password: string }): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${baseUrl}/taikhoan/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    if (!result?.data?.TaiKhoanID) throw new Error('Phản hồi đăng ký không hợp lệ. Vui lòng thử đăng nhập để kiểm tra tài khoản.');
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError' && error.name !== 'TypeError') throw error;
    throw new Error('Không nhận được phản hồi từ máy chủ. Kiểm tra kết nối; nếu đã gửi đăng ký, hãy thử đăng nhập trước khi gửi lại.');
  } finally {
    clearTimeout(timeout);
  }
}
