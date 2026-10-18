import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { gymEquipment } from '@/constants/gym-equipment';

const categories = ['Tất cả', 'Cardio', 'Sức mạnh', 'Đa năng'] as const;

export default function GymEquipmentSection() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(280, width - 64);
  const [category, setCategory] = useState<(typeof categories)[number]>('Tất cả');
  const equipmentList = gymEquipment.filter(equipment => category === 'Tất cả' || equipment.category === category.toLocaleUpperCase('vi-VN'));

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
            <Text style={[styles.filterText, item === category && styles.selectedFilterText]}>{item}{item === 'Tất cả' ? ` (${gymEquipment.length})` : ''}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        key={category}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        snapToInterval={cardWidth + 12}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {equipmentList.map((equipment) => (
          <View key={equipment.id} style={[styles.card, { width: cardWidth }]}>
            <View style={styles.cardHeading}>
              <View style={[styles.icon, { backgroundColor: `${equipment.color}15` }]}>
                <Ionicons name={equipment.icon} size={32} color={equipment.color} />
              </View>
              <Text style={[styles.category, { color: equipment.color }]}>{equipment.category}</Text>
            </View>
            <Text style={styles.name}>{equipment.name}</Text>
            <Text style={[styles.muscles, { color: equipment.color }]}>{equipment.muscles}</Text>
            <Text style={styles.description}>{equipment.description}</Text>
          </View>
        ))}
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
