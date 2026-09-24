import { baseUrl } from './account-api';

async function post<T>(path: string, body: object): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(`${baseUrl}/auth/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.');
    if (!data) throw new Error('Phản hồi máy chủ không hợp lệ.');
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError' && error.name !== 'TypeError') throw error;
    throw new Error('Không nhận được phản hồi. Kiểm tra kết nối và thử lại; nếu vừa yêu cầu mã, hãy kiểm tra email trước.');
  } finally { clearTimeout(timeout); }
}
export const requestRecoveryCode = (email: string) => post<{ retryAfter: number }>('forgot-password', { email });
export const verifyRecoveryCode = (email: string, code: string) => post<{ resetToken: string }>('verify-otp', { email, code });
export const changeRecoveredPassword = (email: string, resetToken: string, password: string) => post('reset-password', { email, resetToken, password });
