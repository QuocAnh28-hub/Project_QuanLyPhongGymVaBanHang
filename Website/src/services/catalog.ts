export type Category = {
  DanhMucID: number
  TenDanhMuc: string
  MoTa: string | null
  TrangThai: string
}
export type Product = {
  SanPhamID: number
  DanhMucID: number
  TenSanPham: string
  MoTa: string | null
  GiaBan: number | string
  DonViTinh: string
  HinhAnh: string | null
  TrangThai: string
}
export type Catalog = { products: Product[]; categories: Category[] }
export const catalogStatus = (status: string) =>
  ({
    ACTIVE: 'Đang hoạt động',
    INACTIVE: 'Ngừng hoạt động',
    OUT_OF_STOCK: 'Hết hàng',
  })[status] || status
export const searchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()

export async function catalogRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  let response: Response
  try {
    response = await adminFetch(`${base}/${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: options.signal
        ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error(
      options.method
        ? 'Mất kết nối máy chủ. Hãy làm mới danh sách để kiểm tra kết quả trước khi thử lại.'
        : 'Không thể kết nối máy chủ. Vui lòng thử lại.'
    )
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    if (data?.error?.code === 'ER_ROW_IS_REFERENCED_2')
      throw new Error(
        'Không thể xóa vì dữ liệu đang được sử dụng. Bạn có thể chuyển sang trạng thái ngừng hoạt động.'
      )
    throw new Error(
      data?.message ||
        `Yêu cầu thất bại (${response.status}). Vui lòng thử lại.`
    )
  }
  if (data === null) throw new Error('Phản hồi máy chủ không hợp lệ.')
  return data as T
}
export async function loadCatalog(signal: AbortSignal): Promise<Catalog> {
  const [products, categories] = await Promise.all([
    catalogRequest<Product[]>('sanpham', { signal }),
    catalogRequest<Category[]>('danhmuc', { signal }),
  ])
  if (!Array.isArray(products) || !Array.isArray(categories))
    throw new Error('Danh sách trả về không hợp lệ.')
  return { products, categories }
}
export function catalogPayload(form: FormData, products: boolean) {
  const text = (key: string) => String(form.get(key) || '').trim()
  const name = text('name')
  if (!name || name.length > (products ? 150 : 100))
    throw new Error('Tên không hợp lệ hoặc vượt quá độ dài cho phép.')
  const status = text('status')
  if (
    !(
      products ? ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'] : ['ACTIVE', 'INACTIVE']
    ).includes(status)
  )
    throw new Error('Trạng thái không hợp lệ.')
  const common = { MoTa: text('description') || null, TrangThai: status }
  if (!products) return { ...common, TenDanhMuc: name }
  const price = Number(text('price'))
  const category = Number(text('category'))
  if (
    !text('price') ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 9999999999999.99 ||
    Math.abs(price * 100 - Math.round(price * 100)) > 0.01
  )
    throw new Error('Giá bán phải không âm và có tối đa 2 chữ số thập phân.')
  if (!Number.isInteger(category) || category <= 0)
    throw new Error('Vui lòng chọn danh mục.')
  if (!text('unit') || text('unit').length > 30)
    throw new Error('Đơn vị tính phải từ 1 đến 30 ký tự.')
  const image = text('image')
  if (image.length > 255 || (image && !/^https?:\/\//i.test(image)))
    throw new Error('Ảnh phải là URL HTTP/HTTPS, tối đa 255 ký tự.')
  return {
    ...common,
    TenSanPham: name,
    DanhMucID: category,
    GiaBan: price,
    DonViTinh: text('unit'),
    HinhAnh: image || null,
  }
}

export function saveCatalogItem(
  products: boolean,
  form: FormData,
  id?: number
) {
  const endpoint = products ? 'sanpham' : 'danhmuc'
  return catalogRequest(id === undefined ? endpoint : `${endpoint}/${id}`, {
    method: id === undefined ? 'POST' : 'PUT',
    body: JSON.stringify(catalogPayload(form, products)),
  })
}

export function deleteCatalogItem(products: boolean, id: number) {
  return catalogRequest(`${products ? 'sanpham' : 'danhmuc'}/${id}`, {
    method: 'DELETE',
  })
}
import { adminFetch } from './auth'
