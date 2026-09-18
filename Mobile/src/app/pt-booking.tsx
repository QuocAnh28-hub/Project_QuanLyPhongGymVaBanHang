import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const trainers = [
  {
    name: "Trần Hoàng Nam",
    role: "MASTER TRAINER • ĐA NĂNG KINH NGHIỆM",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=85",
  },
  {
    name: "Nguyễn Thùy Linh",
    role: "MASTER TRAINER • DINH DƯỠNG",
    image:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=900&q=85",
  },
  {
    name: "Lê Quốc Huy",
    role: "MASTER TRAINER • BOXING",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&q=85",
  },
  {
    name: "Đậu Phạm",
    role: "REHAB SPECIALIST",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=85",
  },
] as const;

const packages = [
  {
    name: "Gói Khởi động • 12 Buổi",
    price: 5400000,
    detail: "Thời hạn 45 ngày • 450.000đ/buổi",
  },
  {
    name: "Gói Chuyên Hóa • 24 Buổi",
    price: 9800000,
    detail: "Thời hạn 90 ngày • 400.000đ/buổi",
  },
  {
    name: "Gói Bứt Phá • 36 Buổi",
    price: 12600000,
    detail: "Thời hạn 150 ngày • 350.000đ/buổi",
  },
];
const dates = [
  { day: "T2", date: "09" },
  { day: "T3", date: "10" },
  { day: "T4", date: "11" },
  { day: "T5", date: "12" },
  { day: "T6", date: "13" },
  { day: "T7", date: "14" },
  { day: "CN", date: "15" },
];
const times = ["07:00 - 08:00", "08:30 - 09:30", "17:30", "18:30", "19:30"];
const goals = [
  "Giảm mỡ nhanh",
  "Tăng cơ nạc",
  "Siết eo săn dáng",
  "Phục hồi chấn thương",
  "Cải thiện thể lực",
];
const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function PTBookingScreen() {
  const { trainerId } = useLocalSearchParams<{ trainerId?: string }>();
  const parsedId = Number(trainerId);
  const trainer =
    trainers[
      Number.isInteger(parsedId) && parsedId >= 0 && parsedId < trainers.length
        ? parsedId
        : 0
    ];
  const [packageIndex, setPackageIndex] = useState(1);
  const [goal, setGoal] = useState(goals[0]);
  const [dateIndex, setDateIndex] = useState(1);
  const [time, setTime] = useState(times[3]);
  const [payment, setPayment] = useState("VietQR");
  const packagePrice = packages[packageIndex].price;
  const total = packagePrice - 500000;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.back()}
              accessibilityLabel="Quay lại"
            >
              <FontAwesome name="angle-left" size={21} color="#edf2e8" />
            </Pressable>
            <Text style={styles.headerTitle}>BOOKING PT</Text>
            <View style={styles.account}>
              <FontAwesome name="user" size={11} color="#516000" />
            </View>
          </View>
          <View style={styles.supportBar}>
            <Text style={styles.supportText}>
              <FontAwesome name="check-circle" size={9} color="#d9ff00" /> HỖ
              TRỢ ĐẶT LỊCH 1-KÈM-1
            </Text>
            <Text style={styles.supportPhone}>☎ 1900 8899</Text>
          </View>
          <View style={styles.steps}>
            <Step number="✓" label="Chọn gói" active />
            <View style={styles.stepLine} />
            <Step number="2" label="Lịch & Trạm" />
            <View style={styles.stepLine} />
            <Step number="3" label="Thanh toán" />
          </View>
          <View style={styles.trainerCard}>
            <Image
              source={{ uri: trainer.image }}
              style={styles.trainerImage}
              contentFit="cover"
            />
            <View style={styles.trainerCopy}>
              <Text style={styles.trainerName}>{trainer.name}</Text>
              <Text style={styles.trainerRole}>{trainer.role}</Text>
              <Text style={styles.trainerLocation}>
                ● QA-Gym Vincom Đồng Khởi, Q.1
              </Text>
            </View>
            <FontAwesome name="exchange" size={12} color="#bfc900" />
          </View>
          <SectionTitle
            icon="bolt"
            title="Chọn Gói Buổi Tập"
            action="HLV Kinh nghiệm"
          />
          {packages.map((item, index) => (
            <Pressable
              key={item.name}
              onPress={() => setPackageIndex(index)}
              style={[
                styles.package,
                packageIndex === index && styles.packageActive,
              ]}
            >
              <View style={styles.radio}>
                {packageIndex === index && <View style={styles.radioDot} />}
              </View>
              <View style={styles.packageCopy}>
                <Text style={styles.packageName}>{item.name}</Text>
                <Text style={styles.packageDetail}>{item.detail}</Text>
                {packageIndex === index && (
                  <Text style={styles.packageBonus}>
                    ✦ Tặng áo Gym Pro ✕ Thực đơn riêng
                  </Text>
                )}
              </View>
              <Text style={styles.packagePrice}>{formatPrice(item.price)}</Text>
              {packageIndex === index && (
                <Text style={styles.usedBadge}>KHUYẾN DÙNG</Text>
              )}
            </Pressable>
          ))}
          <SectionTitle
            icon="bullseye"
            title="Mục Tiêu Tập Luyện"
            action="Chọn 1 - 2 mục tiêu"
          />
          <View style={styles.goalList}>
            {goals.map((item, index) => (
              <Pressable
                key={item}
                onPress={() => setGoal(item)}
                style={[styles.goal, goal === item && styles.goalActive]}
              >
                <FontAwesome
                  name={
                    index === 0
                      ? "bolt"
                      : index === 1
                        ? "line-chart"
                        : "check-circle"
                  }
                  size={9}
                  color={goal === item ? "#182000" : "#d9ff00"}
                />
                <Text
                  style={[
                    styles.goalText,
                    goal === item && styles.goalTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <SectionTitle
            icon="calendar"
            title="Lịch Buổi Tập Đầu Tiên"
            action="Tháng 03/2026"
          />
          <View style={styles.calendar}>
            {dates.map((item, index) => (
              <Pressable
                key={item.date}
                onPress={() => setDateIndex(index)}
                style={[styles.date, dateIndex === index && styles.dateActive]}
              >
                <Text
                  style={[
                    styles.dateDay,
                    dateIndex === index && styles.dateActiveText,
                  ]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dateNumber,
                    dateIndex === index && styles.dateActiveText,
                  ]}
                >
                  {item.date}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.subLabel}>KHUNG GIỜ ƯU TIÊN TRONG NGÀY</Text>
          <View style={styles.timeList}>
            {times.slice(0, 2).map((item) => (
              <Pressable
                key={item}
                onPress={() => setTime(item)}
                style={[styles.time, time === item && styles.timeActive]}
              >
                <Text
                  style={[
                    styles.timeText,
                    time === item && styles.timeActiveText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.subLabel}>Ca Chiều / Tối</Text>
          <View style={styles.timeList}>
            {times.slice(2).map((item) => (
              <Pressable
                key={item}
                onPress={() => setTime(item)}
                style={[styles.time, time === item && styles.timeActive]}
              >
                <Text
                  style={[
                    styles.timeText,
                    time === item && styles.timeActiveText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <SectionTitle icon="tag" title="Ưu Đãi & Điểm Thưởng" />
          <View style={styles.voucher}>
            <Text style={styles.voucherCode}>PTCHAMP2026</Text>
            <Text style={styles.voucherButton}>Đã áp dụng</Text>
            <Text style={styles.voucherDetail}>
              Voucher giảm giá (-500.000đ cho gói 24 buổi)
            </Text>
            <Text style={styles.points}>
              ✓ Dùng 2.000 QA-Points (Khả dụng: 4.500)
            </Text>
          </View>
          <SectionTitle
            icon="credit-card"
            title="Phương Thức Thanh Toán"
            action="Bảo mật 256-bit"
          />
          <View style={styles.paymentPanel}>
            {[
              "VietQR",
              "Thẻ quốc tế / ATM",
              "Ví điện tử MoMo / ZaloPay",
              "Thanh toán tại quầy",
            ].map((item) => (
              <Pressable
                key={item}
                style={styles.paymentRow}
                onPress={() => setPayment(item)}
              >
                <View
                  style={[
                    styles.radio,
                    payment === item && styles.radioSelected,
                  ]}
                />{" "}
                <View style={styles.paymentCopy}>
                  <Text style={styles.paymentName}>{item}</Text>
                  <Text style={styles.paymentDetail}>
                    {item === "VietQR"
                      ? "Quét qua mọi app ngân hàng, kích hoạt ngay"
                      : "Thanh toán nhanh và an toàn"}
                  </Text>
                </View>
                <FontAwesome
                  name={item === "VietQR" ? "qrcode" : "credit-card"}
                  size={12}
                  color={payment === item ? "#d9ff00" : "#829084"}
                />
              </Pressable>
            ))}
          </View>
          <View style={styles.summary}>
            <Text style={styles.summaryLine}>
              Giá niêm yết gói 24 buổi: <Text>9.800.000đ</Text>
            </Text>
            <Text style={styles.summaryLine}>
              Voucher hội viên: <Text style={styles.accent}>-500.000đ</Text>
            </Text>
            <Text style={styles.summaryLine}>
              Đã chiết khấu: <Text style={styles.accent}>TẶNG KÈM 500đ</Text>
            </Text>
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTitle}>Tổng thanh toán:</Text>
              <Text style={styles.summaryPrice}>{formatPrice(total)}</Text>
            </View>
          </View>
          <View style={styles.promise}>
            <FontAwesome name="check-circle" size={13} color="#d9ff00" />
            <Text style={styles.promiseText}>
              <Text style={styles.promiseBold}>Cam kết hài lòng 100%:</Text> HLV
              điều chỉnh yêu cầu đổi HLV miễn phí nếu cảm thấy phong cách chưa
              phù hợp.
            </Text>
          </View>
        </ScrollView>
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>TỔNG CỘNG</Text>
            <Text style={styles.bottomPrice}>{formatPrice(total)}</Text>
            <Text style={styles.bottomHint}>9.800.000đ / không giới hạn</Text>
          </View>
          <Pressable
            style={styles.confirmButton}
            accessibilityLabel="Xác nhận và thanh toán"
          >
            <Text style={styles.confirmText}>XÁC NHẬN & THANH TOÁN</Text>
            <FontAwesome name="arrow-right" size={11} color="#182000" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Step({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepNumber, active && styles.stepNumberActive]}>
        <Text
          style={[styles.stepNumberText, active && styles.stepNumberTextActive]}
        >
          {number}
        </Text>
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
        {label}
      </Text>
    </View>
  );
}
function SectionTitle({
  icon,
  title,
  action,
}: {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  action?: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <FontAwesome name={icon} size={12} color="#d9ff00" />
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && <Text style={styles.sectionAction}>{action}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1011" },
  safeArea: { flex: 1, width: "100%", maxWidth: 540, alignSelf: "center" },
  content: { paddingHorizontal: 10, paddingBottom: 20 },
  header: {
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#242829",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#e9f0e5", fontSize: 9, fontWeight: "900" },
  account: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#edf5dc",
    alignItems: "center",
    justifyContent: "center",
  },
  supportBar: {
    height: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  supportText: { color: "#d9ff00", fontSize: 6, fontWeight: "900" },
  supportPhone: {
    color: "#d9ff00",
    backgroundColor: "#27351f",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 6,
    fontWeight: "900",
  },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#181d1e",
    borderRadius: 7,
    padding: 8,
    marginBottom: 8,
  },
  step: { alignItems: "center", width: 62 },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#303638",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberActive: { backgroundColor: "#caff00" },
  stepNumberText: { color: "#89938a", fontSize: 9, fontWeight: "900" },
  stepNumberTextActive: { color: "#182000" },
  stepLabel: { color: "#8c978e", fontSize: 6, marginTop: 3 },
  stepLabelActive: { color: "#d9ff00", fontWeight: "900" },
  stepLine: { flex: 1, height: 1, backgroundColor: "#4a5a13" },
  trainerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b2022",
    borderRadius: 7,
    padding: 9,
    marginBottom: 8,
  },
  trainerImage: { width: 48, height: 48, borderRadius: 5 },
  trainerCopy: { flex: 1, marginLeft: 9 },
  trainerName: { color: "#f0f5eb", fontSize: 10, fontWeight: "900" },
  trainerRole: {
    color: "#d9ff00",
    fontSize: 6,
    fontWeight: "900",
    marginTop: 3,
  },
  trainerLocation: { color: "#a6b2a5", fontSize: 6, marginTop: 5 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: { color: "#eaf0e6", fontSize: 10, fontWeight: "900", flex: 1 },
  sectionAction: { color: "#d9ff00", fontSize: 6, fontWeight: "900" },
  package: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b2022",
    borderRadius: 7,
    padding: 9,
    marginBottom: 6,
    position: "relative",
  },
  packageActive: {
    backgroundColor: "#252d26",
    borderWidth: 1,
    borderColor: "#4f650e",
  },
  radio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#8a948b",
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d9ff00",
  },
  packageCopy: { flex: 1, marginLeft: 8 },
  packageName: { color: "#eef4e8", fontSize: 9, fontWeight: "900" },
  packageDetail: { color: "#9ba69d", fontSize: 7, marginTop: 4 },
  packageBonus: { color: "#d9ff00", fontSize: 6, marginTop: 5 },
  packagePrice: { color: "#d9ff00", fontSize: 11, fontWeight: "900" },
  usedBadge: {
    position: "absolute",
    right: 8,
    top: 6,
    color: "#182000",
    backgroundColor: "#caff00",
    borderRadius: 3,
    padding: 3,
    fontSize: 5,
    fontWeight: "900",
  },
  goalList: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  goal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#252b2d",
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  goalActive: { backgroundColor: "#caff00" },
  goalText: { color: "#d4ddd3", fontSize: 6, fontWeight: "800" },
  goalTextActive: { color: "#182000" },
  calendar: {
    flexDirection: "row",
    gap: 5,
    backgroundColor: "#181d1e",
    borderRadius: 7,
    padding: 6,
  },
  date: { flex: 1, alignItems: "center", paddingVertical: 6, borderRadius: 5 },
  dateActive: { backgroundColor: "#caff00" },
  dateDay: { color: "#b5c0b5", fontSize: 6, fontWeight: "900" },
  dateNumber: {
    color: "#e8eee4",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  dateActiveText: { color: "#182000" },
  subLabel: {
    color: "#a9b4a8",
    fontSize: 6,
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 5,
  },
  timeList: { flexDirection: "row", gap: 5, marginBottom: 3 },
  time: {
    flex: 1,
    minHeight: 28,
    borderRadius: 5,
    backgroundColor: "#252b2d",
    alignItems: "center",
    justifyContent: "center",
  },
  timeActive: { backgroundColor: "#caff00" },
  timeText: { color: "#dae2d8", fontSize: 7, fontWeight: "900" },
  timeActiveText: { color: "#182000" },
  voucher: { backgroundColor: "#1b2022", borderRadius: 7, padding: 10 },
  voucherCode: { color: "#d9ff00", fontSize: 9, fontWeight: "900" },
  voucherButton: {
    position: "absolute",
    right: 10,
    top: 9,
    color: "#d9ff00",
    fontSize: 6,
    fontWeight: "900",
  },
  voucherDetail: { color: "#aeb9ad", fontSize: 7, marginTop: 7 },
  points: { color: "#d9ff00", fontSize: 7, marginTop: 6 },
  paymentPanel: {
    backgroundColor: "#1b2022",
    borderRadius: 7,
    paddingHorizontal: 9,
  },
  paymentRow: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#293031",
  },
  radioSelected: { borderColor: "#d9ff00", backgroundColor: "#d9ff00" },
  paymentCopy: { flex: 1, marginLeft: 7 },
  paymentName: { color: "#e5ede2", fontSize: 8, fontWeight: "900" },
  paymentDetail: { color: "#89948b", fontSize: 6, marginTop: 3 },
  summary: {
    backgroundColor: "#1b2022",
    borderRadius: 7,
    padding: 10,
    marginTop: 8,
  },
  summaryLine: { color: "#aeb9ad", fontSize: 7, marginBottom: 5 },
  accent: { color: "#d9ff00" },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#303638",
    marginTop: 5,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryTitle: { color: "#e9f0e5", fontSize: 10, fontWeight: "900" },
  summaryPrice: { color: "#d9ff00", fontSize: 16, fontWeight: "900" },
  promise: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#1b2022",
    borderRadius: 7,
    padding: 10,
    marginTop: 8,
  },
  promiseText: { color: "#aeb9ad", flex: 1, fontSize: 7, lineHeight: 11 },
  promiseBold: { color: "#e6eee2", fontWeight: "900" },
  bottomBar: {
    backgroundColor: "#181c1d",
    borderTopWidth: 1,
    borderTopColor: "#2b3031",
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomLabel: { color: "#9da89d", fontSize: 6, fontWeight: "900" },
  bottomPrice: { color: "#d9ff00", fontSize: 17, fontWeight: "900" },
  bottomHint: { color: "#849085", fontSize: 6, marginTop: 2 },
  confirmButton: {
    height: 39,
    borderRadius: 7,
    backgroundColor: "#caff00",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  confirmText: { color: "#182000", fontSize: 7, fontWeight: "900" },
});
