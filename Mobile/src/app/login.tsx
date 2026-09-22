import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  AuthButton,
  AuthDivider,
  AuthField,
  AuthLink,
  AuthScreen,
  SocialButtons,
  authStyles,
} from "@/components/auth-ui";
import { AuthColors as C } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const hero = require("../../assets/auth/login/gym-hero.jpg");
const gymStatus = { occupancy: "Vắng (38% công suất)", hours: "24/7 OPEN" }; // presentation mock
export default function Login() {
  const { login, savedCredential } = useAuth();
  const [credential, setCredential] = useState(savedCredential);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(!!savedCredential);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function handleLogin() {
    if (!credential.trim() || !password) {
      setError("Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      if (await login(credential, password, remember))
        router.replace("/(tabs)");
      else setError("Email, mật khẩu không đúng hoặc tài khoản không được phép đăng nhập.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }
  function handleBiometricLogin() {
    /* TODO: connect native biometric authentication. */
  }
  return (
    <AuthScreen showHeader={false}>
      <View style={s.hero}>
        <Image
          source={hero}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={s.heroShade} />
        <View style={s.heroBottomShade} />
        <View style={s.heroBadge}>
          <Ionicons name="flash" size={17} color={C.lime} />
          <Text style={s.heroBadgeText}>HIIT • HYPERTROPHY • ELITE</Text>
        </View>
        <View style={s.heroDot} />
      </View>
      <View style={s.kickerRow}>
        <View style={s.iconBox}>
          <Ionicons name="barbell" size={20} color={C.lime} />
        </View>
        <Text style={authStyles.kicker}>ATHLETIC MATRIX</Text>
      </View>
      <Text style={authStyles.title}>Chào mừng trở lại</Text>
      <Text style={[authStyles.description, s.intro]}>
        Đăng nhập để tiếp tục hành trình bứt phá giới hạn cùng QA-Gym.
      </Text>
      <AuthField
        label="EMAIL"
        icon="id-card-outline"
        placeholder="email@gym.vn"
        value={credential}
        onChangeText={setCredential}
        autoCapitalize="none"
      />
      <AuthField
        label="MẬT KHẨU"
        icon="lock-closed-outline"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        password
      />
      <View style={s.options}>
        <Pressable
          style={authStyles.row}
          onPress={() => setRemember(!remember)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: remember }}
        >
          <View style={[s.checkbox, remember && s.checked]}>
            {remember && (
              <Ionicons name="checkmark" size={16} color="#283500" />
            )}
          </View>
          <Text style={s.muted}>Ghi nhớ đăng nhập</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/forgot-password")}>
          <Text style={s.link}>Quên mật khẩu?</Text>
        </Pressable>
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <AuthButton
        title={submitting ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP NGAY"}
        icon="speedometer-outline"
        onPress={handleLogin}
        disabled={submitting}
      />
      <View style={[authStyles.card, s.bio]}>
        <View style={s.iconBox}>
          <Ionicons name="finger-print" size={27} color={C.lime} />
        </View>
        <View style={s.bioCopy}>
          <Text style={s.bioTitle}>Xác thực sinh trắc học</Text>
          <Text style={s.muted}>Face ID / Touch ID cho hội viên</Text>
        </View>
        <Pressable style={s.scan} onPress={handleBiometricLogin}>
          <Text style={s.scanText}>QUÉT NGAY</Text>
        </Pressable>
      </View>
      <AuthDivider title="HOẶC ĐĂNG NHẬP NHANH BẰNG" />
      <SocialButtons />
      <View style={s.status}>
        <View style={s.mintDot} />
        <Text style={s.statusText}>
          Phòng tập hiện tại:{" "}
          <Text style={{ fontWeight: "700", color: C.text }}>
            {gymStatus.occupancy}
          </Text>
        </Text>
        <Text style={s.hours}>{gymStatus.hours}</Text>
      </View>
      <AuthLink
        text="Chưa có tài khoản QA-Gym?"
        action="Đăng ký ngay"
        href="/register"
      />
    </AuthScreen>
  );
}
const s = StyleSheet.create({
  hero: {
    width: "100%",
    height: 144,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 25,
    backgroundColor: C.surface,
  },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(17,19,22,0.18)",
  },
  heroBottomShade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(17,19,22,0.72)",
  },
  heroBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    backgroundColor: "rgba(40,42,45,0.95)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: C.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroDot: {
    position: "absolute",
    right: 13,
    bottom: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.lime,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: C.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  intro: { marginTop: 8, marginBottom: 28 },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 1,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 4,
    backgroundColor: C.surfaceHigh,
    marginRight: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: C.lime },
  muted: { color: C.muted, fontSize: 14, lineHeight: 19 },
  link: { color: C.lime, fontSize: 13, fontWeight: "700" },
  error: { color: C.error, marginTop: 10, fontSize: 13 },
  bio: { marginTop: 26, flexDirection: "row", alignItems: "center", gap: 12 },
  bioCopy: { flex: 1 },
  bioTitle: { color: C.text, fontSize: 14, fontWeight: "700" },
  scan: {
    backgroundColor: C.surfaceHigh,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 12,
    maxWidth: 80,
  },
  scanText: {
    color: C.text,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  status: {
    backgroundColor: C.surfaceLow,
    borderRadius: 10,
    marginTop: 30,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mintDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.mint },
  statusText: { color: C.muted, fontSize: 12, flex: 1 },
  hours: { color: C.mint, fontSize: 11, fontWeight: "700" },
});
