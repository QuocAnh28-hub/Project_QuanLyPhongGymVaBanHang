import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { products } from '@/constants/products';

const benefits = [
  ['check-circle', 'Chính hãng 100%', 'Cam kết nguồn gốc và tem phụ đầy đủ'],
  ['truck', 'Giao nhanh trong ngày', 'Miễn phí giao hàng cho đơn từ 500.000đ'],
  ['refresh', 'Đổi trả dễ dàng', 'Đổi sản phẩm trong 7 ngày nếu lỗi từ nhà sản xuất'],
] as const;

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const product = products[Number(productId)] ?? products[0];
  const [quantity, setQuantity] = useState(1);

  return <View style={styles.container}>
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Quay lại danh sách sản phẩm">
            <FontAwesome name="arrow-left" size={17} color="#edf2e8" />
          </Pressable>
          <Text style={styles.topBarTitle}>Chi tiết sản phẩm</Text>
          <Pressable style={styles.iconButton} accessibilityLabel="Chia sẻ sản phẩm">
            <FontAwesome name="share-alt" size={16} color="#edf2e8" />
          </Pressable>
        </View>

        <View style={styles.imagePanel}>
          <Image source={{ uri: product[7] }} style={styles.productImage} contentFit="cover" />
          <View style={styles.imageShade} />
          {product[6] !== '' && <Text style={styles.badge}>{product[6]}</Text>}
          <Pressable style={styles.favoriteButton} accessibilityLabel={`Yêu thích ${product[0]}`}><Text style={styles.favoriteText}>♡</Text></Pressable>
          <View style={styles.imageCaption}><Text style={styles.captionKicker}>QA-GYM PRO SHOP</Text><Text style={styles.captionText}>Nạp đúng. Tập chất.</Text></View>
        </View>

        <View style={styles.productHeader}>
          <Text style={styles.rating}>★ {product[4]} <Text style={styles.reviewCount}>({product[5]} đánh giá)</Text></Text>
          <Text style={styles.productName}>{product[0]}</Text>
          <Text style={styles.productDetail}>{product[1]}</Text>
          <View style={styles.priceLine}><Text style={styles.price}>{product[2]}</Text>{product[3] !== '' && <Text style={styles.oldPrice}>{product[3]}</Text>}<Text style={styles.inStock}>CÒN HÀNG</Text></View>
        </View>

        <View style={styles.divider} />
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Vì sao nên chọn?</Text><Text style={styles.sectionKicker}>QA-GYM GUARANTEE</Text></View>
        <View style={styles.benefitList}>{benefits.map(([icon, title, detail]) => <View style={styles.benefitRow} key={title}><View style={styles.benefitIcon}><FontAwesome name={icon} size={14} color="#d9ff00" /></View><View style={styles.benefitCopy}><Text style={styles.benefitTitle}>{title}</Text><Text style={styles.benefitDetail}>{detail}</Text></View><FontAwesome name="angle-right" size={15} color="#6f796e" /></View>)}</View>

        <View style={styles.noteCard}><MaterialCommunityIcons name="lightning-bolt" size={18} color="#d9ff00" /><View style={styles.noteCopy}><Text style={styles.noteTitle}>Ưu đãi hội viên QA-Gym</Text><Text style={styles.noteText}>Quét mã tích điểm tại quầy để nhận thêm 10% ưu đãi.</Text></View></View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}><Pressable onPress={() => setQuantity((current) => Math.max(1, current - 1))} accessibilityLabel="Giảm số lượng"><Text style={styles.quantityAction}>−</Text></Pressable><Text style={styles.quantity}>{quantity}</Text><Pressable onPress={() => setQuantity((current) => current + 1)} accessibilityLabel="Tăng số lượng"><Text style={styles.quantityAction}>+</Text></Pressable></View>
        <Pressable style={styles.addToCart} accessibilityLabel={`Thêm ${product[0]} vào giỏ`}><FontAwesome name="shopping-cart" size={15} color="#182000" /><Text style={styles.addToCartText}>Thêm vào giỏ</Text></Pressable>
      </View>
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101210' },
  safeArea: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  iconButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#252a27', alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { color: '#f1f5eb', fontSize: 13, fontWeight: '900' },
  imagePanel: { height: 285, borderRadius: 14, overflow: 'hidden', backgroundColor: '#252a26', position: 'relative', marginTop: 6 },
  productImage: { width: '100%', height: '100%' }, imageShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8, 13, 9, .2)' },
  badge: { position: 'absolute', top: 13, left: 13, color: '#182000', backgroundColor: '#caff00', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 5, fontSize: 8, fontWeight: '900' },
  favoriteButton: { position: 'absolute', top: 11, right: 11, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(16, 18, 16, .76)', alignItems: 'center', justifyContent: 'center' }, favoriteText: { color: '#f0f4ea', fontSize: 25, lineHeight: 27 },
  imageCaption: { position: 'absolute', left: 15, bottom: 14 }, captionKicker: { color: '#d9ff00', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }, captionText: { color: '#f6f9f1', fontSize: 20, fontWeight: '900', marginTop: 4 },
  productHeader: { paddingTop: 18 }, rating: { color: '#d9ff00', fontSize: 11, fontWeight: '900' }, reviewCount: { color: '#8d988c', fontWeight: '400' }, productName: { color: '#f2f6ec', fontSize: 21, lineHeight: 26, fontWeight: '900', marginTop: 8 }, productDetail: { color: '#9ba59a', fontSize: 11, marginTop: 7 },
  priceLine: { flexDirection: 'row', alignItems: 'center', marginTop: 13 }, price: { color: '#d9ff00', fontSize: 22, fontWeight: '900' }, oldPrice: { color: '#6d776d', fontSize: 10, textDecorationLine: 'line-through', marginLeft: 9 }, inStock: { color: '#b8d000', backgroundColor: '#28351e', fontSize: 8, fontWeight: '900', paddingHorizontal: 6, paddingVertical: 5, borderRadius: 4, marginLeft: 'auto' },
  divider: { height: 1, backgroundColor: '#293029', marginVertical: 20 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: '#eff4e9', fontSize: 15, fontWeight: '900' }, sectionKicker: { color: '#8ea300', fontSize: 8, fontWeight: '900', letterSpacing: .7 },
  benefitList: { marginTop: 7 }, benefitRow: { flexDirection: 'row', alignItems: 'center', minHeight: 58, borderBottomWidth: 1, borderBottomColor: '#242b25' }, benefitIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#283228', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, benefitCopy: { flex: 1 }, benefitTitle: { color: '#e8eee3', fontSize: 11, fontWeight: '800' }, benefitDetail: { color: '#899388', fontSize: 9, marginTop: 3 },
  noteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252d24', borderRadius: 9, padding: 12, marginTop: 20 }, noteCopy: { flex: 1, marginLeft: 9 }, noteTitle: { color: '#d9ff00', fontSize: 10, fontWeight: '900' }, noteText: { color: '#a9b3a4', fontSize: 9, marginTop: 4 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#181b18', borderTopWidth: 1, borderTopColor: '#2b322b', paddingHorizontal: 16, paddingTop: 11 }, quantityControl: { height: 46, width: 104, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#292e2b', borderRadius: 8 }, quantityAction: { color: '#d9ff00', fontSize: 22, lineHeight: 25, paddingHorizontal: 9 }, quantity: { color: '#f1f5eb', fontSize: 14, fontWeight: '900' }, addToCart: { flex: 1, height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d9ff00', borderRadius: 8 }, addToCartText: { color: '#182000', fontSize: 11, fontWeight: '900' },
});
