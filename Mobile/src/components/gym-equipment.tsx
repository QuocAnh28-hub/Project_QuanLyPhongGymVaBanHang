import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { equipmentImageUrl, getGymEquipment, type GymEquipment } from '@/lib/equipment-api';

const categories = ['Tất cả', 'Cardio', 'Sức mạnh', 'Đa năng'] as const;
const groups = {
  CARDIO: { label: 'Cardio', icon: 'walk-outline', color: '#8cebd2' },
  STRENGTH: { label: 'Sức mạnh', icon: 'barbell-outline', color: '#d9ff00' },
  MULTI: { label: 'Đa năng', icon: 'body-outline', color: '#8fb7ff' },
} as const;

export default function GymEquipmentSection() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(280, width - 64);
  const [category, setCategory] = useState<(typeof categories)[number]>('Tất cả');
  const [equipment, setEquipment] = useState<GymEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;
    setLoading(true); setError('');
    getGymEquipment(controller.signal)
      .then(rows => { if (active) setEquipment(rows); })
      .catch(() => { if (active) { setEquipment([]); setError('Chưa tải được máy tập. Vui lòng thử lại.'); } })
      .finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  // Reload intentionally restarts the request when the user taps "Thử lại".
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]));
  const equipmentList = equipment.filter(item => category === 'Tất cả' || groups[item.NhomMay]?.label === category);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.title}>Máy tập tại phòng</Text>
      </View>
      <Text style={styles.subtitle}>Khám phá thiết bị cho từng nhóm cơ và mục tiêu tập luyện.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {categories.map(item => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected: item === category }}
            onPress={() => setCategory(item)}
            style={[styles.filter, item === category && styles.selectedFilter]}
          >
            <Text style={[styles.filterText, item === category && styles.selectedFilterText]}>
              {item} ({item === 'Tất cả' ? equipment.length : equipment.filter(machine => groups[machine.NhomMay]?.label === item).length})
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {loading && <Text style={styles.state}>Đang tải máy tập…</Text>}
      {!!error && <View style={styles.stateBox}><Text style={styles.state}>{error}</Text><Pressable accessibilityRole="button" onPress={() => setReload(value => value + 1)}><Text style={styles.retry}>Thử lại</Text></Pressable></View>}
      {!loading && !error && !equipmentList.length && <Text style={styles.state}>Chưa có máy tập trong nhóm này.</Text>}
      <ScrollView
        key={category}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        snapToInterval={cardWidth + 12}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {!loading && !error && equipmentList.map((item) => {
          const appearance = groups[item.NhomMay] || groups.STRENGTH;
          const image = equipmentImageUrl(item.HinhAnh);
          return <View key={item.MayTapID} style={[styles.card, { width: cardWidth }]}>
            {image && <Image source={{ uri: image }} style={styles.image} contentFit="contain" accessibilityLabel={item.TenMay} />}
            <View style={styles.cardHeading}>
              <View style={[styles.icon, { backgroundColor: `${appearance.color}15` }]}>
                <Ionicons name={appearance.icon} size={32} color={appearance.color} />
              </View>
              <Text style={[styles.category, { color: appearance.color }]}>{appearance.label.toLocaleUpperCase('vi-VN')}</Text>
            </View>
            <Text style={styles.name}>{item.TenMay}</Text>
            {!!item.NhomCo && <Text style={[styles.muscles, { color: appearance.color }]}>{item.NhomCo}</Text>}
            <Text style={styles.description}>{item.MoTa}</Text>
            <Text style={styles.metadata}>{item.SoLuong} máy{item.ViTri ? ` · ${item.ViTri}` : ''}</Text>
          </View>
        })}
      </ScrollView>
      <View style={styles.tip}>
        <Ionicons name="information-circle-outline" size={18} color="#aeb59e" />
        <Text style={styles.tipText}>Lần đầu sử dụng? Hãy nhờ huấn luyện viên hướng dẫn cách chỉnh máy và tư thế tập.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  image: { width: '100%', height: 140, borderRadius: 10, marginBottom: 14 },
  metadata: { color: '#8f9b92', fontSize: 11, lineHeight: 17, marginTop: 14 },
  state: { color: '#aeb59e', fontSize: 13, lineHeight: 20, paddingVertical: 12 },
  stateBox: { marginBottom: 12 },
  retry: { color: '#d9ff00', fontSize: 13, fontWeight: '700', paddingVertical: 8 },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { color: '#f2f6ea', fontSize: 16, fontWeight: '800' },
  hint: { color: '#c9ed00', fontSize: 11, fontWeight: '600' },
  subtitle: { color: '#9ca599', fontSize: 12, lineHeight: 18, marginTop: 8, marginBottom: 14 },
  filters: { gap: 8, paddingBottom: 14 },
  filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2c322c', backgroundColor: '#1c211d' },
  selectedFilter: { borderColor: '#d9ff00', backgroundColor: '#d9ff00' },
  filterText: { color: '#aeb59e', fontSize: 12, fontWeight: '600' },
  selectedFilterText: { color: '#152000' },
  list: { gap: 12 },
  card: { padding: 16, borderRadius: 14, backgroundColor: '#1c211d', borderWidth: 1, borderColor: '#2c322c' },
  cardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 },
  icon: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  category: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  name: { color: '#f0f4e8', fontSize: 18, fontWeight: '800' },
  muscles: { fontSize: 12, fontWeight: '600', marginTop: 8 },
  description: { color: '#aeb59e', fontSize: 13, lineHeight: 20, marginTop: 12 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12 },
  tipText: { flex: 1, color: '#9ca599', fontSize: 12, lineHeight: 18 },
});
