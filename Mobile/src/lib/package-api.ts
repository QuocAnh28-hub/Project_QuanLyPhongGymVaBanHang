import { baseUrl } from "@/lib/account-api";
import type {
  GymPackage,
  PackageDuration,
  PrivilegeCode,
} from "@/lib/packages";

export type ApiPackage = {
  GoiTapID: number;
  TenGoi: string;
  MoTa: string | null;
  ThoiHan: number;
  Gia: string | number;
  TrangThai: "ACTIVE" | "INACTIVE";
  NgayTao: string;
};

export type ApiPackageDuration = {
  GoiTapThoiHanID: number;
  SoThang: number;
  ThangTang: number;
  GiaGoc: string | number;
  GiaBan: string | number;
  TrangThai: "ACTIVE" | "INACTIVE";
};

export type ApiPackagePrivilege = {
  QuyenLoiID: number;
  MaQuyenLoi: string;
  TenQuyenLoi: string;
  MoTa: string | null;
  SoLuong: number | null;
  ThuTu: number;
  TrangThai: "ACTIVE" | "INACTIVE";
};

export type ApiPackageDetail = {
  GoiTapID: number;
  TenGoi: string;
  MoTa: string | null;
  ThoiHanNgay: number;
  Gia: string | number;
  TrangThai: "ACTIVE" | "INACTIVE";
  NgayTao: string;
  ThoiHan: ApiPackageDuration[];
  QuyenLoi: ApiPackagePrivilege[];
};

// Temporary bridge between current DB numeric IDs and existing UI slugs.
// Replace with a stable MaGoi/catalog key in DB when that field is introduced.
const API_ID_BY_LOCAL_ID: Record<string, number> = {
  "silver-pass": 1,
  "gold-vip": 2,
  "diamond-all-access": 3,
  "student-pass": 4,
};

const PRIVILEGE_CODES = new Set<PrivilegeCode>([
  "CHECKIN_24_7",
  "GROUP_X",
  "YOGA",
  "SAUNA",
  "PT_SESSION",
  "INBODY",
  "GUEST_PASS",
  "SMART_LOCKER",
  "DETOX",
  "PRO_SHOP_DISCOUNT",
]);

const ICON_BY_CODE: Partial<Record<PrivilegeCode, string>> = {
  CHECKIN_24_7: "infinite-outline",
  GROUP_X: "people-circle-outline",
  YOGA: "body-outline",
  SAUNA: "flame-outline",
  PT_SESSION: "barbell-outline",
  INBODY: "pulse-outline",
  GUEST_PASS: "people-outline",
  SMART_LOCKER: "lock-closed-outline",
  DETOX: "cafe-outline",
  PRO_SHOP_DISCOUNT: "bag-handle-outline",
};

function parseMoney(value: string | number): number {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

export function getApiPackageId(localId: string): number | null {
  return API_ID_BY_LOCAL_ID[localId] ?? null;
}

export async function getActivePackages(): Promise<ApiPackage[]> {
  try {
    const response = await fetch(`${baseUrl}/goitap/active`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Dữ liệu trả về không phải danh sách gói tập");
    }

    return data as ApiPackage[];
  } catch (error) {
    throw new Error(
      `Không đọc được ${baseUrl}/goitap/active: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function getActivePackageDetail(
  localId: string,
): Promise<ApiPackageDetail> {
  const apiId = getApiPackageId(localId);
  if (!apiId) {
    throw new Error("Không ánh xạ được gói Mobile sang GoiTapID");
  }

  const response = await fetch(`${baseUrl}/goitap/active/${apiId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object") {
    throw new Error("API chi tiết gói tập trả dữ liệu không hợp lệ");
  }

  const candidate = data as Partial<ApiPackageDetail>;
  if (!Array.isArray(candidate.ThoiHan) || !Array.isArray(candidate.QuyenLoi)) {
    throw new Error(
      "API chi tiết chưa có ThoiHan[]/QuyenLoi[]. Hãy chạy migration + seed backend",
    );
  }

  return candidate as ApiPackageDetail;
}

function durationFromApi(row: ApiPackageDuration): PackageDuration {
  const months = Math.max(1, Number(row.SoThang) || 1);
  const bonusMonths = Math.max(0, Number(row.ThangTang) || 0);
  const baseAmount = parseMoney(row.GiaGoc);
  const totalPrice = parseMoney(row.GiaBan);
  const packagePromotion = Math.max(0, baseAmount - totalPrice);
  const monthlyPrice = Math.round(totalPrice / months);
  const originalMonthlyPrice = Math.round(baseAmount / months);

  return {
    months,
    bonusMonths,
    baseAmount,
    packagePromotion,
    monthlyPrice,
    originalMonthlyPrice,
    totalPrice,
    discountLabel: packagePromotion
      ? `Tiết kiệm ${packagePromotion.toLocaleString("vi-VN")}đ`
      : "Giá chuẩn",
    subtitle: bonusMonths
      ? `+ Tặng ${bonusMonths} tháng`
      : packagePromotion
        ? "Ưu đãi"
        : "Linh hoạt",
    ...(bonusMonths ? { badge: "HOT DEAL" } : {}),
  };
}

function privilegeFromApi(
  row: ApiPackagePrivilege,
): GymPackage["privileges"][number] {
  const code = PRIVILEGE_CODES.has(row.MaQuyenLoi as PrivilegeCode)
    ? (row.MaQuyenLoi as PrivilegeCode)
    : undefined;

  return {
    id: `db-${row.QuyenLoiID}`,
    code,
    icon: code ? (ICON_BY_CODE[code] ?? "checkmark-circle-outline") : "checkmark-circle-outline",
    title: row.TenQuyenLoi,
    badge: row.SoLuong ? `${row.SoLuong} lượt` : "",
    description: row.MoTa?.trim() || row.TenQuyenLoi,
    accent: code === "INBODY" || code === "SMART_LOCKER" ? "cyan" : "lime",
    included: row.SoLuong ?? undefined,
  };
}

export function mergePackageDetail(
  localPackage: GymPackage,
  apiPackage: ApiPackageDetail,
): GymPackage {
  const durations = apiPackage.ThoiHan.length
    ? [...apiPackage.ThoiHan]
        .sort((a, b) => a.SoThang - b.SoThang)
        .map(durationFromApi)
    : [...localPackage.durations];

  const privileges = apiPackage.QuyenLoi.length
    ? [...apiPackage.QuyenLoi]
        .sort((a, b) => a.ThuTu - b.ThuTu || a.QuyenLoiID - b.QuyenLoiID)
        .map(privilegeFromApi)
    : [...localPackage.privileges];

  return {
    ...localPackage,
    name: apiPackage.TenGoi?.trim() || localPackage.name,
    description: apiPackage.MoTa?.trim() || localPackage.description,
    availability: apiPackage.TrangThai === "ACTIVE" ? "active" : "inactive",
    durations,
    privileges,
  };
}

export function mergeActivePackages(
  localPackages: readonly GymPackage[],
  apiPackages: readonly ApiPackage[],
): GymPackage[] {
  const rowsById = new Map(apiPackages.map((row) => [row.GoiTapID, row]));

  return localPackages.flatMap((localPackage) => {
    const apiId = API_ID_BY_LOCAL_ID[localPackage.id];
    if (!apiId) return [];

    const apiPackage = rowsById.get(apiId);
    if (!apiPackage) return [];

    const apiPrice = parseMoney(apiPackage.Gia);

    const durations: PackageDuration[] = localPackage.durations.map((option) => {
      if (option.months !== 1) return { ...option };

      return {
        ...option,
        baseAmount: apiPrice,
        packagePromotion: 0,
        monthlyPrice: apiPrice,
        originalMonthlyPrice: apiPrice,
        totalPrice: apiPrice,
        discountLabel: "Giá từ hệ thống",
        subtitle: "1 tháng",
      };
    });

    return [
      {
        ...localPackage,
        name: apiPackage.TenGoi?.trim() || localPackage.name,
        description: apiPackage.MoTa?.trim() || localPackage.description,
        availability:
          apiPackage.TrangThai === "ACTIVE" ? "active" : "inactive",
        durations,
      },
    ];
  });
}
