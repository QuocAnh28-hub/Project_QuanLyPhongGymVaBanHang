import { router } from "expo-router";
import { useState } from "react";
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
  const { recovery, verifyOtp } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  return (
    <AuthScreen>
      <Text style={authStyles.title}>Xác thực mã</Text>
      <Text style={s.copy}>
        {recovery
          ? "Mã thử nghiệm: 123456. Không có SMS hoặc email thật được gửi."
          : "Hãy bắt đầu lại từ màn Quên mật khẩu."}
      </Text>
      <AuthField
        label="MÃ XÁC THỰC"
        icon="key-outline"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        placeholder="6 chữ số"
        error={error}
      />
      <AuthButton
        title="XÁC THỰC"
        disabled={!recovery}
        onPress={() =>
          verifyOtp(code)
            ? router.replace("/reset-password")
            : setError("Mã xác thực không đúng.")
        }
      />
    </AuthScreen>
  );
}
const s = StyleSheet.create({
  copy: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 28,
  },
});
