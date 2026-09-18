import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { products, type Product } from "@/constants/products";

type OrderItem = { product: Product; detail: string; price: string };
type Order = {
  id: string;
  date: string;
  status: string;
  statusType: Filter;
  total: string;
  items: OrderItem[];
  extra?: string;
  cancelReason?: string;
};

const orders: Order[] = [
  {
    id: "#QA-ORD-88219",
    date: "15/06/2026",
    status: "ĐANG GIAO",
    statusType: "shipping",
    total: "2.875.000đ",
    items: [
      {
        product: products[0],
        detail: "Vị Chocolate Fudge • 5 Lbs",
        price: "1.850.000đ",
      },
      { product: products[1], detail: "Vị Ice Blue Razz", price: "780.000đ" },
    ],
    extra: "+1 sản phẩm khác (Bình lắc QA Pro)",
  },
  {
    id: "#QA-ORD-77402",
    date: "28/05/2026",
    status: "ĐÃ GIAO",
    statusType: "delivered",
    total: "650.000đ",
    items: [
      {
        product: products[3],
        detail: "Màu Matte Black • 800ml",
        price: "380.000đ",
      },
      {
        product: products[5],
        detail: "Size L • Đệm tay cao cấp",
        price: "270.000đ",
      },
    ],
  },
  {
    id: "#QA-ORD-65190",
    date: "12/04/2026",
    status: "ĐÃ GIAO",
    statusType: "delivered",
    total: "2.150.000đ",
    items: [
      {
        product: products[0],
        detail: "Hương Vanilla • Túi 2 Lbs (0.9kg)",
        price: "2.150.000đ",
      },
    ],
  },
  {
    id: "#QA-ORD-51022",
    date: "18/02/2026",
    status: "ĐÃ HỦY",
    statusType: "cancelled",
    total: "420.000đ",
    items: [
      {
        product: products[4],
        detail: "Dây kháng lực PowerBand Heavy",
        price: "420.000đ",
      },
    ],
    cancelReason: "Lý do: Thay đổi địa chỉ nhận hàng",
  },
] as const;

type Filter = "all" | "processing" | "shipping" | "delivered" | "cancelled";

export default function OrdersScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesFilter = filter === "all" || order.statusType === filter;
        return (
          matchesFilter &&
          `${order.id} ${order.items.map((item) => item.product[0]).join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase())
        );
      }),
    [filter, query],
  );

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
            <Text style={styles.headerTitle}>ORDERS</Text>
            <View style={styles.account}>
              <FontAwesome name="user" size={11} color="#516000" />
            </View>
          </View>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <FontAwesome name="search" size={10} color="#aeb9a8" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Tìm mã đơn, tên sản phẩm..."
                placeholderTextColor="#68736b"
                style={styles.searchInput}
              />
              <FontAwesome name="sliders" size={12} color="#d9ff00" />
            </View>
            <Pressable
              style={styles.cartIcon}
              onPress={() => router.push("./cart")}
              accessibilityLabel="Mở giỏ hàng"
            >
              <FontAwesome name="shopping-cart" size={13} color="#e9f1e5" />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>2</Text>
              </View>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            <FilterButton
              label="TẤT CẢ (4)"
              active={filter === "all"}
              onPress={() => setFilter("all")}
            />
            <FilterButton
              label="CHỜ XỬ LÝ"
              active={filter === "processing"}
              onPress={() => setFilter("processing")}
            />
            <FilterButton
              label="ĐANG GIAO HÀNG 1"
              active={filter === "shipping"}
              onPress={() => setFilter("shipping")}
            />
            <FilterButton
              label="ĐÃ GIAO"
              active={filter === "delivered"}
              onPress={() => setFilter("delivered")}
            />
          </ScrollView>
          {visibleOrders.map((order) => (
            <OrderCard order={order} key={order.id} />
          ))}
          {visibleOrders.length === 0 && (
            <View style={styles.empty}>
              <FontAwesome name="search" size={20} color="#d9ff00" />
              <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
            </View>
          )}
          <Text style={styles.footer}>BẠN ĐÃ XEM HẾT CÁC ĐƠN GẦN ĐÂY</Text>
          <Text style={styles.footerAccent}>TRA CỨU ĐƠN CŨ HƠN (2025)</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.filterButton, active && styles.filterActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
      {active && <FontAwesome name="arrow-right" size={9} color="#182000" />}
    </Pressable>
  );
}

function OrderCard({ order }: { order: Order }) {
  const isCancelled = order.statusType === "cancelled";
  return (
    <View style={[styles.orderCard, isCancelled && styles.cancelledCard]}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, isCancelled && styles.muted]}>
          {order.id}
        </Text>
        <Text
          style={[
            styles.status,
            order.statusType === "shipping"
              ? styles.shippingStatus
              : order.statusType === "delivered"
                ? styles.deliveredStatus
                : styles.cancelledStatus,
          ]}
        >
          {order.status}
        </Text>
      </View>
      <Text style={styles.orderDate}>Giao thành công: {order.date}</Text>
      {order.cancelReason && (
        <Text style={styles.cancelReason}>
          <FontAwesome name="clock-o" size={9} color="#909b91" />{" "}
          {order.cancelReason}
        </Text>
      )}
      <View style={styles.orderItems}>
        {order.items.map((item) => (
          <View style={styles.item} key={item.product[0]}>
            <Image
              source={{ uri: item.product[7] }}
              style={styles.itemImage}
              contentFit="cover"
            />
            <View style={styles.itemCopy}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product[0]}
              </Text>
              <Text style={styles.itemDetail} numberOfLines={1}>
                {item.detail}
              </Text>
            </View>
            <View style={styles.itemPrice}>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.quantity}>×1</Text>
            </View>
          </View>
        ))}
      </View>
      {order.extra && <Text style={styles.extra}>{order.extra}</Text>}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>
          Tổng tiền ({order.items.length} sản phẩm)
        </Text>
        <Text style={styles.total}>{order.total}</Text>
      </View>
      <View style={styles.actionRow}>
        {isCancelled ? (
          <>
            <Pressable style={styles.secondaryButton}>
              <FontAwesome name="shopping-cart" size={10} color="#d9ff00" />
              <Text style={styles.secondaryText}>ĐẶT LẠI ĐƠN NÀY</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.secondaryButton}>
              <FontAwesome name="phone" size={10} color="#e8eee4" />
              <Text style={styles.secondaryText}>LIÊN HỆ</Text>
            </Pressable>
            {order.statusType === "shipping" && (
              <Pressable style={styles.primaryButton}>
                <FontAwesome name="map-marker" size={10} color="#182000" />
                <Text style={styles.primaryText}>THEO DÕI ĐƠN</Text>
              </Pressable>
            )}
            {order.statusType === "delivered" && (
              <Pressable style={styles.primaryButton}>
                <FontAwesome name="refresh" size={10} color="#182000" />
                <Text style={styles.primaryText}>MUA LẠI</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
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
  iconButton: {
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
  searchRow: { flexDirection: "row", gap: 7 },
  searchBox: {
    height: 32,
    flex: 1,
    borderRadius: 6,
    backgroundColor: "#1b2022",
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  searchInput: { flex: 1, color: "#e5ede1", fontSize: 8, paddingVertical: 0 },
  cartIcon: {
    width: 34,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#1b2022",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -4,
    backgroundColor: "#d9ff00",
    width: 13,
    height: 13,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { color: "#182000", fontSize: 7, fontWeight: "900" },
  filters: { gap: 6, paddingVertical: 9 },
  filterButton: {
    minHeight: 27,
    borderRadius: 6,
    backgroundColor: "#1b2022",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  filterActive: { backgroundColor: "#caff00" },
  filterText: { color: "#d0dacf", fontSize: 7, fontWeight: "900" },
  filterTextActive: { color: "#182000" },
  orderCard: {
    backgroundColor: "#1b2022",
    borderRadius: 8,
    padding: 9,
    marginBottom: 9,
  },
  cancelledCard: { opacity: 0.7 },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderId: { color: "#e7eee3", fontSize: 10, fontWeight: "900" },
  muted: { color: "#8d978e" },
  status: {
    fontSize: 6,
    fontWeight: "900",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shippingStatus: { color: "#d9ff00", backgroundColor: "#304216" },
  deliveredStatus: { color: "#54dda8", backgroundColor: "#153d30" },
  cancelledStatus: { color: "#abb4ac", backgroundColor: "#303538" },
  orderDate: { color: "#879289", fontSize: 7, marginTop: 3 },
  cancelReason: {
    color: "#9ba69b",
    backgroundColor: "#252b2c",
    borderRadius: 4,
    fontSize: 7,
    padding: 7,
    marginTop: 7,
  },
  orderItems: {
    backgroundColor: "#171c1d",
    borderRadius: 6,
    paddingHorizontal: 7,
    marginTop: 8,
  },
  item: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#242a2b",
  },
  itemImage: {
    width: 39,
    height: 39,
    borderRadius: 3,
    backgroundColor: "#2c3233",
  },
  itemCopy: { flex: 1, marginLeft: 8 },
  itemName: { color: "#e7eee4", fontSize: 8, fontWeight: "900" },
  itemDetail: { color: "#89958b", fontSize: 7, marginTop: 3 },
  itemPrice: { alignItems: "flex-end", marginLeft: 5 },
  price: { color: "#d9ff00", fontSize: 8, fontWeight: "900" },
  quantity: { color: "#7f8a82", fontSize: 6, marginTop: 3 },
  extra: { color: "#8b968b", fontSize: 6, textAlign: "right", marginTop: 6 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalLabel: { color: "#9ea99f", fontSize: 8 },
  total: { color: "#e9f0e6", fontSize: 12, fontWeight: "900" },
  actionRow: { flexDirection: "row", gap: 7 },
  secondaryButton: {
    flex: 1,
    height: 30,
    borderRadius: 5,
    backgroundColor: "#303538",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  secondaryText: { color: "#e8eee4", fontSize: 7, fontWeight: "900" },
  primaryButton: {
    flex: 1,
    height: 30,
    borderRadius: 5,
    backgroundColor: "#caff00",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  primaryText: { color: "#182000", fontSize: 7, fontWeight: "900" },
  empty: { alignItems: "center", paddingVertical: 55, gap: 10 },
  emptyText: { color: "#aeb9ad", fontSize: 9 },
  footer: {
    color: "#738077",
    fontSize: 6,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },
  footerAccent: {
    color: "#d9ff00",
    fontSize: 7,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 5,
  },
});
