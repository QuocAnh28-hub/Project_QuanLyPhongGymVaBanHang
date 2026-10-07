import { catalogRequest, type Product } from './catalog'
export type Warehouse = {
  KhoID: number
  TenKho: string
  DiaChi: string | null
  TrangThai: string
}
export type Receipt = {
  PhieuNhapID: number
  KhoID: number
  NhanVienID: number
  NgayNhap: string
  TongTien: number | string
  GhiChu: string | null
  TrangThai: string
}
export type ReceiptLine = {
  ChiTietPhieuNhapID: number
  PhieuNhapID: number
  SanPhamID: number
  SoLuong: number
  DonGia: number | string
  ThanhTien: number | string
}
export type Stock = { KhoID: number; SanPhamID: number; SoLuongTon: number }
export type Employee = { NhanVienID: number; HoTen: string; TrangThai: string }
export const receiptLabel = (s: string) =>
  ({ PENDING: 'Chờ nhập kho', COMPLETED: 'Đã nhập kho', CANCELLED: 'Đã hủy' })[
    s
  ] || s
export async function loadWarehouse(signal: AbortSignal) {
  const [warehouses, receipts, lines, products, employees, stock] = await Promise.all([
    catalogRequest<Warehouse[]>('kho', { signal }),
    catalogRequest<Receipt[]>('phieunhap', { signal }),
    catalogRequest<ReceiptLine[]>('chitietphieunhap', { signal }),
    catalogRequest<Product[]>('sanpham', { signal }),
    catalogRequest<Employee[]>('nhanvien', { signal }),
    catalogRequest<Stock[]>('phieunhap/stock', { signal }),
  ])
  if (![warehouses, receipts, lines, products, employees, stock].every(Array.isArray))
    throw new Error('Dữ liệu kho không hợp lệ.')
  return { warehouses, receipts, lines, products, employees, stock }
}
export type WarehouseData = Awaited<ReturnType<typeof loadWarehouse>>
export type ReceiptDraftLine = {
  product: string
  quantity: string
  price: string
}

export async function createReceipt(form: FormData, lines: ReceiptDraftLine[]) {
  if (
    !lines.length ||
    new Set(lines.map((l) => l.product)).size !== lines.length
  )
    throw new Error('Cần ít nhất một sản phẩm và không được chọn trùng.')
  const items = lines.map((l) => {
    if (
      !l.product ||
      !l.quantity.trim() ||
      !l.price.trim() ||
      !Number.isInteger(Number(l.quantity)) ||
      Number(l.quantity) <= 0 ||
      !Number.isFinite(Number(l.price)) ||
      Number(l.price) < 0
    )
      throw new Error('Vui lòng kiểm tra sản phẩm, số lượng và đơn giá.')
    return {
      SanPhamID: Number(l.product),
      SoLuong: Number(l.quantity),
      DonGia: Number(l.price),
    }
  })
  await catalogRequest('phieunhap/with-items', {
    method: 'POST',
    body: JSON.stringify({
      KhoID: Number(form.get('warehouse')),
      NhanVienID: Number(form.get('employee')),
      GhiChu: String(form.get('note') || '').trim(),
      items,
    }),
  })
}

export function setReceiptStatus(id: number, status: string) {
  return catalogRequest(`phieunhap/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ TrangThai: status }),
  })
}
