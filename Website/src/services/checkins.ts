export type CheckInRow = {
  CheckInID: number
  HoiVienID: number
  HoTen: string
  SoDienThoai?: string
  ThoiGianCheckIn: string
  ThoiGianCheckOut?: string
  TrangThai: 'CHECKED_IN' | 'CHECKED_OUT'
}
export type QrRecord = {
  MaQRID: number
  MaCode: string
  NgayTao: string
  NgayHetHan?: string
  TrangThai: string
  CheckInID?: number
  HoiVienID?: number
  HoTen?: string
}
export type IssuedQr = {
  token: string
  shortCode: string
  MaQRID: number
  issuedAt: string
  expiresAt: string
  expiresIn: number
  DangKyID: number
  HoiVienID: number
}
export type MemberOption = {
  HoiVienID: number
  TaiKhoanID: number
  HoTen: string
  SoDienThoai?: string
  TrangThaiHoiVien: string
  TrangThaiTaiKhoan: string
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  const response = await adminFetch(`${base}${url.replace(/^\/api/, '')}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Yêu cầu thất bại')
  return body
}

export const getTodayCheckIns = () =>
  request<{
    metrics: { total: number; present: number; checkedOut: number }
    rows: CheckInRow[]
  }>('/api/checkin/admin/today')
export const getCheckInHistory = (params: URLSearchParams) =>
  request<{
    rows: CheckInRow[]
    total: number
    page: number
    pageSize: number
  }>(`/api/checkin/admin/history?${params}`)
export const getQrRecords = () => request<QrRecord[]>('/api/maqr/admin')
export const issueQr = (TaiKhoanID: number) =>
  request<IssuedQr>('/api/checkin/token', {
    method: 'POST',
    body: JSON.stringify({ TaiKhoanID }),
  })
export const searchMembers = (q: string) =>
  request<MemberOption[]>(
    `/api/checkin/admin/members?q=${encodeURIComponent(q)}`
  )
export const revokeQr = (id: number) =>
  request(`/api/maqr/${id}/revoke`, { method: 'PATCH' })
export const checkout = (CheckInID: number) =>
  request(`/api/checkin/${CheckInID}/checkout`, { method: 'POST' })

export type CheckInPreview = {
  token: string
  expiresAt: string
  HoiVienID: number
  DangKyID: number
  HoTen: string
  SoDienThoai: string | null
  AnhDaiDien: string | null
  TenGoi: string
  NgayBatDau: string
  NgayKetThuc: string
  SoNgayConLai: number
  TrangThaiTaiKhoan: string
  TrangThaiHoiVien: string
  TrangThaiDangKy: string
  TrangThaiThanhToan: string
  TrangThaiCheckIn: string
  eligible: boolean
  reasons: { code: string; message: string }[]
}
export const previewCheckIn = (code: string) =>
  request<CheckInPreview>('/api/checkin/admin/preview', { method: 'POST', body: JSON.stringify({ code }) })
export const confirmCheckIn = (code: string) =>
  request<{ message: string; data: CheckInRow }>('/api/checkin/admin/confirm', { method: 'POST', body: JSON.stringify({ code }) })
import { adminFetch } from './auth'
