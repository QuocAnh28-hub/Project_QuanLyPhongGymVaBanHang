import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

const menuItems = [
  ['history', 'Đổi mật khẩu tài khoản'],
  ['info-circle', 'Chính sách bảo lưu thẻ tập'],
  ['bell-o', 'Cài đặt thông báo & Nhắc lịch tập'],
];

const transactions = [
  ['♘', 'Đơn #QA-8941', 'Rule1 Whey Isolate 5lbs +', '1.670.000đ', '14/10/2028'],
  ['↗', 'Đơn #QA-8720', 'Đai lưng tập gym + C4+', '1.100.000đ', '03/09/2028'],
  ['▤', 'Đơn #QA-8105', 'Gia hạn Gói Diamond All-Access...', '15.480.000đ', '14/08/2028'],
];

function Header() {
  return <View style={styles.header}>
    <View style={styles.brandBlock}>
      <Text style={styles.brand}><MaterialCommunityIcons name="dumbbell" size={24} color="white" />QA-GYM<Text style={styles.brandDot}>.</Text></Text>
      <Text style={styles.location}><FontAwesome name="map-marker" size={12} color="#7b7c7d" />  Khoái Châu, Hưng Yên</Text>
    </View>
    <View style={styles.headerActions}><FontAwesome name="bell" size={24} color="#cfcfcf" /><View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View></View>
  </View>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} editable={false} style={styles.fieldInput} /></View>;
}

export default function ProfileScreen() {
  return <View style={styles.container}>
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Header />
        <View style={styles.personalDivider}><Text style={styles.kicker}>♙ HỒ SƠ HỘI VIÊN</Text></View>
        <>
          <View style={styles.memberHero}>
            <View style={styles.memberAvatar}><Image source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=85' }} style={styles.memberImage} contentFit="cover" /><View style={styles.camera}><FontAwesome name="camera" size={11} color="#182000" /></View></View>
            <Text style={styles.memberName}>Nguyễn Tuấn Anh <Text style={styles.verified}>●</Text></Text><Text style={styles.memberTier}>✦ HỘI VIÊN KIM CƯƠNG</Text><Text style={styles.contact}>✉ tuananh.fitness@gmail.com   ☎ 0988 123 456</Text>
            <View style={styles.memberStats}><View><Text style={styles.statNumber}>142</Text><Text style={styles.statLabel}>NGÀY TẬP</Text></View><View><Text style={styles.statNumber}>28</Text><Text style={styles.statLabel}>BUỔI PT</Text></View><View><Text style={styles.statNumber}>3.450</Text><Text style={styles.statLabel}>ĐIỂM TÍCH LŨY</Text></View></View>
          </View>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>THẺ THÀNH VIÊN HIỆN HÀNH</Text><Text style={styles.sectionAction}>ĐANG KÍCH HOẠT</Text></View>
          <View style={styles.passCard}><Text style={styles.passKicker}>QA-GYM PREMIUM</Text><Text style={styles.passName}>DIAMOND ALL-ACCESS PASS</Text><View style={styles.passInfo}><Text style={styles.passLabel}>MÃ THẺ{`\n`}QA24-DA-88992</Text><Text style={styles.passLabel}>HẠN HIỆU LỰC{`\n`}24/12/2026 <Text style={styles.passGreen}>(Còn 248 ngày)</Text></Text></View><View style={styles.progressLabel}><Text style={styles.passMutedText}>Tiến độ gói tập (12 Tháng)</Text><Text style={styles.passMutedText}>68%</Text></View><View style={styles.progressTrack}><View style={styles.progress} /></View><Text style={styles.passBenefits}>ĐẶC QUYỀN BAO GỒM:</Text><View style={styles.benefitPills}><Text style={styles.benefitPill}>◉ Tập 24/7 Không giới hạn</Text><Text style={styles.benefitPill}>◉ Full Group-X & Yoga</Text><Text style={styles.benefitPill}>◉ Sauna Thảo Dược</Text><Text style={styles.benefitPill}>◉ 02 Buổi PT1-1 / Tháng</Text></View><View style={styles.passActions}><Pressable style={styles.darkButton}><Text style={styles.darkButtonText}>▧ Mã QR vào cửa</Text></Pressable><Pressable style={styles.primaryButtonSmall}><Text style={styles.primaryButtonSmallText}>↻ Gia hạn thẻ</Text></Pressable></View></View>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>▣ LỊCH SỬ GIAO DỊCH GẦN ĐÂY</Text><Text style={styles.sectionAction}>XEM TẤT CẢ</Text></View>
          <View style={styles.transactions}>{transactions.map((transaction) => <View style={styles.transaction} key={transaction[0] + transaction[1]}><Text style={styles.transactionIcon}>{transaction[0]}</Text><View style={styles.transactionCopy}><Text style={styles.transactionTitle}>{transaction[1]} <Text style={styles.success}>Thành công</Text></Text><Text style={styles.transactionName}>{transaction[2]}</Text><Text style={styles.transactionDate}>{transaction[4]}</Text></View><View style={styles.transactionAmount}><Text style={styles.transactionAmountText}>{transaction[3]}</Text><Text style={styles.transactionDetail}>Chi tiết</Text></View></View>)}</View>
        </>
        <View style={styles.pageIntro}><Text style={styles.kicker}>♧ CÀI ĐẶT THÔNG TIN CÁ NHÂN</Text></View>
        <View style={styles.formCard}>
          <Field label="HỌ VÀ TÊN" value="Nguyễn Tuấn Anh" />
          <Field label="ĐỊA CHỈ EMAIL" value="tuananh.fitness@gmail.com" />
          <Field label="SỐ ĐIỆN THOẠI" value="0988 123 456" />
          <View style={styles.tripleRow}><Field label="CHIỀU CAO" value="178 cm" /><Field label="CÂN NẶNG" value="74 kg" /><Field label="NGÀY SINH" value="12/09/1998" /></View>
          <Text style={styles.fieldLabel}>MỤC TIÊU THỂ HÌNH</Text>
          <View style={styles.selectBox}><Text style={styles.selectText}>Tăng cơ siết mỡ (Lean Muscle)</Text><Text style={styles.chevron}>⌄</Text></View>
          <Pressable style={styles.primaryButton}><FontAwesome name="save" size={12} color="#192000" /><Text style={styles.primaryText}>CẬP NHẬT THÔNG TIN</Text></Pressable>
        </View>
        <View style={styles.menuCard}>{menuItems.map(([icon, label]) => <Pressable style={styles.menuRow} key={label}><FontAwesome name={icon as never} size={14} color="#d9ff00" /><Text style={styles.menuText}>{label}</Text><Text style={styles.menuArrow}>›</Text></Pressable>)}</View>
        <Pressable style={styles.logout}><FontAwesome name="sign-out" size={13} color="#ff8d82" /><Text style={styles.logoutText}>Đăng xuất tài khoản</Text></Pressable>
        <Text style={styles.version}>QA-GYM APP V2.4.0 • BUILD FOR CHAMPIONS</Text>
      </ScrollView>
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101210' }, safeArea: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' }, 
  content: { paddingHorizontal: 16, paddingBottom: BottomTabInset + 24 },
  header: { position: 'relative', flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 24 }, 
  brandBlock: { flexShrink: 1, paddingRight: 76 }, brand: { color: '#f3f5ec', fontSize: 21, fontWeight: '900', 
  letterSpacing: 1.2 }, brandDot: { color: '#d9ff00' }, location: { color: '#899083', fontSize: 10, marginTop: 5 }, 
  headerActions: { position: 'absolute', top: 20.5, right: 0, flexDirection: 'row', alignItems: 'center', gap: 14 }, 
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#6b7c61', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#b4c7a7' }, 
  avatarText: { color: '#f5f9ed', fontWeight: '800' },
  pageIntro: { borderTopWidth: 1, borderTopColor: '#303631', marginTop: 30, paddingVertical: 12 }, personalDivider: { marginTop: 0, paddingTop: 0, marginBottom: 2 }, 
  kicker: { color: '#d9ff00', fontSize: 10, fontWeight: '900' }, formCard: { backgroundColor: '#1d221f', borderRadius: 10, padding: 11 }, 
  field: { flex: 1, marginBottom: 10 }, fieldLabel: { color: '#d3dfc6', fontSize: 7, fontWeight: '900', marginBottom: 5 }, 
  fieldInput: { color: '#f0f5eb', backgroundColor: '#0e1110', borderRadius: 6, minHeight: 34, paddingHorizontal: 9, fontSize: 10 }, 
  tripleRow: { flexDirection: 'row', gap: 7 }, selectBox: { minHeight: 36, backgroundColor: '#0e1110', borderRadius: 6, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, 
  selectText: { color: '#e5ece0', fontSize: 9 }, chevron: { color: '#d9ff00', fontSize: 18 }, primaryButton: { minHeight: 34, backgroundColor: '#caff00', borderRadius: 7, marginTop: 9, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }, 
  primaryText: { color: '#192000', fontSize: 9, fontWeight: '900' }, menuCard: { backgroundColor: '#1d221f', borderRadius: 10, marginTop: 10, paddingHorizontal: 11 }, 
  menuRow: { minHeight: 43, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#303631', gap: 10 }, menuText: { color: '#e0e7de', fontSize: 9, flex: 1 }, menuArrow: { color: '#d9ff00', fontSize: 20 }, 
  logout: { minHeight: 34, borderRadius: 7, backgroundColor: '#292d30', marginTop: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }, logoutText: { color: '#ff8d82', fontSize: 9, fontWeight: '800' }, 
  version: { color: '#788278', textAlign: 'center', fontSize: 7, fontWeight: '800', marginTop: 12 },
  memberHero: { alignItems: 'center', backgroundColor: '#171b18', borderRadius: 10, padding: 13 }, memberAvatar: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, borderColor: '#d9ff00', padding: 2, position: 'relative' }, 
  memberImage: { width: '100%', height: '100%', borderRadius: 36 }, camera: { position: 'absolute', right: -2, bottom: 0, width: 21, height: 21, borderRadius: 11, backgroundColor: '#caff00', alignItems: 'center', justifyContent: 'center' }, 
  memberName: { color: '#f1f6eb', fontSize: 17, fontWeight: '900', marginTop: 7 }, verified: { color: '#d9ff00', fontSize: 10 }, memberTier: { color: '#d9ff00', fontSize: 7, fontWeight: '900', marginTop: 3 }, 
  contact: { color: '#b3beb0', fontSize: 8, marginTop: 8 }, memberStats: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around', backgroundColor: '#202521', borderRadius: 8, marginTop: 12, paddingVertical: 9, alignItems: 'center' }, 
  statNumber: { color: '#d9ff00', fontSize: 16, fontWeight: '900', textAlign: 'center' }, statLabel: { color: '#8e998d', fontSize: 7, textAlign: 'center', marginTop: 2 }, 
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }, sectionTitle: { color: '#dce7d6', fontSize: 9, fontWeight: '900' }, sectionAction: { color: '#d9ff00', fontSize: 7, fontWeight: '900' }, 
  passCard: { backgroundColor: '#252c24', borderRadius: 9, padding: 12 }, passKicker: { color: '#d9ff00', fontSize: 7, fontWeight: '900' }, passName: { color: '#f1f6eb', fontSize: 14, fontWeight: '900', marginTop: 3 }, 
  passInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }, passLabel: { color: '#dce5d8', fontSize: 8, lineHeight: 13 }, passGreen: { color: '#d9ff00' }, passMutedText: { color: '#aeb9aa', fontSize: 7 }, 
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }, progressTrack: { height: 5, borderRadius: 3, backgroundColor: '#111511', marginTop: 5 }, progress: { width: '68%', height: 5, borderRadius: 3, backgroundColor: '#caff00' }, 
  passBenefits: { color: '#b9c8b5', fontSize: 7, fontWeight: '900', marginTop: 13 }, benefitPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 }, benefitPill: { color: '#dfe8db', fontSize: 7, backgroundColor: '#182018', padding: 4, borderRadius: 4 }, 
  passActions: { flexDirection: 'row', gap: 7, marginTop: 13 }, darkButton: { flex: 1, backgroundColor: '#111411', borderRadius: 7, minHeight: 31, alignItems: 'center', justifyContent: 'center' }, darkButtonText: { color: '#e6eee1', fontSize: 8, fontWeight: '800' }, 
  primaryButtonSmall: { flex: 1, backgroundColor: '#caff00', borderRadius: 7, minHeight: 31, alignItems: 'center', justifyContent: 'center' }, primaryButtonSmallText: { color: '#192000', fontSize: 8, fontWeight: '900' }, transactions: { gap: 7 }, 
  transaction: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1d221f', borderRadius: 8, padding: 9 }, transactionIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#29372a', color: '#d9ff00', textAlign: 'center', paddingTop: 6, marginRight: 8 }, 
  transactionCopy: { flex: 1 }, transactionTitle: { color: '#e5ede2', fontSize: 8, fontWeight: '900' }, success: { color: '#172000', backgroundColor: '#caff00', fontSize: 6, paddingHorizontal: 3 }, transactionName: { color: '#a5b0a2', fontSize: 8, marginTop: 3 }, 
  transactionDate: { color: '#778378', fontSize: 7, marginTop: 3 }, transactionAmount: { alignItems: 'flex-end' }, transactionAmountText: { color: '#d9ff00', fontSize: 8, fontWeight: '900' }, transactionDetail: { color: '#9ba89a', fontSize: 7, marginTop: 4 },
});
