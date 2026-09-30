export type GymPackage = {
  id: number
  durationId?: number
  name: string
  sku: string
  category: string
  badge: string
  duration: number
  price: number
  originalPrice?: number
  active: boolean
  description: string
  features: string[]
  members: number
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

const mapPackage = (p: ApiPackage): GymPackage => ({
  id: p.GoiTapID,
  durationId: p.GoiTapThoiHanID,
  name: p.TenGoi,
  sku: `PKG-${p.GoiTapID}`,
  category: 'all',
  badge: p.TrangThai,
  duration: Number(p.SoThang || 1),
  price: Number(p.GiaBan ?? p.Gia),
  originalPrice: Number(p.GiaGoc || 0),
  active: p.TrangThai === 'ACTIVE',
  description: p.MoTa || '',
  features: p.QuyenLoi?.split('||').filter(Boolean) || [],
  members: Number(p.SoHoiVienActive || 0),
})

export const getPackages = async () =>
  (await request<ApiPackage[]>('/api/goitap')).map(mapPackage)
export async function savePackage(value: GymPackage) {
  await request(value.id ? `/api/goitap/${value.id}` : '/api/goitap', {
    method: value.id ? 'PUT' : 'POST',
    body: JSON.stringify({
      TenGoi: value.name,
      MoTa: value.description,
      GoiTapThoiHanID: value.durationId,
      SoThang: value.duration,
      ThangTang: 0,
      GiaGoc: value.originalPrice || value.price,
      GiaBan: value.price,
      TrangThai: value.active ? 'ACTIVE' : 'INACTIVE',
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
