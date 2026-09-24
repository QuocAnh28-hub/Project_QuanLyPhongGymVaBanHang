import { baseUrl } from "@/lib/account-api";
import type { PaymentMethod } from "@/lib/membership";

export type BackendPaymentMethod = "TIEN_MAT" | "CHUYEN_KHOAN" | "THE";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export type PackagePayment = {
  ThanhToanID: number;
  DangKyID: number;
  HoiVienID: number;
  GoiTapID: number;
  GoiTapThoiHanID: number;
  TenGoi: string;
  SoThang: number;
  ThangTang: number;
  NgayBatDau: string;
  NgayKetThuc: string;
  GiaThanhToan: string | number;
  SoTien: string | number;
  PhuongThucThanhToan: BackendPaymentMethod;
  TrangThaiThanhToan: PaymentStatus;
  TrangThaiDangKy: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
};

type PackagePaymentSummary = Pick<
  PackagePayment,
  | "ThanhToanID"
  | "DangKyID"
  | "HoiVienID"
  | "SoTien"
  | "PhuongThucThanhToan"
> & { TrangThai: PaymentStatus };

const methodMap: Record<PaymentMethod, BackendPaymentMethod> = {
  vietqr: "CHUYEN_KHOAN",
  card: "THE",
  wallet: "CHUYEN_KHOAN",
  pos: "TIEN_MAT",
};

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export async function createPackagePayment(input: {
  registrationId: number;
  paymentMethod: PaymentMethod;
}): Promise<PackagePaymentSummary> {
  const response = await fetch(`${baseUrl}/thanhtoan/package`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      DangKyID: input.registrationId,
      PhuongThucThanhToan: methodMap[input.paymentMethod],
    }),
  });
  if (!response.ok) throw new Error(await readError(response));
  const payload = (await response.json()) as { data: PackagePaymentSummary };
  if (!payload?.data?.ThanhToanID) throw new Error("Backend không trả về ThanhToanID");
  return payload.data;
}

export async function getPackagePaymentDetail(
  paymentId: number,
): Promise<PackagePayment> {
  const response = await fetch(`${baseUrl}/thanhtoan/package/${paymentId}`);
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as PackagePayment;
}

export async function getPaymentByRegistration(
  registrationId: number,
): Promise<PackagePayment | null> {
  const response = await fetch(
    `${baseUrl}/thanhtoan/registration/${registrationId}`,
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as PackagePayment;
}

export const backendPaymentMethodNames: Record<BackendPaymentMethod, string> = {
  TIEN_MAT: "Thanh toán trực tiếp tại quầy",
  CHUYEN_KHOAN: "Chuyển khoản",
  THE: "Thẻ tín dụng / Ghi nợ quốc tế",
};
