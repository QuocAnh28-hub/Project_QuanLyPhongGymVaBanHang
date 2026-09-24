import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthColors as C } from "@/constants/theme";
import { formatVND } from "@/lib/package-logic";
import {
  backendPaymentMethodNames,
  getPackagePaymentDetail,
  type PackagePayment,
} from "@/lib/payment-api";

export default function PackagePaymentScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { paymentId } = useLocalSearchParams<{ paymentId?: string }>();
  const id = Number(paymentId);
  const validId = Number.isInteger(id) && id > 0;
  const [loadedPayment, setPayment] = useState<PackagePayment | null>();
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [reportedPaid, setReportedPaid] = useState(false);
  const order = loadedPayment?.ThanhToanID === id ? loadedPayment : undefined;
  const success =
    order?.TrangThaiThanhToan === "SUCCESS" &&
    order.TrangThaiDangKy === "ACTIVE";
  const failed = order?.TrangThaiThanhToan === "FAILED";
  const cancelled = order?.TrangThaiThanhToan === "CANCELLED";
  const pending = order?.TrangThaiThanhToan === "PENDING";

  async function copy(value: string, message: string) {
    try {
      await Clipboard.setStringAsync(value);
      Alert.alert(message);
    } catch {
      Alert.alert("Không thể sao chép", "Vui lòng thử lại.");
    }
  }

  useEffect(() => {
    let active = true;
    if (!validId) return;

    getPackagePaymentDetail(id)
      .then((row) => {
        if (active) {
          setPayment(row);
          setError("");
        }
      })
      .catch((loadError) => {
        if (active) {
          setPayment(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không tải được thanh toán gói tập.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [id, reload, validId]);

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

        {!validId ? (
          <View style={s.card}>
            <Text style={s.title}>Mã thanh toán không hợp lệ.</Text>
          </View>
        ) : order === undefined && !error ? (
          <Text style={s.muted}>Đang tải đăng ký từ hệ thống...</Text>
        ) : !order ? (
          <View style={s.card}>
            <Text style={s.title}>Không tìm thấy đăng ký gói tập.</Text>
            {error ? <Text style={s.error}>{error}</Text> : null}
          </View>
        ) : (
          <>
            <View style={s.statusIcon}>
              <Ionicons
                name={
                  success
                    ? "checkmark-circle-outline"
                    : failed
                      ? "close-circle-outline"
                      : cancelled
                        ? "ban-outline"
                    : "time-outline"
                }
                color={failed || cancelled ? C.error : C.lime}
                size={38}
              />
            </View>
            <Text style={[s.status, (failed || cancelled) && s.statusError]}>
              {success
                ? "THANH TOÁN THÀNH CÔNG"
                : failed
                  ? "THANH TOÁN THẤT BẠI"
                  : cancelled
                    ? "THANH TOÁN ĐÃ HỦY"
                    : "CHỜ THANH TOÁN"}
            </Text>
            <Text style={s.intro}>
              {success
                ? "Gói tập đã được kích hoạt."
                : "Gói tập chưa được kích hoạt."}
            </Text>

            <View style={s.card}>
              <Row label="Mã thanh toán" value={String(order.ThanhToanID)} />
              <Row label="Mã đăng ký" value={String(order.DangKyID)} />
              <Row
                label="Gói tập"
                value={order.TenGoi}
              />
              <Row label="Thời hạn" value={`${order.SoThang} tháng`} />
              <Row label="Tháng tặng" value={`${order.ThangTang} tháng`} />
              <Row
                label="Số tiền"
                value={formatVND(Number(order.SoTien))}
                accent
              />
              <Row
                label="Phương thức"
                value={backendPaymentMethodNames[order.PhuongThucThanhToan]}
              />
              <Row label="Ngày kích hoạt" value={order.NgayBatDau} />
              <Row label="Ngày hết hạn" value={order.NgayKetThuc} />
              <Row label="Thanh toán" value={order.TrangThaiThanhToan} />
              <Row label="Đăng ký" value={order.TrangThaiDangKy} />
            </View>

            {order.PhuongThucThanhToan === "CHUYEN_KHOAN" && pending ? (
              <View style={s.qrCard}>
                <Text style={s.qrTitle}>QUÉT MÃ VIETQR ĐỂ THANH TOÁN</Text>
                <Image
                  source={require("../../assets/payment/techcombank-vietqr.png")}
                  style={[
                    s.qrImage,
                    {
                      width: Math.min(screenWidth - 52, 300),
                      height: Math.min(screenWidth - 52, 300) * (16 / 9),
                    },
                  ]}
                  resizeMode="contain"
                />
                <View style={s.transferRow}>
                  <View style={s.transferValue}>
                    <Text style={s.transferLabel}>SỐ TIỀN</Text>
                    <Text style={s.transferText}>{formatVND(Number(order.SoTien))}</Text>
                  </View>
                  <Pressable
                    style={s.copyButton}
                    accessibilityLabel="Sao chép số tiền"
                    onPress={() => copy(String(Math.round(Number(order.SoTien))), "Đã sao chép số tiền")}
                  >
                    <Ionicons name="copy-outline" color={C.lime} size={18} />
                    <Text style={s.copyText}>SAO CHÉP</Text>
                  </Pressable>
                </View>
                <View style={s.transferRow}>
                  <View style={s.transferValue}>
                    <Text style={s.transferLabel}>NỘI DUNG CHUYỂN KHOẢN</Text>
                    <Text style={s.transferText}>QAGYM TT{order.ThanhToanID}</Text>
                  </View>
                  <Pressable
                    style={s.copyButton}
                    accessibilityLabel="Sao chép nội dung chuyển khoản"
                    onPress={() => copy(`QAGYM TT${order.ThanhToanID}`, "Đã sao chép nội dung chuyển khoản")}
                  >
                    <Ionicons name="copy-outline" color={C.lime} size={18} />
                    <Text style={s.copyText}>SAO CHÉP</Text>
                  </Pressable>
                </View>
                <Text style={s.qrNote}>
                  Vui lòng nhập đúng số tiền và nội dung để phòng gym đối soát thanh toán.
                </Text>
              </View>
            ) : null}

            <View style={s.notice}>
              <Ionicons
                name={
                  order.PhuongThucThanhToan === "TIEN_MAT"
                    ? "storefront-outline"
                    : "information-circle-outline"
                }
                color={C.lime}
                size={23}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.noticeTitle}>
                  {failed
                    ? "Thanh toán thất bại"
                    : cancelled
                      ? "Thanh toán đã hủy"
                      : order.PhuongThucThanhToan === "TIEN_MAT"
                    ? "Thanh toán tại lễ tân QA-Gym"
                    : success
                      ? "Đã xác nhận thanh toán"
                      : "Chưa xác nhận thanh toán"}
                </Text>
                <Text style={s.muted}>
                  {success
                    ? "Thanh toán đã được backend xác nhận."
                    : failed
                      ? "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác."
                      : cancelled
                        ? "Giao dịch này đã bị hủy và gói tập chưa được kích hoạt."
                        : order.PhuongThucThanhToan === "TIEN_MAT"
                      ? "Vui lòng cung cấp mã thanh toán tại quầy."
                      : order.PhuongThucThanhToan === "THE"
                        ? "Phương thức này chưa kết nối gateway thật."
                        : "Yêu cầu chuyển khoản đã được tạo. Cổng tự động chưa được kết nối."}
                </Text>
              </View>
            </View>

            {order.PhuongThucThanhToan === "CHUYEN_KHOAN" && pending ? (
              <>
                <Pressable
                  style={[s.primary, reportedPaid && s.disabled]}
                  disabled={reportedPaid}
                  onPress={() => setReportedPaid(true)}
                >
                  <Text style={s.primaryText}>
                    {reportedPaid ? "ĐÃ BÁO CHUYỂN KHOẢN" : "TÔI ĐÃ CHUYỂN KHOẢN"}
                  </Text>
                  <Ionicons name="checkmark" color={C.surfaceLowest} />
                </Pressable>
                {reportedPaid ? (
                  <Text style={s.reportedText}>
                    Đã ghi nhận yêu cầu, đang chờ xác nhận.
                  </Text>
                ) : null}
              </>
            ) : null}

            <Pressable style={s.secondary} onPress={() => setReload((x) => x + 1)}>
              <Text style={s.secondaryText}>TẢI LẠI TRẠNG THÁI</Text>
              <Ionicons name="refresh" color={C.text} />
            </Pressable>
            {success ? (
              <Pressable
                style={s.primary}
                onPress={() => router.replace("/membership-detail")}
              >
                <Text style={s.primaryText}>XEM GÓI TẬP CỦA TÔI</Text>
                <Ionicons name="card-outline" color={C.surfaceLowest} />
              </Pressable>
            ) : null}
            <Pressable
              style={s.primary}
              onPress={() => router.replace("/packages")}
            >
              <Text style={s.primaryText}>VỀ DANH SÁCH GÓI</Text>
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
    gap: 12,
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
    marginTop: 8,
  },
  status: {
    color: C.lime,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  statusError: { color: C.error },
  intro: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 13,
    padding: 12,
    gap: 8,
  },
  title: { color: C.text, fontSize: 17, fontWeight: "800" },
  error: { color: C.error, fontSize: 12, lineHeight: 17 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceHigh,
    paddingBottom: 7,
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
  qrCard: {
    backgroundColor: C.surface,
    borderRadius: 13,
    padding: 12,
    gap: 10,
    alignItems: "center",
  },
  qrTitle: { color: C.text, fontSize: 15, fontWeight: "900", textAlign: "center" },
  qrImage: { alignSelf: "center" },
  transferRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.surfaceHigh,
    borderRadius: 10,
    padding: 12,
  },
  transferValue: { flex: 1, gap: 4 },
  transferLabel: { color: C.muted, fontSize: 10, fontWeight: "800" },
  transferText: { color: C.text, fontSize: 17, fontWeight: "900" },
  copyButton: {
    minWidth: 74,
    height: 42,
    borderRadius: 9,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
  },
  copyText: { color: C.lime, fontSize: 9, fontWeight: "900" },
  qrNote: { color: C.muted, fontSize: 12, lineHeight: 17, textAlign: "center" },
  reportedText: { color: C.lime, fontSize: 12, lineHeight: 17, textAlign: "center" },
  disabled: { opacity: 0.6 },
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
  secondary: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: C.surfaceHigh,
    borderRadius: 11,
  },
  secondaryText: { color: C.text, fontSize: 12, fontWeight: "900" },
  primaryText: {
    color: C.surfaceLowest,
    fontSize: 12,
    fontWeight: "900",
  },
});
