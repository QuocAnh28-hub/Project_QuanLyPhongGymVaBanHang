import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUnreadCount, subscribeNotifications } from "@/lib/notifications";

export default function Header() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let live = true;
      const refresh = () => {
        getUnreadCount(user.email)
          .then((count) => {
            if (live) setUnread(count);
          })
          .catch(() => {
            if (live) setUnread(0);
          });
      };
      refresh();
      const unsubscribe = subscribeNotifications((id) => {
        if (id === user.email) refresh();
      });
      return () => {
        live = false;
        unsubscribe();
      };
    }, [user]),
  );
  return (
    <View style={styles.header}>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>
          <MaterialCommunityIcons name="dumbbell" size={24} color="white" />
          QA-GYM<Text style={styles.brandDot}>.</Text>
        </Text>
        <Text style={styles.location}>
          <FontAwesome name="map-marker" size={12} color="#7b7c7d" /> Khoái
          Châu, Hưng Yên
        </Text>
      </View>
      <View style={styles.headerActions}>
        <Pressable
          style={styles.bell}
          onPress={() => router.push("/notifications" as never)}
          accessibilityRole="button"
          accessibilityLabel={`Thông báo, ${user ? unread : 0} chưa đọc`}
        >
          <FontAwesome name="bell" size={22} color="#cfcfcf" />
          {user && unread > 0 ? (
            <Text style={styles.badge}>{unread > 9 ? "9+" : unread}</Text>
          ) : null}
        </Pressable>
        <Pressable
          style={styles.shoppingCart}
          onPress={() => router.push("/cart")}
          accessibilityLabel="Mở giỏ hàng"
        >
          <FontAwesome name="shopping-cart" size={24} color="#f5f9ed" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 24,
  },
  brandBlock: { flexShrink: 1, paddingRight: 76 },
  brand: {
    color: "#f3f5ec",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  brandDot: { color: "#d9ff00" },
  location: { color: "#899083", fontSize: 10, marginTop: 5 },
  headerActions: {
    position: "absolute",
    top: 20.5,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  shoppingCart: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  bell: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    overflow: "hidden",
    backgroundColor: "#c3f400",
    color: "#161e00",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "900",
  },
});
