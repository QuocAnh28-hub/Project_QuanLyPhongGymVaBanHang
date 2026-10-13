import { catalogRequest } from './catalog'
export type Equipment = {
  MayTapID: number
  MaMay: string
  TenMay: string
  NhomMay: 'CARDIO' | 'STRENGTH' | 'MULTI'
  NhomCo: string
  MoTa: string
  HinhAnh: string | null
  SoLuong: number
  ViTri: string
  TrangThai: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
}
export const equipmentGroups = { CARDIO: 'Cardio', STRENGTH: 'Sức mạnh', MULTI: 'Đa năng' }
export const equipmentStatuses = { ACTIVE: 'Đang hoạt động', MAINTENANCE: 'Đang bảo trì', INACTIVE: 'Ngừng hoạt động' }
export const getEquipment = (signal?: AbortSignal) => catalogRequest<Equipment[]>('maytap', { signal })
export const saveEquipment = (row: Omit<Equipment, 'MayTapID'>, id?: number) =>
  catalogRequest(`maytap${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(row) })
export const deleteEquipment = (id: number) => catalogRequest(`maytap/${id}`, { method: 'DELETE' })
