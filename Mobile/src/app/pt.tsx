import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

const filters = ['Tất cả', 'Tăng cơ & Giảm mỡ', 'Powerlifting & Tạ nặng'];

const trainers = [
  {
    name: 'HLV Trần Hoàng Nam',
    badge: 'NASM & ACE Certified',
    experience: '8 Năm KN',
    speciality: 'TRƯỜNG BỘ MÔN THỂ HÌNH',
    rating: '5.0 (98)',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=85',
    stats: [['♙', 'Đã huấn luyện', '300+ Học viên'], ['◉', 'Cấp bậc', 'Master Trainer']],
    focus: 'Giảm mỡ cấp tốc, siết cơ chủ đích, tối ưu hóa thể lực toàn diện và sức mạnh bắp thịt.',
  },
  {
    name: 'HLV Nguyễn Thùy Linh',
    badge: 'ISSA Nutritionist',
    experience: '5 Năm KN',
    speciality: 'ĐỊNH HÌNH ĐƯỜNG CONG NỮ',
    rating: '4.9 (120)',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=900&q=85',
    stats: [['♙', 'Học viên nữ', '240+ Hoàn thành'], ['♨', 'Dinh dưỡng', 'Meal Plan 1-1']],
    focus: 'Tăng vòng 3 đầy đặn, siết eo thon gọn, cân đối vóc dáng mà không cần ép cân khắc nghiệt.',
  },
  {
    name: 'HLV Lê Quốc Huy',
    badge: 'Cựu VĐV Quốc Gia',
    experience: '6 Năm Đào tạo',
    speciality: 'BOXING & KICKFITNESS PRO',
    rating: '4.9 (75)',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&q=85',
    stats: [['◉', 'Đốt calo cực đỉnh', '800 kcal/giờ'], ['↗', 'Phản xạ & Tốc độ', 'High Agility']],
    focus: 'Kickboxing cường độ cao, giải tỏa căng thẳng công việc, tăng cường sự linh hoạt và khả năng tự vệ.',
  },
  {
    name: 'HLV Đậu Phạm',
    badge: 'Cử Nhân Y Sinh Thể Thao',
    experience: 'Chuyên gia Rehab',
    speciality: 'PHỤC HỒI CHỨC NĂNG VẬN ĐỘNG',
    rating: '5.0 (64)',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=85',
    stats: [['✣', 'Giải quyết đau', 'Cổ Vai Gáy & Cột'], ['✚', 'Cân chỉnh', 'Corrective Pose']],
    focus: 'Corrective Exercise, Mobility & Flexibility toàn diện, chỉnh từng vùng, không dùng bản phóng y tế vận động.',
  },
];

type Trainer = (typeof trainers)[number];

function Header() {
  return <View style={styles.header}>
    <View style={styles.brandBlock}>
      <Text style={styles.brand}><MaterialCommunityIcons name="dumbbell" size={24} color="white" />QA-GYM<Text style={styles.brandDot}>.</Text></Text>
      <Text style={styles.location}><FontAwesome name="map-marker" size={12} color="#7b7c7d" />  Khoái Châu, Hưng Yên</Text>
    </View>
    <View style={styles.headerActions}><FontAwesome name="bell" size={24} color="#cfcfcf" /><View style={styles.shoppingCart}><FontAwesome name="shopping-cart" size={24} color="#f5f9ed" /></View></View>
  </View>;
}

function TrainerCard({ trainer }: { trainer: Trainer }) {
  return <View style={styles.trainerCard}>
    <View style={styles.photoWrap}>
      <Image source={{ uri: trainer.image }} style={styles.photo} contentFit="cover" />
      <View style={styles.photoShade} />
      <View style={styles.photoMeta}><Text style={styles.badge}>{trainer.badge}</Text><Text style={styles.experience}>{trainer.experience}</Text></View>
      <View style={styles.photoCaption}><Text style={styles.speciality}>{trainer.speciality}</Text><View style={styles.nameRow}><Text style={styles.trainerName}>{trainer.name}</Text><Text style={styles.rating}>★ {trainer.rating}</Text></View></View>
    </View>
    <View style={styles.cardBody}>
      <View style={styles.statsRow}>{trainer.stats.map(([icon, label, value]) => <View style={styles.stat} key={label}><Text style={styles.statIcon}>{icon}</Text><View><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View></View>)}</View>
      <View style={styles.focus}><Text style={styles.focusLabel}>✺ SỞ TRƯỜNG HUẤN LUYỆN</Text><Text style={styles.focusText}>{trainer.focus}</Text></View>
      <View style={styles.actions}><Pressable style={styles.detailButton}><Text style={styles.detailText}>Chi tiết →</Text></Pressable><Pressable style={styles.bookButton}><FontAwesome name="calendar-o" size={12} color="#172000" /><Text style={styles.bookText}>Đặt tập thử 1-1</Text></Pressable></View>
    </View>
  </View>;
}

export default function PersonalTrainerScreen() {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  return <View style={styles.container}>
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Header />
        <View style={styles.intro}><Text style={styles.kicker}>✺ ELITE COACHING STAFF</Text><Text style={styles.title}>ĐỘI NGŨ HUẤN LUYỆN VIÊN CÁ{`\n`}NHÂN (PT)</Text><Text style={styles.subtitle}>Đồng hành cùng bạn trên con đường kiến tạo vóc dáng mơ ước</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>{filters.map((filter) => <Pressable key={filter} onPress={() => setSelectedFilter(filter)} style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}><Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>{filter}</Text></Pressable>)}</ScrollView>
        <View style={styles.promise}><View style={styles.promiseIcon}><FontAwesome name="certificate" size={17} color="#d9ff00" /></View><View style={styles.promiseCopy}><Text style={styles.promiseTitle}>Cam kết vàng 100% <Text style={styles.promiseAccent}>QA-GYM</Text></Text><Text style={styles.promiseText}>100% HLV tại QA-Gym đều có chứng chỉ đào tạo quốc tế & cam kết hiệu quả theo từng lộ trình cá nhân hóa.</Text></View></View>
        {trainers.map((trainer) => <TrainerCard key={trainer.name} trainer={trainer} />)}
        <View style={styles.cta}><View style={styles.ctaIcon}><FontAwesome name="headphones" size={22} color="#172000" /></View><Text style={styles.ctaTitle}>Chưa chắc chắn chọn HLV nào?</Text><Text style={styles.ctaText}>Để QA-Gym đánh giá chỉ số InBody và ghép đôi HLV phù hợp nhất với thể trạng & mục tiêu của bạn.</Text><Pressable style={styles.ctaButton}><Text style={styles.ctaButtonText}>NHẬN TƯ VẤN TRỰC TIẾP</Text></Pressable></View>
      </ScrollView>
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101210' }, safeArea: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' }, 
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 21 }, brandBlock: { flexShrink: 1, paddingRight: 76 }, brand: { color: '#f3f5ec', fontSize: 21, fontWeight: '900', letterSpacing: 1.2 }, 
  brandDot: { color: '#d9ff00' }, location: { color: '#899083', fontSize: 10, marginTop: 5 }, headerActions: { position: 'absolute', top: 20.5, right: 0, flexDirection: 'row', alignItems: 'center', gap: 14 }, 
  shoppingCart: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  intro: { marginBottom: 12 }, kicker: { color: '#c1da00', fontSize: 9, fontWeight: '900', letterSpacing: 0.6 }, title: { color: '#f4f7ee', fontSize: 20, lineHeight: 24, fontWeight: '900', marginTop: 7 }, 
  subtitle: { color: '#9ca599', fontSize: 10, lineHeight: 14, marginTop: 7 }, filterList: { gap: 7, paddingBottom: 15 }, filterChip: { backgroundColor: '#242925', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 7 }, 
  filterChipActive: { backgroundColor: '#d9ff00' }, filterText: { color: '#abb5a8', fontSize: 8, fontWeight: '800' }, filterTextActive: { color: '#172000' },
  promise: { flexDirection: 'row', backgroundColor: '#272c27', borderRadius: 9, padding: 11, marginBottom: 10 }, promiseIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#263226', alignItems: 'center', justifyContent: 'center', marginRight: 9 }, 
  promiseCopy: { flex: 1 }, promiseTitle: { color: '#e7efe1', fontSize: 11, fontWeight: '900' }, promiseAccent: { color: '#d9ff00', fontSize: 8 }, promiseText: { color: '#aab4a7', fontSize: 8, lineHeight: 12, marginTop: 4 },
  trainerCard: { backgroundColor: '#1c211e', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }, photoWrap: { height: 262, position: 'relative', backgroundColor: '#293029' }, photo: { width: '100%', height: '100%' }, 
  photoShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 7, .38)' }, photoMeta: { position: 'absolute', top: 9, left: 9, right: 9, flexDirection: 'row', justifyContent: 'space-between' }, 
  badge: { color: '#d9ff00', backgroundColor: 'rgba(15, 35, 10, .75)', fontSize: 7, fontWeight: '900', paddingHorizontal: 5, paddingVertical: 3, borderRadius: 3 }, 
  experience: { color: '#d9ff00', fontSize: 7, fontWeight: '900', backgroundColor: 'rgba(15, 35, 10, .75)', paddingHorizontal: 5, paddingVertical: 3, borderRadius: 3 }, 
  photoCaption: { position: 'absolute', left: 10, right: 10, bottom: 10 }, speciality: { color: '#d9ff00', fontSize: 7, fontWeight: '900' }, nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }, 
  trainerName: { color: '#f3f6ed', fontSize: 16, fontWeight: '900' }, rating: { color: '#d9ff00', fontSize: 9, fontWeight: '800' },
  cardBody: { padding: 10 }, statsRow: { flexDirection: 'row', gap: 7, marginBottom: 8 }, stat: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#252b27', borderRadius: 6, padding: 7, gap: 6 }, 
  statIcon: { color: '#d9ff00', fontSize: 14 }, statLabel: { color: '#899489', fontSize: 7 }, statValue: { color: '#e1e8df', fontSize: 8, fontWeight: '800', marginTop: 2 }, focus: { backgroundColor: '#151916', borderRadius: 6, padding: 8 }, 
  focusLabel: { color: '#cbed00', fontSize: 7, fontWeight: '900' }, focusText: { color: '#aab4a8', fontSize: 8, lineHeight: 12, marginTop: 4 }, actions: { flexDirection: 'row', gap: 8, marginTop: 9 }, 
  detailButton: { flex: 1, backgroundColor: '#303632', borderRadius: 6, alignItems: 'center', justifyContent: 'center', minHeight: 28 }, detailText: { color: '#e1e8df', fontSize: 8 }, 
  bookButton: { flex: 1.6, flexDirection: 'row', gap: 6, backgroundColor: '#caff00', borderRadius: 6, alignItems: 'center', justifyContent: 'center', minHeight: 28 }, bookText: { color: '#172000', fontSize: 8, fontWeight: '900' },
  cta: { alignItems: 'center', backgroundColor: '#252a27', borderRadius: 10, padding: 16, marginTop: 2 }, ctaIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#caff00', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, 
  ctaTitle: { color: '#edf2e8', fontSize: 12, fontWeight: '900' }, ctaText: { color: '#98a397', textAlign: 'center', fontSize: 8, lineHeight: 12, marginTop: 6 }, 
  ctaButton: { alignSelf: 'stretch', backgroundColor: '#111411', borderRadius: 6, alignItems: 'center', paddingVertical: 9, marginTop: 12 }, ctaButtonText: { color: '#d9ff00', fontSize: 8, fontWeight: '900' },
});
