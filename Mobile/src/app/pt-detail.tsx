import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getPTDetail, type ApiPT } from "@/lib/pt-api";

const fallback = require("../../assets/images/icon.png");
const money = (value: string | number) => `${Number(value).toLocaleString("vi-VN")}đ`;

export default function PTDetailScreen() {
  const { trainerId } = useLocalSearchParams<{ trainerId?: string }>();
  const ptId = Number(trainerId);
  const validId = Number.isInteger(ptId) && ptId > 0;
  const [trainer, setTrainer] = useState<ApiPT | null>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!validId) {
      return;
    }
    getPTDetail(ptId)
      .then((row) => { if (active) { setTrainer(row); setError(""); } })
      .catch((loadError) => { if (active) { setTrainer(null); setError(loadError instanceof Error ? loadError.message : "Không tải được PT."); } });
    return () => { active = false; };
  }, [ptId, validId]);
  const displayError = validId ? error : "PTID không hợp lệ.";

  const back = () => router.canGoBack() ? router.back() : router.replace("/pt");
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Pressable style={s.icon} onPress={back}><Ionicons name="arrow-back" color="#eef4e8" size={21} /></Pressable>
        <Text style={s.headerTitle}>CHI TIẾT HUẤN LUYỆN VIÊN</Text>
        <View style={s.icon} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {trainer === undefined ? <Text style={s.center}>Đang tải thông tin PT...</Text> : null}
        {!trainer && displayError ? <Text style={s.error}>{displayError}</Text> : null}
        {trainer ? (
          <>
            <Image source={trainer.AnhDaiDien ? { uri: trainer.AnhDaiDien } : fallback} style={s.hero} contentFit="cover" />
            <View style={s.card}>
              <Text style={s.name}>{trainer.HoTen}</Text>
              <Text style={s.specialty}>{trainer.ChuyenMon || "Chưa cập nhật chuyên môn"}</Text>
              <Info label="KINH NGHIỆM" value={trainer.KinhNghiem || "Chưa cập nhật"} />
              <Info label="GIÁ THUÊ" value={`${money(trainer.GiaThue)} / buổi`} accent />
              <Info label="EMAIL" value={trainer.Email || "Chưa cập nhật"} />
              <Info label="SỐ ĐIỆN THOẠI" value={trainer.SoDienThoai || "Chưa cập nhật"} />
              <Pressable
                style={s.primary}
                onPress={() => router.push({ pathname: "/pt-booking", params: { trainerId: String(trainer.PTID) } })}
              >
                <Text style={s.primaryText}>ĐẶT LỊCH THUÊ PT</Text>
                <Ionicons name="calendar-outline" color="#182000" size={18} />
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <View style={s.info}><Text style={s.label}>{label}</Text><Text style={[s.value, accent && s.accent]}>{value}</Text></View>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0d1011" },
  header: { height: 54, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#242829", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#eef4e8", fontSize: 12, fontWeight: "900" },
  content: { width: "100%", maxWidth: 540, alignSelf: "center", padding: 15, gap: 12, paddingBottom: 35 },
  center: { color: "#aeb9ad", textAlign: "center", padding: 35 },
  error: { color: "#ff8d82", textAlign: "center", padding: 35 },
  hero: { width: "100%", height: 320, borderRadius: 16, backgroundColor: "#242829" },
  card: { backgroundColor: "#1b2022", borderRadius: 15, padding: 16, gap: 13 },
  name: { color: "#f0f5eb", fontSize: 25, fontWeight: "900" },
  specialty: { color: "#d9ff00", fontSize: 12, fontWeight: "900" },
  info: { borderTopWidth: 1, borderTopColor: "#303638", paddingTop: 11, gap: 5 },
  label: { color: "#8e998d", fontSize: 9, fontWeight: "900" },
  value: { color: "#e8efe4", fontSize: 13, lineHeight: 19 },
  accent: { color: "#49d79e", fontSize: 17, fontWeight: "900" },
  primary: { minHeight: 50, backgroundColor: "#caff00", borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryText: { color: "#182000", fontSize: 12, fontWeight: "900" },
});
