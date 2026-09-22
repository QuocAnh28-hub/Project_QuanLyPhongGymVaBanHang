import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
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

import { products } from "@/constants/products";

const orderItems = [
  { product: products[0], detail: "Vị: Chocolate Fudge • Số lượng: 1" },
  { product: products[1], detail: "Vị: Ice Blue Razz • Số lượng: 1" },
  { product: products[4], detail: "Size L • Màu: Matte Black • Số lượng: 1" },
] as const;

const parsePrice = (price: string) => Number(price.replace(/\D/g, ""));
const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function CheckoutScreen() {
  const [payment, setPayment] = useState<
    "transfer" | "card" | "wallet" | "cash"
  >("transfer");
  const [usePoints, setUsePoints] = useState(true);
  const [note, setNote] = useState("");
  const subtotal = orderItems.reduce(
    (sum, item) => sum + parsePrice(item.product[2]),
    0,
  );
  const discount = 325000;
  const pointsDiscount = usePoints ? 50000 : 0;
  const total = subtotal - discount - pointsDiscount;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.topBar}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Quay lại giỏ hàng"
            >
              <FontAwesome name="angle-left" size={21} color="#e8eee4" />
            </Pressable>
            <Text style={styles.topTitle}>CHECKOUT FLOW</Text>
            <View style={styles.account}>
              <FontAwesome name="user" size={11} color="#516000" />
            </View>
          </View>
          <View style={styles.steps}>
            <Step icon="1" label="Giỏ hàng" done />
            <View style={styles.stepLine} />
            <Step icon="2" label="Đặt hàng & Thanh toán" active />
            <View style={styles.stepLine} />
            <Step icon="3" label="Hoàn tất" />
          </View>
          <View style={styles.modeSwitch}>
            <Pressable style={[styles.modeButton, styles.modeActive]}>
              <FontAwesome name="truck" size={11} color="#182000" />
              <Text style={styles.modeActiveText}>GIAO TẬN NƠI</Text>
            </Pressable>
            <Pressable style={styles.modeButton}>
              <FontAwesome name="bolt" size={11} color="#d9ff00" />
              <Text style={styles.modeText}>NHẬN TẠI CLB (0.1)</Text>
            </Pressable>
          </View>

          <SectionHeader
            icon="map-marker"
            title="ĐỊA CHỈ NHẬN HÀNG"
            action="THAY ĐỔI"
          />
          <View style={styles.addressCard}>
            <View style={styles.addressTop}>
              <Text style={styles.customer}>Nguyễn Tuấn Anh</Text>
              <Text style={styles.phone}>0912 345{`\n`}678</Text>
              <Text style={styles.addressTag}>MẶC ĐỊNH</Text>
            </View>
            <Text style={styles.address}>
              Số 88 đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
            </Text>
          </View>

          <SectionHeader
            icon="cube"
            title="KIỆN HÀNG (3 MÓN)"
            action="Chi tiết⌄"
          />
          <View style={styles.panel}>
            {orderItems.map((item) => (
              <View style={styles.productRow} key={item.product[0]}>
                <Image
                  source={{ uri: item.product[7] }}
                  style={styles.productImage}
                  contentFit="cover"
                />
                <View style={styles.productCopy}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.product[0]}
                  </Text>
                  <Text style={styles.productDetail} numberOfLines={2}>
                    {item.detail}
                  </Text>
                </View>
                <Text style={styles.productPrice}>{item.product[2]}</Text>
              </View>
            ))}
          </View>

          <SectionHeader icon="bolt" title="PHƯƠNG THỨC VẬN CHUYỂN" />
          <View style={styles.panel}>
            <Choice
              selected
              title="GIAO TIÊU CHUẨN (1-2 NGÀY)"
              detail="Áp dụng mọi miền phí vận chuyển"
              price="0đ"
              badge="Freeship"
            />
            <Choice
              title="HỎA TỐC 2H (NỘI THÀNH HCM)"
              detail="Giao từ hệ thống đến địa chỉ"
              price="+35.000đ"
              badge="Siêu tốc"
            />
          </View>

          <SectionHeader
            icon="credit-card"
            title="PHƯƠNG THỨC THANH TOÁN"
            action="Bảo mật 256-bit"
          />
          <View style={styles.panel}>
            {(["transfer", "card", "wallet", "cash"] as const).map((method) => (
              <PaymentChoice
                key={method}
                method={method}
                selected={payment === method}
                onPress={() => setPayment(method)}
              />
            ))}
          </View>

          <View style={styles.pointsCard}>
            <View style={styles.pointsIcon}>
              <FontAwesome name="tag" size={12} color="#d9ff00" />
            </View>
            <View style={styles.pointsCopy}>
              <Text style={styles.pointsTitle}>
                Dùng QA-Points <Text style={styles.pointsBadge}>500 Pts</Text>
              </Text>
              <Text style={styles.pointsDetail}>
                Quy đổi tương đương -50.000đ
              </Text>
            </View>
            <Pressable
              style={[styles.toggle, usePoints && styles.toggleOn]}
              onPress={() => setUsePoints((current) => !current)}
              accessibilityLabel="Dùng QA-Points"
            >
              <View style={styles.toggleKnob} />
            </Pressable>
          </View>

          <SectionHeader icon="comment" title="GHI CHÚ ĐƠN HÀNG" />
          <View style={styles.notePanel}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Lưu ý cho shipper hoặc yêu cầu đóng gói đặc biệt"
              placeholderTextColor="#657064"
              style={styles.noteInput}
            />
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryHeading}>
              <Text style={styles.summaryTitle}>BẢNG KÊ CHI PHÍ</Text>
              <Text style={styles.vat}>Đã gồm VAT 8%</Text>
            </View>
            <SummaryRow
              label="Tổng tiền hàng (3 sản phẩm)"
              value={formatPrice(subtotal)}
            />
            <SummaryRow
              label="Voucher hội viên VIP Gold (-10%)"
              value={`-${formatPrice(discount)}`}
              accent
            />
            <SummaryRow
              label="Điểm thưởng QA-Points"
              value={`-${formatPrice(pointsDiscount)}`}
              accent
            />
            <SummaryRow
              label="Phí vận chuyển toàn quốc"
              value="MIỄN PHÍ (0đ)"
              accent
            />
            <View style={styles.grandTotal}>
              <Text style={styles.grandLabel}>THANH TOÁN</Text>
              <Text style={styles.grandValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>TỔNG THANH TOÁN</Text>
            <Text style={styles.bottomTotal}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.secure}>
            <FontAwesome name="shield" size={9} color="#d9ff00" />
            <Text style={styles.secureText}> Bảo hành chính hãng 100%</Text>
          </View>
          <Pressable
            style={styles.orderButton}
            accessibilityLabel="Đặt hàng ngay"
          >
            <FontAwesome name="lock" size={11} color="#182000" />
            <Text style={styles.orderText}>ĐẶT HÀNG NGAY</Text>
            <FontAwesome name="arrow-right" size={13} color="#182000" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Step({
  icon,
  label,
  done = false,
  active = false,
}: {
  icon: string;
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <View style={styles.step}>
      <View
        style={[styles.stepIcon, (done || active) && styles.stepIconActive]}
      >
        <Text
          style={[
            styles.stepIconText,
            (done || active) && styles.stepIconTextActive,
          ]}
        >
          {icon}
        </Text>
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  action?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <FontAwesome name={icon} size={12} color="#d9ff00" />
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && <Text style={styles.sectionAction}>{action}</Text>}
    </View>
  );
}

function Choice({
  selected = false,
  title,
  detail,
  price,
  badge,
}: {
  selected?: boolean;
  title: string;
  detail: string;
  price: string;
  badge: string;
}) {
  return (
    <View style={styles.choice}>
      <View style={[styles.radio, selected && styles.radioSelected]} />{" "}
      <View style={styles.choiceCopy}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceDetail}>{detail}</Text>
      </View>
      <View style={styles.choiceRight}>
        <Text style={styles.choiceBadge}>{badge}</Text>
        <Text style={[styles.choicePrice, selected && styles.accentText]}>
          {price}
        </Text>
      </View>
    </View>
  );
}

const paymentLabels = {
  transfer: [
    "VIETQR / CHUYỂN KHOẢN 24/7",
    "Quét mã QR tự động xác nhận trong 3 giây.",
  ],
  card: ["THẺ QUỐC TẾ / THẺ ATM NAPAS", "Visa, Mastercard, JCB, ATM Napas"],
  wallet: ["VÍ MOMO / ZALOPAY / APPLE PAY", "Thanh toán một chạm qua app"],
  cash: [
    "THANH TOÁN KHI NHẬN HÀNG (COD)",
    "Đồng kiểm hàng trước khi thanh toán tiền mặt",
  ],
} as const;
function PaymentChoice({
  method,
  selected,
  onPress,
}: {
  method: keyof typeof paymentLabels;
  selected: boolean;
  onPress: () => void;
}) {
  const [title, detail] = paymentLabels[method];
  return (
    <Pressable style={styles.paymentRow} onPress={onPress}>
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <View style={styles.paymentCopy}>
        <Text style={styles.paymentTitle}>{title}</Text>
        <Text style={styles.paymentDetail}>{detail}</Text>
        {selected && method === "transfer" && (
          <Text style={styles.pointsHint}>
            ⓘ Tặng thêm +50 QA-Points vào tài khoản
          </Text>
        )}
      </View>
      <FontAwesome
        name={
          method === "transfer"
            ? "qrcode"
            : method === "card"
              ? "credit-card"
              : method === "wallet"
                ? "money"
                : "money"
        }
        size={13}
        color={selected ? "#d9ff00" : "#b8c2b7"}
      />
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, accent && styles.accentText]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1011" },
  safeArea: { flex: 1, width: "100%", maxWidth: 540, alignSelf: "center" },
  content: { paddingHorizontal: 10, paddingBottom: 20 },
  topBar: {
    height: 42,
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
  topTitle: { color: "#e8eee4", fontSize: 11, fontWeight: "900" },
  account: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#edf5dc",
    alignItems: "center",
    justifyContent: "center",
  },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1f20",
    borderRadius: 7,
    padding: 8,
    marginBottom: 8,
  },
  step: { alignItems: "center", width: 70 },
  stepIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#303638",
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconActive: { backgroundColor: "#d9ff00" },
  stepIconText: { color: "#7b857c", fontSize: 9, fontWeight: "900" },
  stepIconTextActive: { color: "#1b2400" },
  stepLabel: {
    color: "#727c73",
    fontSize: 7,
    textAlign: "center",
    marginTop: 3,
  },
  stepLabelActive: { color: "#d9ff00", fontWeight: "900" },
  stepLine: { height: 1, flex: 1, backgroundColor: "#536000" },
  modeSwitch: { flexDirection: "row", gap: 8, marginBottom: 10 },
  modeButton: {
    flex: 1,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#1b2022",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  modeActive: { backgroundColor: "#d9ff00" },
  modeActiveText: { color: "#182000", fontSize: 8, fontWeight: "900" },
  modeText: { color: "#d9ff00", fontSize: 8, fontWeight: "900" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 9,
    marginBottom: 6,
    paddingHorizontal: 5,
  },
  sectionTitle: { color: "#e7eee3", fontSize: 11, fontWeight: "900", flex: 1 },
  sectionAction: { color: "#bed500", fontSize: 8, fontWeight: "900" },
  addressCard: { backgroundColor: "#1b2022", borderRadius: 7, padding: 10 },
  addressTop: { flexDirection: "row", alignItems: "flex-start" },
  customer: {
    color: "#edf3e9",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900",
    flex: 1,
  },
  phone: { color: "#c6d2c2", fontSize: 8, lineHeight: 10, width: 50 },
  addressTag: {
    color: "#d9ff00",
    backgroundColor: "#304216",
    fontSize: 7,
    fontWeight: "900",
    padding: 5,
    borderRadius: 3,
  },
  address: { color: "#a6b0a4", fontSize: 9, lineHeight: 12, marginTop: 5 },
  panel: { backgroundColor: "#1b2022", borderRadius: 7, padding: 8 },
  productRow: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#252b2c",
  },
  productImage: {
    width: 39,
    height: 39,
    borderRadius: 3,
    backgroundColor: "#2c3233",
  },
  productCopy: { flex: 1, marginLeft: 8 },
  productName: { color: "#e8eee4", fontSize: 9, fontWeight: "900" },
  productDetail: { color: "#89948b", fontSize: 8, marginTop: 3 },
  productPrice: {
    color: "#e9f1e5",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
  choice: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#252b2c",
  },
  radio: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#d5ddd2",
    marginHorizontal: 4,
  },
  radioSelected: { backgroundColor: "#d9ff00", borderColor: "#d9ff00" },
  choiceCopy: { flex: 1, marginLeft: 5 },
  choiceTitle: { color: "#e1e9df", fontSize: 9, fontWeight: "900" },
  choiceDetail: { color: "#89948b", fontSize: 8, marginTop: 3 },
  choiceRight: { alignItems: "flex-end" },
  choiceBadge: {
    color: "#9db900",
    backgroundColor: "#304216",
    fontSize: 7,
    fontWeight: "900",
    padding: 3,
    borderRadius: 2,
  },
  choicePrice: {
    color: "#e4ece1",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3,
  },
  accentText: { color: "#d9ff00" },
  paymentRow: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#252b2c",
  },
  paymentCopy: { flex: 1, marginLeft: 5 },
  paymentTitle: { color: "#e5ede2", fontSize: 9, fontWeight: "900" },
  paymentDetail: { color: "#89948b", fontSize: 8, marginTop: 3 },
  pointsHint: { color: "#49d69d", fontSize: 7, marginTop: 3 },
  pointsCard: {
    backgroundColor: "#1b2022",
    borderRadius: 7,
    padding: 9,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  pointsIcon: {
    width: 27,
    height: 27,
    borderRadius: 6,
    backgroundColor: "#304216",
    alignItems: "center",
    justifyContent: "center",
  },
  pointsCopy: { flex: 1, marginLeft: 9 },
  pointsTitle: { color: "#e8eee4", fontSize: 11, fontWeight: "900" },
  pointsBadge: {
    color: "#182000",
    backgroundColor: "#d9ff00",
    fontSize: 7,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  pointsDetail: { color: "#89948b", fontSize: 8, marginTop: 3 },
  toggle: {
    width: 33,
    height: 18,
    borderRadius: 10,
    backgroundColor: "#3a4140",
    padding: 2,
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: "#c8ee00" },
  toggleKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#101512",
  },
  notePanel: { backgroundColor: "#1b2022", borderRadius: 7, padding: 9 },
  noteInput: {
    minHeight: 35,
    backgroundColor: "#252a2c",
    borderRadius: 5,
    color: "#e8eee4",
    fontSize: 9,
    paddingHorizontal: 9,
  },
  summary: {
    backgroundColor: "#1b2022",
    borderRadius: 7,
    padding: 10,
    marginTop: 10,
  },
  summaryHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  summaryTitle: { color: "#e8eee4", fontSize: 11, fontWeight: "900" },
  vat: { color: "#b7c500", fontSize: 8, fontWeight: "900" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: { color: "#b3bdb2", fontSize: 9 },
  summaryValue: { color: "#e5ede2", fontSize: 9, fontWeight: "800" },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#303638",
    marginTop: 7,
    paddingTop: 9,
    flexDirection: "row",
    alignItems: "center",
  },
  grandLabel: { color: "#eaf0e6", fontSize: 11, fontWeight: "900" },
  grandValue: {
    color: "#d9ff00",
    fontSize: 21,
    fontWeight: "900",
    marginLeft: "auto",
  },
  bottomBar: {
    backgroundColor: "#171b1c",
    borderTopWidth: 1,
    borderTopColor: "#2b3031",
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 5,
  },
  bottomLabel: { color: "#89938a", fontSize: 7, fontWeight: "900" },
  bottomTotal: { color: "#d9ff00", fontSize: 18, fontWeight: "900" },
  secure: {
    position: "absolute",
    right: 12,
    top: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  secureText: { color: "#9ba692", fontSize: 7 },
  orderButton: {
    height: 38,
    marginTop: 5,
    borderRadius: 7,
    backgroundColor: "#caff00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  orderText: { color: "#182000", fontSize: 10, fontWeight: "900" },
});
