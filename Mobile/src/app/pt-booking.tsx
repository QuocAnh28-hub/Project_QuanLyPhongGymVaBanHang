import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import {
  bookPT,
  getAvailablePTSchedules,
  getPTDetail,
  PTApiError,
  type ApiPT,
  type ApiPTSchedule,
} from "@/lib/pt-api";

const money = (value: string | number) => `${Number(value).toLocaleString("vi-VN")}đ`;

export default function PTBookingScreen() {
  const { user } = useAuth();
  const { trainerId } = useLocalSearchParams<{ trainerId?: string }>();
  const ptId = Number(trainerId);
  const [trainer, setTrainer] = useState<ApiPT | null>();
  const [schedules, setSchedules] = useState<ApiPTSchedule[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!Number.isInteger(ptId) || ptId <= 0) {
      setTrainer(null);
      setError("PTID không hợp lệ.");
      return;
    }
    try {
      const [pt, slots] = await Promise.all([getPTDetail(ptId), getAvailablePTSchedules(ptId)]);
      setTrainer(pt);
      setSchedules(slots);
      setSelected((current) => slots.some((slot) => slot.LichPTID === current) ? current : null);
      setSelectedDate((current) => current && slots.some((slot) => slot.NgayLam === current) ? current : (slots[0]?.NgayLam ?? ""));
      setError("");
    } catch (loadError) {
      setTrainer(null);
      setSchedules([]);
      setError(loadError instanceof Error ? loadError.message : "Không tải được lịch PT.");
    }
  }, [ptId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const dates = useMemo(() => [...new Set(schedules.map((slot) => slot.NgayLam))], [schedules]);
  const visibleSlots = schedules.filter((slot) => slot.NgayLam === selectedDate);

  async function submit() {
    if (!user?.accountId || !selected || loading) return;
    setLoading(true);
    try {
      await bookPT({ accountId: user.accountId, scheduleId: selected, note });
      Alert.alert("Thành công", "Đăng ký lịch PT thành công", [
        { text: "Xem lịch", onPress: () => router.replace("/pt-schedule") },
      ]);
    } catch (submitError) {
      const apiError = submitError instanceof PTApiError ? submitError : null;
      if (apiError?.code === "SLOT_NOT_AVAILABLE") {
        Alert.alert("Lịch vừa được đặt", "Lịch này vừa được người khác đặt. Vui lòng chọn khung giờ khác.");
        await load();
      } else {
        Alert.alert("Không thể đăng ký", apiError?.code === "BOOKING_EXISTS" ? "Bạn đã đăng ký khung giờ này." : (apiError?.message || "Vui lòng thử lại."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Pressable style={s.icon} onPress={() => router.back()}><Ionicons name="arrow-back" color="#eef4e8" size={21} /></Pressable>
        <Text style={s.headerTitle}>ĐĂNG KÝ LỊCH PT</Text><View style={s.icon} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {trainer === undefined ? <Text style={s.center}>Đang tải lịch trống...</Text> : null}
        {error ? <Text style={s.error}>{error}</Text> : null}
        {trainer ? (
          <>
            <View style={s.card}>
              <Text style={s.label}>HUẤN LUYỆN VIÊN</Text>
              <Text style={s.name}>{trainer.HoTen}</Text>
              <Text style={s.specialty}>{trainer.ChuyenMon || "Chưa cập nhật chuyên môn"}</Text>
              <Text style={s.price}>{money(trainer.GiaThue)} / buổi</Text>
            </View>

            <Text style={s.section}>CHỌN NGÀY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
              {dates.map((date) => (
                <Pressable key={date} onPress={() => { setSelectedDate(date); setSelected(null); }} style={[s.choice, selectedDate === date && s.choiceActive]}>
                  <Text style={[s.choiceText, selectedDate === date && s.choiceTextActive]}>{new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={s.section}>CHỌN KHUNG GIỜ</Text>
            <View style={s.slots}>
              {visibleSlots.map((slot) => (
                <Pressable key={slot.LichPTID} onPress={() => setSelected(slot.LichPTID)} style={[s.slot, selected === slot.LichPTID && s.choiceActive]}>
                  <Text style={[s.slotText, selected === slot.LichPTID && s.choiceTextActive]}>{slot.GioBatDau.slice(0, 5)} - {slot.GioKetThuc.slice(0, 5)}</Text>
                </Pressable>
              ))}
              {!visibleSlots.length ? <Text style={s.muted}>Không có lịch AVAILABLE trong ngày này.</Text> : null}
            </View>

            <Text style={s.section}>GHI CHÚ CHO PT</Text>
            <TextInput value={note} onChangeText={setNote} maxLength={500} multiline placeholder="Ví dụ: Muốn tập trung tăng cơ" placeholderTextColor="#727d73" style={s.input} />
            <Pressable disabled={!selected || loading || !user?.accountId} onPress={submit} style={[s.primary, (!selected || loading || !user?.accountId) && s.disabled]}>
              <Text style={s.primaryText}>{loading ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ LỊCH PT"}</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0d1011" },
  header: { height: 54, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#242829", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#eef4e8", fontSize: 12, fontWeight: "900" },
  content: { width: "100%", maxWidth: 540, alignSelf: "center", padding: 15, gap: 12, paddingBottom: 35 },
  center: { color: "#aeb9ad", textAlign: "center", padding: 35 },
  error: { color: "#ff8d82", textAlign: "center", padding: 20 },
  card: { backgroundColor: "#1b2022", borderRadius: 13, padding: 15, gap: 6 },
  label: { color: "#8e998d", fontSize: 9, fontWeight: "900" },
  name: { color: "#f0f5eb", fontSize: 21, fontWeight: "900" },
  specialty: { color: "#d9ff00", fontSize: 10, fontWeight: "800" },
  price: { color: "#49d79e", fontSize: 15, fontWeight: "900", marginTop: 5 },
  section: { color: "#e8efe4", fontSize: 11, fontWeight: "900", marginTop: 6 },
  row: { gap: 8 },
  choice: { backgroundColor: "#242829", borderRadius: 9, paddingHorizontal: 13, paddingVertical: 11 },
  choiceActive: { backgroundColor: "#caff00" },
  choiceText: { color: "#aeb9ad", fontSize: 10, fontWeight: "900" },
  choiceTextActive: { color: "#182000" },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slot: { backgroundColor: "#242829", borderRadius: 9, padding: 12 },
  slotText: { color: "#eef4e8", fontSize: 11, fontWeight: "800" },
  muted: { color: "#aeb9ad", fontSize: 11 },
  input: { minHeight: 90, backgroundColor: "#1b2022", color: "#eef4e8", borderRadius: 10, padding: 12, textAlignVertical: "top" },
  primary: { minHeight: 52, backgroundColor: "#caff00", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.45 },
  primaryText: { color: "#182000", fontSize: 12, fontWeight: "900" },
});
