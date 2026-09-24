import { baseUrl } from "@/lib/account-api";
import type { PaymentMethod } from "@/lib/membership";

export type RegistrationResult = {
  DangKyID: number;
  HoiVienID: number;
  GoiTapID: number;
  GoiTapThoiHanID: number;
  TenGoi: string;
  SoThang: number;
  ThangTang: number;
  NgayBatDau: string;
  NgayKetThuc: string;
  GiaGoc: number;
  GiaBan: number;
  SoTienGiam: number;
  GiaThanhToan: number;
  MaKhuyenMai: string | null;
  TrangThai: "PENDING";
};

export type RegistrationDetail = {
  DangKyID: number;
  HoiVienID: number;
  GoiTapID: number;
  GoiTapThoiHanID: number;
  NgayDangKy: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  GiaThanhToan: string | number;
  TrangThai: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  TenGoi: string;
  SoThang: number;
  ThangTang: number;
  GiaGoc: string | number;
  GiaBan: string | number;
  SoTienGiam: string | number;
};

export class RegistrationApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly registrationId?: number,
  ) {
    super(message);
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export async function registerPackage(input: {
  accountId: number;
  packageId: number;
  durationId: number;
  activationDate: string;
  voucherCode?: string | null;
}): Promise<RegistrationResult> {
  const response = await fetch(`${baseUrl}/dangkygoitap/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      TaiKhoanID: input.accountId,
      GoiTapID: input.packageId,
      GoiTapThoiHanID: input.durationId,
      NgayBatDau: input.activationDate,
      MaKhuyenMai: input.voucherCode || undefined,
    }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
      code?: string;
      data?: { DangKyID?: number };
    } | null;
    throw new RegistrationApiError(
      data?.message || `HTTP ${response.status}`,
      data?.code,
      data?.data?.DangKyID,
    );
  }

  const payload = (await response.json()) as {
    message: string;
    data: RegistrationResult;
  };

  if (!payload?.data?.DangKyID) {
    throw new Error("Backend không trả về DangKyID");
  }

  return payload.data;
}

export async function getRegistrationDetail(
  registrationId: number,
): Promise<RegistrationDetail> {
  const response = await fetch(
    `${baseUrl}/dangkygoitap/detail/${registrationId}`,
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as RegistrationDetail;
}

export const paymentMethodNames: Record<PaymentMethod, string> = {
  vietqr: "VietQR / Chuyển khoản 24/7",
  card: "Thẻ tín dụng / Ghi nợ quốc tế",
  wallet: "Ví điện tử",
  pos: "Thanh toán trực tiếp tại quầy",
};
