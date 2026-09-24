import { baseUrl } from "@/lib/account-api";

export type ApiPT = {
  PTID: number;
  HoTen: string;
  NgaySinh: string | null;
  GioiTinh: "NAM" | "NU" | "KHAC" | null;
  SoDienThoai: string | null;
  Email: string | null;
  ChuyenMon: string | null;
  KinhNghiem: string | null;
  GiaThue: string | number;
  AnhDaiDien: string | null;
  TrangThai: "ACTIVE" | "INACTIVE";
};

export type ApiPTSchedule = {
  LichPTID: number;
  PTID: number;
  NgayLam: string;
  GioBatDau: string;
  GioKetThuc: string;
  TrangThai: "AVAILABLE" | "BOOKED" | "OFF";
};

export type ApiPTBooking = {
  ThuePTID: number;
  HoiVienID: number;
  PTID: number;
  LichPTID: number;
  HoTenPT: string;
  ChuyenMon: string | null;
  AnhDaiDien: string | null;
  NgayDat: string;
  NgayLam: string;
  GioBatDau: string;
  GioKetThuc: string;
  GiaThue: string | number;
  TrangThai: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  GhiChu: string | null;
};

export class PTApiError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
  }
}

async function read<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string; code?: string })
    | null;
  if (!response.ok) {
    throw new PTApiError(payload?.message || `HTTP ${response.status}`, payload?.code);
  }
  return payload as T;
}

export async function getActivePTs(): Promise<ApiPT[]> {
  return read(await fetch(`${baseUrl}/pt/active`));
}

export async function getPTDetail(ptId: number): Promise<ApiPT> {
  return read(await fetch(`${baseUrl}/pt/active/${ptId}`));
}

export async function getAvailablePTSchedules(ptId: number): Promise<ApiPTSchedule[]> {
  return read(await fetch(`${baseUrl}/lichpt/available/${ptId}`));
}

export async function bookPT(input: {
  accountId: number;
  scheduleId: number;
  note?: string;
}): Promise<ApiPTBooking> {
  const response = await fetch(`${baseUrl}/thuept/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TaiKhoanID: input.accountId,
      LichPTID: input.scheduleId,
      GhiChu: input.note?.trim() || undefined,
    }),
  });
  const result = await read<{ data: ApiPTBooking }>(response);
  return result.data;
}

export async function getMyPTBookings(accountId: number): Promise<ApiPTBooking[]> {
  return read(await fetch(`${baseUrl}/thuept/account/${accountId}`));
}

export async function cancelPTBooking(input: {
  accountId: number;
  bookingId: number;
}): Promise<ApiPTBooking> {
  const response = await fetch(`${baseUrl}/thuept/${input.bookingId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ TaiKhoanID: input.accountId }),
  });
  const result = await read<{ data: ApiPTBooking }>(response);
  return result.data;
}
