import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import {
  AuthButton,
  AuthField,
  AuthScreen,
  authStyles,
} from "@/components/auth-ui";
import { AuthColors as C } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtp() {
  const { recovery, verifyOtp, beginRecovery } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const remaining = Math.max(0, Math.ceil(((recovery?.resendAt || 0) - now) / 1000));
  async function submit(resend = false) {
    if (lock.current || !recovery) return;
    if (!resend && !/^\d{6}$/.test(code)) { setError('Vui lòng nhập đủ 6 chữ số.'); return; }
    lock.current = true; setBusy(true); setError('');
    try {
      if (resend) { await beginRecovery(recovery.email); setCode(''); setNow(Date.now()); }
      else if (await verifyOtp(code)) router.replace('/reset-password');
      else setError('Phiên xác thực không hợp lệ. Hãy yêu cầu mã mới.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Không thể xác thực.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return (
    <AuthScreen>
      <Text style={authStyles.title}>Xác thực mã</Text>
      <Text style={s.copy}>
        {recovery
          ? `Nếu ${recovery.email} thuộc tài khoản đang hoạt động, mã đã được gửi đến email này. Kiểm tra cả thư rác. Mã có hiệu lực trong 2 phút.`
          : "Hãy bắt đầu lại từ màn Quên mật khẩu."}
      </Text>
      <AuthField
        label="MÃ XÁC THỰC"
        icon="key-outline"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={value => { setCode(value.replace(/\D/g, '')); setError(''); }}
        editable={!busy}
        autoComplete="one-time-code"
        placeholder="6 chữ số"
        error={error}
      />
      <AuthButton
        title={busy ? 'ĐANG XỬ LÝ...' : 'XÁC THỰC'}
        disabled={!recovery || busy}
        onPress={() => submit()}
      />
      <AuthButton title={remaining ? `GỬI LẠI SAU ${remaining} GIÂY` : 'GỬI LẠI MÃ'} disabled={!recovery || busy || remaining > 0} onPress={() => submit(true)} />
      <AuthButton title="ĐỔI EMAIL" disabled={busy} onPress={() => router.replace('/forgot-password')} />
    </AuthScreen>
  );
}
const s = StyleSheet.create({
  copy: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 28,
  },
});
