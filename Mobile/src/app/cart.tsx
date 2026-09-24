import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/shop-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { getCart, updateCart, formatPrice, type CartItem } from "@/lib/shop-api";

export default function CartScreen() {
  const { user } = useAuth();
  const accountId = user?.accountId;
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const generation = useRef(0);
  const [reload, setReload] = useState(0);
  useFocusEffect(useCallback(() => {
    const version = ++generation.current;
    setItems([]); setError(''); setNotice(''); setLoading(!!accountId);
    if (accountId) getCart(accountId).then(data => { if (version === generation.current) setItems(data); })
      .catch(e => { if (version === generation.current) setError(e.message); })
      .finally(() => { if (version === generation.current) setLoading(false); });
    return () => { generation.current++; };
  // reload intentionally invalidates the focus callback for pull-to-refresh/retry.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, reload]));
  async function change(item: CartItem, quantity: number) {
    if (!accountId || busy.current) return;
    const version = generation.current;
    busy.current = true; setSaving(true); setNotice('');
    try { const data = await updateCart(accountId, item.SanPhamID, quantity, 'PUT'); if (version === generation.current) setItems(data); }
    catch (e) { if (version === generation.current) setNotice(e instanceof Error ? e.message : 'Không cập nhật được giỏ hàng.'); }
    finally { busy.current = false; setSaving(false); }
  }
  const total = items.reduce((sum, item) => sum + item.GiaBan * item.SoLuong, 0);
  const count = items.reduce((sum, item) => sum + item.SoLuong, 0);
  const canCheckout = !!accountId && !loading && !saving && !error && items.length > 0
    && items.every(item => item.TrangThai === 'ACTIVE' && item.DanhMucTrangThai === 'ACTIVE');
  return <View style={styles.container}><SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { if (!saving) setReload(n => n + 1); }} tintColor="#d9ff00" />}>
      <View style={styles.topBar}><Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/product')} accessibilityLabel="Quay lại"><FontAwesome name="angle-left" size={22} color="#d9ff00" /></Pressable><Text style={styles.topBarTitle}>GIỎ HÀNG ({count})</Text></View>
      {!accountId ? <Pressable onPress={() => router.push('/login')}><Text style={styles.itemName}>Đăng nhập để xem giỏ hàng</Text></Pressable> : loading ? <ActivityIndicator color="#d9ff00" /> : error ? <View><Text style={styles.itemName}>{error}</Text><Pressable onPress={() => setReload(n => n + 1)}><Text style={styles.stock}>Thử lại</Text></Pressable></View> : <>
        {!items.length && <Text style={styles.itemName}>Giỏ hàng của bạn đang trống.</Text>}
        {!!notice && <Text accessibilityLiveRegion="polite" style={styles.itemName}>{notice}</Text>}
        {items.map(item => <View key={item.SanPhamID} style={styles.itemCard}>
          <View style={styles.itemTop}><Pressable onPress={() => router.push({ pathname: '/product-detail', params: { productId: item.SanPhamID } })} accessibilityLabel={`Xem ${item.TenSanPham}`}>
            <Image source={DEFAULT_PRODUCT_IMAGE} style={styles.itemImage} contentFit="contain" />
          </Pressable><View style={styles.itemCopy}><Text style={styles.itemName}>{item.TenSanPham}</Text><Text style={styles.itemDetail}>{item.DonViTinh}</Text><Text style={styles.itemPrice}>{formatPrice(item.GiaBan)}</Text></View><Pressable disabled={saving} onPress={() => void change(item, 0)} accessibilityLabel={`Xóa ${item.TenSanPham}`}><Text style={styles.remove}>×</Text></Pressable></View>
          <View style={styles.itemBottom}><Text style={styles.stock}>{item.TrangThai === 'ACTIVE' && item.DanhMucTrangThai === 'ACTIVE' ? formatPrice(item.GiaBan * item.SoLuong) : 'Sản phẩm không còn bán'}</Text><View style={styles.quantity}>
            <Pressable disabled={saving || item.SoLuong <= 1} onPress={() => void change(item, item.SoLuong - 1)} accessibilityLabel="Giảm số lượng"><Text style={styles.quantityAction}>−</Text></Pressable><Text style={styles.quantityValue}>{item.SoLuong}</Text><Pressable disabled={saving || item.SoLuong >= 99 || item.TrangThai !== 'ACTIVE' || item.DanhMucTrangThai !== 'ACTIVE'} onPress={() => void change(item, item.SoLuong + 1)} accessibilityLabel="Tăng số lượng"><Text style={styles.quantityAction}>+</Text></Pressable>
          </View></View>
        </View>)}
        {!!items.length && <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>TỔNG TIỀN ĐƠN HÀNG ({count} sản phẩm)</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          <Text style={styles.tax}>Phí vận chuyển được tính tại trang thanh toán.</Text>
          {!canCheckout && !saving && <Text style={styles.tax}>Vui lòng xóa sản phẩm hết hàng hoặc ngừng bán trước khi thanh toán.</Text>}
        </View>}
      </>}
      <Pressable style={styles.continueShopping} onPress={() => router.push('/product')}>
        <Text style={styles.continueShoppingText}>TIẾP TỤC MUA SẮM</Text>
      </Pressable>
    </ScrollView>
    <View style={styles.bottomBar}>
      <View style={styles.bottomSummary}>
        <Text style={styles.bottomLabel}>Tổng tiền đơn hàng</Text>
        <Text style={styles.bottomTotal} accessibilityLiveRegion="polite">{loading || error ? '—' : formatPrice(total)}</Text>
        <Text style={styles.bottomNote}>Chưa gồm phí vận chuyển</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Thanh toán ngay" disabled={!canCheckout} style={[styles.checkoutButton, !canCheckout && styles.checkoutDisabled]} onPress={() => router.push('/checkout')}>
        <Text style={styles.checkoutText}>THANH TOÁN NGAY</Text><FontAwesome name="arrow-right" size={13} color="#1b2400" />
      </Pressable>
    </View>
  </SafeAreaView></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, backgroundColor: "#0f1213" },
  safeArea: { flex: 1, minHeight: 0, width: "100%", maxWidth: 540, alignSelf: "center" },
  scrollArea: { flex: 1, minHeight: 0 },
  content: { paddingHorizontal: 13, paddingBottom: 18 },
  topBar: {
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: { color: "#e7eee5", fontSize: 13, fontWeight: "900" },
  accountButton: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#edf5dc",
    alignItems: "center",
    justifyContent: "center",
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  heading: { color: "#eef3e9", fontSize: 13, fontWeight: "900" },
  itemCount: { color: "#d9ff00", fontSize: 9 },
  clearText: { color: "#bbc500", fontSize: 9, fontWeight: "800" },
  shippingCard: {
    backgroundColor: "#1e2325",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  shippingTop: { flexDirection: "row", alignItems: "center" },
  shippingIcon: {
    width: 21,
    height: 21,
    borderRadius: 5,
    backgroundColor: "#2a3b18",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  shippingTitle: { color: "#e9f0e6", fontSize: 10, fontWeight: "900", flex: 1 },
  shippingPercent: { color: "#d9ff00", fontSize: 9, fontWeight: "900" },
  shippingCopy: { color: "#bac2b8", fontSize: 9, marginTop: 7 },
  highlight: { color: "#d9ff00", fontWeight: "900" },
  progressTrack: {
    height: 5,
    backgroundColor: "#3a4041",
    borderRadius: 3,
    marginTop: 8,
  },
  progressFill: {
    width: "85%",
    height: 5,
    backgroundColor: "#d9ff00",
    borderRadius: 3,
  },
  itemCard: {
    backgroundColor: "#1b2022",
    borderRadius: 8,
    padding: 9,
    marginBottom: 9,
  },
  itemTop: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 14,
    height: 14,
    backgroundColor: "#d9ff00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: 4,
    backgroundColor: "#2b3032",
  },
  itemCopy: { flex: 1, marginLeft: 9 },
  itemName: { color: "#e9eee7", fontSize: 11, fontWeight: "900" },
  itemDetail: { color: "#95a095", fontSize: 8, marginTop: 4 },
  itemPriceRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  itemPrice: { color: "#d9ff00", fontSize: 12, fontWeight: "900" },
  itemOldPrice: {
    color: "#717a72",
    fontSize: 8,
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  remove: { color: "#c4d400", fontSize: 20, lineHeight: 19, marginLeft: 6 },
  itemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
    paddingLeft: 21,
  },
  stock: { color: "#45d49e", fontSize: 8, fontWeight: "900" },
  quantity: {
    width: 67,
    height: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#292d30",
    borderRadius: 6,
  },
  quantityAction: { color: "#d9ff00", fontSize: 16, paddingHorizontal: 5 },
  quantityValue: { color: "#f0f5eb", fontSize: 10, fontWeight: "900" },
  giftCard: {
    backgroundColor: "#1b2022",
    borderRadius: 8,
    padding: 9,
    marginBottom: 9,
  },
  giftTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  giftTitle: { color: "#d9ff00", fontSize: 9, fontWeight: "900", flex: 1 },
  giftBadge: {
    color: "#253000",
    backgroundColor: "#d9ff00",
    fontSize: 7,
    fontWeight: "900",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 3,
  },
  giftContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252a2c",
    borderRadius: 5,
    padding: 6,
    marginTop: 7,
  },
  giftImage: { width: 43, height: 43, borderRadius: 3 },
  giftCopy: { flex: 1, marginLeft: 8 },
  giftName: { color: "#e7eee4", fontSize: 9, fontWeight: "900" },
  giftDetail: { color: "#9ca69b", fontSize: 8, marginTop: 3 },
  giftPrice: { color: "#d9ff00", fontSize: 8, fontWeight: "900", marginTop: 3 },
  giftOldPrice: {
    color: "#879085",
    textDecorationLine: "line-through",
    fontWeight: "400",
  },
  couponCard: {
    backgroundColor: "#1b2022",
    borderRadius: 8,
    padding: 10,
    marginBottom: 9,
  },
  couponTitleRow: { flexDirection: "row", alignItems: "center" },
  couponTitle: { color: "#e7eee4", fontSize: 9, fontWeight: "900" },
  couponForm: { flexDirection: "row", gap: 6, marginTop: 9 },
  couponCode: {
    flex: 1,
    backgroundColor: "#34383c",
    borderRadius: 7,
    color: "#e6ece2",
    fontSize: 9,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  applyButton: {
    backgroundColor: "#d9ff00",
    borderRadius: 7,
    paddingHorizontal: 13,
    justifyContent: "center",
  },
  applyText: { color: "#192100", fontSize: 9, fontWeight: "900" },
  appliedCoupon: {
    backgroundColor: "#263519",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginTop: 7,
  },
  appliedText: { color: "#d9ff00", fontSize: 9, fontWeight: "900", flex: 1 },
  appliedDetail: { color: "#b8c2ab", fontWeight: "400" },
  summaryCard: {
    backgroundColor: "#1b2022",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  summaryTitle: {
    color: "#e9efe6",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: { color: "#bdc6ba", fontSize: 9 },
  summaryValue: { color: "#e2e9df", fontSize: 9, fontWeight: "800" },
  summaryAccent: { color: "#d9ff00" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#303638",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 9,
  },
  totalLabel: { color: "#edf2e9", fontSize: 10, fontWeight: "900" },
  totalValue: { color: "#d9ff00", fontSize: 17, fontWeight: "900" },
  tax: { color: "#9ba59a", fontSize: 8, textAlign: "right", marginTop: 2 },
  bottomBar: {
    flexShrink: 0,
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#171b1c",
    borderTopWidth: 1,
    borderTopColor: "#2b3031",
    paddingHorizontal: 13,
    paddingVertical: 12,
    gap: 10,
  },
  bottomSummary: { flex: 1, gap: 3 },
  bottomLabel: { color: "#b6c0b7", fontSize: 12 },
  bottomTotal: { color: "#d9ff00", fontSize: 20, fontWeight: "900" },
  bottomNote: { color: "#89938a", fontSize: 10 },
  continueShopping: { alignItems: "center", paddingVertical: 16 },
  continueShoppingText: { color: "#d9ff00", fontSize: 12, fontWeight: "800" },
  saved: { color: "#8c978c", fontSize: 7 },
  checkoutButton: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d9ff00",
    borderRadius: 8,
  },
  checkoutText: { color: "#1b2400", fontSize: 12, fontWeight: "900" },
  checkoutDisabled: { backgroundColor: "#929c62" },
});
