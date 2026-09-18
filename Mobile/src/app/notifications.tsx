import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AuthColors as C } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
  getNotificationPreferences,
  getNotifications,
  markAllAsRead,
  markAsRead,
  requestPtReschedule,
  subscribeNotifications,
  updateNotificationPreferences,
  type Notification,
  type NotificationCategory,
  type NotificationPreferences,
} from "@/lib/notifications";
import {
  formatRelativeTime,
  selectNotifications,
} from "@/lib/notification-view";
import { readLocal, writeLocal } from "@/lib/local-store";

type Filter = "all" | NotificationCategory;
type Sort = "newest" | "oldest" | "unread";
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "TẤT CẢ" },
  { id: "schedule", label: "LỊCH TẬP & PT" },
  { id: "promotion", label: "ƯU ĐÃI & VOUCHER" },
  { id: "transaction", label: "GIAO DỊCH & ĐIỂM" },
  { id: "system", label: "HỆ THỐNG & CLB" },
];
const sortLabels: Record<Sort, string> = {
  newest: "MỚI NHẤT",
  oldest: "CŨ NHẤT",
  unread: "CHƯA ĐỌC TRƯỚC",
};
const icons: Record<NotificationCategory, keyof typeof Ionicons.glyphMap> = {
  schedule: "calendar-outline",
  promotion: "pricetag-outline",
  transaction: "receipt-outline",
  system: "information-circle-outline",
};
const colors: Record<NotificationCategory, string> = {
  schedule: C.mint,
  promotion: C.lime,
  transaction: C.lime,
  system: C.cyan,
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<Notification[] | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [limit, setLimit] = useState(10);
  const [detail, setDetail] = useState<Notification | null>(null);
  const [sheet, setSheet] = useState<"settings" | "sort" | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [toast, setToast] = useState("");
  const load = useCallback(async () => {
    if (!user) {
      setRows([]);
      return;
    }
    try {
      const [items, settings] = await Promise.all([
        getNotifications(user.email),
        getNotificationPreferences(user.email),
      ]);
      setRows(items);
      setPrefs(settings);
      setError("");
    } catch {
      setError("Không thể tải thông báo. Kéo xuống để thử lại.");
    }
  }, [user]);
  useFocusEffect(
    useCallback(() => {
      void load();
      const unsubscribe = subscribeNotifications((id) => {
        if (id === user?.email) void load();
      });
      return unsubscribe;
    }, [load, user?.email]),
  );
  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }
  async function open(row: Notification) {
    if (!user) return;
    if (!row.readAt) {
      await markAsRead(user.email, row.id);
      setRows(
        (current) =>
          current?.map((item) =>
            item.id === row.id
              ? { ...item, readAt: new Date().toISOString() }
              : item,
          ) ?? null,
      );
    }
    setDetail(row);
  }
  async function activate(row: Notification) {
    if (!user) return;
    if (!row.readAt) await markAsRead(user.email, row.id);
    action(row);
  }
  async function readAll() {
    if (!user) return;
    try {
      await markAllAsRead(user.email);
      setRows(
        (current) =>
          current?.map((item) => ({
            ...item,
            readAt: item.readAt ?? new Date().toISOString(),
          })) ?? null,
      );
      setToast("Đã đánh dấu tất cả đã đọc.");
    } catch {
      setToast("Không thể cập nhật thông báo.");
    }
  }
  async function changePreference(
    key: keyof Omit<NotificationPreferences, "userId">,
    value: boolean,
  ) {
    if (!user) return;
    try {
      const next = await updateNotificationPreferences(user.email, {
        [key]: value,
      });
      setPrefs(next);
      if (key === "pushEnabled" && value)
        setToast(
          "Đã lưu lựa chọn. Thiết bị chưa được cấu hình nhận push thật.",
        );
    } catch {
      setToast("Không thể lưu cài đặt.");
    }
  }
  async function saveVoucher(code: string) {
    if (!user) return;
    try {
      const key = `qa-gym-saved-vouchers:${user.email}`;
      const saved: string[] = JSON.parse((await readLocal(key)) ?? "[]");
      await writeLocal(key, JSON.stringify([...new Set([...saved, code])]));
      setDetail(null);
      setToast(`Đã lưu mã ${code}`);
    } catch {
      setToast("Không thể lưu mã voucher.");
    }
  }
  async function reschedule(row: Notification) {
    if (!user) return;
    try {
      await requestPtReschedule(user.email, row.id);
      setToast(
        "Đã lưu yêu cầu đổi lịch ở trạng thái chờ. Chưa gửi tới lễ tân.",
      );
      setDetail(null);
    } catch {
      setToast("Không thể lưu yêu cầu đổi lịch.");
    }
  }
  function action(row: Notification) {
    setDetail(null);
    switch (row.actionType) {
      case "shop":
        router.push("/product");
        break;
      case "pt":
        router.push("/pt-schedule");
        break;
      case "reschedule":
        void reschedule(row);
        break;
      case "membership":
        router.push("/membership-detail");
        break;
      case "renewal":
        router.push({
          pathname: "/package-detail",
          params: {
            id: row.actionPayload?.packageId ?? "",
            renewal: row.actionPayload?.membershipId ?? "",
          },
        });
        break;
      case "orders":
        router.push("/orders");
        break;
      case "invoice":
        if (row.actionPayload?.orderId)
          router.push({
            pathname: "/package-payment",
            params: { orderId: row.actionPayload.orderId },
          });
        else setToast("Chưa có biên lai điện tử để tải.");
        break;
      default:
        setDetail(row);
    }
  }
  const all = rows ?? [];
  const unread = all.filter((row) => !row.readAt).length;
  const visible = selectNotifications(all, filter, sort);
  const paged = visible.slice(0, limit);
  const summary = [
    {
      label: "THÔNG BÁO HỆ THỐNG & LỊCH TẬP",
      value: `${all.filter((row) => !row.readAt && (row.category === "schedule" || row.category === "system")).length} TIN MỚI`,
      detail:
        all.find((row) => row.category === "schedule")?.title ??
        "Lịch tập & cập nhật CLB",
    },
    {
      label: "ƯU ĐÃI & VOUCHER",
      value: `${all.filter((row) => row.category === "promotion").length} KHẢ DỤNG`,
      detail:
        all.find((row) => row.category === "promotion")?.title ??
        "Ưu đãi cho hội viên",
    },
    {
      label: "GIAO DỊCH & ĐIỂM",
      value: `+${all.filter((row) => row.type === "points_reward").reduce((sum, row) => sum + Number(row.metadata?.points ?? 0), 0)} PTS`,
      detail: `${all.filter((row) => row.category === "transaction").length} thông báo giao dịch`,
    },
  ];
  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          style={s.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>THÔNG BÁO & ƯU ĐÃI</Text>
        <Pressable
          onPress={() => void readAll()}
          style={s.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Đánh dấu tất cả đã đọc"
        >
          <Ionicons name="checkmark-done-outline" size={23} color={C.lime} />
        </Pressable>
        <Pressable
          onPress={() => setSheet("settings")}
          style={s.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Cài đặt thông báo"
        >
          <Ionicons name="options-outline" size={22} color={C.text} />
        </Pressable>
      </View>
      <FlatList
        data={paged}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          s.list,
          { paddingBottom: Math.max(insets.bottom, 18) + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor={C.lime}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={s.eyebrow}>TRUNG TÂM THÔNG BÁO</Text>
            <Text style={s.title}>
              {unread
                ? `${unread} thông báo chưa đọc`
                : "Bạn đã xem hết thông báo"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.summaryRow}
            >
              {summary.map((card) => (
                <View key={card.label} style={s.summaryCard}>
                  <Text style={s.summaryLabel}>{card.label}</Text>
                  <Text style={s.summaryValue}>{card.value}</Text>
                  <Text style={s.summaryDetail} numberOfLines={2}>
                    {card.detail}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filters}
            >
              {filters.map((chip) => (
                <Pressable
                  key={chip.id}
                  onPress={() => {
                    setFilter(chip.id);
                    setLimit(10);
                  }}
                  style={[s.chip, filter === chip.id && s.chipActive]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[s.chipText, filter === chip.id && s.chipTextActive]}
                  >
                    {chip.label}{" "}
                    {chip.id === "all"
                      ? all.length
                      : all.filter((row) => row.category === chip.id).length}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={s.listToolbar}>
              <Text style={s.section}>
                {filter === "all"
                  ? "TẤT CẢ THÔNG BÁO"
                  : filters.find((chip) => chip.id === filter)?.label}
              </Text>
              <Pressable
                onPress={() => setSheet("sort")}
                style={s.sortButton}
                accessibilityRole="button"
              >
                <Ionicons name="filter-outline" size={16} color={C.lime} />
                <Text style={s.sortText}>{sortLabels[sort]}</Text>
              </Pressable>
            </View>
            {error ? <Text style={s.error}>{error}</Text> : null}
          </>
        }
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            onPress={() => void open(item)}
            onAction={() => void activate(item)}
          />
        )}
        ListEmptyComponent={
          rows === null ? (
            <Text style={s.emptyText}>Đang tải thông báo...</Text>
          ) : (
            <View style={s.empty}>
              <Ionicons
                name="notifications-off-outline"
                size={36}
                color={C.lime}
              />
              <Text style={s.emptyTitle}>Bạn đã xem hết thông báo</Text>
              <Text style={s.emptyText}>
                Thông báo mới về lịch tập, gói tập và ưu đãi sẽ xuất hiện tại
                đây.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          visible.length > 0 ? (
            <View style={s.footer}>
              <Text style={s.meta}>
                Hiển thị {paged.length} / {visible.length} thông báo
              </Text>
              {paged.length < visible.length ? (
                <Pressable
                  onPress={() => setLimit((value) => value + 10)}
                  style={s.loadMore}
                  accessibilityRole="button"
                >
                  <Text style={s.loadMoreText}>TẢI THÊM THÔNG BÁO CŨ HƠN</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
      />
      <Modal
        visible={sheet === "sort"}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <Pressable style={s.backdrop} onPress={() => setSheet(null)}>
          <Pressable
            style={s.sheet}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={s.sheetTitle}>SẮP XẾP THÔNG BÁO</Text>
            {(["newest", "oldest", "unread"] as Sort[]).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => {
                  setSort(mode);
                  setSheet(null);
                }}
                style={s.choice}
              >
                <Text style={s.choiceText}>{sortLabels[mode]}</Text>
                {sort === mode ? (
                  <Ionicons name="checkmark" size={18} color={C.lime} />
                ) : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={sheet === "settings"}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <Pressable style={s.backdrop} onPress={() => setSheet(null)}>
          <Pressable
            style={s.sheet}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>CÀI ĐẶT THÔNG BÁO</Text>
              <Pressable onPress={() => setSheet(null)} style={s.iconButton}>
                <Ionicons name="close" size={22} color={C.text} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              {prefs ? (
                (
                  [
                    ["pushEnabled", "Thông báo đẩy (App)"],
                    ["emailEnabled", "Email Hóa đơn & Tin tức"],
                    ["smsEnabled", "SMS OTP & Khẩn cấp"],
                    ["ptReminderEnabled", "Nhắc lịch PT"],
                    ["promotionEnabled", "Ưu đãi & Voucher"],
                    ["transactionEnabled", "Thông báo giao dịch"],
                    ["systemEnabled", "Thông báo hệ thống"],
                  ] as [keyof Omit<NotificationPreferences, "userId">, string][]
                ).map(([key, label]) => (
                  <View key={key} style={s.preference}>
                    <Text style={s.preferenceText}>{label}</Text>
                    <Switch
                      value={prefs[key]}
                      onValueChange={(value) =>
                        void changePreference(key, value)
                      }
                      trackColor={{ true: C.lime, false: C.surfaceHighest }}
                      thumbColor={C.text}
                    />
                  </View>
                ))
              ) : (
                <Text style={s.emptyText}>Đang tải cài đặt...</Text>
              )}
              <Text style={s.settingsHint}>
                Các lựa chọn được lưu trên thiết bị. Chưa kết nối dịch vụ
                push/email/SMS thật.
              </Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={!!detail}
        transparent
        animationType="slide"
        onRequestClose={() => setDetail(null)}
      >
        <Pressable style={s.backdrop} onPress={() => setDetail(null)}>
          <Pressable
            style={s.sheet}
            onPress={(event) => event.stopPropagation()}
          >
            {detail ? (
              <>
                <View style={s.sheetHead}>
                  <Ionicons
                    name={icons[detail.category]}
                    size={26}
                    color={colors[detail.category]}
                  />
                  <Pressable
                    onPress={() => setDetail(null)}
                    style={s.iconButton}
                  >
                    <Ionicons name="close" size={22} color={C.text} />
                  </Pressable>
                </View>
                <Text style={s.badge}>
                  {detail.badge ??
                    filters.find((chip) => chip.id === detail.category)?.label}
                </Text>
                <Text style={s.detailTitle}>{detail.title}</Text>
                <Text style={s.meta}>
                  {formatRelativeTime(detail.createdAt)}
                </Text>
                <Text style={s.detailMessage}>{detail.message}</Text>
                {detail.metadata?.amount ? (
                  <Text style={s.detailMessage}>
                    Số tiền:{" "}
                    {Number(detail.metadata.amount).toLocaleString("vi-VN")}đ ·
                    Phương thức: {detail.metadata.paymentMethod}
                  </Text>
                ) : null}
                {detail.actionType ? (
                  <Pressable
                    style={s.primary}
                    onPress={() => action(detail)}
                    accessibilityRole="button"
                  >
                    <Text style={s.primaryText}>
                      {actionLabel(detail.actionType)}
                    </Text>
                  </Pressable>
                ) : null}
                {detail.actionPayload?.code ? (
                  <Pressable
                    style={s.secondary}
                    onPress={() => void saveVoucher(detail.actionPayload!.code)}
                  >
                    <Text style={s.secondaryText}>
                      LƯU MÃ: {detail.actionPayload.code}
                    </Text>
                  </Pressable>
                ) : null}
                {detail.type === "pt_reminder" ? (
                  <Pressable
                    style={s.secondary}
                    onPress={() => void reschedule(detail)}
                  >
                    <Text style={s.secondaryText}>YÊU CẦU ĐỔI LỊCH</Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
      {toast ? (
        <Pressable onPress={() => setToast("")} style={s.toast}>
          <Text style={s.toastText}>{toast}</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}
function actionLabel(action: NonNullable<Notification["actionType"]>) {
  return (
    {
      shop: "KHÁM PHÁ PRO SHOP",
      pt: "XEM LỊCH TẬP PT",
      reschedule: "YÊU CẦU ĐỔI LỊCH",
      invoice: "XEM ĐƠN / BIÊN LAI",
      membership: "XEM GÓI ĐANG DÙNG",
      renewal: "GIA HẠN NGAY",
      orders: "XEM ĐƠN HÀNG",
      voucher: "LƯU MÃ VOUCHER",
    } satisfies Record<NonNullable<Notification["actionType"]>, string>
  )[action];
}
function NotificationCard({
  item,
  onPress,
  onAction,
}: {
  item: Notification;
  onPress: () => void;
  onAction: () => void;
}) {
  const color = colors[item.category];
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.card,
        !item.readAt && { borderColor: color, borderLeftWidth: 4 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.readAt ? "" : "Chưa đọc. "}${item.title}`}
    >
      <View
        style={[
          s.cardIcon,
          {
            backgroundColor:
              item.category === "schedule"
                ? "#193b31"
                : item.category === "system"
                  ? "#26333d"
                  : "#303815",
          },
        ]}
      >
        <Ionicons name={icons[item.category]} size={22} color={color} />
      </View>
      <View style={s.cardBody}>
        <View style={s.cardTop}>
          <Text style={s.cardTitle}>{item.title}</Text>
          {!item.readAt ? (
            <View style={[s.dot, { backgroundColor: color }]} />
          ) : null}
        </View>
        <Text style={s.time}>
          {formatRelativeTime(item.createdAt)}{" "}
          {item.badge ? `· ${item.badge}` : ""}
        </Text>
        <Text style={s.message} numberOfLines={2}>
          {item.message}
        </Text>
        {item.actionType ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onAction();
            }}
            style={s.actionButton}
            accessibilityRole="button"
            accessibilityLabel={actionLabel(item.actionType)}
          >
            <Text style={s.actionText}>{actionLabel(item.actionType)}</Text>
            <Ionicons name="arrow-forward" size={14} color={C.lime} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  header: {
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceHigh,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: C.text, flex: 1, fontSize: 14, fontWeight: "900" },
  list: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  eyebrow: {
    color: C.lime,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 20,
  },
  title: {
    color: C.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 5,
    marginBottom: 15,
  },
  summaryRow: { gap: 10, paddingBottom: 18 },
  summaryCard: {
    width: 205,
    minHeight: 112,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: C.surfaceHigh,
  },
  summaryLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "800",
    minHeight: 28,
  },
  summaryValue: {
    color: C.lime,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 3,
  },
  summaryDetail: { color: C.muted, fontSize: 10, marginTop: 5 },
  filters: { gap: 7, paddingBottom: 13 },
  chip: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceHigh,
  },
  chipActive: { backgroundColor: C.lime },
  chipText: { color: C.muted, fontSize: 9, fontWeight: "800" },
  chipTextActive: { color: "#161e00" },
  listToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
    gap: 8,
  },
  section: { color: C.text, fontSize: 10, fontWeight: "900", flex: 1 },
  sortButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sortText: { color: C.lime, fontSize: 9, fontWeight: "900" },
  error: { color: C.error, fontSize: 11, marginBottom: 10 },
  card: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.surfaceHigh,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: "row", gap: 5, alignItems: "flex-start" },
  cardTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    flex: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  time: { color: C.muted, fontSize: 9, marginTop: 5 },
  message: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 7 },
  actionButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
  },
  actionText: { color: C.lime, fontSize: 10, fontWeight: "900" },
  empty: {
    minHeight: 220,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: { color: C.text, fontSize: 16, fontWeight: "900" },
  emptyText: {
    color: C.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
  },
  footer: { alignItems: "center", padding: 12, gap: 10 },
  meta: { color: C.muted, fontSize: 10 },
  loadMore: {
    minHeight: 44,
    backgroundColor: C.surfaceHigh,
    borderRadius: 9,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  loadMoreText: { color: C.text, fontSize: 10, fontWeight: "800" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.72)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.surfaceLow,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    gap: 8,
    maxHeight: "85%",
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  choice: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    backgroundColor: C.surface,
    borderRadius: 8,
  },
  choiceText: { color: C.text, fontSize: 12, fontWeight: "700" },
  preference: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  preferenceText: { color: C.text, fontSize: 12, flex: 1 },
  settingsHint: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 6 },
  badge: { color: C.lime, fontSize: 10, fontWeight: "900" },
  detailTitle: { color: C.text, fontSize: 20, fontWeight: "900" },
  detailMessage: { color: C.text, fontSize: 13, lineHeight: 20, marginTop: 10 },
  primary: {
    minHeight: 48,
    backgroundColor: C.lime,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  primaryText: { color: "#161e00", fontSize: 11, fontWeight: "900" },
  secondary: {
    minHeight: 44,
    backgroundColor: C.surfaceHighest,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: C.text, fontSize: 10, fontWeight: "800" },
  toast: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    maxWidth: "90%",
    backgroundColor: C.surfaceHighest,
    borderRadius: 9,
    padding: 12,
  },
  toastText: { color: C.text, fontSize: 12 },
});
