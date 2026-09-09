import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

const durations = ['1 Tháng', '3 Tháng', '6 Tháng', '12 Tháng'];

const benefits = [
  ['Tập không giới hạn', '06:00 - 22:00 cả tuần'],
  ['Tham gia tất cả các lớp Yoga & Group-X', 'bản quyền'],
  ['Không giới hạn Sauna theo thời gian không giới hạn'],
  ['Tặng 02 buổi InBody định kỳ tư vấn chuyển sâu cùng HLV'],
];

function BenefitRow({ children, icon }: { children: string[]; icon: string }) {
  return (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={styles.benefitText}>{children.join(' ')}</Text>
    </View>
  );
}

function PlanButton({ children, muted = false }: { children: string; muted?: boolean }) {
  return (
    <Pressable style={[styles.planButton, muted && styles.mutedButton]}>
      <Text style={[styles.planButtonText, muted && styles.mutedButtonText]}>{children}</Text>
      <Text style={styles.buttonArrow}>{muted ? '◌' : '↗'}</Text>
    </Pressable>
  );
}

export default function PackagesScreen() {
  const [selectedDuration, setSelectedDuration] = useState('12 Tháng');

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          stickyHeaderIndices={[0]}>
          <View style={styles.header}>
            <View style={styles.brandWrap}>
              <View style={styles.brandMark}>
                <MaterialCommunityIcons name="dumbbell" size={15} color="#d9ff00" />
              </View>
              <View>
                <Text style={styles.brand}>QA-GYM</Text>
                <Text style={styles.brandSub}>GOI TAP</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Ionicons name="notifications-outline" size={19} color="#dce2d9" />
              <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
            </View>
          </View>

          <View style={styles.intro}>
            <View style={styles.eyebrow}><Text style={styles.eyebrowText}>✦ ĐĂNG KÝ TẬP THỂ HÌNH 5 SAO</Text></View>
            <Text style={styles.title}>Các Gói Tập & Thẻ Hội Viên{`\n`}QA-Gym</Text>
            <Text style={styles.subtitle}>Lựa chọn gói tập phù hợp với mục tiêu thể hình{`\n`}của bạn</Text>
          </View>

          <View style={styles.durationBar}>
            {durations.map((duration) => (
              <Pressable
                key={duration}
                onPress={() => setSelectedDuration(duration)}
                style={[styles.durationItem, selectedDuration === duration && styles.durationSelected]}>
                <Text style={[styles.durationText, selectedDuration === duration && styles.durationSelectedText]}>{duration}</Text>
                {duration === '12 Tháng' && <Text style={styles.hotBadge}>HOT -40%</Text>}
              </Pressable>
            ))}
          </View>

          <View style={styles.planCard}>
            <View style={styles.planTag}><Text style={styles.planTagText}>✦ BÁN CHẠY NHẤT</Text></View>
            <Text style={styles.planKicker}>HẠNG THẺ ĐƯỢC YÊU THÍCH</Text>
            <View style={styles.planHeadingRow}>
              <View><Text style={styles.planName}>Gold VIP - Phổ Biến Nhất</Text><View style={styles.priceRow}><Text style={styles.price}>790.000đ</Text><Text style={styles.perMonth}>/tháng</Text></View></View>
              <Text style={styles.planStar}>☆</Text>
            </View>
            <Text style={styles.saving}>✓ Tiết kiệm 300.000đ khi đóng 12 tháng</Text>
            <View style={styles.benefits}>
              {benefits.map((benefit, index) => <BenefitRow key={index} icon={['◷', '♧', '♧', '♧'][index]}>{benefit}</BenefitRow>)}
            </View>
            <PlanButton>ĐĂNG KÝ GÓI GOLD VIP ⚡</PlanButton>
            <Text style={styles.hotline}>▣ Tư vấn qua Zalo / Hotline</Text>
          </View>

          <View style={styles.planCard}>
            <View style={[styles.planTag, styles.blueTag]}><Text style={[styles.planTagText, styles.blueTagText]}>ĐĂNG KÝ THƯỜNG LƯU</Text></View>
            <Text style={[styles.planKicker, styles.blueKicker]}>CÓ TRỌN GÓI CAO CẤP</Text>
            <View style={styles.planHeadingRow}><View><Text style={styles.planName}>Diamond All-Access</Text><View style={styles.priceRow}><Text style={styles.darkPrice}>1.290.000đ</Text><Text style={styles.perMonth}>/tháng</Text></View></View><Text style={styles.diamond}>◇</Text></View>
            <View style={styles.benefits}>
              {['Toàn bộ quyền lợi của Gold VIP', 'Miễn phí 02 buổi tập 1-1 cùng Huấn luyện viên cá nhân (PT)', 'Được dẫn theo 01 người bạn đi tập cùng mỗi tháng', 'Khăn tắm lạnh & Nước detox thường hạng miễn phí mỗi buổi', 'Quyền ưu tiên phục hồi bất kỳ hạng Lounge VIP sang trọng'].map((text, index) => <BenefitRow key={index} icon={['◉', '✦', '♧', '▾', '◫'][index]}>{[text]}</BenefitRow>)}
            </View>
            <PlanButton muted>ĐĂNG KÝ DIAMOND</PlanButton>
          </View>

          <View style={styles.planCard}>
            <View style={[styles.planTag, styles.silverTag]}><Text style={[styles.planTagText, styles.silverTagText]}>TIẾT KIỆM TỐI ƯU</Text></View>
            <Text style={styles.planKicker}>BƯỚC KHỞI ĐẦU</Text>
            <Text style={styles.planName}>Silver Pass - Khởi Đầu</Text>
            <View style={styles.priceRow}><Text style={styles.darkPrice}>490.000đ</Text><Text style={styles.perMonth}>/tháng</Text></View>
            <View style={styles.benefits}>
              <BenefitRow icon="◷">{['Tập không giới hạn khung giờ chuẩn:', '08:00 - 16:00']}</BenefitRow>
              <BenefitRow icon="✦">{['Toàn quyền sử dụng phòng tập Tạ máy & Khu Cardio nhập khẩu']}</BenefitRow>
              <BenefitRow icon="♙">{['Miễn phí túi đồ cá nhân thông minh & phòng tắm nóng lạnh']}</BenefitRow>
            </View>
            <PlanButton muted>CHỌN SILVER PASS</PlanButton>
          </View>

          <View style={styles.studentCard}>
            <View><View style={[styles.planTag, styles.studentTag]}><Text style={[styles.planTagText, styles.studentTagText]}>ƯU ĐÃI GEN Z</Text></View><Text style={styles.planName}>Gói Student / HSSV</Text><Text style={styles.studentCopy}>Yêu cầu xuất trình thẻ HSSV{`\n`}còn hiệu lực khi check-in</Text></View>
            <View style={styles.studentPrice}><Text style={styles.studentAmount}>350.000đ</Text><Text style={styles.perMonth}>/tháng</Text><Text style={styles.studentTime}>✓ Full giờ 08:00 - 17:00</Text></View>
            <PlanButton muted>ĐĂNG KÝ HSSV</PlanButton>
          </View>

          <Text style={styles.tableTitle}>MINH BẠCH Ở RÕ RÀNG</Text>
          <Text style={styles.tableHeading}>Bảng So Sánh Quyền Lợi Nhanh</Text>
          <View style={styles.table}>
            {['Đặc quyền|Silver|Gold VIP|Diamond', 'Khung giờ tập|08h-16h|24/7 Full|24/7 Full', 'Yoga & Lớp nhóm|—|✓|✓', 'Sauna Thảo Dược|—|✓|✓', 'Buổi PT1-1|—|—|2 Buổi', 'Lounge & Detox|—|—|✓'].map((row) => <View style={styles.tableRow} key={row}><>{row.split('|').map((cell, index) => <Text key={index} style={[styles.tableCell, index === 0 && styles.tableLabel, index > 1 && styles.tableAccent]}>{cell}</Text>)}</></View>)}
          </View>

          <View style={styles.noteCard}><Text style={styles.noteIcon}>▣</Text><View><Text style={styles.noteTitle}>Trả góp 0% Lãi Suất</Text><Text style={styles.noteText}>Áp dụng linh hoạt qua{`\n`}thẻ tín dụng của 26{`\n`}ngân hàng liên kết, thủ tục chỉ{`\n`}2 phút không phụ phí.</Text></View></View>
          <View style={styles.noteCard}><Text style={styles.noteIcon}>◉</Text><View><Text style={styles.noteTitle}>Chính Sách Bảo Lưu Linh Hoạt</Text><Text style={styles.noteText}>Bảo lưu ngay tập hoàn toàn miễn phí{`\n`}lên tới 60 ban{`\n`}ngày khi bạn bận công tác, du lịch{`\n`}hoặc lễ Tết.</Text></View></View>

          <View style={styles.footerPromo}><Text style={styles.promoKicker}>KHÔNG GIAN TẬP LUYỆN CHUẨN QUỐC TẾ</Text><Text style={styles.promoTitle}>1.800m² Không Gian & Thiết Bị{`\n`}Hammer Strength</Text><Text style={styles.promoCopy}>Chưa biết gói nào phù hợp nhất với cơ địa của bạn?</Text><Text style={styles.promoLink}>Đặt lịch hẹn tham quan phòng tập miễn phí →</Text></View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0f10' },
  safeArea: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' },
  content: { paddingHorizontal: 12, paddingBottom: BottomTabInset + 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#101415', marginHorizontal: -12, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#23282a' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 7 }, brandMark: { width: 25, height: 25, backgroundColor: '#1b2021', justifyContent: 'center', alignItems: 'center' }, brand: { color: '#e8eee7', fontSize: 12, fontWeight: '900', letterSpacing: 1 }, brandSub: { color: '#d9ff00', fontSize: 7, fontWeight: '900', letterSpacing: 1 }, headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 }, avatar: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#667466', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#a8baa4' }, avatarText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  intro: { alignItems: 'center', paddingTop: 22, paddingBottom: 17 }, eyebrow: { backgroundColor: '#253500', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }, eyebrowText: { color: '#cbed00', fontSize: 7, fontWeight: '900' }, title: { color: '#e5e9e3', textAlign: 'center', fontSize: 18, lineHeight: 21, fontWeight: '900', marginTop: 10 }, subtitle: { color: '#879087', textAlign: 'center', fontSize: 10, lineHeight: 14, marginTop: 8 },
  durationBar: { flexDirection: 'row', backgroundColor: '#1a1e20', borderRadius: 7, padding: 3, marginBottom: 18 }, durationItem: { flex: 1, minHeight: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }, durationSelected: { backgroundColor: '#d9ff00' }, durationText: { color: '#c3c9c0', fontSize: 8, fontWeight: '800' }, durationSelectedText: { color: '#1d2700' }, hotBadge: { color: '#fff', backgroundColor: '#e80038', fontSize: 6, fontWeight: '900', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  planCard: { backgroundColor: '#202427', borderRadius: 8, padding: 11, marginBottom: 10, borderWidth: 1, borderColor: '#2c3133' }, planTag: { alignSelf: 'flex-start', backgroundColor: '#c9f000', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 4 }, planTagText: { color: '#263100', fontSize: 7, fontWeight: '900' }, planKicker: { color: '#cbed00', fontSize: 7, fontWeight: '900', marginTop: 9 }, planHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, planName: { color: '#e5e8e3', fontSize: 14, fontWeight: '900', marginTop: 3 }, priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }, price: { color: '#d9ff00', fontSize: 27, lineHeight: 30, fontWeight: '900' }, darkPrice: { color: '#e0e4df', fontSize: 27, lineHeight: 30, fontWeight: '900' }, perMonth: { color: '#88908b', fontSize: 8, marginLeft: 3 }, planStar: { color: '#d9ff00', fontSize: 25 }, saving: { color: '#bbdb00', fontSize: 8, fontWeight: '700', marginTop: 3 }, benefits: { marginTop: 9, gap: 5 }, benefitRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#171a1c', borderRadius: 4, paddingVertical: 7, paddingHorizontal: 7 }, benefitIcon: { color: '#cfff00', width: 16, fontSize: 11, fontWeight: '900' }, benefitText: { color: '#c4c9c4', flex: 1, fontSize: 9, lineHeight: 12 }, planButton: { backgroundColor: '#caff00', minHeight: 29, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 10, flexDirection: 'row' }, planButtonText: { color: '#1b2600', fontSize: 9, fontWeight: '900' }, buttonArrow: { color: '#1b2600', fontSize: 11, marginLeft: 5 }, mutedButton: { backgroundColor: '#3b3e42' }, mutedButtonText: { color: '#e1e4df' }, hotline: { color: '#9ca49b', fontSize: 8, textAlign: 'center', marginTop: 8 },
  blueTag: { backgroundColor: '#182e3b' }, blueTagText: { color: '#59c8f1' }, blueKicker: { color: '#4ebbe6' }, diamond: { color: '#63cfff', fontSize: 28 }, silverTag: { backgroundColor: '#39413e' }, silverTagText: { color: '#d1d7ce' }, studentCard: { backgroundColor: '#1c2022', borderRadius: 8, padding: 11, marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6 }, studentTag: { backgroundColor: '#0ba879' }, studentTagText: { color: '#071c17' }, studentCopy: { color: '#8b948e', fontSize: 8, lineHeight: 11, marginTop: 5 }, studentPrice: { alignItems: 'flex-end' }, studentAmount: { color: '#50d9a9', fontSize: 15, fontWeight: '900', marginTop: 15 }, studentTime: { color: '#9fa9a1', fontSize: 8, marginTop: 14 },
  tableTitle: { color: '#cbed00', textAlign: 'center', fontSize: 7, fontWeight: '900', letterSpacing: 1, marginBottom: 4 }, tableHeading: { color: '#e5e9e4', textAlign: 'center', fontSize: 13, fontWeight: '900', marginBottom: 9 }, table: { backgroundColor: '#1c2022', borderRadius: 7, overflow: 'hidden', marginBottom: 14 }, tableRow: { flexDirection: 'row', minHeight: 31, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2d3234' }, tableCell: { color: '#a8b0a9', fontSize: 7, flex: 1, textAlign: 'center' }, tableLabel: { color: '#d7dbd6', textAlign: 'left', paddingLeft: 6, flex: 1.3 }, tableAccent: { color: '#cbed00', fontWeight: '800' }, noteCard: { flexDirection: 'row', backgroundColor: '#292d30', borderRadius: 8, padding: 11, marginBottom: 9 }, noteIcon: { color: '#cbed00', fontSize: 17, width: 28 }, noteTitle: { color: '#e0e5df', fontSize: 10, fontWeight: '800' }, noteText: { color: '#a4aca5', fontSize: 8, lineHeight: 11, marginTop: 4 }, footerPromo: { minHeight: 190, justifyContent: 'flex-end', padding: 12, marginTop: 10, backgroundColor: '#15191a', borderRadius: 6 }, promoKicker: { color: '#cbed00', fontSize: 7, fontWeight: '900' }, promoTitle: { color: '#e5ebe4', fontSize: 14, lineHeight: 17, fontWeight: '900', marginTop: 5 }, promoCopy: { color: '#c0c6bf', fontSize: 9, textAlign: 'center', marginTop: 30 }, promoLink: { color: '#cbed00', fontSize: 8, textAlign: 'center', fontWeight: '900', marginTop: 10 },
});