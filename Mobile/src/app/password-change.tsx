import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: keyof typeof FontAwesome.glyphMap;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <FontAwesome name={icon} size={11} color="#d9ff00" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#667168"
          secureTextEntry
          style={styles.input}
        />
        <FontAwesome name="eye" size={11} color="#7f8b80" />
      </View>
    </View>
  );
}

export default function PasswordChangeScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [biometric, setBiometric] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Quay lại hồ sơ"
            >
              <FontAwesome name="angle-left" size={21} color="#edf2e8" />
            </Pressable>
            <Text style={styles.headerTitle}>PASSWORD CHANGE</Text>
            <View style={styles.account}>
              <FontAwesome name="user" size={11} color="#516000" />
            </View>
          </View>
          <View style={styles.securityBar}>
            <Text style={styles.securityText}>
              <FontAwesome name="check-circle" size={10} color="#d9ff00" /> TIÊU
              CHUẨN MÃ HÓA
            </Text>
            <Text style={styles.secureBadge}>
              <FontAwesome name="lock" size={8} color="#d9ff00" /> BẢO MẬT
              256-BIT
            </Text>
          </View>
          <View style={styles.intro}>
            <View style={styles.lockIcon}>
              <FontAwesome name="shield" size={17} color="#d9ff00" />
            </View>
            <View style={styles.introCopy}>
              <Text style={styles.introTitle}>
                Bảo vệ tài khoản hội viên QA-Gym
              </Text>
              <Text style={styles.introText}>
                Mật khẩu mới cần có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                thường, số và ký tự đặc biệt để đảm bảo an toàn tuyệt đối cho
                tài khoản.
              </Text>
            </View>
          </View>
          <View style={styles.lastChanged}>
            <FontAwesome name="clock-o" size={10} color="#9ba69c" />
            <Text style={styles.lastChangedText}>
              {" "}
              Lần đổi mật khẩu gần nhất: 45 ngày trước (12/04/2026)
            </Text>
          </View>
          <PasswordField
            label="MẬT KHẨU HIỆN TẠI"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••••••"
            icon="lock"
          />
          <PasswordField
            label="MẬT KHẨU MỚI"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••••••"
            icon="key"
          />
          <View style={styles.strength}>
            <View style={styles.strengthHeader}>
              <Text style={styles.smallLabel}>MỨC ĐỘ AN TOÀN</Text>
              <Text style={styles.strengthText}>ĐỘ MẠNH: KHÁ MẠNH</Text>
            </View>
            <View style={styles.strengthBars}>
              <View style={styles.barActive} />
              <View style={styles.barActive} />
              <View style={styles.barActive} />
              <View style={styles.bar} />
            </View>
            <Text style={styles.rule}>● Tối thiểu 8 ký tự</Text>
            <Text style={styles.rule}>● Ít nhất 1 chữ in hoa (A-Z)</Text>
            <Text style={styles.rule}>● Ít nhất 1 chữ số (0-9)</Text>
            <Text style={styles.rule}>● Ký tự đặc biệt (!@#$%)</Text>
          </View>
          <PasswordField
            label="XÁC NHẬN MẬT KHẨU MỚI"
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder="••••••••••••"
            icon="refresh"
          />
          <Text style={styles.match}>
            <FontAwesome name="check-circle" size={10} color="#42d69e" /> Mật
            khẩu trùng khớp hoàn toàn
          </Text>
          <Text style={styles.sectionLabel}>TÙY CHỌN AN NINH NÂNG CAO</Text>
          <View style={styles.options}>
            <Option
              icon="desktop"
              title="Đăng xuất khỏi tất cả thiết bị khác"
              detail="Hủy phiên đăng nhập hiện tại trên máy tính bảng và web studio"
            />
            <Option
              icon="shield"
              title="Xác thực sinh trắc học"
              detail="Sử dụng Face ID / Touch ID"
              active={biometric}
              onPress={() => setBiometric((value) => !value)}
            />
            <Option
              icon="mobile"
              title="Xác thực 2 bước (2FA)"
              detail="SMS/Email: Bang Bất (+84 912***678)"
              active={twoFactor}
              onPress={() => setTwoFactor((value) => !value)}
            />
          </View>
          <Pressable style={styles.primaryButton}>
            <FontAwesome name="save" size={11} color="#182000" />
            <Text style={styles.primaryText}>CẬP NHẬT MẬT KHẨU MỚI</Text>
            <FontAwesome name="arrow-right" size={11} color="#182000" />
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>HỦY BỎ</Text>
          </Pressable>
          <View style={styles.support}>
            <FontAwesome name="user-circle" size={20} color="#89948b" />
            <View style={styles.supportCopy}>
              <Text style={styles.supportTitle}>Gặp sự cố đăng nhập?</Text>
              <Text style={styles.supportText}>
                Liên hệ hỗ trợ:{" "}
                <Text style={styles.supportAccent}>1900 8899</Text>
              </Text>
            </View>
            <View style={styles.phone}>
              <FontAwesome name="phone" size={11} color="#182000" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Option({
  icon,
  title,
  detail,
  active = false,
  onPress,
}: {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  detail: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.option} onPress={onPress}>
      <View style={styles.optionIcon}>
        <FontAwesome name={icon} size={12} color="#d9ff00" />
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDetail}>{detail}</Text>
      </View>
      <View style={[styles.toggle, active && styles.toggleActive]}>
        <View style={[styles.toggleKnob, active && styles.toggleKnobActive]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1011" },
  safeArea: { flex: 1, width: "100%", maxWidth: 540, alignSelf: "center" },
  content: { paddingHorizontal: 10, paddingBottom: 25 },
  header: {
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#242829",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#e9f0e5", fontSize: 10, fontWeight: "900" },
  account: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#edf5dc",
    alignItems: "center",
    justifyContent: "center",
  },
  securityBar: {
    height: 30,
    borderRadius: 6,
    backgroundColor: "#181d1e",
    paddingHorizontal: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  securityText: { color: "#d9ff00", fontSize: 7, fontWeight: "900" },
  secureBadge: {
    color: "#aeb9ad",
    backgroundColor: "#303638",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 7,
    fontWeight: "900",
  },
  intro: {
    flexDirection: "row",
    backgroundColor: "#1b2022",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  lockIcon: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: "#303b20",
    alignItems: "center",
    justifyContent: "center",
  },
  introCopy: { flex: 1, marginLeft: 9 },
  introTitle: { color: "#e7eee4", fontSize: 11, fontWeight: "900" },
  introText: { color: "#9ca79c", fontSize: 8, lineHeight: 10, marginTop: 4 },
  lastChanged: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181d1e",
    borderRadius: 5,
    padding: 7,
    marginTop: 7,
  },
  lastChangedText: { color: "#9ba69c", fontSize: 8 },
  field: { marginTop: 12 },
  fieldLabel: {
    color: "#d5e0cd",
    fontSize: 8,
    fontWeight: "900",
    marginBottom: 5,
  },
  inputWrap: {
    minHeight: 35,
    borderRadius: 6,
    backgroundColor: "#181d1e",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: { flex: 1, color: "#e8efe5", fontSize: 11, paddingVertical: 0 },
  strength: {
    backgroundColor: "#181d1e",
    borderRadius: 6,
    padding: 9,
    marginTop: 8,
  },
  strengthHeader: { flexDirection: "row", justifyContent: "space-between" },
  smallLabel: { color: "#9daa9d", fontSize: 7, fontWeight: "900" },
  strengthText: { color: "#d9ff00", fontSize: 7, fontWeight: "900" },
  strengthBars: { flexDirection: "row", gap: 4, marginVertical: 6 },
  barActive: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#caff00",
  },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#343a3b" },
  rule: { color: "#caff00", fontSize: 8, lineHeight: 14 },
  match: { color: "#48d79e", fontSize: 8, marginTop: 6 },
  sectionLabel: {
    color: "#d5e0cd",
    fontSize: 8,
    fontWeight: "900",
    marginTop: 17,
    marginBottom: 7,
  },
  options: {
    backgroundColor: "#1b2022",
    borderRadius: 7,
    paddingHorizontal: 9,
  },
  option: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#293031",
  },
  optionIcon: {
    width: 27,
    height: 27,
    borderRadius: 5,
    backgroundColor: "#29352b",
    alignItems: "center",
    justifyContent: "center",
  },
  optionCopy: { flex: 1, marginLeft: 8 },
  optionTitle: { color: "#e5ede2", fontSize: 9, fontWeight: "900" },
  optionDetail: { color: "#89948b", fontSize: 7, marginTop: 3 },
  toggle: {
    width: 32,
    height: 18,
    borderRadius: 10,
    backgroundColor: "#394040",
    padding: 2,
  },
  toggleActive: { backgroundColor: "#caff00" },
  toggleKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#aeb8af",
  },
  toggleKnobActive: { backgroundColor: "#182000", marginLeft: 14 },
  primaryButton: {
    minHeight: 36,
    borderRadius: 7,
    backgroundColor: "#caff00",
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { color: "#182000", fontSize: 9, fontWeight: "900" },
  cancelButton: {
    minHeight: 32,
    borderRadius: 7,
    backgroundColor: "#2b3032",
    marginTop: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: "#e3eae2", fontSize: 9, fontWeight: "900" },
  support: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b2022",
    borderRadius: 7,
    padding: 9,
    marginTop: 17,
  },
  supportCopy: { flex: 1, marginLeft: 8 },
  supportTitle: { color: "#bfc9bd", fontSize: 8, fontWeight: "900" },
  supportText: { color: "#89948b", fontSize: 8, marginTop: 3 },
  supportAccent: { color: "#d9ff00", fontWeight: "900" },
  phone: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#caff00",
    alignItems: "center",
    justifyContent: "center",
  },
});
