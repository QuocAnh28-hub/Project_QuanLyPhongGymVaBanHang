import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthColors as C } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { formatVND } from "@/lib/package-logic";
import {
  getEnrollment,
  type MembershipEnrollment,
  type PaymentMethod,
} from "@/lib/membership";

const paymentNames: Record<PaymentMethod, string> = {
  vietqr: "VietQR / Chuyển khoản 24/7",
  card: "Thẻ tín dụng / Ghi nợ quốc tế",
  wallet: "Ví điện tử",
  pos: "Thanh toán trực tiếp tại quầy",
};

export default function PackagePaymentScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<MembershipEnrollment | null>();
  useEffect(() => {
    let active = true;
    if (user && typeof orderId === "string")
      getEnrollment(user.email, orderId).then((row) => {
        if (active) setOrder(row);
      });
    return () => {
      active = false;
    };
  }, [orderId, user]);
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.replace("/packages")}>
          <Ionicons name="close" color={C.text} size={22} />
        </Pressable>
        <Text style={s.headerTitle}>THANH TOÁN GÓI TẬP</Text>
        <Pressable onPress={() => router.push("/profile")}>
          <Ionicons name="person-circle-outline" color={C.text} size={25} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Stepper />
        {order === undefined ? (
          <Text style={s.muted}>Đang tải đơn...</Text>
        ) : !order ? (
          <View style={s.card}>
            <Text style={s.title}>Không tìm thấy đơn đăng ký.</Text>
          </View>
        ) : (
          <>
            <View style={s.statusIcon}>
              <Ionicons name="time-outline" color={C.lime} size={38} />
            </View>
            <Text style={s.status}>CHỜ THANH TOÁN</Text>
            <Text style={s.intro}>
              Đơn đăng ký đã được lưu. Gói tập chưa được kích hoạt.
            </Text>
            <View style={s.card}>
              <Row label="Mã đơn" value={order.id} />
              <Row
                label="Gói tập"
                value={`${order.packageName} · ${order.durationMonths} tháng`}
              />
              <Row
                label="Số tiền"
                value={formatVND(order.finalAmount ?? order.totalPrice)}
                accent
              />
              <Row
                label="Phương thức"
                value={paymentNames[order.paymentMethod] ?? order.paymentMethod}
              />
              <Row
                label="Ngày kích hoạt"
                value={order.activationDate ?? order.startDate}
              />
              <Row label="Ngày hết hạn" value={order.expiryDate} />
            </View>
            <View style={s.notice}>
              <Ionicons
                name={
                  order.paymentMethod === "pos"
                    ? "storefront-outline"
                    : "information-circle-outline"
                }
                color={C.lime}
                size={23}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.noticeTitle}>
                  {order.paymentMethod === "pos"
                    ? "Thanh toán tại lễ tân QA-Gym"
                    : "Cổng thanh toán chưa được kết nối"}
                </Text>
                <Text style={s.muted}>
                  {order.paymentMethod === "pos"
                    ? "Vui lòng cung cấp mã đơn tại quầy. Hội viên chỉ được kích hoạt sau khi lễ tân xác nhận thanh toán."
                    : "Phương thức này chưa được kết nối trong bản hiện tại. Đơn vẫn ở trạng thái chờ thanh toán; không có giao dịch nào được xác nhận."}
                </Text>
              </View>
            </View>
            <Pressable
              style={s.primary}
              onPress={() => router.replace("/profile")}
            >
              <Text style={s.primaryText}>XEM ĐƠN TRONG HỒ SƠ</Text>
              <Ionicons name="arrow-forward" color={C.surfaceLowest} />
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function Stepper() {
  return (
    <View style={s.stepper}>
      {["CHỌN GÓI", "THÔNG TIN", "THANH TOÁN"].map((label, index) => (
        <View style={s.step} key={label}>
          <View style={s.stepCircle}>
            {index < 2 ? (
              <Ionicons name="checkmark" color={C.surfaceLowest} size={14} />
            ) : (
              <Text style={s.stepNumber}>03</Text>
            )}
          </View>
          <Text style={s.stepLabel}>{label}</Text>
          {index < 2 ? <View style={s.track} /> : null}
        </View>
      ))}
    </View>
  );
}
function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={s.row}>
      <Text style={s.muted}>{label}</Text>
      <Text style={[s.value, accent && s.accent]}>{value}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceLow,
  },
  headerTitle: { flex: 1, color: C.text, fontSize: 14, fontWeight: "800" },
  content: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    padding: 14,
    gap: 15,
  },
  stepper: {
    flexDirection: "row",
    backgroundColor: C.surfaceLow,
    borderRadius: 12,
    padding: 12,
  },
  step: { flex: 1, alignItems: "center", position: "relative" },
  stepCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: C.lime,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepNumber: { color: C.surfaceLowest, fontSize: 10, fontWeight: "900" },
  stepLabel: { color: C.lime, fontSize: 9, fontWeight: "800", marginTop: 5 },
  track: {
    position: "absolute",
    top: 12,
    left: "62%",
    width: "76%",
    height: 2,
    backgroundColor: C.lime,
  },
  statusIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: C.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 18,
  },
  status: {
    color: C.lime,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  intro: { color: C.muted, fontSize: 13, lineHeight: 18, textAlign: "center" },
  card: { backgroundColor: C.surface, borderRadius: 13, padding: 14, gap: 12 },
  title: { color: C.text, fontSize: 17, fontWeight: "800" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceHigh,
    paddingBottom: 10,
  },
  muted: { color: C.muted, fontSize: 12, lineHeight: 17, flex: 1 },
  value: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    flex: 1.5,
  },
  accent: { color: C.lime, fontSize: 17, fontWeight: "900" },
  notice: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 13,
    padding: 14,
  },
  noticeTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },
  primary: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: C.lime,
    borderRadius: 11,
  },
  primaryText: { color: C.surfaceLowest, fontSize: 12, fontWeight: "900" },
});
