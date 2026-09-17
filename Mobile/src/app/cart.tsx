import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { products } from '@/constants/products';

const cartItems = [
  { product: products[0], quantity: 1, detail: 'Vị: Chocolate Fudge • 5 Lbs / 2.27kg' },
  { product: products[1], quantity: 1, detail: 'Vị: Ice Blue Razz • 60 Servings' },
  { product: products[4], quantity: 1, detail: 'Size: M • Màu: Matte Black Leather' },
] as const;

function parsePrice(price: string) {
  return Number(price.replace(/\D/g, ''));
}

function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

export default function CartScreen() {
  const [quantities, setQuantities] = useState<number[]>(cartItems.map((item) => item.quantity));
  const subtotal = cartItems.reduce((total, item, index) => total + parsePrice(item.product[2]) * quantities[index], 0);
  const discount = 325000;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  const changeQuantity = (index: number, amount: number) => {
    setQuantities((current) => current.map((quantity, itemIndex) => itemIndex === index ? Math.max(1, quantity + amount) : quantity));
  };

  return <View style={styles.container}>
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Quay lại">
            <FontAwesome name="angle-left" size={22} color="#d9ff00" />
          </Pressable>
          <Text style={styles.topBarTitle}>CART</Text>
          <Pressable style={styles.accountButton} accessibilityLabel="Tài khoản"><FontAwesome name="user" size={13} color="#516000" /></Pressable>
        </View>

        <View style={styles.headingRow}><Text style={styles.heading}>GIỎ HÀNG <Text style={styles.itemCount}>(3 Món)</Text></Text><Text style={styles.clearText}>Xóa tất cả</Text></View>
        <View style={styles.shippingCard}>
          <View style={styles.shippingTop}><View style={styles.shippingIcon}><FontAwesome name="truck" size={13} color="#d9ff00" /></View><Text style={styles.shippingTitle}>Freeship Toàn Quốc</Text><Text style={styles.shippingPercent}>85%</Text></View>
          <Text style={styles.shippingCopy}>Mua thêm <Text style={styles.highlight}>150.000đ</Text> để mở khóa miễn phí vận chuyển!</Text>
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
        </View>

        {cartItems.map((item, index) => <View style={styles.itemCard} key={item.product[0]}>
          <View style={styles.itemTop}>
            <Pressable style={styles.checkbox} accessibilityLabel={`Chọn ${item.product[0]}`}><FontAwesome name="check" size={10} color="#192100" /></Pressable>
            <Image source={{ uri: item.product[7] }} style={styles.itemImage} contentFit="cover" />
            <View style={styles.itemCopy}><Text style={styles.itemName} numberOfLines={1}>{item.product[0]}</Text><Text style={styles.itemDetail} numberOfLines={1}>{item.detail}</Text><View style={styles.itemPriceRow}><Text style={styles.itemPrice}>{item.product[2]}</Text><Text style={styles.itemOldPrice}>{item.product[3]}</Text></View></View>
            <Pressable accessibilityLabel={`Xóa ${item.product[0]}`}><Text style={styles.remove}>×</Text></Pressable>
          </View>
          <View style={styles.itemBottom}><Text style={styles.stock}><FontAwesome name="check-circle" size={10} color="#35d69d" /> CÒN HÀNG</Text><View style={styles.quantity}><Pressable onPress={() => changeQuantity(index, -1)} accessibilityLabel="Giảm số lượng"><Text style={styles.quantityAction}>−</Text></Pressable><Text style={styles.quantityValue}>{quantities[index]}</Text><Pressable onPress={() => changeQuantity(index, 1)} accessibilityLabel="Tăng số lượng"><Text style={styles.quantityAction}>+</Text></Pressable></View></View>
        </View>)}

        <View style={styles.giftCard}><View style={styles.giftTop}><FontAwesome name="gift" size={13} color="#d9ff00" /><Text style={styles.giftTitle}>QUÀ TẶNG KÈM ĐẠT MỐC</Text><Text style={styles.giftBadge}>MỞ KHÓA</Text></View><View style={styles.giftContent}><Image source={{ uri: products[3][7] }} style={styles.giftImage} contentFit="cover" /><View style={styles.giftCopy}><Text style={styles.giftName}>Bình Lắc Shaker QA-Gym 700ml</Text><Text style={styles.giftDetail}>Chất liệu nhựa Tritan BPA-Free cao cấp</Text><Text style={styles.giftPrice}>MIỄN PHÍ <Text style={styles.giftOldPrice}>đ 150.000đ</Text></Text></View><MaterialCommunityIcons name="cog-outline" size={17} color="#35d69d" /></View></View>

        <View style={styles.couponCard}><View style={styles.couponTitleRow}><FontAwesome name="tag" size={12} color="#cbd5c5" /><Text style={styles.couponTitle}> ƯU ĐÃI / COUPON</Text></View><View style={styles.couponForm}><Text style={styles.couponCode}>GYMERVIP10</Text><Pressable style={styles.applyButton}><Text style={styles.applyText}>ÁP DỤNG</Text></Pressable></View><View style={styles.appliedCoupon}><FontAwesome name="certificate" size={11} color="#d9ff00" /><Text style={styles.appliedText}> GYMERVIP10 <Text style={styles.appliedDetail}>(-10% tổng đơn)</Text></Text><FontAwesome name="times-circle-o" size={12} color="#b9c39e" /></View></View>

        <View style={styles.summaryCard}><Text style={styles.summaryTitle}>TÓM TẮT ĐƠN HÀNG</Text><SummaryRow label="Tạm tính (3 món)" value={formatPrice(subtotal)} /><SummaryRow label="Giảm giá hội viên (GYMERVIP10)" value={`-${formatPrice(discount)}`} accent /><SummaryRow label="Phí vận chuyển" value="Miễn phí (Đơn > 500k)" accent /><SummaryRow label="Điểm tích lũy QA-Points" value="+290 điểm" accent /><View style={styles.totalRow}><Text style={styles.totalLabel}>TỔNG THANH TOÁN</Text><Text style={styles.totalValue}>{formatPrice(total)}</Text></View><Text style={styles.tax}>Đã bao gồm VAT & Quà tặng</Text></View>
      </ScrollView>
      <View style={styles.bottomBar}><View><Text style={styles.bottomLabel}>Tổng cộng:</Text><Text style={styles.bottomTotal}>{formatPrice(total)}</Text><Text style={styles.saved}>Tiết kiệm {formatPrice(discount)}</Text></View><Pressable style={styles.checkoutButton} onPress={() => router.push('./checkout')} accessibilityLabel="Mua hàng"><Text style={styles.checkoutText}>MUA HÀNG (3)</Text><FontAwesome name="arrow-right" size={13} color="#1b2400" /></Pressable></View>
    </SafeAreaView>
  </View>;
}

function SummaryRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{label}</Text><Text style={[styles.summaryValue, accent && styles.summaryAccent]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1213' }, safeArea: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' }, content: { paddingHorizontal: 13, paddingBottom: 18 },
  topBar: { height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }, topBarTitle: { color: '#e7eee5', fontSize: 12, fontWeight: '900' }, accountButton: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#edf5dc', alignItems: 'center', justifyContent: 'center' },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }, heading: { color: '#eef3e9', fontSize: 12, fontWeight: '900' }, itemCount: { color: '#d9ff00', fontSize: 8 }, clearText: { color: '#bbc500', fontSize: 8, fontWeight: '800' },
  shippingCard: { backgroundColor: '#1e2325', borderRadius: 8, padding: 10, marginBottom: 10 }, shippingTop: { flexDirection: 'row', alignItems: 'center' }, shippingIcon: { width: 21, height: 21, borderRadius: 5, backgroundColor: '#2a3b18', alignItems: 'center', justifyContent: 'center', marginRight: 7 }, shippingTitle: { color: '#e9f0e6', fontSize: 9, fontWeight: '900', flex: 1 }, shippingPercent: { color: '#d9ff00', fontSize: 8, fontWeight: '900' }, shippingCopy: { color: '#bac2b8', fontSize: 8, marginTop: 7 }, highlight: { color: '#d9ff00', fontWeight: '900' }, progressTrack: { height: 5, backgroundColor: '#3a4041', borderRadius: 3, marginTop: 8 }, progressFill: { width: '85%', height: 5, backgroundColor: '#d9ff00', borderRadius: 3 },
  itemCard: { backgroundColor: '#1b2022', borderRadius: 8, padding: 9, marginBottom: 9 }, itemTop: { flexDirection: 'row', alignItems: 'center' }, checkbox: { width: 14, height: 14, backgroundColor: '#d9ff00', alignItems: 'center', justifyContent: 'center', marginRight: 7 }, itemImage: { width: 54, height: 54, borderRadius: 4, backgroundColor: '#2b3032' }, itemCopy: { flex: 1, marginLeft: 9 }, itemName: { color: '#e9eee7', fontSize: 10, fontWeight: '900' }, itemDetail: { color: '#95a095', fontSize: 7, marginTop: 4 }, itemPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 }, itemPrice: { color: '#d9ff00', fontSize: 11, fontWeight: '900' }, itemOldPrice: { color: '#717a72', fontSize: 7, textDecorationLine: 'line-through', marginLeft: 6 }, remove: { color: '#c4d400', fontSize: 19, lineHeight: 19, marginLeft: 6 }, itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7, paddingLeft: 21 }, stock: { color: '#45d49e', fontSize: 7, fontWeight: '900' }, quantity: { width: 67, height: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#292d30', borderRadius: 6 }, quantityAction: { color: '#d9ff00', fontSize: 15, paddingHorizontal: 5 }, quantityValue: { color: '#f0f5eb', fontSize: 9, fontWeight: '900' },
  giftCard: { backgroundColor: '#1b2022', borderRadius: 8, padding: 9, marginBottom: 9 }, giftTop: { flexDirection: 'row', alignItems: 'center', gap: 6 }, giftTitle: { color: '#d9ff00', fontSize: 8, fontWeight: '900', flex: 1 }, giftBadge: { color: '#253000', backgroundColor: '#d9ff00', fontSize: 6, fontWeight: '900', paddingHorizontal: 5, paddingVertical: 3, borderRadius: 3 }, giftContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252a2c', borderRadius: 5, padding: 6, marginTop: 7 }, giftImage: { width: 43, height: 43, borderRadius: 3 }, giftCopy: { flex: 1, marginLeft: 8 }, giftName: { color: '#e7eee4', fontSize: 8, fontWeight: '900' }, giftDetail: { color: '#9ca69b', fontSize: 7, marginTop: 3 }, giftPrice: { color: '#d9ff00', fontSize: 7, fontWeight: '900', marginTop: 3 }, giftOldPrice: { color: '#879085', textDecorationLine: 'line-through', fontWeight: '400' },
  couponCard: { backgroundColor: '#1b2022', borderRadius: 8, padding: 10, marginBottom: 9 }, couponTitleRow: { flexDirection: 'row', alignItems: 'center' }, couponTitle: { color: '#e7eee4', fontSize: 8, fontWeight: '900' }, couponForm: { flexDirection: 'row', gap: 6, marginTop: 9 }, couponCode: { flex: 1, backgroundColor: '#34383c', borderRadius: 7, color: '#e6ece2', fontSize: 8, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 10 }, applyButton: { backgroundColor: '#d9ff00', borderRadius: 7, paddingHorizontal: 13, justifyContent: 'center' }, applyText: { color: '#192100', fontSize: 8, fontWeight: '900' }, appliedCoupon: { backgroundColor: '#263519', borderRadius: 6, flexDirection: 'row', alignItems: 'center', padding: 8, marginTop: 7 }, appliedText: { color: '#d9ff00', fontSize: 8, fontWeight: '900', flex: 1 }, appliedDetail: { color: '#b8c2ab', fontWeight: '400' },
  summaryCard: { backgroundColor: '#1b2022', borderRadius: 8, padding: 10, marginBottom: 6 }, summaryTitle: { color: '#e9efe6', fontSize: 10, fontWeight: '900', marginBottom: 8 }, summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }, summaryLabel: { color: '#bdc6ba', fontSize: 8 }, summaryValue: { color: '#e2e9df', fontSize: 8, fontWeight: '800' }, summaryAccent: { color: '#d9ff00' }, totalRow: { borderTopWidth: 1, borderTopColor: '#303638', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 9 }, totalLabel: { color: '#edf2e9', fontSize: 9, fontWeight: '900' }, totalValue: { color: '#d9ff00', fontSize: 16, fontWeight: '900' }, tax: { color: '#9ba59a', fontSize: 7, textAlign: 'right', marginTop: 2 },
  bottomBar: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#171b1c', borderTopWidth: 1, borderTopColor: '#2b3031', paddingHorizontal: 13, paddingTop: 7 }, bottomLabel: { color: '#89938a', fontSize: 7 }, bottomTotal: { color: '#d9ff00', fontSize: 16, fontWeight: '900' }, saved: { color: '#8c978c', fontSize: 6 }, checkoutButton: { height: 39, minWidth: 137, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d9ff00', borderRadius: 8 }, checkoutText: { color: '#1b2400', fontSize: 8, fontWeight: '900' },
});
