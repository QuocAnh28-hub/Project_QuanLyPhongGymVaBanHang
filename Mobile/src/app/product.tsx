import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { products, type Product } from '@/constants/products';

const categories = ['Tất cả (8)', 'Whey Protein', 'Pre-Workout & EAA', 'Phụ kiện'];
function Header() {
  return <View style={styles.header}>
    <View style={styles.brandBlock}>
      <Text style={styles.brand}><MaterialCommunityIcons name="dumbbell" size={24} color="white" />QA-GYM<Text style={styles.brandDot}>.</Text></Text>
      <Text style={styles.location}><FontAwesome name="map-marker" size={12} color="#7b7c7d" />  Khoái Châu, Hưng Yên</Text>
    </View>
    <View style={styles.headerActions}><FontAwesome name="bell" size={24} color="#cfcfcf" /><View style={styles.shoppingCart}><FontAwesome name="shopping-cart" size={24} color="#f5f9ed" /></View></View>
  </View>;
}

function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return <Pressable style={styles.productCard} onPress={onPress} accessibilityLabel={`Xem chi tiết ${product[0]}`}>
    <View style={styles.productImageWrap}>
      <Image source={{ uri: product[7] }} style={styles.productImage} contentFit="cover" />
      {product[6] !== '' && <Text style={styles.productBadge}>{product[6]}</Text>}
      <Pressable style={styles.favorite} accessibilityLabel={`Yêu thích ${product[0]}`}><Text style={styles.favoriteText}>♡</Text></Pressable>
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.rating}>★ {product[4]} <Text style={styles.reviewCount}>({product[5]})</Text></Text>
      <Text style={styles.productName} numberOfLines={2}>{product[0]}</Text>
      <Text style={styles.productDetail} numberOfLines={1}>{product[1]}</Text>
      {product[3] !== '' && <Text style={styles.oldPrice}>{product[3]}</Text>}
      <View style={styles.priceRow}><Text style={styles.productPrice}>{product[2]}</Text><Pressable style={styles.addButton} accessibilityLabel={`Thêm ${product[0]} vào giỏ`}><Text style={styles.addButtonText}>+</Text></Pressable></View>
    </View>
  </Pressable>;
}

export default function ProductsScreen() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  return <View style={styles.container}>
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Header />
        <View style={styles.intro}><Text style={styles.kicker}>✦ CHÍNH HÃNG 100% • BẢO ĐẢM QA-GYM</Text><Text style={styles.title}>QA-Gym Pro Shop & Dinh{`\n`}Dưỡng</Text><Text style={styles.subtitle}>Thực phẩm bổ sung chính hãng, phụ kiện tập luyện cao cấp</Text></View>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}><FontAwesome name="search" size={15} color="#a8b09f" /><TextInput placeholder="Tìm Whey, Pre-workout, đai lưng..." placeholderTextColor="#8c9389" style={styles.searchInput} /></View>
          <Pressable style={styles.filterButton} accessibilityLabel="Bộ lọc sản phẩm"><FontAwesome name="sliders" size={18} color="#d9ff00" /><View style={styles.filterDot} /></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>{categories.map((category) => <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}><Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>{category}</Text></Pressable>)}</ScrollView>
        <View style={styles.promoCard}><View style={styles.promoIcon}><FontAwesome name="certificate" size={22} color="#d9ff00" /></View><View style={styles.promoCopy}><Text style={styles.promoTitle}>ĐẶC QUYỀN HỘI VIÊN QA-GYM <Text style={styles.promoDiscount}>-10% THẬT QUÁY</Text></Text><Text style={styles.promoText}>Hội viên QA-Gym giảm thêm 10% cho mọi đơn hàng phụ kiện và dinh dưỡng khi quét mã tích điểm tại quầy lễ tân.</Text></View></View>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Sản phẩm tuyển chọn <Text style={styles.countBadge}>8</Text></Text><Text style={styles.sortText}>↕ Phổ biến nhất</Text></View>
        <View style={styles.productGrid}>{products.map((product, index) => <ProductCard key={product[0]} product={product} onPress={() => router.push({ pathname: '/product-detail', params: { productId: String(index) } })} />)}</View>
        <View style={styles.helpCard}><View style={styles.helpIcon}><FontAwesome name="headphones" size={18} color="#d9ff00" /></View><View style={styles.helpCopy}><Text style={styles.helpTitle}>Cần tư vấn chọn Whey & Pre?</Text><Text style={styles.helpText}>PT và chuyên gia dinh dưỡng sẵn sàng hỗ trợ bạn.</Text></View><Pressable style={styles.helpButton}><Text style={styles.helpButtonText}>Hỏi{`\n`}ngay</Text></Pressable></View>
      </ScrollView>
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101210' }, safeArea: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' }, 
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 22 }, 
  brandBlock: { flexShrink: 1, paddingRight: 76 }, brand: { color: '#f3f5ec', fontSize: 21, fontWeight: '900', letterSpacing: 1.2 }, 
  brandDot: { color: '#d9ff00' }, location: { color: '#899083', fontSize: 10, marginTop: 5 }, 
  headerActions: { position: 'absolute', top: 20.5, right: 0, flexDirection: 'row', alignItems: 'center', gap: 14 }, 
  shoppingCart: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  intro: { marginBottom: 14 }, kicker: { color: '#c1da00', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }, 
  title: { color: '#f4f7ee', fontSize: 23, lineHeight: 27, fontWeight: '900', marginTop: 8 }, 
  subtitle: { color: '#9ca599', fontSize: 10, marginTop: 6 }, 
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 }, 
  searchBox: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#292d30', borderRadius: 9, paddingHorizontal: 11 }, 
  searchInput: { flex: 1, color: '#e6ebe1', fontSize: 11, paddingVertical: 0 }, 
  filterButton: { width: 44, height: 42, borderRadius: 9, backgroundColor: '#292d30', justifyContent: 'center', alignItems: 'center' }, 
  filterDot: { position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: 3, backgroundColor: '#d9ff00' },
  cartBadge: { position: 'absolute', top: -5, right: -4, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: '#d9ff00', color: '#182000', fontSize: 9, fontWeight: '900', textAlign: 'center', paddingTop: 3 },
  categoryList: { gap: 7, paddingBottom: 18 }, categoryChip: { backgroundColor: '#1d211e', borderRadius: 15, paddingHorizontal: 13, paddingVertical: 8 }, 
  categoryChipActive: { backgroundColor: '#d9ff00' }, categoryText: { color: '#bdc5b8', fontSize: 9, fontWeight: '800' }, 
  categoryTextActive: { color: '#172000' }, promoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#272c27', borderRadius: 9, padding: 11, marginBottom: 22 }, 
  promoIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1d241d', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, promoCopy: { flex: 1 }, 
  promoTitle: { color: '#d9ff00', fontSize: 8, fontWeight: '900' }, promoDiscount: { color: '#d9ff00', backgroundColor: '#385500', fontSize: 7, paddingHorizontal: 3 }, 
  promoText: { color: '#c1c9bc', fontSize: 9, lineHeight: 13, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }, 
  sectionTitle: { color: '#eff4e9', fontSize: 15, fontWeight: '900' }, countBadge: { color: '#b8c0b3', backgroundColor: '#303631', fontSize: 9, paddingHorizontal: 5, borderRadius: 7 }, 
  sortText: { color: '#9ba59a', fontSize: 9 }, 
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }, 
  productCard: { width: '48.6%', backgroundColor: '#1d211f', borderRadius: 10, overflow: 'hidden' }, 
  productImageWrap: { height: 142, backgroundColor: '#252a26', position: 'relative' }, 
  productImage: { width: '100%', height: '100%' }, 
  productBadge: { position: 'absolute', top: 8, left: 8, color: '#182000', backgroundColor: '#caff00', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 4, fontSize: 7, fontWeight: '900' }, 
  favorite: { position: 'absolute', top: 7, right: 7, width: 25, height: 25, borderRadius: 13, backgroundColor: 'rgba(16, 18, 16, .72)', alignItems: 'center', justifyContent: 'center' }, 
  favoriteText: { color: '#e6eee2', fontSize: 20, lineHeight: 22 }, productInfo: { padding: 9 }, rating: { color: '#d9ff00', fontSize: 9, fontWeight: '800' }, reviewCount: { color: '#8e998d', fontWeight: '400' }, 
  productName: { color: '#edf2e8', fontSize: 11, lineHeight: 14, fontWeight: '800', marginTop: 7, minHeight: 28 }, productDetail: { color: '#8e998d', fontSize: 8, marginTop: 4 }, 
  oldPrice: { color: '#6c756d', fontSize: 8, textDecorationLine: 'line-through', marginTop: 5 }, 
  priceRow: { minHeight: 31, flexDirection: 'row', alignItems: 'flex-end', marginTop: 2 }, productPrice: { color: '#d9ff00', fontSize: 15, fontWeight: '900' }, 
  addButton: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#caff00', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }, 
  addButtonText: { color: '#1b2600', fontSize: 23, lineHeight: 25, fontWeight: '500' },
  helpCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252a27', borderRadius: 10, padding: 12, marginTop: 22 }, 
  helpIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#303930', alignItems: 'center', justifyContent: 'center', marginRight: 9 }, 
  helpCopy: { flex: 1 }, helpTitle: { color: '#e8eee3', fontSize: 11, fontWeight: '800' }, 
  helpText: { color: '#8f998e', fontSize: 8, marginTop: 4 }, helpButton: { backgroundColor: '#383d3b', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 }, 
  helpButtonText: { color: '#e2e9df', fontSize: 8, fontWeight: '800', textAlign: 'center' },
});
