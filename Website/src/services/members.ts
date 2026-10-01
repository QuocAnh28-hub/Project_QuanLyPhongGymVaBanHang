import { useEffect, useState } from 'react'
import { adminFetch } from './auth'

export type Member = {
  HoiVienID: number
  TaiKhoanID: number | null
  HoTen: string
  SoDienThoai: string | null
  Email: string | null
  NgaySinh: string | null
  GioiTinh: string | null
  DiaChi: string | null
  NgayDangKy: string | null
  TrangThai: string
  ChieuCao?: number | null
  CanNang?: number | null
  MucTieuTheHinh?: string | null
}
export type Registration = {
  DangKyID: number
  HoiVienID: number
  GoiTapID: number
  NgayDangKy: string
  NgayBatDau: string
  NgayKetThuc: string
  GiaThanhToan: number
  TrangThai: string
}
type Checkin = {
  CheckInID: number
  HoiVienID: number
  ThoiGianCheckIn: string
  ThoiGianCheckOut: string | null
  TrangThai: string
}
type Order = {
  DonHangID: number
  HoiVienID: number
  NgayDat: string
  TongTien: number
  TrangThai: string
}
type Booking = {
  ThuePTID: number
  HoiVienID: number
  PTID: number
  NgayDat: string
  TrangThai: string
}
export const statusLabel = (value: string) =>
  ({
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Ngừng hoạt động',
    BLOCKED: 'Đã khóa',
    PENDING: 'Chờ xử lý',
    CANCELLED: 'Đã hủy',
    EXPIRED: 'Hết hạn',
    SUCCESS: 'Thành công',
    COMPLETED: 'Hoàn thành',
    CHECKED_IN: 'Đang tập',
    CHECKED_OUT: 'Đã ra về',
  })[value] ||
  value ||
  'Chưa cập nhật'
export function formatDate(value: string | null | undefined, time = false) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : time
      ? date.toLocaleString('vi-VN')
      : date.toLocaleDateString('vi-VN')
}
export const money = (value: number) =>
  Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
export const memberCode = (id: number) => `HV${String(id).padStart(5, '0')}`
export async function getApi<T>(path: string, signal: AbortSignal): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  const response = await adminFetch(`${base}/${path}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
  })
  if (!response.ok)
    throw new Error(
      `Không thể tải dữ liệu (${response.status}). Vui lòng thử lại.`
    )
  return response.json()
}
export function useMemberData<T>(loader: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    // Reset the request state when its member ID or refresh version changes.
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true)
    setError('')
    setData(null)
    loader(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setData(value)
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : 'Không thể kết nối máy chủ.'
          )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [loader, version])
  return {
    data,
    error,
    loading,
    reload: () => setVersion((value) => value + 1),
  }
}
export const loadMembers = (signal: AbortSignal) =>
  getApi<Member[]>('hoivien', signal)
export async function loadRelated(id: number, signal: AbortSignal) {
  const results = await Promise.allSettled([
    getApi<Registration[]>('dangkygoitap', signal),
    getApi<Checkin[]>('checkin', signal),
    getApi<Order[]>('donhang', signal),
    getApi<Booking[]>('thuept', signal),
    getApi<{ GoiTapID: number; TenGoi: string }[]>('goitap', signal),
  ])
  const own = <T extends { HoiVienID: number }>(
    result: PromiseSettledResult<T[]>
  ) =>
    result.status === 'fulfilled'
      ? result.value.filter((row) => Number(row.HoiVienID) === Number(id))
      : []
  return {
    registrations: own(results[0]),
    checkins: own(results[1]),
    orders: own(results[2]),
    bookings: own(results[3]),
    packages: results[4].status === 'fulfilled' ? results[4].value : [],
    warnings: results.flatMap((result, i) =>
      result.status === 'rejected'
        ? [
            [
              'đăng ký gói',
              'check-in',
              'đơn hàng',
              'đặt lịch PT',
              'tên gói tập',
            ][i],
          ]
        : []
    ),
  }
}
export function exportCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value)
          return `"${(/^[=+@\-\t\r]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`
        })
        .join(',')
    )
    .join('\r\n')
  const url = URL.createObjectURL(
    new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })
  )
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
