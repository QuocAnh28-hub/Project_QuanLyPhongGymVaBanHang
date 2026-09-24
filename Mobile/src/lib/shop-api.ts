import { baseUrl } from './account-api';

export { request as shopRequest };

export type ShopProduct = {
  SanPhamID: number; DanhMucID: number; TenSanPham: string; MoTa: string | null;
  GiaBan: number; DonViTinh: string; HinhAnh: string | null; TrangThai: string;
};
export type ShopCategory = { DanhMucID: number; TenDanhMuc: string; TrangThai: string };
export type CartItem = ShopProduct & { SoLuong: number; TenDanhMuc: string; DanhMucTrangThai: string };
export const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
export const searchKey = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${baseUrl}${path}`, { ...init, signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Không tải được dữ liệu cửa hàng.');
    return data as T;
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error instanceof TypeError)) {
      throw new Error('Không kết nối được cửa hàng. Vui lòng kiểm tra mạng và thử lại.');
    }
    throw error;
  } finally { clearTimeout(timeout); }
}

function product<T extends ShopProduct>(row: T): T {
  const price = Number(row.GiaBan);
  if (!Number.isFinite(price) || price < 0) throw new Error('Giá sản phẩm không hợp lệ.');
  const image = row.HinhAnh?.trim();
  return { ...row, SanPhamID: Number(row.SanPhamID), DanhMucID: Number(row.DanhMucID), GiaBan: price,
    HinhAnh: image ? (/^https?:\/\//i.test(image) ? image : `${baseUrl}/${image.replace(/^\/+/, '')}`) : null };
}
export async function getCatalog() {
  const [rows, categories] = await Promise.all([request<ShopProduct[]>('/sanpham'), request<ShopCategory[]>('/danhmuc')]);
  if (!Array.isArray(rows) || !Array.isArray(categories)) throw new Error('Dữ liệu cửa hàng không hợp lệ.');
  const active = categories.filter(c => c.TrangThai === 'ACTIVE').map(c => ({ ...c, DanhMucID: Number(c.DanhMucID) }));
  return { categories: active, products: rows.map(product).filter(p => p.TrangThai !== 'INACTIVE' && active.some(c => c.DanhMucID === p.DanhMucID)) };
}
export async function getShopProduct(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Mã sản phẩm không hợp lệ.');
  const row = product(await request<ShopProduct>(`/sanpham/${id}`));
  const category = await request<ShopCategory>(`/danhmuc/${row.DanhMucID}`);
  if (row.TrangThai === 'INACTIVE' || category.TrangThai !== 'ACTIVE') throw new Error('Sản phẩm đã ngừng bán.');
  return { ...row, TenDanhMuc: category.TenDanhMuc };
}
export async function getCart(accountId: number) {
  return (await request<CartItem[]>(`/giohang/account/${accountId}/items`)).map(product);
}
export async function updateCart(accountId: number, productId: number, quantity: number, method: 'POST' | 'PUT' = 'POST') {
  return (await request<CartItem[]>(`/giohang/account/${accountId}/items`, {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity }),
  })).map(product);
}
