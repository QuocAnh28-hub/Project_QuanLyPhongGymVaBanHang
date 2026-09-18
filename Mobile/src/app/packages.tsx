import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/app/Common/header";
import { useAuth } from "@/context/AuthContext";
import {
  getActiveMembership,
  getFavorite,
  setFavorite,
  type MembershipEnrollment,
} from "@/lib/membership";
import { formatVND } from "@/lib/package-logic";
import { packages, type GymPackage, type PrivilegeCode } from "@/lib/packages";

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
const comparePackages = packages.filter((item) =>
  ["silver-pass", "gold-vip", "diamond-all-access"].includes(item.id),
);

export default function PackagesScreen() {
  const { user } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState(12);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [membership, setMembership] = useState<MembershipEnrollment | null>(
    null,
  );
  const [error, setError] = useState("");
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
          packages.map(async (item) =>
            (await getFavorite(user.email, item.id)) ? item.id : null,
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
    }, [user]),
  );
  const open = (item: GymPackage) =>
    item.availability === "active" &&
    router.push({
      pathname: "/package-detail",
      params: { id: item.id, duration: String(selectedDuration) },
    });
  async function toggle(item: GymPackage) {
    if (!user) return router.push("/login");
    const next = !favorites.includes(item.id);
    try {
      await setFavorite(user.email, item.id, next);
      setFavorites((current) =>
        next ? [...current, item.id] : current.filter((id) => id !== item.id),
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
          {packages.map((item) => {
            const option = item.durations.find(
              (row) => row.months === selectedDuration,
            );
            if (!option) return null;
            const owned = membership?.packageId === item.id;
            return (
              <Pressable
                key={item.id}
                style={[s.card, item.id === "student-pass" && s.student]}
                onPress={() =>
                  owned ? router.push("/membership-detail") : open(item)
                }
                accessibilityRole="button"
              >
                <View style={s.cardTop}>
                  <Text
                    style={[
                      s.tag,
                      item.id === "diamond-all-access" && s.blue,
                      item.id === "student-pass" && s.green,
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
                      {favorites.includes(item.id) ? "★" : "☆"}
                    </Text>
                  </Pressable>
                </View>
                <Text style={s.name}>{item.name}</Text>
                <View style={s.priceRow}>
                  <Text style={[s.price, item.popular && s.lime]}>
                    {formatVND(option.monthlyPrice)}
                  </Text>
                  <Text style={s.perMonth}>/tháng</Text>
                </View>
                <Text style={s.saving}>
                  Tổng {formatVND(option.totalPrice)} · {option.discountLabel}
                  {option.bonusMonths
                    ? ` · Tặng ${option.bonusMonths} tháng`
                    : ""}
                </Text>
                <View style={s.benefits}>
                  {item.privileges
                    .slice(0, item.id === "diamond-all-access" ? 5 : 4)
                    .map((p) => (
                      <View style={s.benefit} key={p.id}>
                        <Text style={s.check}>✦</Text>
                        <Text style={s.benefitText}>{p.title}</Text>
                      </View>
                    ))}
                </View>
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
                        : item.id === "silver-pass"
                          ? "CHỌN SILVER PASS"
                          : item.id === "gold-vip"
                            ? "ĐĂNG KÝ GÓI GOLD VIP"
                            : item.id === "student-pass"
                              ? "ĐĂNG KÝ HSSV"
                              : "XEM CHI TIẾT DIAMOND"}
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
                  key={item.id}
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
                  <Text style={s.cell} key={item.id}>
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
    fontSize: 8,
    fontWeight: "900",
  },
  title: {
    color: "#e5e9e3",
    textAlign: "center",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    marginTop: 10,
  },
  subtitle: {
    color: "#879087",
    textAlign: "center",
    fontSize: 10,
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
  durationText: { color: "#c3c9c0", fontSize: 9, fontWeight: "800" },
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
    fontSize: 8,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: "hidden",
  },
  blue: { color: "#59c8f1", backgroundColor: "#182e3b" },
  green: { color: "#071c17", backgroundColor: "#0ba879" },
  star: { color: "#d9ff00", fontSize: 25 },
  name: { color: "#e5e8e3", fontSize: 14, fontWeight: "900", marginTop: 8 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 2 },
  price: { color: "#e0e4df", fontSize: 27, fontWeight: "900" },
  lime: { color: "#d9ff00" },
  perMonth: { color: "#88908b", fontSize: 9, marginLeft: 3 },
  saving: { color: "#bbdb00", fontSize: 9, marginTop: 3 },
  benefits: { marginTop: 9, gap: 5 },
  benefit: {
    flexDirection: "row",
    backgroundColor: "#171a1c",
    borderRadius: 4,
    padding: 7,
  },
  check: { color: "#cfff00", width: 17 },
  benefitText: { color: "#c4c9c4", flex: 1, fontSize: 10 },
  restriction: { color: "#50d9a9", fontSize: 9, marginTop: 9 },
  button: {
    backgroundColor: "#caff00",
    minHeight: 34,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
  },
  buttonText: { color: "#1b2600", fontSize: 10, fontWeight: "900" },
  arrow: { color: "#1b2600", marginLeft: 6 },
  mutedButton: { backgroundColor: "#3b3e42" },
  mutedText: { color: "#e1e4df" },
  tableKicker: {
    color: "#cbed00",
    textAlign: "center",
    fontSize: 8,
    fontWeight: "900",
    marginTop: 10,
  },
  tableTitle: {
    color: "#e5e9e4",
    textAlign: "center",
    fontSize: 14,
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
  cell: { color: "#cbed00", fontSize: 8, flex: 1, textAlign: "center" },
  label: { color: "#d7dbd6", textAlign: "left", paddingLeft: 6, flex: 1.3 },
  headingCell: {
    color: "#cbed00",
    fontSize: 8,
    fontWeight: "800",
    textAlign: "center",
  },
});
