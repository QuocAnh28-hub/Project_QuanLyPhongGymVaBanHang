import { catalogRequest, type Product } from './catalog'
import { adminFetch } from './auth'
import type { Member } from './members'

export type Order = {
  DonHangID: number
  HoiVienID: number
  NgayDat: string
  TongTien: number | string
  TrangThai: string
  DiaChiGiaoHang: string | null
  GhiChu: string | null
}
export type OrderItem = {
  ChiTietDonHangID: number
  DonHangID: number
  SanPhamID: number
  SoLuong: number
  DonGia: number | string
  ThanhTien: number | string
}
export type CheckoutInfo = {
  TenNguoiNhan: string
  SoDienThoai: string
  CachNhan: string
  PhiVanChuyen: number | string
  TrangThaiThanhToan: string
  PhuongThucThanhToan: string
  HoaDonID: number | null
}
export const orderStatuses = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'COMPLETED',
  'CANCELLED',
] as const
export const orderLabel = (status: string) =>
  ({
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy',
  })[status] || status
export const nextStatuses = (status: string) =>
  ({
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  })[status] || []
export async function loadOrders(signal: AbortSignal) {
  const [orders, members, products] = await Promise.all([
    catalogRequest<Order[]>('donhang', { signal }),
    catalogRequest<Member[]>('hoivien', { signal }),
    catalogRequest<Product[]>('sanpham', { signal }),
  ])
  if (![orders, members, products].every(Array.isArray))
    throw new Error('Danh sách trả về không hợp lệ.')
  return { orders, members, products }
}
export async function loadOrderDetail(id: number, signal: AbortSignal) {
  const [order, allItems] = await Promise.all([
    catalogRequest<Order>(`donhang/${id}`, { signal }),
    catalogRequest<OrderItem[]>('chitietdonhang', { signal }),
  ])
  if (!Array.isArray(allItems))
    throw new Error('Chi tiết sản phẩm trả về không hợp lệ.')
  let checkout: CheckoutInfo | null = null
  let checkoutState: 'linked' | 'unlinked' | 'unavailable' = 'unavailable'
  try {
    const member = await catalogRequest<Member>(`hoivien/${order.HoiVienID}`, {
      signal,
    })
    if (!member.TaiKhoanID) checkoutState = 'unlinked'
    else {
      const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(
        /\/$/,
        ''
      )
      const response = await adminFetch(
        `${base}/donhang/account/${member.TaiKhoanID}/orders/${id}`,
        { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) }
      )
      if (response.status === 404) checkoutState = 'unlinked'
      else if (response.ok) {
        checkout = await response.json()
        checkoutState = 'linked'
      }
    }
  } catch {
    /* Keep order details available if checkout cannot be loaded. */
  }
  return {
    order,
    items: allItems.filter((item) => Number(item.DonHangID) === Number(id)),
    checkout,
    checkoutState,
  }
}
export function deliveryPayload(form: FormData) {
  const address = String(form.get('address') || '').trim()
  const note = String(form.get('note') || '').trim()
  if (address.length > 255 || note.length > 500)
    throw new Error('Địa chỉ tối đa 255 ký tự, ghi chú tối đa 500 ký tự.')
  return { DiaChiGiaoHang: address || null, GhiChu: note || null }
}
export function validateTransition(
  order: Order,
  target: string,
  checkoutState: string,
  checkout: CheckoutInfo | null
) {
  if (!nextStatuses(order.TrangThai).includes(target))
    throw new Error(
      'Trạng thái đơn đã thay đổi hoặc thao tác không hợp lệ. Vui lòng làm mới.'
    )
  if (checkoutState === 'unavailable')
    throw new Error(
      'Chưa kiểm tra được thanh toán. Vui lòng thử lại trước khi cập nhật trạng thái.'
    )
  if (
    checkout &&
    target === 'CANCELLED' &&
    checkout.TrangThaiThanhToan === 'SUCCESS'
  )
    throw new Error(
      'Đơn đã thanh toán cần xử lý hoàn tiền riêng trước khi hủy.'
    )
  if (
    checkout &&
    target !== 'CANCELLED' &&
    checkout.TrangThaiThanhToan !== 'SUCCESS'
  )
    throw new Error(
      'Đơn checkout chưa thanh toán thành công. Cần xác nhận thu tiền qua luồng thanh toán trước khi xử lý.'
    )
}
