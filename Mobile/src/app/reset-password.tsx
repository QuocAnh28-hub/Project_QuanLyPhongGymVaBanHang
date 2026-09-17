import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthButton, AuthField, AuthScreen, authStyles } from '@/components/auth-ui';
import { AuthColors as C } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ResetPassword() {
  const { recovery, resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  async function submit() {
    if (password.length < 8) { setError('Mật khẩu cần ít nhất 8 ký tự.'); return; }
    if (password !== confirm) { setError('Mật khẩu xác nhận không khớp.'); return; }
    try { if (await resetPassword(password)) router.replace('/login'); else setError('Phiên khôi phục không hợp lệ.'); }
    catch { setError('Không thể lưu mật khẩu. Vui lòng thử lại.'); }
  }
  return <AuthScreen><Text style={authStyles.title}>Đặt lại mật khẩu</Text><Text style={s.copy}>Tạo mật khẩu mới cho tài khoản QA-Gym.</Text><AuthField label="MẬT KHẨU MỚI" icon="lock-closed-outline" value={password} onChangeText={setPassword} placeholder="Ít nhất 8 ký tự" password /><AuthField label="XÁC NHẬN MẬT KHẨU" icon="lock-closed-outline" value={confirm} onChangeText={setConfirm} placeholder="Nhập lại mật khẩu mới" password error={error} /><AuthButton title="LƯU MẬT KHẨU" disabled={!recovery?.verified} onPress={submit} /></AuthScreen>;
}
const s = StyleSheet.create({ copy: { color: C.muted, fontSize: 14, marginTop: 12, marginBottom: 28 } });
