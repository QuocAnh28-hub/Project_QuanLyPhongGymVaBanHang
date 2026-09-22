import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { products } from "@/constants/products";

const productFacts = [
  ["PROTEIN ISOLATE", "25g", "100% WPI & Hydrolyzed"],
  ["BCAA TỰ NHIÊN", "6g", "Tái tạo cơ siêu tốc"],
  ["ĐƯỜNG & CHẤT BÉO", "0g", "Zero Fat & Zero Sugar"],
  ["NĂNG LƯỢNG SẠCH", "110 kcal", "Không lo dị ứng"],
] as const;

const nutritionRows = [
  ["Khẩu phần 1 muỗng (30g)", "76 lần dùng"],
  ["Năng lượng (Calories)", "110 kcal"],
  ["Carbohydrate toàn phần (Total Fat)", "0g (0%)"],
  ["Cholesterol", "5 mg (2%)"],
  ["Natri (Sodium)", "50 mg (2%)"],
  ["Carbohydrate đường (Sugars)", "1g (1%)"],
  ["Protein tinh khiết", "25 g (50%)"],
] as const;

const reviews = [
  [
    "Tuấn Trí - PT QA-GYM",
    "Mùi Vanilla thơm, dễ uống và không bị ngấy. Chất lượng đúng như cam kết, dùng rất hợp với lịch tập của mình.",
  ],
  [
    "Minh Anh",
    "Giao hàng siêu nhanh, đóng gói chắc chắn. Team tư vấn rất nhiệt tình và hướng dẫn dùng rõ ràng.",
  ],
] as const;

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const parsedProductIndex = Number(productId);
  const productIndex =
    Number.isInteger(parsedProductIndex) &&
    parsedProductIndex >= 0 &&
    parsedProductIndex < products.length
      ? parsedProductIndex
      : 0;
  const product = products[productIndex];
  const [quantity, setQuantity] = useState(1);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.topBar}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.back()}
              accessibilityLabel="Quay lại danh sách sản phẩm"
            >
              <FontAwesome name="arrow-left" size={17} color="#edf2e8" />
            </Pressable>
            <Text style={styles.topBarTitle}>CHI TIẾT SẢN PHẨM</Text>
            <View style={styles.topBarActions}>
              <Pressable
                style={styles.iconButton}
                accessibilityLabel="Chia sẻ sản phẩm"
              >
                <FontAwesome name="share-alt" size={15} color="#eef4e7" />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                accessibilityLabel="Yêu thích sản phẩm"
              >
                <FontAwesome name="heart-o" size={15} color="#eef4e7" />
              </Pressable>
            </View>
          </View>

          <View style={styles.hero}>
            <Image
              source={{ uri: product[7] }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.heroShade} />
            {product[6] !== "" && (
              <Text style={styles.badge}>{product[6]}</Text>
            )}
            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>QA-GYM PRO SHOP</Text>
              <Text style={styles.heroTitle}>Nạp đúng. Tập chất.</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          >
            {[
              productIndex,
              ...products
                .map((_, index) => index)
                .filter((index) => index !== productIndex)
                .slice(0, 3),
            ].map((index, thumbnailIndex) => (
              <View
                key={`${index}-${thumbnailIndex}`}
                style={[
                  styles.thumbnail,
                  thumbnailIndex === 0 && styles.thumbnailActive,
                ]}
              >
                <Image
                  source={{ uri: products[index][7] }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.productHeader}>
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>
                ★ {product[4]}{" "}
                <Text style={styles.reviewCount}>({product[5]} đánh giá)</Text>
              </Text>
              <Text style={styles.stock}>
                <FontAwesome name="check-circle" size={10} color="#d9ff00" />{" "}
                CÒN HÀNG
              </Text>
            </View>
            <Text style={styles.productName}>{product[0]}</Text>
            <Text style={styles.productDetail}>
              {product[1]} • Chính hãng 100%
            </Text>
            <View style={styles.priceLine}>
              <Text style={styles.price}>{product[2]}</Text>
              {product[3] !== "" && (
                <Text style={styles.oldPrice}>{product[3]}</Text>
              )}
              <Text style={styles.discount}>-12%</Text>
            </View>
          </View>

          <View style={styles.factGrid}>
            {productFacts.map(([label, value, detail]) => (
              <View key={label} style={styles.factCard}>
                <Text style={styles.factLabel}>{label}</Text>
                <View style={styles.factValueRow}>
                  <Text style={styles.factValue}>{value}</Text>
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={14}
                    color="#d9ff00"
                  />
                </View>
                <Text style={styles.factDetail}>{detail}</Text>
              </View>
            ))}
          </View>

          <SectionTitle title="HƯỞNG LỢI ĐẶC QUYỀN" kicker="Hội viên QA-Gym" />
          <View style={styles.memberCard}>
            <Benefit
              icon="truck"
              title="Miễn phí vận chuyển toàn quốc"
              detail="Áp dụng đơn hàng nhập khẩu từ 500.000đ."
            />
            <Benefit
              icon="gift"
              title="Ưu đãi hội viên Diamond (-15%)"
              detail="Tự động giảm khi tài khoản thành viên đủ hạng."
            />
            <Benefit
              icon="certificate"
              title="Tặng kèm Shaker QA-Gym 700ml"
              detail="Bình lắc cao cấp cho đơn hàng dinh dưỡng từ 1.500.000đ."
            />
            <Benefit
              icon="shield"
              title="Cam kết chính hãng & đổi trả 7 ngày"
              detail="Đền 200% nếu phát hiện hàng giả, đổi trả khi lỗi sản xuất."
            />
          </View>
          <SectionTitle
            title="THÔNG TIN DINH DƯỠNG CHUẨN FDA"
            kicker="76 lần dùng"
          />
          <View style={styles.nutritionCard}>
            {nutritionRows.map(([label, value], index) => (
              <View
                key={label}
                style={[
                  styles.nutritionRow,
                  index === nutritionRows.length - 1 && styles.nutritionLastRow,
                ]}
              >
                <Text
                  style={[
                    styles.nutritionLabel,
                    index === nutritionRows.length - 1 && styles.proteinLabel,
                  ]}
                >
                  {label}
                </Text>
                <Text
                  style={[
                    styles.nutritionValue,
                    index === nutritionRows.length - 1 && styles.proteinValue,
                  ]}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.featurePills}>
            <Text style={styles.featurePill}>
              <FontAwesome name="check" size={9} color="#d9ff00" /> Không Amino
              Spiking
            </Text>
            <Text style={styles.featurePill}>
              <FontAwesome name="check" size={9} color="#d9ff00" /> Không Gluten
              &amp; Đường
            </Text>
            <Text style={styles.featurePill}>
              <FontAwesome name="check" size={9} color="#d9ff00" /> Chuẩn GMP
              Hoa Kỳ
            </Text>
          </View>
          <SectionTitle
            title="ĐÁNH GIÁ TỪ GYMERS"
            kicker={`Xem tất cả (${product[5]})`}
          />
          <View style={styles.reviewSummary}>
            <Text style={styles.reviewScore}>4.9 / 5</Text>
            <Text style={styles.reviewStars}>★★★★★</Text>
            <Text style={styles.reviewCaption}>98% khách hàng hài lòng</Text>
          </View>
          {reviews.map(([name, review]) => (
            <View style={styles.reviewCard} key={name}>
              <View style={styles.reviewTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                </View>
                <View style={styles.reviewIdentity}>
                  <Text style={styles.reviewer}>
                    {name}{" "}
                    <FontAwesome
                      name="check-circle"
                      size={10}
                      color="#52c98c"
                    />
                  </Text>
                  <Text style={styles.reviewDate}>
                    Đã mua hàng • 4 ngày trước
                  </Text>
                </View>
                <Text style={styles.reviewStars}>★★★★★</Text>
              </View>
              <Text style={styles.reviewText}>{review}</Text>
            </View>
          ))}
          <Text style={styles.footerNote}>
            QA-GYM PRO SHOP • Hàng chuẩn, tập chuẩn
          </Text>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.cartButton}
            accessibilityLabel="Thêm vào giỏ hàng"
          >
            <FontAwesome name="shopping-cart" size={17} color="#d9ff00" />
          </Pressable>
          <View style={styles.quantityControl}>
            <Pressable
              onPress={() => setQuantity((current) => Math.max(1, current - 1))}
              accessibilityLabel="Giảm số lượng"
            >
              <Text style={styles.quantityAction}>−</Text>
            </Pressable>
            <Text style={styles.quantity}>{quantity}</Text>
            <Pressable
              onPress={() => setQuantity((current) => current + 1)}
              accessibilityLabel="Tăng số lượng"
            >
              <Text style={styles.quantityAction}>+</Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.buyButton}
            accessibilityLabel={`Mua ${product[0]} ngay`}
          >
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={17}
              color="#182000"
            />
            <Text style={styles.buyButtonText}>MUA NGAY ({product[2]})</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function SectionTitle({ title, kicker }: { title: string; kicker: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionKicker}>{kicker}</Text>
    </View>
  );
}

function Benefit({
  icon,
  title,
  detail,
}: {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIcon}>
        <FontAwesome name={icon} size={13} color="#d9ff00" />
      </View>
      <View style={styles.benefitCopy}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDetail}>{detail}</Text>
      </View>
      <FontAwesome name="angle-right" size={14} color="#6f796e" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101210" },
  safeArea: { flex: 1, width: "100%", maxWidth: 540, alignSelf: "center" },
  content: { paddingHorizontal: 10, paddingBottom: 26 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  topBarActions: { flexDirection: "row", gap: 7 },
  iconButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#252a27",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    color: "#e9efe4",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  hero: {
    height: 210,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#242a26",
    position: "relative",
  },
  heroImage: { width: "100%", height: "100%" },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(8, 13, 9, .2)",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    color: "#182000",
    backgroundColor: "#caff00",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 8,
    fontWeight: "900",
  },
  heroCopy: { position: "absolute", left: 12, bottom: 11 },
  heroKicker: {
    color: "#d9ff00",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#f5f9ef",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  thumbnailList: { gap: 6, paddingVertical: 8 },
  thumbnail: {
    width: 54,
    height: 42,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#272c28",
    borderWidth: 1,
    borderColor: "#272d28",
  },
  thumbnailActive: { borderColor: "#d9ff00" },
  thumbnailImage: { width: "100%", height: "100%" },
  productHeader: { paddingHorizontal: 4, paddingTop: 4 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rating: { color: "#d9ff00", fontSize: 10, fontWeight: "900" },
  reviewCount: { color: "#8e998d", fontWeight: "400" },
  stock: { color: "#b9cf00", fontSize: 8, fontWeight: "900" },
  productName: {
    color: "#f1f5eb",
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "900",
    marginTop: 7,
  },
  productDetail: { color: "#96a095", fontSize: 10, marginTop: 5 },
  priceLine: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  price: { color: "#d9ff00", fontSize: 22, fontWeight: "900" },
  oldPrice: {
    color: "#6d776d",
    fontSize: 10,
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  discount: {
    color: "#172000",
    backgroundColor: "#bfe000",
    fontSize: 8,
    fontWeight: "900",
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 3,
    marginLeft: 8,
  },
  factGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 12 },
  factCard: {
    width: "49%",
    minHeight: 59,
    backgroundColor: "#202521",
    borderRadius: 6,
    padding: 8,
  },
  factLabel: { color: "#7d887d", fontSize: 7, fontWeight: "900" },
  factValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  factValue: { color: "#eff5e8", fontSize: 17, fontWeight: "900" },
  factDetail: { color: "#9ca79a", fontSize: 8, marginTop: 2 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
    marginBottom: 7,
  },
  sectionTitle: {
    color: "#eff4e9",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  sectionKicker: { color: "#b9cf00", fontSize: 8, fontWeight: "900" },
  memberCard: {
    backgroundColor: "#202521",
    borderRadius: 7,
    paddingHorizontal: 9,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#30372f",
  },
  benefitIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#303a2d",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  benefitCopy: { flex: 1 },
  benefitTitle: { color: "#e8eee3", fontSize: 10, fontWeight: "900" },
  benefitDetail: {
    color: "#899388",
    fontSize: 8,
    marginTop: 3,
    lineHeight: 10,
  },
  nutritionCard: {
    backgroundColor: "#202521",
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  nutritionRow: {
    minHeight: 23,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#30372f",
  },
  nutritionLastRow: { borderBottomWidth: 0 },
  nutritionLabel: { color: "#d3dbcf", fontSize: 8 },
  nutritionValue: { color: "#eff5e8", fontSize: 8, fontWeight: "900" },
  proteinLabel: { color: "#d9ff00", fontWeight: "900" },
  proteinValue: { color: "#d9ff00" },
  featurePills: { flexDirection: "row", gap: 4, marginTop: 5 },
  featurePill: {
    flex: 1,
    minHeight: 31,
    backgroundColor: "#202521",
    borderRadius: 5,
    color: "#9ca79a",
    fontSize: 7,
    textAlign: "center",
    paddingHorizontal: 3,
    paddingVertical: 7,
  },
  reviewSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#202521",
    borderRadius: 7,
    padding: 9,
    gap: 8,
  },
  reviewScore: { color: "#eff5e8", fontSize: 13, fontWeight: "900" },
  reviewStars: { color: "#d9ff00", fontSize: 11, letterSpacing: 1 },
  reviewCaption: { color: "#8d988c", fontSize: 8, marginLeft: "auto" },
  reviewCard: {
    backgroundColor: "#202521",
    borderRadius: 7,
    padding: 10,
    marginTop: 6,
  },
  reviewTop: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#394238",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#d9ff00", fontSize: 12, fontWeight: "900" },
  reviewIdentity: { flex: 1, marginLeft: 8 },
  reviewer: { color: "#e4ebe0", fontSize: 9, fontWeight: "900" },
  reviewDate: { color: "#7f897e", fontSize: 8, marginTop: 2 },
  reviewText: { color: "#b0baad", fontSize: 9, lineHeight: 12, marginTop: 8 },
  footerNote: {
    color: "#566055",
    fontSize: 8,
    textAlign: "center",
    marginTop: 20,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#181b18",
    borderTopWidth: 1,
    borderTopColor: "#2b322b",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  cartButton: {
    width: 39,
    height: 40,
    borderRadius: 7,
    backgroundColor: "#292e2b",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityControl: {
    height: 40,
    width: 71,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#292e2b",
    borderRadius: 7,
  },
  quantityAction: {
    color: "#d9ff00",
    fontSize: 19,
    lineHeight: 22,
    paddingHorizontal: 5,
  },
  quantity: { color: "#f1f5eb", fontSize: 13, fontWeight: "900" },
  buyButton: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#d9ff00",
    borderRadius: 7,
  },
  buyButtonText: { color: "#182000", fontSize: 9, fontWeight: "900" },
});
