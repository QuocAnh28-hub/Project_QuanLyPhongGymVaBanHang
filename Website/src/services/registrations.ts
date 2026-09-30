export type ContractStatus = string
export type Contract = {
  id: number
  code: string
  time: string
  member: string
  memberId: string
  phone: string
  age: number
  cccd: string
  packageName: string
  coach: string
  branch: string
  value: number
  listPrice: number
  discount: number
  paymentId?: number
  paymentMethod?: string
  paymentStatus: string
  paymentAmount: number
  status: ContractStatus
  term: string
  transaction: string
  daysLeft?: number
}

type ApiRegistration = {
  DangKyID: number
  HoiVienID: number
  HoTen: string
  SoDienThoai?: string
  TenGoi: string
  SoThang: number
  ThangTang: number
  NgayDangKy: string
  NgayBatDau: string
  NgayKetThuc: string
  GiaThanhToan: number
  TrangThaiDangKy: string
  TrangThaiThanhToan: string
  PhuongThucThanhToan?: string
  ThanhToanID?: number
  SoTien?: number
  SoNgayConLai: number
}
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Yêu cầu thất bại')
  return body
}

export const getRegistrations = async (): Promise<Contract[]> =>
  (await request<ApiRegistration[]>('/api/dangkygoitap/admin')).map((r) => ({
    id: r.DangKyID,
    code: `#QA-CTR-${r.DangKyID}`,
    time: r.NgayDangKy,
    member: r.HoTen,
    memberId: `HV-${r.HoiVienID}`,
    phone: r.SoDienThoai || '',
    age: 0,
    cccd: '—',
    packageName: r.TenGoi,
    coach: `${r.SoThang}+${r.ThangTang} tháng · còn ${r.SoNgayConLai} ngày`,
    branch: '—',
    value: Number(r.GiaThanhToan),
    listPrice: Number(r.GiaThanhToan),
    discount: 0,
    paymentId: r.ThanhToanID,
    paymentMethod: r.PhuongThucThanhToan,
    paymentStatus: r.TrangThaiThanhToan,
    paymentAmount: Number(r.SoTien ?? r.GiaThanhToan),
    status: r.TrangThaiDangKy as ContractStatus,
    term: `${r.NgayBatDau} → ${r.NgayKetThuc}`,
    transaction: r.ThanhToanID ? `PAY-${r.ThanhToanID}` : 'Chưa thanh toán',
    daysLeft: Number(r.SoNgayConLai),
  }))
export const renewRegistration = (id: number) =>
  request<{ message: string }>(`/api/dangkygoitap/${id}/renew`, {
    method: 'POST',
  })
export const confirmPayment = (id: number) =>
  request<{ message: string }>(`/api/thanhtoan/${id}/confirm`, {
    method: 'POST',
  })
