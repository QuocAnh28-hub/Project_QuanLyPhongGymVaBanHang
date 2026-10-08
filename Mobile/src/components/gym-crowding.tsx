import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getGymCrowding, type GymCrowding } from '@/lib/check-in-api';

const hourLabel = (hour: number, now: Date) => {
  const start = hour === now.getHours()
    ? `${String(hour).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    : `${String(hour).padStart(2,'0')}:00`;
  return `${start} – ${String(hour+1).padStart(2,'0')}:00`;
};
export default function GymCrowdingCard() {
  const { user } = useAuth();
  const accountId = user?.accountId;
  const [state, setState] = useState<{ accountId: number; data: GymCrowding; updatedAt: number } | null>(null);
  const [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [now, setNow] = useState(() => new Date());
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
  // Unobserved hours may be closed: never describe them as quiet hours.
  const observed = (data?.hours || []).filter(h => h.sessions > 0 && h.hour >= now.getHours() && h.hour < 24).sort((a,b) => b.averageCount-a.averageCount || a.hour-b.hour);
  const canCompare = !!data && data.sampleSessions >= 2 && observed.length > 1 && observed[0].averageCount > observed[observed.length-1].averageCount;
  const busy = canCompare ? observed.filter(h => h.averageCount === observed[0].averageCount).slice(0,3) : [];
  const quiet = canCompare ? [...observed].reverse().filter(h => h.averageCount === observed[observed.length-1].averageCount).slice(0,3).sort((a,b)=>a.hour-b.hour) : [];
  return <View style={s.card}>
    <View style={s.heading}><Ionicons name="people-outline" size={22} color="#c3f400" /><Text style={s.title}>Chọn giờ tập thoải mái</Text></View>
    {error ? <View style={s.errorRow}><Text style={s.note}>{error}</Text><Pressable accessibilityRole="button" onPress={() => setReload(v=>v+1)}><Text style={s.retry}>Thử lại</Text></Pressable></View> : null}
    {!data && !error ? <Text style={s.note}>Đang tải tình hình phòng tập…</Text> : null}
    {data && <>
      <View style={s.current}><View><Text style={s.note}>Đang có mặt hôm nay</Text><Text style={s.source}>Cập nhật {new Date(state!.updatedAt).toLocaleTimeString('vi-VN')}</Text></View><Text style={s.count}>{data.currentCount}<Text style={s.unit}> người</Text></Text></View>
      {canCompare ? <View style={s.periods}>
        <View style={[s.period,s.quiet]}><Text style={s.quietLabel}>Giờ thường ít người</Text>{quiet.map(h=><Text key={h.hour} style={s.time}>{hourLabel(h.hour, now)}</Text>)}</View>
        <View style={[s.period,s.busy]}><Text style={s.busyLabel}>Giờ thường đông người</Text>{busy.map(h=><Text key={h.hour} style={s.time}>{hourLabel(h.hour, now)}</Text>)}</View>
      </View> : <Text style={s.note}>{observed.length === 0 ? 'Không còn khung giờ có dữ liệu dự báo từ hiện tại đến 24:00 hôm nay.' : 'Chưa đủ dữ liệu để phân biệt giờ đông và giờ ít người trong các khung giờ còn lại hôm nay.'}</Text>}
      <Text style={s.source}>Dựa trên {data.sampleSessions} lượt đã hoàn tất trong {data.days} ngày trước. Mức độ đông hôm nay có thể khác.</Text>
    </>}
  </View>;
}
const s = StyleSheet.create({
  card: { marginBottom: 24, padding: 18, borderWidth: 1, borderColor: '#343b36', borderRadius: 14, backgroundColor: '#1a1c1f', gap: 14 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, title: { flex: 1, color: '#e2e2e6', fontSize: 16, fontWeight: '700' },
  note: { color: '#aeb59e', fontSize: 12, lineHeight: 18 }, current: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#343b36' },
  count: { color: '#c3f400', fontSize: 25, fontWeight: '700' }, unit: { color: '#aeb59e', fontSize: 12, fontWeight: '400' },
  periods: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, period: { flexGrow: 1, flexBasis: 145, padding: 12, borderWidth: 1, borderRadius: 10, gap: 8 },
  quiet: { backgroundColor: '#1e3025', borderColor: '#335340' }, busy: { backgroundColor: '#302a1d', borderColor: '#55452b' },
  quietLabel: { color: '#85dfad', fontSize: 12, fontWeight: '700' }, busyLabel: { color: '#e8cd84', fontSize: 12, fontWeight: '700' },
  time: { color: '#e2e2e6', fontSize: 13, fontWeight: '600' }, source: { color: '#8f9b92', fontSize: 11, lineHeight: 17 },
  errorRow: { gap: 8 }, retry: { color: '#c3f400', paddingVertical: 8, fontSize: 12, fontWeight: '600' },
});
