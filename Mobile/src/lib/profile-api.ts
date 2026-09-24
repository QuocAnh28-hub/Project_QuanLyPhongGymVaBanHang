import { baseUrl } from './account-api';

export type MemberProfile = {
  TaiKhoanID: number; HoiVienID: number; EmailDangNhap: string;
  HoTen: string; NgaySinh: string | null; GioiTinh: string | null;
  SoDienThoai: string | null; Email: string | null; DiaChi: string | null;
  AnhDaiDien: string | null; ChieuCao: number | null; CanNang: number | null;
  MucTieuTheHinh: string | null; TrangThai: string;
};

export async function getMemberProfile(accountId: number): Promise<MemberProfile> {
  const response = await fetch(`${baseUrl}/hoivien/account/${accountId}`);
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || 'Không tải được hồ sơ');
  return result as MemberProfile;
}

export async function updateMemberProfile(accountId: number, payload: Partial<Pick<MemberProfile, 'HoTen' | 'NgaySinh' | 'GioiTinh' | 'SoDienThoai' | 'DiaChi' | 'AnhDaiDien' | 'ChieuCao' | 'CanNang' | 'MucTieuTheHinh'>>): Promise<MemberProfile> {
  const response = await fetch(`${baseUrl}/hoivien/account/${accountId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || 'Không lưu được hồ sơ');
  return result as MemberProfile;
}
