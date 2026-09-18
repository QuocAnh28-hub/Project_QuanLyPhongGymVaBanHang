import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getPackageById } from "@/lib/packages";
import { useAuth } from "@/context/AuthContext";
import { getCheckInHistory, type CheckInRecord } from "@/lib/check-in";
import {
  getActiveMembership,
  type MembershipEnrollment,
} from "@/lib/membership";
import { parseLocalDate } from "@/lib/package-logic";

const C = {
  bg: "#111316",
  card: "#1e2023",
  high: "#282a2d",
  text: "#e2e2e6",
  muted: "#aeb59e",
  lime: "#c3f400",
  mint: "#4edea3",
  ink: "#161e00",
};
const daysBetween = (from: Date, to: Date) =>
  Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 86400000));

export default function MembershipDetailScreen() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<MembershipEnrollment | null>();
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (user)
        Promise.all([
          getActiveMembership(user.email),
          getCheckInHistory(user.email),
        ]).then(([active, history]) => {
          if (mounted) {
            setMembership(active);
            setRecords(
              history.filter((row) => row.membershipId === active?.id),
            );
          }
        });
      return () => {
        mounted = false;
      };
    }, [user]),
  );
  const data = useMemo(() => {
    if (!membership) return null;
    const start = parseLocalDate(membership.activationDate);
    const end = parseLocalDate(membership.expiryDate);
    const today = new Date();
    const total = start && end ? Math.max(1, daysBetween(start, end)) : 1;
    const elapsed = start ? Math.max(0, daysBetween(start, today)) : 0;
    return {
      remaining: end ? daysBetween(today, end) : 0,
      progress: Math.min(100, Math.round((elapsed / total) * 100)),
      package: getPackageById(membership.packageId),
    };
  }, [membership]);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/profile");
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.top}>
        <View style={s.brand}>
          <Ionicons name="flash" color={C.lime} size={19} />
          <Text style={s.brandText}>WORKOUT PACKAGES</Text>
        </View>
        <Ionicons name="person-circle-outline" color={C.text} size={28} />
      </View>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heading}>
          <Pressable
            style={s.icon}
            onPress={back}
            accessibilityLabel="Quay lại Cá nhân"
          >
            <Ionicons name="arrow-back" color={C.text} size={21} />
          </Pressable>
          <View style={s.headingCopy}>
            <Text style={s.kicker}>QA-GYM ELITE ACCESS</Text>
            <Text style={s.title}>GÓI TẬP ĐANG DÙNG</Text>
          </View>
        </View>
        {membership === undefined ? (
          <Text style={s.center}>Đang tải gói tập...</Text>
        ) : !membership || !data ? (
          <View style={s.empty}>
            <Ionicons name="diamond-outline" color={C.lime} size={38} />
            <Text style={s.cardTitle}>Bạn chưa có gói tập đang hoạt động</Text>
            <Text style={s.muted}>
              Gói chờ thanh toán không được hiển thị như thẻ đang dùng.
            </Text>
            <Pressable
              style={s.primary}
              onPress={() => router.push("/packages")}
            >
              <Text style={s.primaryText}>KHÁM PHÁ GÓI TẬP</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.memberCard}>
              <View style={s.packageHead}>
                <View style={s.diamond}>
                  <Ionicons name="diamond-outline" color={C.lime} size={27} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.packageName}>
                    {membership.packageName.toUpperCase()}
                  </Text>
                  <Text style={s.label}>
                    {data.package?.tier ?? "QA-GYM MEMBERSHIP"}
                  </Text>
                </View>
                <Text style={s.active}>● ĐANG HOẠT ĐỘNG</Text>
              </View>
              <Text style={s.label}>HỘI VIÊN SỞ HỮU</Text>
              <View style={s.owner}>
                <Text style={s.ownerName}>{user?.name.toUpperCase()}</Text>
                <Text style={s.cardCode}>
                  MÃ THẺ{`\n`}
                  {membership.id.replace("QA-MEM-", "QA-")}
                </Text>
              </View>
              <View style={s.remaining}>
                <Text style={s.remainingText}>
                  ◉ Còn lại {data.remaining} ngày
                </Text>
                <Text style={s.muted}>
                  Hết hạn:{" "}
                  {new Date(
                    `${membership.expiryDate}T00:00:00`,
                  ).toLocaleDateString("vi-VN")}
                </Text>
              </View>
              <View style={s.track}>
                <View style={[s.progress, { width: `${data.progress}%` }]} />
              </View>
              <View style={s.actions}>
                <Pressable
                  style={s.qrButton}
                  onPress={() => router.push("/check-in-pass")}
                >
                  <Ionicons name="qr-code-outline" color={C.ink} size={18} />
                  <Text style={s.primaryText}>MÃ CHECK-IN QR</Text>
                </Pressable>
                <Pressable
                  style={s.renew}
                  onPress={() =>
                    router.push({
                      pathname: "/package-detail",
                      params: {
                        id: membership.packageId,
                        renewal: membership.id,
                      },
                    })
                  }
                >
                  <Ionicons name="refresh-outline" color={C.text} size={18} />
                  <Text style={s.renewText}>GIA HẠN GÓI</Text>
                </Pressable>
              </View>
            </View>
            <View style={s.sectionHead}>
              <Text style={s.section}>THỐNG KÊ SỬ DỤNG GÓI</Text>
              <Text style={s.mint}>Dữ liệu hiện tại</Text>
            </View>
            <View style={s.stats}>
              <Stat
                label="TỔNG BUỔI"
                value={String(records.length)}
                detail="Đã check-in"
              />
              <Stat label="CÙNG PT" value="0" detail="Chưa có dữ liệu PT" />
              <Stat
                label="DẪN BẠN"
                value={
                  data.package?.privileges.some(
                    (item) => item.id === "companion",
                  )
                    ? "1"
                    : "0"
                }
                detail="Quyền guest pass"
              />
            </View>
            <View style={s.sectionHead}>
              <Text style={s.section}>ĐẶC QUYỀN GÓI</Text>
              <Text style={s.limePill}>
                {data.package?.privileges.length ?? 0} QUYỀN LỢI
              </Text>
            </View>
            <View style={s.privileges}>
              {data.package?.privileges.map((item) => (
                <View style={s.privilege} key={item.id}>
                  <View style={s.check}>
                    <Ionicons name="checkmark" color={C.lime} size={15} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.privilegeTitle}>{item.title}</Text>
                    <Text style={s.muted}>{item.description}</Text>
                  </View>
                </View>
              )) ?? (
                <Text style={s.muted}>
                  Chưa có dữ liệu quyền lợi cho gói này.
                </Text>
              )}
            </View>
            <Text style={s.section}>HỢP ĐỒNG & BẢO LƯU</Text>
            <View style={s.policy}>
              <Ionicons name="document-text-outline" color={C.text} size={22} />
              <View style={{ flex: 1 }}>
                <Text style={s.privilegeTitle}>Hợp đồng điện tử</Text>
                <Text style={s.muted}>Chưa có tệp hợp đồng PDF</Text>
              </View>
              <View style={s.disabledButton}>
                <Text style={s.disabledText}>TẢI PDF</Text>
              </View>
            </View>
            <View style={s.policy}>
              <Ionicons name="snow-outline" color={C.mint} size={22} />
              <View style={{ flex: 1 }}>
                <Text style={s.privilegeTitle}>Đóng băng / Bảo lưu thẻ</Text>
                <Text style={s.muted}>
                  Chưa kết nối quy trình yêu cầu bảo lưu
                </Text>
              </View>
              <View style={s.disabledButton}>
                <Text style={s.disabledText}>YÊU CẦU</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <View style={s.stat}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.muted}>{detail}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  top: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#24272a",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandText: { color: C.text, fontSize: 16, fontWeight: "900" },
  content: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    padding: 15,
    gap: 12,
    paddingBottom: 40,
  },
  heading: { flexDirection: "row", alignItems: "center", gap: 11 },
  headingCopy: { flex: 1, alignItems: "center" },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { color: C.lime, fontSize: 9, fontWeight: "900" },
  title: { color: C.text, fontSize: 18, fontWeight: "900" },
  center: { color: C.muted, textAlign: "center", padding: 30 },
  empty: {
    minHeight: 240,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cardTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  muted: { color: C.muted, fontSize: 10, lineHeight: 15 },
  primary: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: C.lime,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: C.ink, fontSize: 10, fontWeight: "900" },
  memberCard: {
    backgroundColor: C.card,
    borderRadius: 17,
    padding: 18,
    gap: 11,
  },
  packageHead: { flexDirection: "row", alignItems: "center", gap: 9 },
  diamond: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: C.high,
    alignItems: "center",
    justifyContent: "center",
  },
  packageName: { color: C.text, fontSize: 17, fontWeight: "900" },
  label: { color: C.muted, fontSize: 8, fontWeight: "900" },
  active: {
    color: C.lime,
    backgroundColor: "#303719",
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 7,
    fontWeight: "900",
  },
  owner: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  ownerName: { color: C.text, fontSize: 20, fontWeight: "900", flex: 1 },
  cardCode: {
    color: C.text,
    fontSize: 8,
    fontWeight: "900",
    textAlign: "right",
  },
  remaining: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  remainingText: { color: C.text, fontSize: 11, fontWeight: "800" },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: C.high,
    overflow: "hidden",
  },
  progress: { height: 5, backgroundColor: C.lime },
  actions: { flexDirection: "row", gap: 8, marginTop: 8 },
  qrButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 10,
    backgroundColor: C.lime,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  renew: {
    flex: 1,
    minHeight: 45,
    borderRadius: 10,
    backgroundColor: C.high,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  renewText: { color: C.text, fontSize: 10, fontWeight: "900" },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  section: { color: C.text, fontSize: 9, fontWeight: "900", marginTop: 7 },
  mint: { color: C.mint, fontSize: 8 },
  stats: { flexDirection: "row", gap: 7 },
  stat: {
    flex: 1,
    minHeight: 100,
    borderRadius: 12,
    backgroundColor: C.card,
    padding: 11,
    justifyContent: "space-between",
  },
  statValue: { color: C.text, fontSize: 23, fontWeight: "900" },
  limePill: {
    color: C.ink,
    backgroundColor: C.lime,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 7,
    fontWeight: "900",
  },
  privileges: {
    backgroundColor: C.card,
    borderRadius: 15,
    padding: 14,
    gap: 14,
  },
  privilege: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3c4a12",
    alignItems: "center",
    justifyContent: "center",
  },
  privilegeTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
  },
  policy: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  disabledButton: {
    backgroundColor: C.high,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    opacity: 0.5,
  },
  disabledText: { color: C.muted, fontSize: 8, fontWeight: "900" },
});
