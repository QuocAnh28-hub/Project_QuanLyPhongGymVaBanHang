export type GymPackage = {
  id: number
  name: string
  category: string
  badge: string
  durations: PackageDurationAdmin[]
  active: boolean
  description: string
  features: string[]
  members: number
}

export type PackageDurationAdmin = {
  durationId?: number
  months: number
  bonusMonths: number
  originalPrice: number
  salePrice: number
  active: boolean
}

type ApiPackage = {
  GoiTapID: number
  GoiTapThoiHanID?: number
  TenGoi: string
  MoTa?: string
  SoThang?: number
  GiaGoc?: number
  GiaBan?: number
  Gia: number
  TrangThai: 'ACTIVE' | 'INACTIVE'
  SoHoiVienActive: number
  QuyenLoi?: string
  ThoiHan: ApiPackageDetail['ThoiHan']
  QuyenLoiChiTiet: ApiPackageDetail['QuyenLoi']
}

type ApiPackageDetail = {
  GoiTapID: number
  TenGoi: string
  MoTa?: string
  TrangThai: 'ACTIVE' | 'INACTIVE'
  ThoiHan: Array<{
    GoiTapThoiHanID: number
    SoThang: number
    ThangTang: number
    GiaGoc: number | string
    GiaBan: number | string
    TrangThai: 'ACTIVE' | 'INACTIVE'
  }>
  QuyenLoi: Array<{ TenQuyenLoi: string; TrangThai: 'ACTIVE' | 'INACTIVE' }>
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await adminFetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Yêu cầu thất bại')
  return body
}

const mapPackage = (p: ApiPackageDetail, members = 0): GymPackage => ({
  id: p.GoiTapID,
  name: p.TenGoi,
  category: 'all',
  badge: p.TrangThai,
  durations: p.ThoiHan.map(row => ({
    durationId: row.GoiTapThoiHanID,
    months: Number(row.SoThang),
    bonusMonths: Number(row.ThangTang),
    originalPrice: Number(row.GiaGoc),
    salePrice: Number(row.GiaBan),
    active: row.TrangThai === 'ACTIVE',
  })),
  active: p.TrangThai === 'ACTIVE',
  description: p.MoTa || '',
  features: p.QuyenLoi.filter(row => row.TrangThai === 'ACTIVE').map(row => row.TenQuyenLoi),
  members,
})

export const getPackageAdminDetail = async (id: number, members = 0) =>
  mapPackage(await request<ApiPackageDetail>(`/api/goitap/admin/${id}`), members)

export const getPackages = async () => {
  const rows = await request<ApiPackage[]>('/api/goitap')
  return rows.map(row => mapPackage({
    GoiTapID: row.GoiTapID,
    TenGoi: row.TenGoi,
    MoTa: row.MoTa,
    TrangThai: row.TrangThai,
    ThoiHan: row.ThoiHan,
    QuyenLoi: row.QuyenLoiChiTiet,
  }, Number(row.SoHoiVienActive || 0)))
}
export async function savePackage(value: GymPackage) {
  await request(value.id ? `/api/goitap/${value.id}` : '/api/goitap', {
    method: value.id ? 'PUT' : 'POST',
    body: JSON.stringify({
      TenGoi: value.name,
      MoTa: value.description,
      TrangThai: value.active ? 'ACTIVE' : 'INACTIVE',
      ThoiHan: value.durations.map(row => ({
        GoiTapThoiHanID: row.durationId,
        SoThang: row.months,
        ThangTang: row.bonusMonths,
        GiaGoc: row.originalPrice,
        GiaBan: row.salePrice,
        TrangThai: row.active ? 'ACTIVE' : 'INACTIVE',
      })),
      QuyenLoi: value.features,
    }),
  })
}
export const setPackageStatus = (id: number, active: boolean) =>
  request(`/api/goitap/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ TrangThai: active ? 'ACTIVE' : 'INACTIVE' }),
  })
export const deletePackage = (id: number) =>
  request<{ message: string }>(`/api/goitap/${id}`, { method: 'DELETE' })
import { adminFetch } from './auth'
