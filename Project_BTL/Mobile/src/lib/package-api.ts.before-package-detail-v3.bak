import { baseUrl } from "@/lib/account-api";
import type { GymPackage, PackageDuration } from "@/lib/packages";

export type ApiPackage = {
  GoiTapID: number;
  TenGoi: string;
  MoTa: string | null;
  ThoiHan: number;
  Gia: string | number;
  TrangThai: "ACTIVE" | "INACTIVE";
  NgayTao: string;
};

// Cầu nối tạm giữa ID DB hiện tại và slug UI.
// Khi backend có field MaGoi/CatalogKey ổn định thì thay mapping này bằng field đó.
const API_ID_BY_LOCAL_ID: Record<string, number> = {
  "silver-pass": 1,
  "gold-vip": 2,
  "diamond-all-access": 3,
  "student-pass": 4,
};

function parsePrice(value: ApiPackage["Gia"]): number | null {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
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

    const apiPrice = parsePrice(apiPackage.Gia);

    const durations: PackageDuration[] = localPackage.durations.map((option) => {
      // Schema backend hiện tại chỉ có một Gia/ThoiHan cơ bản.
      // Chỉ đồng bộ giá 1 tháng; 3/6/12 tháng vẫn dùng logic UI cũ
      // cho đến khi GoiTapThoiHan được nối vào API.
      if (option.months !== 1 || apiPrice === null) return { ...option };

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
