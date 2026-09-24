import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { cancelPTBooking, getMyPTBookings, type ApiPTBooking } from "@/lib/pt-api";

const labels: Record<ApiPTBooking["TrangThai"], string> = {
  PENDING: "CHỜ XÁC NHẬN",
  CONFIRMED: "ĐÃ XÁC NHẬN",
  COMPLETED: "HOÀN THÀNH",
  CANCELLED: "ĐÃ HỦY",
};
const money = (value: string | number) => `${Number(value).toLocaleString("vi-VN")}đ`;

export default function PTScheduleScreen() {
  const { user } = useAuth();
  const accountId = user?.accountId;
  const [bookings, setBookings] = useState<ApiPTBooking[]>();
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  const load = useCallback(async () => {
    if (!accountId) {
      setBookings([]);
      setError("Không tìm thấy tài khoản đăng nhập.");
      return;
    }
    try {
      setBookings(await getMyPTBookings(accountId));
      setNow(Date.now());
      setError("");
    } catch (loadError) {
      setBookings([]);
      setError(loadError instanceof Error ? loadError.message : "Không tải được lịch thuê PT.");
    }
  }, [accountId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function askCancel(booking: ApiPTBooking) {
    Alert.alert("Hủy lịch PT", `Bạn muốn hủy lịch với ${booking.HoTenPT}?`, [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy lịch",
        style: "destructive",
        onPress: async () => {
          if (!user?.accountId || cancelling) return;
          setCancelling(booking.ThuePTID);
          try {
            await cancelPTBooking({ accountId: user.accountId, bookingId: booking.ThuePTID });
            await load();
          } catch (cancelError) {
            Alert.alert("Không thể hủy", cancelError instanceof Error ? cancelError.message : "Vui lòng thử lại.");
          } finally {
            setCancelling(null);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Pressable style={s.icon} onPress={() => router.canGoBack() ? router.back() : router.replace("/profile")}><Ionicons name="arrow-back" color="#eef4e8" size={21} /></Pressable>
        <Text style={s.headerTitle}>LỊCH THUÊ PT</Text>
        <Pressable style={s.add} onPress={() => router.push("/pt")}><Ionicons name="add" color="#182000" size={22} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.kicker}>DỮ LIỆU TỪ HỆ THỐNG</Text>
        <Text style={s.title}>LỊCH PT CỦA TÔI</Text>
        {bookings === undefined ? <Text style={s.center}>Đang tải lịch PT...</Text> : null}
        {error ? <Text style={s.error}>{error}</Text> : null}
        {bookings && !bookings.length && !error ? (
          <View style={s.empty}>
            <Ionicons name="calendar-outline" color="#d9ff00" size={36} />
            <Text style={s.cardTitle}>Bạn chưa có lịch thuê PT</Text>
            <Pressable style={s.primary} onPress={() => router.push("/pt")}><Text style={s.primaryText}>CHỌN HUẤN LUYỆN VIÊN</Text></Pressable>
          </View>
        ) : null}
        {bookings?.map((booking) => {
          const start = new Date(`${booking.NgayLam}T${booking.GioBatDau}`);
          const cancellable = ["PENDING", "CONFIRMED"].includes(booking.TrangThai) && start.getTime() > now;
          return (
            <View key={booking.ThuePTID} style={s.card}>
              <View style={s.cardHead}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{booking.HoTenPT}</Text>
                  <Text style={s.specialty}>{booking.ChuyenMon || "Chưa cập nhật chuyên môn"}</Text>
                </View>
                <Text style={[s.status, booking.TrangThai === "CANCELLED" && s.cancelled]}>{labels[booking.TrangThai]}</Text>
              </View>
              <Row label="Ngày tập" value={new Date(`${booking.NgayLam}T00:00:00`).toLocaleDateString("vi-VN")} />
              <Row label="Khung giờ" value={`${booking.GioBatDau.slice(0, 5)} - ${booking.GioKetThuc.slice(0, 5)}`} />
              <Row label="Giá thuê" value={money(booking.GiaThue)} />
              {booking.GhiChu ? <Row label="Ghi chú" value={booking.GhiChu} /> : null}
              {cancellable ? (
                <Pressable disabled={cancelling === booking.ThuePTID} style={s.cancelButton} onPress={() => askCancel(booking)}>
                  <Text style={s.cancelText}>{cancelling === booking.ThuePTID ? "ĐANG HỦY..." : "HỦY LỊCH"}</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <View style={s.row}><Text style={s.muted}>{label}</Text><Text style={s.value}>{value}</Text></View>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0d1011" },
  header: { height: 54, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#242829", alignItems: "center", justifyContent: "center" },
  add: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#caff00", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#eef4e8", fontSize: 12, fontWeight: "900" },
  content: { width: "100%", maxWidth: 540, alignSelf: "center", padding: 15, gap: 12, paddingBottom: 35 },
  kicker: { color: "#d9ff00", fontSize: 9, fontWeight: "900" },
  title: { color: "#f0f5eb", fontSize: 22, fontWeight: "900" },
  center: { color: "#aeb9ad", textAlign: "center", padding: 30 },
  error: { color: "#ff8d82", textAlign: "center", padding: 15 },
  empty: { backgroundColor: "#1b2022", borderRadius: 14, padding: 25, alignItems: "center", gap: 12 },
  card: { backgroundColor: "#1b2022", borderRadius: 13, padding: 14, gap: 10 },
  cardHead: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  cardTitle: { color: "#eef4e8", fontSize: 17, fontWeight: "900" },
  specialty: { color: "#d9ff00", fontSize: 9, marginTop: 3 },
  status: { color: "#182000", backgroundColor: "#caff00", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, fontSize: 8, fontWeight: "900" },
  cancelled: { color: "#ffaaa1", backgroundColor: "#442b2b" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, borderTopWidth: 1, borderTopColor: "#303638", paddingTop: 9 },
  muted: { color: "#8e998d", fontSize: 10 },
  value: { color: "#e8efe4", fontSize: 11, fontWeight: "700", textAlign: "right", flex: 1 },
  cancelButton: { minHeight: 40, backgroundColor: "#3a2a2a", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cancelText: { color: "#ff9f96", fontSize: 10, fontWeight: "900" },
  primary: { minHeight: 44, backgroundColor: "#caff00", borderRadius: 9, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#182000", fontSize: 10, fontWeight: "900" },
});
