import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthColors as C, AuthRadius as R, AuthSpacing as S } from '@/constants/theme';

export function AuthScreen({ children, showHeader = true }: { children: ReactNode; showHeader?: boolean }) {
  return <SafeAreaView style={s.safe} edges={['top', 'bottom']}><KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>{showHeader ? <AuthHeader /> : null}{children}</ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
export function AuthHeader() {
  return <View style={s.header}><Pressable accessibilityLabel="Quay lại" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} hitSlop={12}><Ionicons name="arrow-back" size={26} color={C.text} /></Pressable><View style={s.brand}><Text style={s.brandText}>QA-GYM</Text><View style={s.dot} /></View><View style={s.avatar}><Ionicons name="person-outline" size={20} color="#283500" /></View></View>;
}
export function AuthField({ label, icon, error, password, right, ...props }: TextInputProps & { label: string; icon: keyof typeof Ionicons.glyphMap; error?: string; password?: boolean; right?: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return <View style={s.field}><Text style={s.label}>{label}</Text><View style={s.inputWrap}><Ionicons name={icon} size={21} color={C.muted} /><TextInput {...props} placeholderTextColor="#777b70" style={s.input} secureTextEntry={password && !visible} />{password ? <Pressable accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onPress={() => setVisible(!visible)}><Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={21} color={C.muted} /></Pressable> : right}</View>{error ? <Text style={s.error}>{error}</Text> : null}</View>;
}
export function AuthButton({ title, icon = 'arrow-forward', onPress, disabled }: { title: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void; disabled?: boolean }) {
  return <Pressable style={[s.button, disabled && s.disabled]} onPress={onPress} disabled={disabled}><Text style={s.buttonText}>{title}</Text><Ionicons name={icon} size={22} color="#283500" /></Pressable>;
}
export function AuthDivider({ title }: { title: string }) { return <View style={s.divider}><View style={s.line} /><Text style={s.dividerText}>{title}</Text><View style={s.line} /></View>; }
export function SocialButtons() { const handleSocialLogin = (_provider: 'google' | 'apple') => { /* TODO: connect OAuth when configured. */ }; return <View style={s.socialRow}><Pressable style={s.social} onPress={() => handleSocialLogin('google')}><Text style={[s.socialIcon, { color: '#c3f400' }]}>G</Text><Text style={s.socialText}>Google</Text></Pressable><Pressable style={s.social} onPress={() => handleSocialLogin('apple')}><Ionicons name="logo-apple" size={21} color={C.text} /><Text style={s.socialText}>Apple ID</Text></Pressable></View>; }
export function AuthLink({ text, action, href }: { text: string; action: string; href: '/login' | '/register' | '/forgot-password' }) { return <View style={s.footer}><Text style={s.muted}>{text} </Text><Pressable onPress={() => router.push(href)}><Text style={s.link}>{action}</Text></Pressable></View>; }
export const authStyles = StyleSheet.create({ title: { color: C.text, fontSize: 31, fontWeight: '700', letterSpacing: -0.8 }, description: { color: C.muted, fontSize: 17, lineHeight: 25 }, card: { backgroundColor: C.surface, borderRadius: R.xl, padding: S.md }, row: { flexDirection: 'row', alignItems: 'center' }, kicker: { color: C.lime, fontSize: 13, fontWeight: '700', letterSpacing: 1.5 } });
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background }, flex: { flex: 1 }, scroll: { width: '100%', maxWidth: 540, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 42 },
  header: { height: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandText: { color: C.lime, fontSize: 18, fontWeight: '700', letterSpacing: 2 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.lime }, avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  field: { marginBottom: 17 }, label: { color: C.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 7 }, inputWrap: { height: 54, backgroundColor: C.surface, borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 12 }, input: { flex: 1, color: C.text, fontSize: 16, padding: 0 }, error: { color: C.error, fontSize: 13, marginTop: 5 },
  button: { height: 56, borderRadius: 12, backgroundColor: C.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 22 }, disabled: { opacity: .55 }, buttonText: { color: '#283500', fontSize: 15, fontWeight: '800', letterSpacing: 1.2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 26 }, line: { height: 1, backgroundColor: '#333538', flex: 1 }, dividerText: { color: C.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }, socialRow: { flexDirection: 'row', gap: 12 }, social: { flex: 1, height: 52, borderRadius: 12, backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, socialIcon: { fontSize: 23, fontWeight: '800' }, socialText: { color: C.text, fontSize: 15, fontWeight: '700' }, footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 32 }, muted: { color: C.muted, fontSize: 15 }, link: { color: C.lime, fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' },
});
