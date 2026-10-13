import { baseUrl } from './account-api';

export type GymEquipment = {
  MayTapID: number;
  MaMay: string;
  TenMay: string;
  NhomMay: 'CARDIO' | 'STRENGTH' | 'MULTI';
  NhomCo: string;
  MoTa: string;
  HinhAnh: string | null;
  SoLuong: number;
  ViTri: string;
  TrangThai: 'ACTIVE';
};
export async function getGymEquipment(signal?: AbortSignal): Promise<GymEquipment[]> {
  const response = await fetch(`${baseUrl}/maytap/active`, { signal });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || 'Chưa tải được máy tập.');
  if (!Array.isArray(data)) throw new Error('Danh sách máy tập không hợp lệ.');
  return data;
}
export function equipmentImageUrl(path: string | null) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/uploads/') ? new URL(path, baseUrl).href : undefined;
}
