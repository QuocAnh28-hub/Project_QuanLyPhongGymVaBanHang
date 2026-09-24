const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const storageKey = 'qa-admin-session'
export type AdminSession = { token: string; expiresAt: number; account: { TaiKhoanID: number; Email: string; VaiTro: string } }
async function request(path: string, options: RequestInit = {}) {
  let response: Response
  try { response = await fetch(`${baseUrl}/auth/admin/${path}`, { ...options, signal: AbortSignal.timeout(15000) }) }
  catch { throw new Error('Không thể kết nối máy chủ. Vui lòng thử lại.') }
  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (response.status === 502 || response.status === 504) throw new Error('Không thể kết nối backend. Vui lòng khởi động BE và kiểm tra cổng API.')
  if (!response.ok) throw new Error(data?.message || 'Không thể xử lý yêu cầu đăng nhập.')
  if (!data) throw new Error('Phản hồi máy chủ không hợp lệ.')
  return data
}
export function clearSession() { localStorage.removeItem(storageKey); sessionStorage.removeItem(storageKey) }
export async function login(email: string, password: string, remember: boolean): Promise<AdminSession> {
  const data = await request('login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  if (data.account?.VaiTro?.trim().toUpperCase() !== 'ADMIN' || !data.token || data.expiresAt <= Date.now()) throw new Error('Tài khoản không có quyền quản trị.')
  clearSession()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(storageKey, JSON.stringify(data))
  return data
}
export async function restoreSession(): Promise<AdminSession | null> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey) || 'null')
    if (!saved?.token || saved.expiresAt <= Date.now()) { clearSession(); return null }
    const data = await request('session', { headers: { Authorization: `Bearer ${saved.token}` } })
    return { ...data, token: saved.token }
  } catch { clearSession(); return null }
}
export async function logout(token: string) {
  clearSession()
  await request('logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
}
