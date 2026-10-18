import { shopRequest } from './shop-api';

export type CheckoutItem = {
  HinhAnh: string | null;
  SanPhamID: number;
  TenSanPham: string;
  SoLuong: number;
  GiaBan: string | number;
  DonViTinh: string;
};
export type CheckoutPreview = {
  bankTransferAvailable?: boolean;
  customer: {
    HoTen: string;
    SoDienThoai: string | null;
    DiaChi: string | null;
  };
  items: CheckoutItem[];
  subtotal: string;
  shipping: string;
  cartVersion: string;
  requestKey: string;
  demoEnabled: boolean;
};
export type CheckoutInput = {
  requestKey: string;
  cartVersion: string;
  name: string;
  phone: string;
  delivery: 'PICKUP' | 'DELIVERY';
  address: string;
  note: string;
  paymentMethod: 'TIEN_MAT' | 'CHUYEN_KHOAN';
};
export type ShopOrder = {
  paymentBlockReason?: string | null;
  transfer: { bankBin: string; accountNo: string; accountName: string; amount: string; content: string; qrPayload: string } | null;
  DonHangID: number;
  NgayDat: string;
  TongTien: string | number;
  TrangThai: string;
  DiaChiGiaoHang: string | null;
  GhiChu: string | null;
  TenNguoiNhan: string;
  SoDienThoai: string;
  CachNhan: 'PICKUP' | 'DELIVERY';
  PhiVanChuyen: string | number;
  ThanhToanID: number;
  PhuongThucThanhToan: CheckoutInput['paymentMethod'];
  TrangThaiThanhToan: string;
  HoaDonID: number | null;
  demoEnabled: boolean;
  items: (Omit<CheckoutItem, 'GiaBan'> & {
    DonGia: string | number;
    ThanhTien: string | number;
  })[];
};
export const orderStatus: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};
export const paymentStatus: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  SUCCESS: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  CANCELLED: 'Đã hủy thanh toán',
};
export const checkoutStorageKey = (accountId: number) =>
  `qa-shop-checkout-${accountId}`;
export const getCheckout = (accountId: number) =>
  shopRequest<CheckoutPreview>(`/donhang/checkout/${accountId}`);
export const createShopOrder = (accountId: number, input: CheckoutInput) =>
  shopRequest<ShopOrder>(`/donhang/checkout/${accountId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
export const getShopOrder = (accountId: number, orderId: number) =>
  shopRequest<ShopOrder>(`/donhang/account/${accountId}/orders/${orderId}`);
export const findCheckoutOrder = (accountId: number, requestKey: string) =>
  shopRequest<ShopOrder | null>(
    `/donhang/account/${accountId}/request/${encodeURIComponent(requestKey)}`
  );
export const getShopOrders = (accountId: number) =>
  shopRequest<Omit<ShopOrder, 'demoEnabled' | 'transfer'>[]>(
    `/donhang/account/${accountId}/orders`
  );
export function latestPendingOrder(orders: Pick<ShopOrder, 'DonHangID' | 'TrangThai' | 'TrangThaiThanhToan'>[]) {
  return orders.filter(order => order.TrangThai === 'PENDING' && order.TrangThaiThanhToan === 'PENDING')
    .reduce<number | null>((latest, order) => latest === null || order.DonHangID > latest ? order.DonHangID : latest, null);
}
export const confirmDemoOrder = (accountId: number, orderId: number) =>
  shopRequest<ShopOrder>(
    `/donhang/account/${accountId}/orders/${orderId}/demo-confirm`,
    { method: 'POST' }
  );
