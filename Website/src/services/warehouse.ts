import { catalogRequest, type Product } from './catalog'
export type Warehouse = { KhoID: number; TenKho: string; DiaChi: string | null; TrangThai: string }
export type Receipt = { PhieuNhapID: number; KhoID: number; NhanVienID: number; NgayNhap: string; TongTien: number | string; GhiChu: string | null; TrangThai: string }
export type ReceiptLine = { ChiTietPhieuNhapID: number; PhieuNhapID: number; SanPhamID: number; SoLuong: number; DonGia: number | string; ThanhTien: number | string }
export type Employee = { NhanVienID: number; HoTen: string; TrangThai: string }
export const receiptLabel = (s: string) => ({ PENDING: 'Chờ nhập kho', COMPLETED: 'Đã nhập kho', CANCELLED: 'Đã hủy' }[s] || s)
export async function loadWarehouse(signal: AbortSignal) {
  const [warehouses, receipts, lines, products, employees] = await Promise.all([
    catalogRequest<Warehouse[]>('kho', { signal }), catalogRequest<Receipt[]>('phieunhap', { signal }),
    catalogRequest<ReceiptLine[]>('chitietphieunhap', { signal }), catalogRequest<Product[]>('sanpham', { signal }), catalogRequest<Employee[]>('nhanvien', { signal }),
  ])
  if (![warehouses, receipts, lines, products, employees].every(Array.isArray)) throw new Error('Dữ liệu kho không hợp lệ.')
  return { warehouses, receipts, lines, products, employees }
}
export type WarehouseData = Awaited<ReturnType<typeof loadWarehouse>>
export function summarizeInbound(data: WarehouseData) {
  const rows = new Map<string, { KhoID: number; SanPhamID: number; quantity: number; value: number }>()
  const completed = new Map(data.receipts.filter(r => r.TrangThai === 'COMPLETED').map(r => [Number(r.PhieuNhapID), r]))
  for (const line of data.lines) {
    const receipt = completed.get(Number(line.PhieuNhapID))
    if (!receipt) continue
    const key = `${receipt.KhoID}:${line.SanPhamID}`
    const row = rows.get(key) || { KhoID: receipt.KhoID, SanPhamID: line.SanPhamID, quantity: 0, value: 0 }
    row.quantity += Number(line.SoLuong)
    row.value += Number(line.ThanhTien)
    rows.set(key, row)
  }
  return [...rows.values()]
}
