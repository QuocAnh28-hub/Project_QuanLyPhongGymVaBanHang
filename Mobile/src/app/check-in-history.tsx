import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import {
  getCheckInHistory,
  type ApiCheckInRecord,
} from "@/lib/check-in-api";

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
const recordDurationMinutes = (record: ApiCheckInRecord) =>
  record.ThoiGianCheckOut
    ? Math.max(
        0,
        Math.floor(
          (new Date(record.ThoiGianCheckOut).getTime() -
            new Date(record.ThoiGianCheckIn).getTime()) /
            60000,
        ),
      )
    : 0;

export default function CheckInHistoryScreen() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ApiCheckInRecord[]>([]);
  const [error, setError] = useState("");
  const [month, setMonth] = useState<MonthFilter>("current");
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (user?.accountId)
        getCheckInHistory(user.accountId).then((rows) => {
          if (mounted) {
            setRecords(rows);
            setError("");
          }
        }).catch((loadError) => {
          if (mounted) {
            setRecords([]);
            setError(loadError instanceof Error ? loadError.message : "Không tải được lịch sử check-in.");
          }
        });
      return () => {
        mounted = false;
      };
    }, [user]),
  );
  const filtered = useMemo(
    () =>
      records.filter((row) => {
        const date = new Date(row.ThoiGianCheckIn);
        const target = month === "previous" ? monthStart(-1) : monthStart(0);
        return (
          month === "all" ||
          (date.getFullYear() === target.getFullYear() &&
            date.getMonth() === target.getMonth())
        );
      }),
    [month, records],
  );
  const summaryMonth = month === "previous" ? monthStart(-1) : monthStart(0);
  const summary = useMemo(() => {
    const rows = month === "all" ? records : filtered;
    const days = [...new Set(rows.map((row) => new Date(row.ThoiGianCheckIn).getDate()))].sort((a, b) => a - b);
    let streak = 0;
    let current = 0;
    let previous = -2;
    days.forEach((day) => {
      current = day === previous + 1 ? current + 1 : 1;
      streak = Math.max(streak, current);
      previous = day;
    });
    return {
      totalSessions: rows.length,
      totalDurationMinutes: rows.reduce((sum, row) => sum + recordDurationMinutes(row), 0),
      streak,
      attendanceByDay: days,
      activeSessions: rows.filter((row) => row.TrangThai === "CHECKED_IN").length,
    };
  }, [filtered, month, records]);
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
              label="TRONG PHÒNG"
              value={String(summary.activeSessions)}
              accent
            />
            <Metric label="ĐỊA ĐIỂM" value="QA-Gym" />
          </View>
        </View>
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
              {error || "Dữ liệu sẽ xuất hiện sau khi cổng hoặc nhân viên quét QR thành công."}
            </Text>
          </View>
        ) : (
          filtered.map((record) => (
            <RecordCard key={record.CheckInID} record={record} />
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
function RecordCard({ record }: { record: ApiCheckInRecord }) {
  const date = new Date(record.ThoiGianCheckIn);
  const completed = record.TrangThai === "CHECKED_OUT" && !!record.ThoiGianCheckOut;
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
          <Text style={s.cardTitle}>QA-Gym</Text>
        </View>
        <Text style={[s.status, !completed && s.live]}>
          {completed ? "ĐÃ CHECK-OUT" : "ĐANG TRONG PHÒNG"}
        </Text>
      </View>
      <View style={s.recordMeta}>
        <Text style={s.meta}>
          GIỜ VÀO:{" "}
          <Text style={s.metaValue}>
            {date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </Text>
        {record.ThoiGianCheckOut ? (
          <Text style={s.meta}>
            GIỜ RA: <Text style={s.metaValue}>{new Date(record.ThoiGianCheckOut).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</Text>
          </Text>
        ) : null}
      </View>
      {completed ? <Text style={s.activity}>THỜI LƯỢNG: {durationLabel(recordDurationMinutes(record))}</Text> : null}
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
  kicker: { color: C.lime, fontSize: 10, fontWeight: "900" },
  title: { color: C.text, fontSize: 19, fontWeight: "900" },
  summary: { backgroundColor: C.card, borderRadius: 15, padding: 14, gap: 13 },
  summaryHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  label: { color: C.muted, fontSize: 9, fontWeight: "900" },
  big: { color: C.text, fontSize: 35, fontWeight: "900", marginTop: 2 },
  bigAccent: { color: C.lime, fontSize: 16 },
  streak: {
    color: C.text,
    backgroundColor: C.high,
    borderRadius: 14,
    padding: 7,
    fontSize: 9,
    fontWeight: "800",
  },
  week: { flexDirection: "row", justifyContent: "space-between" },
  day: { alignItems: "center", gap: 5 },
  dayName: { color: C.muted, fontSize: 9, fontWeight: "800" },
  dayDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.high,
    alignItems: "center",
    justifyContent: "center",
  },
  dayActive: { backgroundColor: C.lime },
  dayNumber: { color: C.muted, fontSize: 10, fontWeight: "900" },
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
  metricValue: { color: C.text, fontSize: 14, fontWeight: "900" },
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
  chipText: { color: C.muted, fontSize: 10, fontWeight: "900" },
  chipTextActive: { color: C.ink },
  section: { color: C.lime, fontSize: 11, fontWeight: "900", marginTop: 4 },
  empty: {
    minHeight: 190,
    backgroundColor: C.card,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: "900" },
  muted: { color: C.muted, fontSize: 12, lineHeight: 16 },
  record: { backgroundColor: C.card, borderRadius: 13, padding: 14, gap: 7 },
  liveRecord: { borderLeftWidth: 3, borderLeftColor: C.lime },
  recordHead: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  recordDate: {
    color: C.lime,
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 4,
  },
  status: {
    color: C.mint,
    backgroundColor: "#26312e",
    borderRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 8,
    fontWeight: "900",
  },
  live: { color: C.ink, backgroundColor: C.lime },
  recordMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  meta: { color: C.muted, fontSize: 9, fontWeight: "800" },
  metaValue: { color: C.text },
  activity: {
    color: C.text,
    fontSize: 11,
    backgroundColor: "#191b1e",
    borderRadius: 8,
    padding: 9,
  },
});
