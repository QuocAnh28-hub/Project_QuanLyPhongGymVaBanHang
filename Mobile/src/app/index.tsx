import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

import { FontAwesome } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const images = {
  hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=85',
  strength: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=85',
  hiit: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=85',
  yoga: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=700&q=85',
};

const workouts = [
  { icon: <MaterialCommunityIcons name="check-circle"/>, value: '100+', label: 'Thiết bị tối tân', color: '#d9ff00' },
  { icon: <MaterialCommunityIcons name="hot-tub"/>, value: 'Sauna & Spa', label: 'Không gian thư giãn', color: '#8cebd2' },
  { icon: <Ionicons name="body" />, value: 'InBody 770', label: 'Đo cơ thể miễn phí', color: '#8fb7ff' },
  { icon: <Ionicons name="fast-food"/>, value: 'Free Bar', label: 'Nạp năng lượng lành mạnh', color: '#d9ff00' },
]; 

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return <View style={styles.sectionTitle}><Text style={styles.sectionHeading}>{title}</Text>{action && <Text style={styles.sectionAction}>{action}</Text>}</View>;
}

function StatCard({ icon, value, label, color }: (typeof workouts)[number]) {
  return <View style={styles.statCard}><Text style={[styles.statIcon, { color }]}>{icon}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function WorkoutCard({ image, title, detail, tag }: { image: string; title: string; detail: string; tag: string }) {
  return <View style={styles.workoutCard}>
    <Image source={{ uri: image }} style={styles.workoutImage} contentFit="cover" />
    <View style={styles.workoutOverlay} />
    <View style={styles.workoutTag}><Text style={styles.workoutTagText}>{tag}</Text></View>
    <View style={styles.workoutCopy}><Text style={styles.workoutTitle}>{title}</Text><Text style={styles.workoutDetail}>{detail}</Text><Text style={styles.workoutLink}>Khám phá khu vực →</Text></View>
  </View>;
} 

export default function HomeScreen() {
  return <View style={styles.container}>
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View><Text style={styles.brand}><MaterialCommunityIcons name="dumbbell" size={24} color="white" />QA-GYM<Text style={styles.brandDot}>.</Text></Text><Text style={styles.location}><FontAwesome name="map-marker" size={12} color="#7b7c7d"/>  Khoái Châu, Hưng Yên</Text></View>
          
          <View style={styles.headerActions}> <FontAwesome name="bell" size={24} color="#cfcfcf"/><View style={styles.shoppingCart}><FontAwesome name="shopping-cart" size={24} color="#f5f9ed" /></View></View>
          
        </View> 

        <View style={styles.greeting}><Text style={styles.kicker}>Wellcome</Text><Text style={styles.greetingTitle}>Sẵn sàng bứt phá?</Text><Text style={styles.greetingCopy}>Hôm nay là một ngày tuyệt vời để chăm sóc cơ thể.</Text></View>

        <View style={styles.heroCard}>
          <Image source={{ uri: images.hero }} style={styles.heroImage} contentFit="cover" /><View style={styles.heroShade} />
          <View style={styles.heroCopy}><View style={styles.pill}><Text style={styles.pillText}>✦  ƯU ĐÃI ĐẶC BIỆT</Text></View><Text style={styles.heroTitle}>Tập luyện{`\n`}không giới hạn</Text><Text style={styles.heroDetail}>Trải nghiệm toàn bộ tiện ích cao cấp</Text><TouchableOpacity style={styles.heroButton}><Text style={styles.heroButtonText}>Xem gói hội viên  →</Text></TouchableOpacity></View>
        </View>

        <SectionTitle title="Khám phá tiện ích" action="XEM TẤT CẢ" />
        <View style={styles.statsGrid}>{workouts.map((item) => <StatCard key={item.label} {...item} />)}</View>

        <SectionTitle title="Khu vực luyện tập" action="4 khu vực" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          <WorkoutCard image={images.hiit} title="Cardio Hi-Tech Zone" detail="Máy chạy bộ và thiết bị tập tim mạch" tag="NHIỆT ĐỘ 24°C" />
          <WorkoutCard image={images.strength} title="Free Weights" detail="Khu vực tạ tự do chuyên nghiệp" tag="TẦNG 2" />
          <WorkoutCard image={images.yoga} title="Mind & Body" detail="Yoga, stretching và thiền" tag="YÊN TĨNH" />
        </ScrollView>

        <SectionTitle title="Lớp Group-X hôm nay" action="XEM LỊCH" />
        <View style={styles.schedule}>{[['17:30', 'Les Mills BodyPump™', 'Phòng tập GX1', 'Còn 12 chỗ'], ['18:45', 'RPM Cycling Party', 'Phòng Cycling', 'Còn 8 chỗ'], ['19:30', 'Zumba Fitness', 'Studio 3', 'Còn 6 chỗ']].map(([time, title, room, seats]) => <View style={styles.scheduleRow} key={title}><Text style={styles.scheduleTime}>{time}</Text><View style={styles.scheduleInfo}><Text style={styles.scheduleTitle}>{title}</Text><Text style={styles.scheduleRoom}>{room}</Text></View><View style={styles.seatPill}><Text style={styles.seatText}>{seats}</Text></View></View>)}</View>

        <View style={styles.reviewCard}><Text style={styles.stars}>★★★★★ <Text style={styles.rating}>4.9 / 5.0</Text></Text><Text style={styles.reviewQuote}>“Không gian tuyệt vời, thiết bị hiện đại và đội ngũ rất nhiệt tình!”</Text><Text style={styles.reviewAuthor}>— Nguyễn Minh Anh, hội viên 2 năm</Text></View>
        <View style={styles.ctaCard}><Text style={styles.ctaIcon}>♨</Text><Text style={styles.ctaKicker}>TRẢI NGHIỆM KHÁC BIỆT MỖI NGÀY</Text><Text style={styles.ctaTitle}>Đăng ký trải nghiệm{`\n`}Tập thử 7 ngày 0đ</Text><Text style={styles.ctaCopy}>Tận hưởng đầy đủ tiện ích cao cấp và cảm nhận sự thay đổi.</Text><TouchableOpacity style={styles.ctaButton}><Text style={styles.ctaButtonText}>ĐĂNG KÝ TẬP THỬ NGAY  →</Text></TouchableOpacity></View>
        <Text style={styles.footerNote}>⌁  Áp dụng cho hội viên mới • Điều kiện áp dụng</Text>
      </ScrollView>
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101210' },
  safeArea: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 24},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 24 },
  brand: { color: '#f3f5ec', fontSize: 21, fontWeight: '900', letterSpacing: 1.2 },
  brandDot: { color: '#d9ff00' }, location: { color: '#899083', fontSize: 10, marginTop: 5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 }, headerIcon: { color: '#e9f1e3', fontSize: 23 },
  shoppingCart: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  greeting: { marginBottom: 18 }, kicker: { color: '#c1da00', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, greetingTitle: { color: '#f4f7ee', fontSize: 25, fontWeight: '800', marginTop: 6 }, greetingCopy: { color: '#9ca599', fontSize: 12, marginTop: 6 },
  heroCard: { height: 204, borderRadius: 14, overflow: 'hidden', marginBottom: 26 }, heroImage: { ...StyleSheet.absoluteFill }, heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8, 15, 10, .62)' }, heroCopy: { flex: 1, padding: 18, justifyContent: 'center' },
  pill: { alignSelf: 'flex-start', backgroundColor: '#c8ed00', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 5, marginBottom: 10 }, pillText: { color: '#192000', fontSize: 9, fontWeight: '900' }, heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', lineHeight: 26 }, heroDetail: { color: '#d4dbcf', fontSize: 11, marginTop: 7 }, heroButton: { backgroundColor: '#d9ff00', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 4, alignSelf: 'flex-start', marginTop: 13 }, heroButtonText: { color: '#152000', fontSize: 10, fontWeight: '900' },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, sectionHeading: { color: '#f2f6ea', fontSize: 15, fontWeight: '800' }, sectionAction: { color: '#c9ed00', fontSize: 9, fontWeight: '900' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 26 }, statCard: { backgroundColor: '#1c211d', borderRadius: 8, padding: 11, width: '48.8%', minHeight: 82, borderWidth: 1, borderColor: '#2c322c' }, statIcon: { fontSize: 16, fontWeight: '900', marginBottom: 4 }, statValue: { color: '#f0f4e8', fontSize: 12, fontWeight: '800' }, statLabel: { color: '#8e978d', fontSize: 9, marginTop: 3 },
  horizontalList: { gap: 10, paddingBottom: 26 }, workoutCard: { width: 180, height: 174, borderRadius: 10, overflow: 'hidden', backgroundColor: '#1d231e' }, workoutImage: { ...StyleSheet.absoluteFill }, workoutOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 12, 8, .52)' }, workoutTag: { position: 'absolute', top: 10, left: 10, backgroundColor: '#d9ff00', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 3 }, workoutTagText: { color: '#172000', fontSize: 7, fontWeight: '900' }, workoutCopy: { position: 'absolute', left: 12, right: 10, bottom: 11 }, workoutTitle: { color: '#fff', fontSize: 14, fontWeight: '900' }, workoutDetail: { color: '#d0d8ce', fontSize: 9, marginTop: 4, lineHeight: 13 }, workoutLink: { color: '#d9ff00', fontSize: 9, fontWeight: '800', marginTop: 7 },
  schedule: { backgroundColor: '#1b201c', borderRadius: 9, paddingHorizontal: 12, marginBottom: 24 }, scheduleRow: { minHeight: 61, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2c322c', gap: 11 }, scheduleTime: { color: '#d9ff00', fontSize: 11, fontWeight: '900', width: 39 }, scheduleInfo: { flex: 1 }, scheduleTitle: { color: '#ecf2e7', fontSize: 11, fontWeight: '800' }, scheduleRoom: { color: '#858e84', fontSize: 9, marginTop: 4 }, seatPill: { backgroundColor: '#2a3328', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 5 }, seatText: { color: '#bde000', fontSize: 8, fontWeight: '800' },
  reviewCard: { backgroundColor: '#1d231e', borderRadius: 9, padding: 14, marginBottom: 24 }, stars: { color: '#d9ff00', fontSize: 13, letterSpacing: 1 }, rating: { color: '#e8eee2', fontSize: 11, letterSpacing: 0 }, reviewQuote: { color: '#d9ded5', fontSize: 11, lineHeight: 17, marginTop: 8 }, reviewAuthor: { color: '#899288', fontSize: 9, marginTop: 7 },
  ctaCard: { backgroundColor: '#182018', borderRadius: 10, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#35412e' }, ctaIcon: { color: '#d9ff00', fontSize: 22, marginBottom: 8 }, ctaKicker: { color: '#b8cf00', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, ctaTitle: { color: '#f6faef', textAlign: 'center', fontSize: 19, lineHeight: 23, fontWeight: '900', marginTop: 7 }, ctaCopy: { color: '#929d91', textAlign: 'center', fontSize: 10, lineHeight: 15, marginTop: 8 }, ctaButton: { backgroundColor: '#d9ff00', alignSelf: 'stretch', alignItems: 'center', paddingVertical: 11, borderRadius: 5, marginTop: 15 }, ctaButtonText: { color: '#192100', fontSize: 9, fontWeight: '900' }, footerNote: { color: '#717a6e', fontSize: 8, textAlign: 'center', marginTop: 10 },
});
