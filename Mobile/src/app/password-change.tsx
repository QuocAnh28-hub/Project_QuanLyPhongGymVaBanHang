import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { changePassword } from '@/lib/password-api';

export default function PasswordChangeScreen() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const strong = next.length >= 8 && /[A-Z]/.test(next) && /[a-z]/.test(next) && /\d/.test(next) && /[^A-Za-z0-9]/.test(next);
  const valid = !!user?.accountId && !!current && strong && next !== current && confirm === next;
  async function submit() {
    if (!valid || !user?.accountId || loading) return;
    setLoading(true);
    try {
      await changePassword(user.accountId, current, next);
      setCurrent(''); setNext(''); setConfirm('');
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.');
    } catch (error) { Alert.alert('Không thể đổi mật khẩu', error instanceof Error ? error.message : 'Vui lòng thử lại'); }
    finally { setLoading(false); }
  }
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>
    <Pressable onPress={() => router.back()}><Text style={s.back}>‹ QUAY LẠI</Text></Pressable>
    <Text style={s.title}>ĐỔI MẬT KHẨU</Text>
    <Text style={s.hint}>Mật khẩu mới cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</Text>
    {([['Mật khẩu hiện tại', current, setCurrent], ['Mật khẩu mới', next, setNext], ['Nhập lại mật khẩu mới', confirm, setConfirm]] as const).map(([label, value, change]) => <View key={label}>
      <Text style={s.label}>{label}</Text><TextInput style={s.input} value={value} onChangeText={change} secureTextEntry autoCapitalize="none" />
    </View>)}
    {next && !strong ? <Text style={s.error}>Mật khẩu mới chưa đủ mạnh.</Text> : null}
    {confirm && confirm !== next ? <Text style={s.error}>Mật khẩu nhập lại không khớp.</Text> : null}
    <Pressable style={[s.button, (!valid || loading) && s.disabled]} onPress={submit} disabled={!valid || loading}><Text style={s.buttonText}>{loading ? 'ĐANG LƯU...' : 'ĐỔI MẬT KHẨU'}</Text></Pressable>
    <Text style={s.hint}>Xác thực hai yếu tố và sinh trắc học: Chưa hỗ trợ.</Text>
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101210' }, content: { width: '100%', maxWidth: 540, alignSelf: 'center', padding: 20, gap: 16 },
  back: { color: '#d9ff00', fontWeight: '800' }, title: { color: '#f0f4ec', fontSize: 25, fontWeight: '900' },
  hint: { color: '#aeb9aa', lineHeight: 21 }, label: { color: '#d9ff00', marginBottom: 7, fontWeight: '700' },
  input: { backgroundColor: '#232826', borderRadius: 9, color: '#fff', padding: 13 }, error: { color: '#ff9f9f' },
  button: { backgroundColor: '#d9ff00', borderRadius: 10, padding: 16, alignItems: 'center' }, disabled: { opacity: 0.4 },
  buttonText: { color: '#182000', fontWeight: '900' },
});
