import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { homeClubs } from "@/constants/package-detail";
import { useAuth } from "@/context/AuthContext";
import {
  CheckInApiError,
  createCheckInToken,
  type CheckInQrToken,
} from "@/lib/check-in-api";

const C = {
  bg: "#111316",
  card: "#1e2023",
  low: "#1a1c1f",
  high: "#282a2d",
  text: "#e2e2e6",
  muted: "#aeb59e",
  lime: "#c3f400",
  mint: "#4edea3",
  ink: "#161e00",
};
const club = {
  ...homeClubs[0],
  address: "Tầng 3, 72 Lê Thánh Tôn & 45A Lý Tự Trọng, Q.1, TP.HCM",
  gate: "SẴN SÀNG QUÉT",
  capacity: 38,
};

export default function CheckInPassScreen() {
  const { user } = useAuth();
  const accountId = user?.accountId;
  const { width } = useWindowDimensions();
  const [token, setToken] = useState<CheckInQrToken | null>();
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requestToken = useCallback(async () => {
    if (!accountId) {
      setToken(null);
      setError("Không tìm thấy tài khoản đăng nhập.");
      return;
    }
    try {
      const next = await createCheckInToken(accountId);
      setToken(next);
      setSeconds(next.expiresIn);
      setError("");
    } catch (loadError) {
      setToken(null);
      setError(
        loadError instanceof CheckInApiError
          ? loadError.message
          : "Không thể tải mã QR check-in.",
      );
    }
  }, [accountId]);

  useFocusEffect(
    useCallback(() => {
      requestToken();
    }, [requestToken]),
  );

  useEffect(() => {
    if (!token) return;
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(token.expiresAt).getTime() - Date.now()) / 1000),
      );
      setSeconds(remaining);
      if (!remaining) {
        setToken(null);
        requestToken();
      }
    };
    tick();
    const timer = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timer);
  }, [requestToken, token]);
  const qrSize = Math.min(230, width - 96);
  const memberCode = token ? `QA-${token.DangKyID}` : "";
  const initials = (user?.name ?? "QA")
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/profile");
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.top}>
        <View style={s.brand}>
          <Ionicons name="flash" color={C.lime} size={19} />
          <Text style={s.brandText}>CHECK IN PASS</Text>
        </View>
        <Ionicons name="person-circle-outline" color={C.text} size={28} />
      </View>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heading}>
          <Pressable
            style={s.iconButton}
            onPress={back}
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" color={C.text} size={21} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>LỐI VÀO TỰ ĐỘNG</Text>
            <Text style={s.title}>CỔNG KIỂM SOÁT QR</Text>
          </View>
          <Pressable
            disabled
            style={s.iconButton}
            accessibilityLabel="Đèn pin không khả dụng vì màn hình không dùng camera"
          >
            <Ionicons name="flashlight-outline" color={C.muted} size={20} />
          </Pressable>
          <Pressable
            style={s.iconButton}
            onPress={() =>
              setNotice(
                "Thiết bị chưa có API điều khiển độ sáng. Hãy tăng sáng trong cài đặt nhanh.",
              )
            }
            accessibilityLabel="Hướng dẫn tăng sáng"
          >
            <Ionicons name="sunny-outline" color={C.lime} size={21} />
          </Pressable>
        </View>
        {notice ? (
          <Pressable onPress={() => setNotice("")} style={s.notice}>
            <Text style={s.noticeText}>{notice}</Text>
          </Pressable>
        ) : null}
        <View style={s.tabs}>
          <Tab
            active
            label="MÃ CÁ NHÂN"
            icon="id-card-outline"
            onPress={() => undefined}
          />
          <Tab
            active={false}
            disabled
            label="MÃ KHÁCH MỜI (+1)"
            icon="person-add-outline"
            onPress={() => undefined}
          />
        </View>
        <Text style={s.disabledReason}>Mã khách mời sẽ được hỗ trợ sau.</Text>
        <View style={s.club}>
          <View style={s.row}>
            <Ionicons name="location-outline" color={C.lime} size={22} />
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{club.name}</Text>
              <Text style={s.muted}>{club.address}</Text>
            </View>
            <View style={s.online} />
          </View>
          <Text style={s.demo}>QR DO BACKEND CẤP · DÀNH CHO CỔNG/NHÂN VIÊN QUÉT</Text>
          <View style={s.statusRow}>
            <Status
              icon="radio-outline"
              label="CỔNG BARRIER"
              value={club.gate}
            />
            <Status
              icon="speedometer-outline"
              label="MẬT ĐỘ TẬP"
              value={`${club.capacity}% (Vắng)`}
            />
          </View>
        </View>
        {token === undefined ? (
          <Text style={s.center}>Đang tải thẻ hội viên...</Text>
        ) : !token ? (
          <View style={s.empty}>
            <Ionicons name="lock-closed-outline" color={C.lime} size={34} />
            <Text style={s.cardTitle}>Không thể cấp mã QR</Text>
            <Text style={s.muted}>{error || "Bạn chưa có gói tập đang hoạt động."}</Text>
            <Pressable
              style={s.primary}
              onPress={requestToken}
            >
              <Text style={s.primaryText}>THỬ LẠI</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.pass}>
            <View style={s.identity}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{user?.name.toUpperCase()}</Text>
                <View style={s.row}>
                  <Text style={s.badge}>
                    MEMBER PASS
                  </Text>
                  <Text style={s.muted}>#{memberCode}</Text>
                </View>
              </View>
              <Ionicons name="flash" color={C.lime} size={22} />
            </View>
            <View style={s.timer}>
              <Text style={s.timerText}>
                ↻ LÀM MỚI BẢO MẬT:{" "}
                <Text style={{ color: C.lime }}>{seconds}s</Text>
              </Text>
              <View style={s.timerTrack}>
                <View
                  style={[
                    s.timerFill,
                    { width: `${(seconds / token.expiresIn) * 100}%` },
                  ]}
                />
              </View>
            </View>
            {token ? (
              <View
                style={s.qr}
                accessible
                accessibilityLabel={`QR token ${token.token}`}
              >
                <QRCode
                  value={token.token}
                  size={qrSize}
                  backgroundColor="#fff"
                  color="#0c0e11"
                  ecl="M"
                />
                <Text style={s.qrLabel}>♢ MÃ QR ĐƯỢC BACKEND KÝ</Text>
              </View>
            ) : null}
            <View style={s.localWarning}>
              <Ionicons
                name="shield-checkmark-outline"
                color={C.mint}
                size={18}
              />
              <Text style={s.muted}>
                Mã hết hạn sau {token.expiresIn} giây và tự động làm mới. Chỉ
                cổng hoặc nhân viên mới thực hiện scan check-in.
              </Text>
            </View>
          </View>
        )}
        <View style={s.steps}>
          <Text style={s.sectionTitle}>QUY TRÌNH VÀO PHÒNG</Text>
          {[
            "Đưa mã trước mắt đọc cảm biến",
            "Đợi tín hiệu đèn xanh và tiếng bíp",
            "Nhận thông báo tủ đồ Smart Locker",
          ].map((text, index) => (
            <View style={s.step} key={text}>
              <Text style={s.stepNumber}>0{index + 1}</Text>
              <Text style={s.stepText}>{text}</Text>
            </View>
          ))}
        </View>
        <Pressable
          style={s.history}
          onPress={() => router.push("/check-in-history")}
        >
          <Ionicons name="time-outline" color={C.text} size={18} />
          <Text style={s.historyText}>LỊCH SỬ VÀO CỔNG</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
function Tab({
  active,
  disabled,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[s.tab, active && s.tabActive, disabled && s.disabled]}
    >
      <Ionicons name={icon} color={active ? C.ink : C.muted} size={17} />
      <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}
function Status({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={s.status}>
      <Ionicons name={icon} color={C.mint} size={17} />
      <View>
        <Text style={s.statusLabel}>{label}</Text>
        <Text style={s.statusValue}>{value}</Text>
      </View>
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
  brandText: { color: C.text, fontSize: 17, fontWeight: "900" },
  content: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    padding: 15,
    gap: 14,
    paddingBottom: 35,
  },
  heading: { flexDirection: "row", alignItems: "center", gap: 9 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { color: C.muted, fontSize: 10, fontWeight: "800" },
  title: { color: C.text, fontSize: 18, fontWeight: "900" },
  notice: { backgroundColor: "#2a301c", borderRadius: 9, padding: 10 },
  noticeText: { color: C.lime, fontSize: 12 },
  tabs: {
    flexDirection: "row",
    backgroundColor: C.low,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  tabActive: { backgroundColor: C.lime },
  tabText: { color: C.muted, fontSize: 11, fontWeight: "900" },
  tabTextActive: { color: C.ink },
  disabled: { opacity: 0.38 },
  disabledReason: { color: C.muted, fontSize: 11, marginTop: -9 },
  club: { backgroundColor: C.card, borderRadius: 14, padding: 15, gap: 11 },
  row: { flexDirection: "row", alignItems: "center", gap: 7 },
  cardTitle: { color: C.text, fontSize: 17, fontWeight: "900" },
  muted: { color: C.muted, fontSize: 12, lineHeight: 16 },
  online: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.mint },
  demo: { color: "#d5b976", fontSize: 9, fontWeight: "800" },
  statusRow: { flexDirection: "row", gap: 8 },
  status: {
    flex: 1,
    minHeight: 54,
    backgroundColor: C.high,
    borderRadius: 9,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusLabel: { color: C.muted, fontSize: 8, fontWeight: "800" },
  statusValue: { color: C.mint, fontSize: 10, fontWeight: "900" },
  center: { color: C.muted, textAlign: "center", padding: 30 },
  empty: {
    backgroundColor: C.card,
    borderRadius: 16,
    alignItems: "center",
    padding: 24,
    gap: 10,
  },
  primary: {
    backgroundColor: C.lime,
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryText: { color: C.ink, fontSize: 12, fontWeight: "900" },
  pass: {
    backgroundColor: C.card,
    borderRadius: 17,
    padding: 16,
    alignItems: "center",
    gap: 14,
  },
  identity: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: C.high,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: C.lime, fontWeight: "900" },
  badge: {
    color: C.ink,
    backgroundColor: C.lime,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 2,
    fontSize: 9,
    fontWeight: "900",
  },
  timer: {
    width: "100%",
    backgroundColor: "#0c0e11",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timerText: { color: C.text, fontSize: 10, fontWeight: "900", flex: 1 },
  timerTrack: {
    width: 88,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.high,
    overflow: "hidden",
  },
  timerFill: { height: 7, backgroundColor: C.lime },
  qr: {
    maxWidth: 286,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 9,
  },
  qrLabel: { color: "#111316", fontSize: 9, fontWeight: "900" },
  barcodeHint: { color: C.muted, fontSize: 9, fontWeight: "800" },
  barcode: {
    maxWidth: 286,
    width: "100%",
    minHeight: 67,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "flex-start",
  },
  barcodeText: {
    position: "absolute",
    bottom: 4,
    left: 12,
    right: 12,
    textAlign: "center",
    color: "#111",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "800",
  },
  localWarning: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  steps: { gap: 8 },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: "900" },
  step: {
    backgroundColor: C.card,
    borderRadius: 11,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  stepNumber: { color: C.lime, fontSize: 17, fontWeight: "900" },
  stepText: { color: C.text, fontSize: 13, flex: 1 },
  history: {
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: C.high,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  historyText: { color: C.text, fontSize: 12, fontWeight: "900" },
});
