import { catalogRequest } from './catalog'
export type Employee = {
  NhanVienID: number; TaiKhoanID: number; HoTen: string; NgaySinh: string | null; GioiTinh: string | null
  SoDienThoai: string | null; Email: string | null; ChucVu: string | null; NgayVaoLam: string | null
  TrangThai: string; EmailDangNhap: string; VaiTro: string; TrangThaiTaiKhoan: string
}
export function employeeSession() {
  try { return JSON.parse(localStorage.getItem('qa-admin-session') || sessionStorage.getItem('qa-admin-session') || 'null') as { token: string; account: { TaiKhoanID: number } } | null }
  catch { return null }
}
export async function employeeRequest<T>(path = '', options: RequestInit = {}): Promise<T> {
  const session = employeeSession()
  if (!session?.token) throw new Error('Vui lòng đăng nhập lại bằng tài khoản Admin.')
  return catalogRequest<T>(`auth/admin/employees${path}`, { ...options, headers: { Authorization: `Bearer ${session.token}` } })
}
export const loadEmployees = async (signal: AbortSignal) => {
  const data = await employeeRequest<Employee[]>('', { signal })
  if (!Array.isArray(data)) throw new Error('Dữ liệu nhân viên không hợp lệ.')
  return data
}
export const employeeStatus = (status: string) => ({ ACTIVE: 'Hoạt động', INACTIVE: 'Ngừng hoạt động', BLOCKED: 'Bị khóa', LOCKED: 'Đã khóa' }[status] || status)
