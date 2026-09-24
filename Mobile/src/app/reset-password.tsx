import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import {
  AuthButton,
  AuthField,
  AuthScreen,
  authStyles,
} from "@/components/auth-ui";
import { AuthColors as C } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function ResetPassword() {
  const { recovery, resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function submit() {
    if (lock.current) return;
    if (password.length < 8 || password.length > 255 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Mật khẩu cần 8–255 ký tự, gồm chữ và số.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    lock.current = true; setBusy(true); setError('');
    try {
      if (await resetPassword(password)) router.replace("/login");
      else setError("Phiên khôi phục không hợp lệ.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể lưu mật khẩu. Vui lòng thử lại.");
    } finally { lock.current = false; setBusy(false); }
  }
  return (
    <AuthScreen>
      <Text style={authStyles.title}>Đặt lại mật khẩu</Text>
      <Text style={s.copy}>{recovery?.verified ? 'Tạo mật khẩu mới cho tài khoản QA-Gym. Phiên xác thực có hiệu lực trong 5 phút.' : 'Hãy yêu cầu mã xác nhận trước khi đặt lại mật khẩu.'}</Text>
      <AuthField
        label="MẬT KHẨU MỚI"
        icon="lock-closed-outline"
        value={password}
        editable={!busy}
        onChangeText={setPassword}
        placeholder="Ít nhất 8 ký tự"
        password
      />
      <AuthField
        label="XÁC NHẬN MẬT KHẨU"
        icon="lock-closed-outline"
        value={confirm}
        editable={!busy}
        onChangeText={setConfirm}
        placeholder="Nhập lại mật khẩu mới"
        password
        error={error}
      />
      <AuthButton
        title={busy ? 'ĐANG LƯU...' : 'LƯU MẬT KHẨU'}
        disabled={!recovery?.verified || busy}
        onPress={submit}
      />
      <AuthButton title="YÊU CẦU MÃ MỚI" disabled={busy} onPress={() => router.replace('/forgot-password')} />
    </AuthScreen>
  );
}
const s = StyleSheet.create({
  copy: { color: C.muted, fontSize: 15, marginTop: 12, marginBottom: 28 },
});
