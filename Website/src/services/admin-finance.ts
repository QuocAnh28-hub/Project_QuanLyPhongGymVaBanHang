const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await adminFetch(`${base}/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Yêu cầu thất bại')
  return body
}
export type Payment = {
  ThanhToanID: number
  HoiVienID: number
  HoiVien: string
  NoiDung: string | null
  SoTien: number | string
  PhuongThucThanhToan: string
  NgayThanhToan: string
  TrangThai: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  HoaDonID: number | null
  Loai: 'PACKAGE' | 'SHOP' | 'UNKNOWN'
  DangKyID: number | null
  DonHangID: number | null
}
export type Promotion = {
  KhuyenMaiID: number
  MaKhuyenMai: string
  TenKhuyenMai: string
  PhanTramGiam: number | string
  SoTienGiam: number | string
  NgayBatDau: string
  NgayKetThuc: string
  DieuKien: string | null
  TrangThai: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  LuotSuDung: number
  TongSoTienGiam: number | string
}
export type PromotionStats = {
  SoChuongTrinh: number
  DangActive: number
  LuotSuDung: number
  TongSoTienGiam: number | string
}
export type PromotionHistory = {
  ApDungKhuyenMaiID: number
  MaKhuyenMai: string
  TenKhuyenMai: string
  Loai: string
  ThamChieuID: number
  SoTienGiam: number | string
  NgayApDung: string
}
export type Report = {
  range: { from: string; to: string }
  revenue: {
    total: number | string
    package: number | string
    shop: number | string
    pt: null
  }
  revenueByDay: { date: string; amount: number | string }[]
  revenueByMethod: { method: string; amount: number | string }[]
  members: Record<string, number>
  checkins: Record<string, number>
  checkinsByDay: { date: string; count: number }[]
  peakHours: { hour: number; count: number }[]
  shop: Record<string, number | string>
  topProducts: { SanPhamID: number; TenSanPham: string; quantity: number }[]
  pt: Record<string, number>
  topTrainers: { PTID: number; HoTen: string; rentals: number }[]
}
export const getPayments = () => request<Payment[]>('thanhtoan')
export const confirmShopPayment = (orderId: number) =>
  request(`donhang/${orderId}/confirm-payment`, { method:'POST' })
export const getPromotions = () => request<Promotion[]>('khuyenmai')
export const getPromotionStats = () =>
  request<PromotionStats>('khuyenmai/admin/stats')
export const getPromotionHistory = () =>
  request<PromotionHistory[]>('khuyenmai/admin/history')
export const savePromotion = (promotion: Partial<Promotion>) =>
  request<Promotion>(
    `khuyenmai${promotion.KhuyenMaiID ? `/${promotion.KhuyenMaiID}` : ''}`,
    {
      method: promotion.KhuyenMaiID ? 'PUT' : 'POST',
      body: JSON.stringify(promotion),
    }
  )
export const deactivatePromotion = (id: number) =>
  request(`khuyenmai/${id}`, { method: 'DELETE' })
export const getReport = (from: string, to: string) =>
  request<Report>(`reports/admin?from=${from}&to=${to}`)
import { adminFetch } from './auth'
