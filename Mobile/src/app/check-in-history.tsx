import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import {
  getCheckInHistory,
  getMonthlyCheckInSummary,
  recordDurationMinutes,
  type CheckInRecord,
} from "@/lib/check-in";

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
type MonthFilter = "current" | "previous" | "all";
const monthStart = (offset: number) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  date.setHours(0, 0, 0, 0);
  return date;
};
const durationLabel = (minutes: number) =>
  minutes < 60
    ? `${minutes}p`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}p`;

export default function CheckInHistoryScreen() {
  const { user } = useAuth();
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [club, setClub] = useState("all");
  const [month, setMonth] = useState<MonthFilter>("current");
  const [now, setNow] = useState(new Date());
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (user)
        getCheckInHistory(user.email).then((rows) => {
          if (mounted) {
            setRecords(rows);
            setNow(new Date());
          }
        });
      const timer = setInterval(() => setNow(new Date()), 60000);
      return () => {
        mounted = false;
        clearInterval(timer);
      };
    }, [user]),
  );
  const clubs = useMemo(
    () => [
      ...new Map(records.map((row) => [row.clubId, row.clubName])).entries(),
    ],
    [records],
  );
  const filtered = useMemo(
    () =>
      records.filter((row) => {
        const date = new Date(row.checkInAt);
        const target = month === "previous" ? monthStart(-1) : monthStart(0);
        const monthMatches =
          month === "all" ||
          (date.getFullYear() === target.getFullYear() &&
            date.getMonth() === target.getMonth());
        return monthMatches && (club === "all" || row.clubId === club);
      }),
    [club, month, records],
  );
  const summaryMonth = month === "previous" ? monthStart(-1) : monthStart(0);
  const summary = useMemo(
    () =>
      getMonthlyCheckInSummary(
        month === "all"
          ? records.filter((row) => club === "all" || row.clubId === club)
          : filtered,
        summaryMonth,
        now,
      ),
    [club, filtered, month, now, records, summaryMonth],
  );
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/check-in-pass");
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.top}>
        <View style={s.brand}>
          <Ionicons name="flash" color={C.lime} size={19} />
          <Text style={s.brandText}>SCHEDULE HISTORY</Text>
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
            accessibilityLabel="Quay lại QR"
          >
            <Ionicons name="arrow-back" color={C.text} size={21} />
          </Pressable>
          <View>
            <Text style={s.kicker}>NHẬT KÝ TẬP LUYỆN</Text>
            <Text style={s.title}>LỊCH SỬ CHECK-IN</Text>
          </View>
        </View>
        <View style={s.summary}>
          <View style={s.summaryHead}>
            <View>
              <Text style={s.label}>
                TỔNG QUAN THÁNG{" "}
                {summaryMonth.toLocaleDateString("vi-VN", {
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
              <Text style={s.big}>
                {summary.totalSessions}
                <Text style={s.bigAccent}> BUỔI TẬP</Text>
              </Text>
            </View>
            <Text style={s.streak}>🔥 CHUỖI {summary.streak} NGÀY</Text>
          </View>
          <View style={s.week}>
            {Array.from({ length: 7 }, (_, index) => {
              const day = new Date();
              day.setDate(day.getDate() - (6 - index));
              const attended = summary.attendanceByDay.includes(day.getDate());
              return (
                <View style={s.day} key={index}>
                  <Text style={s.dayName}>
                    {day.toLocaleDateString("vi-VN", { weekday: "short" })}
                  </Text>
                  <View style={[s.dayDot, attended && s.dayActive]}>
                    <Text style={[s.dayNumber, attended && s.dayNumberActive]}>
                      {day.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={s.metrics}>
            <Metric
              label="THỜI GIAN"
              value={durationLabel(summary.totalDurationMinutes)}
            />
            <Metric
              label="ƯỚC TÍNH"
              value={`${Math.round(summary.totalDurationMinutes * 7.6)} kcal`}
              accent
            />
            <Metric label="GHÉ NHIỀU" value={summary.mostVisitedClub ?? "—"} />
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          <Chip
            active={club === "all"}
            label="Tất cả chi nhánh"
            onPress={() => setClub("all")}
          />
          {clubs.map(([id, name]) => (
            <Chip
              key={id}
              active={club === id}
              label={name}
              onPress={() => setClub(id)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          <Chip
            active={month === "current"}
            label="Tháng hiện tại"
            onPress={() => setMonth("current")}
          />
          <Chip
            active={month === "previous"}
            label="Tháng trước"
            onPress={() => setMonth("previous")}
          />
          <Chip
            active={month === "all"}
            label="Tất cả"
            onPress={() => setMonth("all")}
          />
        </ScrollView>
        <Text style={s.section}>
          {filtered.length
            ? `${filtered.length} LẦN CHECK-IN`
            : "NHẬT KÝ VÀO CỔNG"}
        </Text>
        {!filtered.length ? (
          <View style={s.empty}>
            <Ionicons name="calendar-outline" color={C.lime} size={35} />
            <Text style={s.cardTitle}>Chưa có lịch sử check-in</Text>
            <Text style={s.muted}>
              Dữ liệu sẽ xuất hiện sau khi cổng thật hoặc repository gọi
              createCheckIn().
            </Text>
          </View>
        ) : (
          filtered.map((record) => (
            <RecordCard key={record.id} record={record} now={now} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={s.metric}>
      <Text style={s.label}>{label}</Text>
      <Text
        numberOfLines={2}
        style={[s.metricValue, accent && { color: C.mint }]}
      >
        {value}
      </Text>
    </View>
  );
}
function Chip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}
function RecordCard({ record, now }: { record: CheckInRecord; now: Date }) {
  const date = new Date(record.checkInAt);
  const completed = record.status === "completed" && !!record.checkOutAt;
  return (
    <View style={[s.record, !completed && s.liveRecord]}>
      <View style={s.recordHead}>
        <View style={{ flex: 1 }}>
          <Text style={s.recordDate}>
            {date.toLocaleDateString("vi-VN")} ·{" "}
            {date.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={s.cardTitle}>{record.clubName}</Text>
        </View>
        <Text style={[s.status, !completed && s.live]}>
          {completed ? "HOÀN TẤT" : "IN PROGRESS"}
        </Text>
      </View>
      <Text style={s.muted}>⌾ {record.area}</Text>
      <View style={s.recordMeta}>
        <Text style={s.meta}>
          THỜI GIAN:{" "}
          <Text style={s.metaValue}>
            {durationLabel(recordDurationMinutes(record, now))}
          </Text>
        </Text>
        {record.gate ? (
          <Text style={s.meta}>
            CỔNG: <Text style={s.metaValue}>{record.gate}</Text>
          </Text>
        ) : null}
      </View>
      {record.activity ? (
        <Text style={s.activity}>⚡ {record.activity}</Text>
      ) : null}
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
  summary: { backgroundColor: C.card, borderRadius: 15, padding: 14, gap: 13 },
  summaryHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  label: { color: C.muted, fontSize: 8, fontWeight: "900" },
  big: { color: C.text, fontSize: 34, fontWeight: "900", marginTop: 2 },
  bigAccent: { color: C.lime, fontSize: 15 },
  streak: {
    color: C.text,
    backgroundColor: C.high,
    borderRadius: 14,
    padding: 7,
    fontSize: 8,
    fontWeight: "800",
  },
  week: { flexDirection: "row", justifyContent: "space-between" },
  day: { alignItems: "center", gap: 5 },
  dayName: { color: C.muted, fontSize: 8, fontWeight: "800" },
  dayDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.high,
    alignItems: "center",
    justifyContent: "center",
  },
  dayActive: { backgroundColor: C.lime },
  dayNumber: { color: C.muted, fontSize: 9, fontWeight: "900" },
  dayNumberActive: { color: C.ink },
  metrics: { flexDirection: "row", gap: 7 },
  metric: {
    flex: 1,
    minHeight: 66,
    backgroundColor: "#191b1e",
    borderRadius: 9,
    padding: 9,
    justifyContent: "space-between",
  },
  metricValue: { color: C.text, fontSize: 13, fontWeight: "900" },
  filters: { gap: 8 },
  chip: {
    minHeight: 38,
    paddingHorizontal: 15,
    borderRadius: 19,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: C.lime },
  chipText: { color: C.muted, fontSize: 9, fontWeight: "900" },
  chipTextActive: { color: C.ink },
  section: { color: C.lime, fontSize: 10, fontWeight: "900", marginTop: 4 },
  empty: {
    minHeight: 190,
    backgroundColor: C.card,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cardTitle: { color: C.text, fontSize: 15, fontWeight: "900" },
  muted: { color: C.muted, fontSize: 11, lineHeight: 16 },
  record: { backgroundColor: C.card, borderRadius: 13, padding: 14, gap: 7 },
  liveRecord: { borderLeftWidth: 3, borderLeftColor: C.lime },
  recordHead: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  recordDate: {
    color: C.lime,
    fontSize: 9,
    fontWeight: "900",
    marginBottom: 4,
  },
  status: {
    color: C.mint,
    backgroundColor: "#26312e",
    borderRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 7,
    fontWeight: "900",
  },
  live: { color: C.ink, backgroundColor: C.lime },
  recordMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  meta: { color: C.muted, fontSize: 8, fontWeight: "800" },
  metaValue: { color: C.text },
  activity: {
    color: C.text,
    fontSize: 10,
    backgroundColor: "#191b1e",
    borderRadius: 8,
    padding: 9,
  },
});
