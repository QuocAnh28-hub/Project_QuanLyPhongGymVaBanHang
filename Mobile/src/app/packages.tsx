import { useCallback, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/app/Common/header";
import { AuthColors as C } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
  getActiveMembership,
  getFavorite,
  setFavorite,
  type MembershipEnrollment,
} from "@/lib/membership";
import {
  getActivePackageDetail,
  getActivePackages,
  packageFromApi,
  packageFromApiDetail,
} from "@/lib/package-api";
import { formatVND } from "@/lib/package-logic";
import { type GymPackage, type PrivilegeCode } from "@/lib/packages";

const months = [1, 3, 6, 12];
const comparison: { label: string; code?: PrivilegeCode; hours?: true }[] = [
  { label: "Khung giờ tập", hours: true },
  { label: "Yoga", code: "YOGA" },
  { label: "Group-X", code: "GROUP_X" },
  { label: "Sauna", code: "SAUNA" },
  { label: "PT 1-1", code: "PT_SESSION" },
  { label: "Lounge & Detox", code: "DETOX" },
  { label: "InBody", code: "INBODY" },
  { label: "Guest pass", code: "GUEST_PASS" },
  { label: "Smart Locker", code: "SMART_LOCKER" },
];
export default function PackagesScreen() {
  const { user } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState(12);
  const [displayPackages, setDisplayPackages] =
    useState<readonly GymPackage[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [membership, setMembership] = useState<MembershipEnrollment | null>(
    null,
  );
  const [error, setError] = useState("");
  
  const [apiError, setApiError] = useState("");
  const comparePackages = displayPackages.filter((item) =>
    [1, 2, 3].includes(item.apiId),
  );

  useFocusEffect(
    useCallback(() => {
      let live = true;

      getActivePackages()
        .then(async (rows) => {
          const details = await Promise.allSettled(
            rows.map((row) => getActivePackageDetail(row.GoiTapID)),
          );
          if (!live) return;

          const packagesFromApi = rows.map((row, index) => {
            const detail = details[index];
            return detail.status === "fulfilled"
              ? packageFromApiDetail(detail.value)
              : { ...packageFromApi(row), durations: [], privileges: [] };
          });
          setDisplayPackages(packagesFromApi);
          setApiError(
            !packagesFromApi.length
              ? "Hiện chưa có gói tập đang mở."
              : details.some((detail) => detail.status === "rejected")
                ? "Một số gói chưa tải được thời hạn. Vui lòng mở lại màn hình."
                : "",
          );
        })
        .catch((apiError) => {
          if (!live) return;

          setDisplayPackages([]);
          setApiError(
            `${
              apiError instanceof Error
                ? apiError.message
                : "Không kết nối được API gói tập"
            }.`,
          );
        });

      return () => {
        live = false;
      };
    }, []),
  );
useFocusEffect(
    useCallback(() => {
      let live = true;
      if (!user) {
        setFavorites([]);
        setMembership(null);
        return;
      }
      Promise.all([
        getActiveMembership(user.email),
        Promise.all(
          displayPackages.map(async (item) =>
            (await getFavorite(user.email, String(item.apiId)))
              ? String(item.apiId)
              : null,
          ),
        ),
      ])
        .then(([active, ids]) => {
          if (live) {
            setMembership(active);
            setFavorites(ids.filter((id): id is string => !!id));
          }
        })
        .catch(() => {
          if (live) setError("Không thể tải thông tin hội viên.");
        });
      return () => {
        live = false;
      };
    }, [user, displayPackages]),
  );
  const open = (item: GymPackage) =>
    item.availability === "active" &&
    router.push({
      pathname: "/package-detail",
      params: { id: String(item.apiId), duration: String(selectedDuration) },
    });
  async function toggle(item: GymPackage) {
    if (!user) return router.push("/login");
    const favoriteId = String(item.apiId);
    const next = !favorites.includes(favoriteId);
    try {
      await setFavorite(user.email, favoriteId, next);
      setFavorites((current) =>
        next ? [...current, favoriteId] : current.filter((id) => id !== favoriteId),
      );
    } catch {
      setError("Không thể lưu yêu thích.");
    }
  }
  return (
    <View style={s.background}>
      <SafeAreaView edges={["top"]} style={s.safe}>
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <View style={s.intro}>
            <Text style={s.eyebrow}>✦ ĐĂNG KÝ TẬP THỂ HÌNH 5 SAO</Text>
            <Text style={s.title}>Các Gói Tập & Thẻ Hội Viên{"\n"}QA-Gym</Text>
            <Text style={s.subtitle}>
              Lựa chọn gói tập phù hợp với mục tiêu của bạn
            </Text>
          </View>
          <View style={s.durationBar}>
            {months.map((value) => (
              <Pressable
                key={value}
                onPress={() => setSelectedDuration(value)}
                style={[s.duration, selectedDuration === value && s.selected]}
              >
                <Text
                  style={[
                    s.durationText,
                    selectedDuration === value && s.selectedText,
                  ]}
                >
                  {value} Tháng
                </Text>
              </Pressable>
            ))}
          </View>
          {error ? <Text style={s.error}>{error}</Text> : null}
          {apiError ? <Text style={s.error}>{apiError}</Text> : null}
          {displayPackages.map((item) => {
            const option = item.durations.find(
              (row) => row.months === selectedDuration,
            );
            const visiblePrivileges = item.privileges.slice(0, 4);
            const remainingPrivileges = item.privileges.length - visiblePrivileges.length;
            const owned = membership?.packageId === item.id;
            return (
              <Pressable
                key={item.apiId}
                style={[s.card, item.apiId === 4 && s.student]}
                onPress={() =>
                  owned ? router.push("/membership-detail") : open(item)
                }
                accessibilityRole="button"
              >
                <View style={s.cardTop}>
                  <Text
                    style={[
                      s.tag,
                      item.apiId === 3 && s.blue,
                      item.apiId === 4 && s.green,
                    ]}
                  >
                    {item.popular ? "✦ BÁN CHẠY NHẤT" : item.tier}
                  </Text>
                  <Pressable
                    hitSlop={12}
                    onPress={(event) => {
                      event.stopPropagation();
                      void toggle(item);
                    }}
                    accessibilityLabel={`Yêu thích ${item.name}`}
                  >
                    <Text style={s.star}>
                      {favorites.includes(String(item.apiId)) ? "★" : "☆"}
                    </Text>
                  </Pressable>
                </View>
                <Text style={s.name}>{item.name}</Text>
                {option ? (
                  <>
                    <View style={s.priceRow}>
                      <Text style={[s.price, item.popular && s.lime]}>
                        {formatVND(option.monthlyPrice)}
                      </Text>
                      <Text style={s.perMonth}>/tháng</Text>
                    </View>
                    <View style={s.priceSummary}>
                      <View style={s.priceSummaryRow}>
                        <View style={s.priceTotal}>
                          <Text style={s.priceMetaLabel}>TỔNG THANH TOÁN</Text>
                          <Text style={s.priceMetaValue} numberOfLines={1}>
                            {formatVND(option.totalPrice)}
                          </Text>
                        </View>
                        <Text style={s.durationPill}>
                          {option.months} THÁNG
                        </Text>
                      </View>
                      {option.packagePromotion > 0 || option.bonusMonths > 0 ? (
                        <View style={s.offerRow}>
                          {option.packagePromotion > 0 ? (
                            <Text style={s.savingPill}>
                              TIẾT KIỆM {formatVND(option.packagePromotion)}
                            </Text>
                          ) : null}
                          {option.bonusMonths > 0 ? (
                            <Text style={s.bonusPill}>
                              + TẶNG {option.bonusMonths} THÁNG
                            </Text>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  </>
                ) : (
                  <View style={s.unavailableDuration}>
                    <Text style={s.unavailableDurationText}>
                      Chưa có gói {selectedDuration} tháng
                    </Text>
                  </View>
                )}
                {visiblePrivileges.length ? (
                  <View style={s.benefits}>
                    {visiblePrivileges.map((privilege) => (
                      <View style={s.benefit} key={privilege.id}>
                        <Ionicons
                          name={privilege.icon as keyof typeof Ionicons.glyphMap}
                          color={
                            privilege.accent === "cyan"
                              ? C.cyan
                              : privilege.accent === "mint"
                                ? C.mint
                                : C.lime
                          }
                          size={15}
                        />
                        <Text style={s.benefitText} numberOfLines={2}>
                          {privilege.title}
                        </Text>
                      </View>
                    ))}
                    {remainingPrivileges > 0 ? (
                      <Text style={s.moreBenefits}>
                        + {remainingPrivileges} quyền lợi khác
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                {item.requiresStudentVerification ? (
                  <Text style={s.restriction}>
                    Cần xác minh thẻ HSSV còn hiệu lực
                  </Text>
                ) : null}
                <View style={[s.button, !item.popular && s.mutedButton]}>
                  <Text style={[s.buttonText, !item.popular && s.mutedText]}>
                    {owned
                      ? "XEM GÓI ĐANG DÙNG"
                      : item.availability !== "active"
                        ? "CHƯA MỞ BÁN"
                        : item.apiId === 1
                          ? "CHỌN SILVER PASS"
                          : item.apiId === 2
                            ? "ĐĂNG KÝ GÓI GOLD VIP"
                            : item.apiId === 4
                              ? "ĐĂNG KÝ HSSV"
                              : item.apiId === 3
                                ? "XEM CHI TIẾT DIAMOND"
                                : "XEM CHI TIẾT GÓI"}
                  </Text>
                  <Text style={s.arrow}>↗</Text>
                </View>
              </Pressable>
            );
          })}
          <Text style={s.tableKicker}>MINH BẠCH & RÕ RÀNG</Text>
          <Text style={s.tableTitle}>Bảng So Sánh Quyền Lợi Nhanh</Text>
          <View style={s.table}>
            <View style={s.row}>
              <Text style={[s.cell, s.label]}>Đặc quyền</Text>
              {comparePackages.map((item) => (
                <Pressable
                  key={item.apiId}
                  style={s.cell}
                  onPress={() => open(item)}
                >
                  <Text style={s.headingCell}>{item.tier}</Text>
                </Pressable>
              ))}
            </View>
            {comparison.map((row) => (
              <View style={s.row} key={row.label}>
                <Text style={[s.cell, s.label]}>{row.label}</Text>
                {comparePackages.map((item) => (
                  <Text style={s.cell} key={item.apiId}>
                    {row.hours
                      ? item.accessHours
                        ? `${item.accessHours.from}–${item.accessHours.to}`
                        : "24/7"
                      : item.privileges.some((p) => p.code === row.code)
                        ? "✓"
                        : "—"}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
const s = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#0c0f10" },
  safe: { flex: 1, width: "100%", maxWidth: 540, alignSelf: "center" },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  intro: { alignItems: "center", paddingTop: 22, paddingBottom: 17 },
  eyebrow: {
    color: "#cbed00",
    backgroundColor: "#253500",
    borderRadius: 7,
    padding: 6,
    fontSize: 9,
    fontWeight: "900",
  },
  title: {
    color: "#e5e9e3",
    textAlign: "center",
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900",
    marginTop: 10,
  },
  subtitle: {
    color: "#879087",
    textAlign: "center",
    fontSize: 11,
    marginTop: 8,
  },
  durationBar: {
    flexDirection: "row",
    backgroundColor: "#1a1e20",
    borderRadius: 7,
    padding: 3,
    marginBottom: 18,
  },
  duration: {
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  selected: { backgroundColor: "#d9ff00" },
  durationText: { color: "#c3c9c0", fontSize: 10, fontWeight: "800" },
  selectedText: { color: "#1d2700" },
  error: { color: "#ff6b6b", marginBottom: 10 },
  card: {
    backgroundColor: "#202427",
    borderRadius: 8,
    padding: 11,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2c3133",
  },
  student: { backgroundColor: "#1c2022" },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    color: "#263100",
    backgroundColor: "#c9f000",
    fontSize: 9,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: "hidden",
  },
  blue: { color: "#59c8f1", backgroundColor: "#182e3b" },
  green: { color: "#071c17", backgroundColor: "#0ba879" },
  star: { color: "#d9ff00", fontSize: 26 },
  name: { color: "#e5e8e3", fontSize: 15, fontWeight: "900", marginTop: 8 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 2 },
  price: { color: "#e0e4df", fontSize: 28, fontWeight: "900" },
  lime: { color: "#d9ff00" },
  perMonth: { color: "#88908b", fontSize: 10, marginLeft: 3 },
  priceSummary: {
    backgroundColor: C.surfaceLowest,
    borderRadius: 8,
    padding: 10,
    marginTop: 9,
    gap: 8,
  },
  priceSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  priceTotal: { flex: 1, minWidth: 0 },
  priceMetaLabel: { color: C.muted, fontSize: 9, fontWeight: "800" },
  priceMetaValue: {
    color: C.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
    flexShrink: 1,
  },
  durationPill: {
    color: C.lime,
    backgroundColor: C.surfaceHigh,
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 9,
    fontWeight: "900",
  },
  offerRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  savingPill: {
    color: C.surfaceLowest,
    backgroundColor: C.lime,
    borderRadius: 5,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: "900",
  },
  bonusPill: {
    color: C.mint,
    backgroundColor: C.surfaceHigh,
    borderRadius: 5,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: "900",
  },
  unavailableDuration: {
    backgroundColor: C.surfaceLowest,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 13,
    marginTop: 9,
  },
  unavailableDurationText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  benefits: { marginTop: 8, gap: 5 },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surfaceLowest,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  benefitText: {
    color: C.text,
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
  moreBenefits: {
    color: C.lime,
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 3,
    paddingTop: 2,
  },
  restriction: { color: "#50d9a9", fontSize: 10, marginTop: 9 },
  button: {
    backgroundColor: "#caff00",
    minHeight: 34,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
  },
  buttonText: { color: "#1b2600", fontSize: 11, fontWeight: "900" },
  arrow: { color: "#1b2600", marginLeft: 6 },
  mutedButton: { backgroundColor: "#3b3e42" },
  mutedText: { color: "#e1e4df" },
  tableKicker: {
    color: "#cbed00",
    textAlign: "center",
    fontSize: 9,
    fontWeight: "900",
    marginTop: 10,
  },
  tableTitle: {
    color: "#e5e9e4",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 9,
  },
  table: { backgroundColor: "#1c2022", borderRadius: 7, overflow: "hidden" },
  row: {
    flexDirection: "row",
    minHeight: 34,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2d3234",
  },
  cell: { color: "#cbed00", fontSize: 9, flex: 1, textAlign: "center" },
  label: { color: "#d7dbd6", textAlign: "left", paddingLeft: 6, flex: 1.3 },
  headingCell: {
    color: "#cbed00",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
  },
});

