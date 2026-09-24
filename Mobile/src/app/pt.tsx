import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/app/Common/header";
import { getActivePTs, type ApiPT } from "@/lib/pt-api";

const fallback = require("../../assets/images/icon.png");
const money = (value: string | number) => `${Number(value).toLocaleString("vi-VN")}đ`;

export default function PTScreen() {
  const [trainers, setTrainers] = useState<ApiPT[]>();
  const [filter, setFilter] = useState("Tất cả");
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getActivePTs()
        .then((rows) => {
          if (active) {
            setTrainers(rows);
            setError("");
          }
        })
        .catch((loadError) => {
          if (active) {
            setTrainers([]);
            setError(loadError instanceof Error ? loadError.message : "Không tải được danh sách PT.");
          }
        });
      return () => { active = false; };
    }, []),
  );

  const specialties = useMemo(
    () => [
      "Tất cả",
      ...new Set(
        (trainers ?? [])
          .map((trainer) => trainer.ChuyenMon?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ],
    [trainers],
  );
  const visible = filter === "Tất cả"
    ? trainers ?? []
    : (trainers ?? []).filter((trainer) => trainer.ChuyenMon === filter);

  return (
    <View style={s.container}>
      <SafeAreaView style={s.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Header />
          <View style={s.heading}>
            <View>
              <Text style={s.kicker}>HUẤN LUYỆN VIÊN QA-GYM</Text>
              <Text style={s.title}>CHỌN PT PHÙ HỢP</Text>
            </View>
            <Pressable style={s.schedule} onPress={() => router.push("/pt-schedule")}>
              <FontAwesome name="calendar" size={12} color="#182000" />
              <Text style={s.scheduleText}>LỊCH CỦA TÔI</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
            {specialties.map((item) => (
              <Pressable key={item} onPress={() => setFilter(item)} style={[s.chip, filter === item && s.chipActive]}>
                <Text style={[s.chipText, filter === item && s.chipTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {trainers === undefined ? <Text style={s.center}>Đang tải danh sách PT...</Text> : null}
          {error ? <Text style={s.error}>{error}</Text> : null}
          {trainers !== undefined && !visible.length && !error ? (
            <Text style={s.center}>Database chưa có PT ACTIVE phù hợp.</Text>
          ) : null}

          {visible.map((trainer) => (
            <Pressable
              key={trainer.PTID}
              style={s.card}
              onPress={() => router.push({ pathname: "/pt-detail", params: { trainerId: String(trainer.PTID) } })}
            >
              <Image source={trainer.AnhDaiDien ? { uri: trainer.AnhDaiDien } : fallback} style={s.image} contentFit="cover" />
              <View style={s.copy}>
                <Text style={s.name}>{trainer.HoTen}</Text>
                <Text style={s.specialty}>{trainer.ChuyenMon || "Chưa cập nhật chuyên môn"}</Text>
                <Text style={s.experience} numberOfLines={2}>{trainer.KinhNghiem || "Chưa cập nhật kinh nghiệm"}</Text>
                <Text style={s.price}>{money(trainer.GiaThue)} / buổi</Text>
              </View>
              <FontAwesome name="chevron-right" size={13} color="#d9ff00" />
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1011" },
  safe: { flex: 1, width: "100%", maxWidth: 540, alignSelf: "center" },
  content: { paddingHorizontal: 14, paddingBottom: 30, gap: 12 },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  kicker: { color: "#d9ff00", fontSize: 9, fontWeight: "900" },
  title: { color: "#f0f5eb", fontSize: 20, fontWeight: "900", marginTop: 3 },
  schedule: { flexDirection: "row", gap: 6, backgroundColor: "#caff00", borderRadius: 8, padding: 10, alignItems: "center" },
  scheduleText: { color: "#182000", fontSize: 9, fontWeight: "900" },
  filters: { gap: 8 },
  chip: { backgroundColor: "#242829", borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 },
  chipActive: { backgroundColor: "#caff00" },
  chipText: { color: "#aeb9ad", fontSize: 10, fontWeight: "800" },
  chipTextActive: { color: "#182000" },
  center: { color: "#aeb9ad", textAlign: "center", padding: 30 },
  error: { color: "#ff8d82", textAlign: "center", padding: 15 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1b2022", borderRadius: 12, padding: 12 },
  image: { width: 82, height: 96, borderRadius: 9, backgroundColor: "#282d2f" },
  copy: { flex: 1, gap: 5 },
  name: { color: "#f0f5eb", fontSize: 16, fontWeight: "900" },
  specialty: { color: "#d9ff00", fontSize: 10, fontWeight: "800" },
  experience: { color: "#aeb9ad", fontSize: 10, lineHeight: 14 },
  price: { color: "#49d79e", fontSize: 12, fontWeight: "900" },
});
