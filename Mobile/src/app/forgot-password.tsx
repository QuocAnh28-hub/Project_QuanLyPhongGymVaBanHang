import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import {
  AuthButton,
  AuthField,
  AuthScreen,
  authStyles,
} from "@/components/auth-ui";
import { AuthColors as C } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPassword() {
  const { beginRecovery } = useAuth();
  const [method, setMethod] = useState<"sms" | "email">("email");
  const [credential, setCredential] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function handleSendRecoveryCode() {
    if (lock.current) return;
    if (!credential.trim()) {
      setError("Vui lòng nhập số điện thoại hoặc email.");
      return;
    }
    if (method === "email" && !/^\S+@\S+\.\S+$/.test(credential.trim())) {
      setError("Email không hợp lệ.");
      return;
    }
    if (method === "sms" && !/^\d{9,11}$/.test(credential.replace(/\s/g, ""))) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }
    lock.current = true; setBusy(true); setError('');
    try {
      await beginRecovery(credential);
      router.push('/verify-otp');
    } catch (error) { setError(error instanceof Error ? error.message : 'Không thể gửi mã xác nhận.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return (
    <AuthScreen>
      <View style={s.security}>
        <View style={s.securityInner}>
          <Ionicons name="lock-closed" size={30} color={C.lime} />
        </View>
        <View style={s.bolt}>
          <Ionicons name="flash" size={16} color="#00311f" />
        </View>
      </View>
      <Text style={[authStyles.title, s.title]}>Khôi phục mật khẩu</Text>
      <Text style={[authStyles.description, s.description]}>
        Đừng lo lắng! Hãy nhập email đã đăng ký tài khoản
        QA-Gym, chúng tôi sẽ gửi mã OTP xác thực tức thì.
      </Text>
      <View style={s.methods}>
        {(
          [
            {
              key: "sms",
              icon: "chatbox-ellipses-outline",
              title: "Gửi mã OTP qua SMS",
              detail: "Chưa hỗ trợ",
            },
            {
              key: "email",
              icon: "mail-open-outline",
              title: "Gửi mã OTP qua Email",
              detail: "Sử dụng email đã đăng ký tài khoản",
            },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.key}
            disabled={busy || item.key === 'sms'}
            style={s.method}
            onPress={() => {
              setMethod(item.key);
              setCredential("");
              setError("");
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: method === item.key }}
          >
            <View style={s.methodIcon}>
              <Ionicons
                name={item.icon}
                size={25}
                color={method === item.key ? C.lime : C.muted}
              />
            </View>
            <View style={s.methodCopy}>
              <View style={authStyles.row}>
                <Text style={s.methodTitle}>{item.title}</Text>
                {item.key === "email" && (
                  <Text style={s.recommended}>KHUYÊN DÙNG</Text>
                )}
              </View>
              <Text style={s.methodDetail}>{item.detail}</Text>
            </View>
            <View style={s.radio}>
              {method === item.key && <View style={s.radioDot} />}
            </View>
          </Pressable>
        ))}
      </View>
      <AuthField
        label="EMAIL ĐÃ ĐĂNG KÝ"
        editable={!busy}
        icon={method === "sms" ? "phone-portrait-outline" : "mail-outline"}
        placeholder={method === "sms" ? "09xx xxx 678" : "email@example.com"}
        keyboardType={method === "sms" ? "phone-pad" : "email-address"}
        autoCapitalize="none"
        value={credential}
        onChangeText={(value) => {
          setCredential(value);
          setError("");
        }}
        error={error}
        right={
          credential ? (
            <Pressable
              accessibilityLabel="Xóa nội dung"
              onPress={() => setCredential("")}
            >
              <Ionicons name="close-circle-outline" size={21} color={C.muted} />
            </Pressable>
          ) : null
        }
      />
      <View style={s.notice}>
        <Ionicons name="shield-checkmark-outline" size={22} color={C.lime} />
        <Text style={s.noticeText}>
          <Text style={{ color: C.lime, fontWeight: "700" }}>Lưu ý:</Text> Mã
          OTP sẽ hết hạn sau <Text style={{ fontWeight: "700" }}>2 phút</Text>.
          Tuyệt đối không cung cấp mã cho bất kỳ ai kể cả HLV hay nhân viên
          phòng gym.
        </Text>
      </View>
      <AuthButton title={busy ? 'ĐANG GỬI MÃ...' : 'GỬI MÃ XÁC THỰC'} disabled={busy} onPress={handleSendRecoveryCode} />
      <Pressable
        style={s.support}
        onPress={() => Linking.openURL("tel:19008899")}
      >
        <Ionicons name="headset-outline" size={20} color={C.mint} />
        <Text style={s.supportText}>
          Sự cố nhận mã? Gọi Lễ tân:{" "}
          <Text style={{ color: C.text, fontWeight: "700" }}>1900 8899</Text>
        </Text>
      </Pressable>
      <Pressable style={s.footer} onPress={() => router.replace("/login")}>
        <Ionicons name="chevron-back" size={17} color={C.muted} />
        <Text style={s.footerText}>QUAY LẠI ĐĂNG NHẬP</Text>
      </Pressable>
    </AuthScreen>
  );
}
const s = StyleSheet.create({
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 9,
  },
  topText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.lime },
  badgeText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  security: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: C.surfaceHigh,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 36,
    marginBottom: 22,
  },
  securityInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#0c0e11",
    alignItems: "center",
    justifyContent: "center",
  },
  bolt: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#00a572",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { textAlign: "center", marginBottom: 11 },
  description: { textAlign: "center", marginBottom: 28 },
  methods: { gap: 10, marginBottom: 22 },
  method: {
    minHeight: 82,
    backgroundColor: C.surfaceLow,
    borderRadius: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: C.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  methodCopy: { flex: 1 },
  methodTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
    flexShrink: 1,
  },
  methodDetail: { color: C.muted, fontSize: 13, marginTop: 6 },
  recommended: {
    color: C.lime,
    backgroundColor: "#343d1b",
    fontSize: 10,
    fontWeight: "700",
    padding: 5,
    borderRadius: 15,
    overflow: "hidden",
    marginLeft: 5,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.lime },
  notice: {
    backgroundColor: C.surfaceHigh,
    borderRadius: 11,
    flexDirection: "row",
    gap: 10,
    padding: 15,
    marginTop: 2,
  },
  noticeText: { color: C.text, fontSize: 14, lineHeight: 20, flex: 1 },
  support: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginTop: 35,
  },
  supportText: { color: C.muted, fontSize: 13 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  footerText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
