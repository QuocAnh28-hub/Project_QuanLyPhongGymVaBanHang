import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { readLocal } from './local-store';

export type ApiAccount = {
  TaiKhoanID: number;
  Email: string;
  VaiTro: string;
};
export const API_TOKEN = 'qa-gym-api-token-v1';

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];

export const baseUrl = (
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web'
    ? 'http://localhost:3000'
    : `http://${expoHost || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost')}:3000`)
).replace(/\/$/, '');

export async function authenticatedFetch(input: string, init: RequestInit = {}) {
  const token = await readLocal(API_TOKEN);
  return fetch(input, { ...init, headers: { ...init.headers, ...(token && { Authorization: `Bearer ${token}` }) } });
}

export function isActiveCustomer(account: ApiAccount): boolean {
  return account.VaiTro === 'CUSTOMER';
}

export async function loginAccount(email: string, password: string) {
  const response = await fetch(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const data = await response.json().catch(() => null);
  if (!response.ok) return null;
  return data as { token: string; expiresAt: number; account: ApiAccount };
}

export async function restoreAccount() {
  const response = await authenticatedFetch(`${baseUrl}/auth/me`);
  if (!response.ok) return null;
  return (await response.json() as { account: ApiAccount }).account;
}

export const logoutAccount = () => authenticatedFetch(`${baseUrl}/auth/logout`, { method: 'POST' });

export async function registerAccount(account: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<void> {
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
    if (!response.ok)
      throw new Error(result?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    if (!result?.data?.TaiKhoanID)
      throw new Error(
        'Phản hồi đăng ký không hợp lệ. Vui lòng thử đăng nhập để kiểm tra tài khoản.'
      );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name !== 'AbortError' &&
      error.name !== 'TypeError'
    )
      throw error;
    throw new Error(
      'Không nhận được phản hồi từ máy chủ. Kiểm tra kết nối; nếu đã gửi đăng ký, hãy thử đăng nhập trước khi gửi lại.'
    );
  } finally {
    clearTimeout(timeout);
  }
}
