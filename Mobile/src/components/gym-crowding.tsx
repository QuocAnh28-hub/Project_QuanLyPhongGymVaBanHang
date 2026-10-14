import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getGymCrowding, type GymCrowding } from '@/lib/check-in-api';

const hourLabel = (hour: number) => `${String(hour).padStart(2,'0')}:00 – ${String(hour+1).padStart(2,'0')}:00`;
const levels = [
  { label: 'Ít người', color: '#85dfad' },
  { label: 'Vừa phải', color: '#e8cd84' },
  { label: 'Đông người', color: '#f28b82' },
  { label: 'Chưa có dữ liệu', color: '#59615b' },
];
export default function GymCrowdingCard() {
  const { user } = useAuth();
  const accountId = user?.accountId;
  const [state, setState] = useState<{ accountId: number; data: GymCrowding; updatedAt: number } | null>(null);
  const [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [selectedHour, setSelectedHour] = useState(() => new Date().getHours());
  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setError('');
    if (!accountId) return () => controller.abort();
    let requestVersion = 0;
    const load = async () => {
      setNow(new Date());
      const version = ++requestVersion;
      try {
        const data = await getGymCrowding(controller.signal);
        if (!controller.signal.aborted && version === requestVersion) { setState({ accountId, data, updatedAt: Date.now() }); setError(''); }
      } catch { if (!controller.signal.aborted && version === requestVersion) { setState(null); setError('Chưa tải được tình hình phòng tập.'); } }
    };
    void load();
    const timer = setInterval(() => { if (AppState.currentState === 'active') void load(); }, 15000);
    const appState = AppState.addEventListener('change', value => { if (value === 'active') void load(); });
    return () => { controller.abort(); clearInterval(timer); appState.remove(); };
  }, [accountId,reload]));
  if (!accountId) return null;
  const data = state?.accountId === accountId ? state.data : null;
  const hours = Array.from({ length: 24 }, (_, hour) =>
    data?.hours.find(item => item.hour === hour) || { hour, sessions: 0, averageCount: 0 });
  const peak = Math.max(0, ...hours.map(item => item.averageCount));
  const axisMax = Math.max(1, Math.ceil(peak));
  // Levels compare historical occupancy with the busiest hour, not room capacity.
  const levelFor = (item: GymCrowding['hours'][number]) => item.sessions === 0 ? levels[3]
    : levels[item.averageCount / (peak || 1) <= 1 / 3 ? 0 : item.averageCount / (peak || 1) <= 2 / 3 ? 1 : 2];
  const selected = hours[selectedHour];
  const selectedLevel = levelFor(selected);
  return <View style={s.card}>
    <View style={s.heading}><Ionicons name="people-outline" size={22} color="#c3f400" /><Text style={s.title}>Chọn giờ tập thoải mái</Text></View>
    {error ? <View style={s.errorRow}><Text style={s.note}>{error}</Text><Pressable accessibilityRole="button" onPress={() => setReload(v=>v+1)}><Text style={s.retry}>Thử lại</Text></Pressable></View> : null}
    {!data && !error ? <Text style={s.note}>Đang tải tình hình phòng tập…</Text> : null}
    {data && <>
      <View style={s.current}><View><Text style={s.note}>Đang có mặt</Text></View><Text style={s.count}>{data.currentCount}<Text style={s.unit}> người</Text></Text></View>
      <View style={s.chartHeading}><Text style={s.chartTitle}>Mức đông theo từng giờ</Text><Text style={s.source}>Người trung bình</Text></View>
      <View style={s.chartRow}>
        <View style={s.axis}>{[axisMax, axisMax / 2, 0].map(value => <Text key={value} style={s.axisLabel}>{value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</Text>)}</View>
        <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled contentContainerStyle={s.chartContent}>
          <View>
            <View pointerEvents="none" style={s.grid}>{[0, 1, 2].map(value => <View key={value} style={s.gridLine} />)}</View>
            <View style={s.bars}>{hours.map(item => {
              const level = levelFor(item);
              const active = item.hour === selectedHour;
              return <Pressable key={item.hour} accessibilityRole="button" accessibilityState={{ selected: active }}
                accessibilityLabel={`${hourLabel(item.hour)}, ${level.label}${item.sessions > 0 ? `, trung bình ${item.averageCount.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} người` : ''}`}
                onPress={() => setSelectedHour(item.hour)} style={[s.column, active && s.selectedColumn]}>
                <View style={s.barSpace}><View style={[s.bar, { height: item.sessions > 0 ? Math.max(3, item.averageCount / axisMax * 132) : 3, backgroundColor: level.color }, active && s.selectedBar]} /></View>
                <Text style={[s.hour, item.hour === now.getHours() && s.currentHour]}>{String(item.hour).padStart(2, '0')}</Text>
                <View style={[s.hourDot, { backgroundColor: item.hour === now.getHours() ? '#c3f400' : 'transparent' }]} />
              </Pressable>;
            })}</View>
          </View>
        </ScrollView>
      </View>
      <Text style={s.source}>Vuốt ngang để xem đủ 24 giờ · Chạm cột để xem chi tiết</Text>
      <View style={s.detail}><Text style={s.time}>{hourLabel(selectedHour)}</Text><Text style={[s.detailLevel, { color: selectedLevel.color }]}>{selectedLevel.label}</Text>
        <Text style={s.note}>{selected.sessions > 0 ? `Trung bình ${selected.averageCount.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} người có mặt · ${selected.sessions} lượt tập có mặt trong khung giờ này` : 'Chưa ghi nhận lượt tập hoàn tất trong khung giờ này.'}</Text></View>
      <View style={s.legend}>{levels.map(level => <View key={level.label} style={s.legendItem}><View style={[s.legendDot, { backgroundColor: level.color }]} /><Text style={s.source}>{level.label}</Text></View>)}</View>
      <Text style={s.source}>Màu sắc so sánh với giờ đông nhất trong ngày. Chấm xanh đánh dấu giờ hiện tại.</Text>
      <Text style={s.source}>Dựa trên {data.sampleSessions} lượt đã hoàn tất trong {data.days} ngày trước. Mức độ đông hôm nay có thể khác.</Text>
    </>}
  </View>;
}
const s = StyleSheet.create({
  card: { marginBottom: 24, padding: 18, borderWidth: 1, borderColor: '#343b36', borderRadius: 14, backgroundColor: '#1a1c1f', gap: 14 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, title: { flex: 1, color: '#e2e2e6', fontSize: 16, fontWeight: '700' },
  note: { color: '#aeb59e', fontSize: 12, lineHeight: 18 }, current: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#343b36' },
  count: { color: '#c3f400', fontSize: 25, fontWeight: '700' }, unit: { color: '#aeb59e', fontSize: 12, fontWeight: '400' },
  chartHeading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  chartTitle: { color: '#e2e2e6', fontSize: 13, fontWeight: '700' },
  chartRow: { flexDirection: 'row', gap: 8 },
  axis: { width: 32, height: 140, justifyContent: 'space-between' },
  axisLabel: { color: '#8f9b92', fontSize: 10, textAlign: 'right' },
  chartContent: { paddingBottom: 8 },
  grid: { position: 'absolute', top: 8, left: 0, right: 0, height: 132, justifyContent: 'space-between' },
  gridLine: { height: 1, backgroundColor: '#343b36' },
  bars: { flexDirection: 'row' },
  column: { width: 36, alignItems: 'center', borderRadius: 6, paddingTop: 8, paddingBottom: 4 },
  selectedColumn: { backgroundColor: '#ffffff0c' },
  barSpace: { height: 132, justifyContent: 'flex-end' },
  bar: { width: 22, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  selectedBar: { borderWidth: 1, borderColor: '#eef4e8' },
  hour: { color: '#aeb59e', fontSize: 11, marginTop: 8 },
  currentHour: { color: '#c3f400', fontWeight: '700' },
  hourDot: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },
  detail: { padding: 12, borderRadius: 10, backgroundColor: '#222724', gap: 6 },
  detailLevel: { fontSize: 12, fontWeight: '700' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  time: { color: '#e2e2e6', fontSize: 13, fontWeight: '600' }, source: { color: '#8f9b92', fontSize: 11, lineHeight: 17 },
  errorRow: { gap: 8 }, retry: { color: '#c3f400', paddingVertical: 8, fontSize: 12, fontWeight: '600' },
});
