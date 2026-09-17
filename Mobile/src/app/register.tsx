import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthButton, AuthDivider, AuthField, AuthLink, AuthScreen, SocialButtons } from '@/components/auth-ui';
import { AuthColors as C } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const goals = [{ title: 'Tăng cơ bắp', detail: 'Hypertrophy', icon: 'barbell-outline' }, { title: 'Giảm mỡ / Siết', detail: 'Fat Burn', icon: 'flame-outline' }, { title: 'Rèn thể lực', detail: 'Endurance', icon: 'fitness-outline' }, { title: 'Yoga & Phục hồi', detail: 'Mobility', icon: 'body-outline' }] as const;
export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [goalsSelected, setGoalsSelected] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const set = (key: keyof typeof form) => (value: string) => setForm(old => ({ ...old, [key]: value }));
  const errors = { name: !form.name.trim() ? 'Vui lòng nhập họ và tên.' : '', phone: !form.phone.trim() ? 'Vui lòng nhập số điện thoại.' : '', email: !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? 'Email không hợp lệ.' : '', password: form.password.length < 8 ? 'Mật khẩu cần ít nhất 8 ký tự.' : '', confirm: form.confirm !== form.password || !form.confirm ? 'Mật khẩu xác nhận không khớp.' : '' };
  const strength = !form.password ? 0 : form.password.length < 8 ? 1 : /[A-Za-z]/.test(form.password) && /\d/.test(form.password) && /[^A-Za-z0-9]/.test(form.password) ? 3 : 2;
  async function handleRegister() {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || !terms) return;
    try { setMessage(await register({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), password: form.password }) ?? ''); }
    catch { setMessage('Không thể lưu tài khoản. Vui lòng thử lại.'); }
  }
  return <AuthScreen>
    <View style={s.promo}><Text style={s.promoBadge}>ϟ  ĐẶC QUYỀN HỘI VIÊN MỚI</Text><Text style={s.promoTitle}>Gia nhập <Text style={{ color: C.lime }}>QA-Gym</Text></Text><Text style={s.promoCopy}>Tạo tài khoản hội viên để nhận ngay 1 buổi tập 1-1 cùng HLV & phân tích chỉ số InBody 770 miễn phí!</Text><View style={s.benefits}>{[['fitness-outline', '1x HLV Pro'], ['stats-chart-outline', 'InBody Scan'], ['ribbon-outline', 'Pass 30 ngày']].map(([icon, title]) => <View style={s.benefit} key={title}><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={C.mint} /><Text style={s.benefitText}>{title}</Text></View>)}</View></View>
    <AuthField label="HỌ VÀ TÊN" icon="person-outline" placeholder="Nguyễn Tuấn Anh" value={form.name} onChangeText={set('name')} error={submitted ? errors.name : undefined} />
    <AuthField label="SỐ ĐIỆN THOẠI" icon="call-outline" placeholder="0912 345 678" keyboardType="phone-pad" value={form.phone} onChangeText={set('phone')} error={submitted ? errors.phone : undefined} />
    <AuthField label="EMAIL" icon="mail-outline" placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set('email')} error={submitted ? errors.email : undefined} />
    <AuthField label="MẬT KHẨU" icon="lock-closed-outline" placeholder="Ít nhất 8 ký tự, gồm chữ và số" value={form.password} onChangeText={set('password')} password error={submitted ? errors.password : undefined} />
    <View style={s.strength}><Text style={s.strengthText}>{['CHƯA NHẬP', 'YẾU', 'TRUNG BÌNH', 'MẠNH'][strength]}</Text><View style={s.bars}>{[1, 2, 3].map(n => <View key={n} style={[s.bar, strength >= n && { backgroundColor: strength === 1 ? C.error : C.lime }]} />)}</View></View>
    <AuthField label="XÁC NHẬN MẬT KHẨU" icon="lock-closed-outline" placeholder="Nhập lại mật khẩu" value={form.confirm} onChangeText={set('confirm')} password error={submitted ? errors.confirm : undefined} />
    <View style={s.sectionRow}><Text style={s.sectionTitle}>MỤC TIÊU TẬP LUYỆN CHÍNH</Text><Text style={s.hint}>Chọn 1 hoặc nhiều</Text></View>
    <View style={s.goals}>{goals.map(goal => { const selected = goalsSelected.includes(goal.title); return <Pressable key={goal.title} style={[s.goal, selected && s.goalSelected]} onPress={() => setGoalsSelected(old => selected ? old.filter(x => x !== goal.title) : [...old, goal.title])}><View style={[s.goalIcon, selected && s.goalIconSelected]}><Ionicons name={goal.icon} size={19} color={selected ? '#283500' : C.text} /></View><View style={{ flex: 1 }}><Text style={[s.goalTitle, selected && { color: C.lime }]}>{goal.title}</Text><Text style={s.goalDetail}>{goal.detail}</Text></View></Pressable>; })}</View>
    <Pressable style={s.terms} onPress={() => setTerms(!terms)} accessibilityRole="checkbox" accessibilityState={{ checked: terms }}><View style={[s.check, terms && { backgroundColor: C.lime }]}>{terms && <Ionicons name="checkmark" size={18} color="#283500" />}</View><Text style={s.termsText}>Tôi đồng ý với <Text style={s.underline}>Điều khoản dịch vụ</Text> & <Text style={s.underline}>Chính sách bảo mật</Text> của QA-Gym.</Text></Pressable>
    {submitted && !terms ? <Text style={s.error}>Vui lòng đồng ý với điều khoản.</Text> : null}{message ? <Text style={s.error}>{message}</Text> : null}<AuthButton title="ĐĂNG KÝ HỘI VIÊN" onPress={handleRegister} />
    <AuthDivider title="HOẶC ĐĂNG KÝ NHANH" /><SocialButtons />
    <View style={s.community}><Ionicons name="trophy-outline" size={26} color={C.lime} /><View><Text style={s.communityTitle}>Hơn 12,400+ gymer đã tham gia</Text><Text style={s.communityCopy}>Cộng đồng tập luyện bứt phá giới hạn số 1</Text></View></View>
    <AuthLink text="Đã có tài khoản?" action="Đăng nhập" href="/login" />
  </AuthScreen>;
}
const s = StyleSheet.create({ promo: { backgroundColor: '#2b2d2e', borderRadius: 15, padding: 17, marginBottom: 26 }, promoBadge: { color: C.lime, fontSize: 10, fontWeight: '800', letterSpacing: .5, marginBottom: 13 }, promoTitle: { color: C.text, fontSize: 26, fontWeight: '800' }, promoCopy: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 9 }, benefits: { flexDirection: 'row', gap: 9, marginTop: 16 }, benefit: { flex: 1, minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.background, borderRadius: 9, padding: 7 }, benefitText: { color: C.text, fontSize: 10, fontWeight: '700', flex: 1 }, strength: { marginTop: -10, marginBottom: 17 }, strengthText: { color: C.muted, fontSize: 10, fontWeight: '700', textAlign: 'right', marginBottom: 5 }, bars: { flexDirection: 'row', gap: 6 }, bar: { flex: 1, height: 4, borderRadius: 3, backgroundColor: C.surfaceHigh }, sectionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 8, marginBottom: 9 }, sectionTitle: { color: C.text, fontSize: 11, fontWeight: '800', letterSpacing: .5 }, hint: { color: C.lime, fontSize: 11, fontWeight: '700' }, goals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, goal: { width: '48.8%', flexDirection: 'row', alignItems: 'center', minHeight: 56, backgroundColor: C.surface, borderRadius: 10, gap: 8, padding: 8 }, goalSelected: { borderWidth: 1, borderColor: '#394713' }, goalIcon: { width: 30, height: 30, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surfaceHigh }, goalIconSelected: { backgroundColor: C.lime }, goalTitle: { color: C.text, fontSize: 11, fontWeight: '700' }, goalDetail: { color: C.muted, fontSize: 10 }, terms: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 25 }, check: { width: 22, height: 22, backgroundColor: C.surfaceHigh, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }, termsText: { color: C.muted, flex: 1, fontSize: 12, lineHeight: 19 }, underline: { color: C.text, textDecorationLine: 'underline' }, error: { color: C.error, fontSize: 12, marginTop: 8 }, community: { marginTop: 28, backgroundColor: '#0c0e11', borderRadius: 13, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 15 }, communityTitle: { color: C.text, fontSize: 12, fontWeight: '700' }, communityCopy: { color: C.muted, fontSize: 11, marginTop: 3 } });
