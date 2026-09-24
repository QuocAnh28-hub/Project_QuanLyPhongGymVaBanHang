import { enrollmentGifts, homeClubs } from "@/constants/package-detail";
import { type GymPackage } from "@/lib/packages";
import {
  getActivePackageDetail,
  packageFromApiDetail,
} from "@/lib/package-api";
import { registerPackage } from "@/lib/membership-api";
import { getActiveMembership, getEnrollment } from "@/lib/membership";
import { getStudentVerification } from "@/lib/student-verification";
import { AuthColors as C } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { type PaymentMethod } from "@/lib/membership";
import {
  calculatePrice,
  findVoucher,
  formatVND,
  localDate,
  startOfDay,
  validateMemberForm,
  type Voucher,
} from "@/lib/package-logic";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Errors = Partial<
  Record<
    | "name"
    | "phone"
    | "email"
    | "activationDate"
    | "homeClubId"
    | "terms"
    | "submit",
    string
  >
>;
const methods: {
  id: PaymentMethod;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  badge?: string;
}[] = [
  {
    id: "vietqr",
    icon: "qr-code-outline",
    title: "VietQR / Chuyển khoản 24/7",
    detail: "Tạo yêu cầu thanh toán (0₫ phí)",
  },
  {
    id: "card",
    icon: "card-outline",
    title: "Thẻ tín dụng / Ghi nợ quốc tế",
    detail: "Visa, Mastercard, JCB",
    badge: "TRẢ GÓP 0%",
  },
  {
    id: "wallet",
    icon: "wallet-outline",
    title: "Ví điện tử MoMo / ZaloPay / Apple Pay",
    detail: "Thanh toán qua ví khi cổng được kết nối",
  },
  {
    id: "pos",
    icon: "storefront-outline",
    title: "Thanh toán trực tiếp tại quầy",
    detail: "Nộp phí khi đến phòng tập lần đầu",
  },
];
const activationOptions = [
  { id: "today", label: "Bắt đầu ngay hôm nay", days: 0 },
  { id: "tomorrow", label: "Bắt đầu từ ngày mai", days: 1 },
  { id: "week", label: "Sau 07 ngày", days: 7 },
  { id: "custom", label: "Tùy chọn ngày trong 30 ngày tới", days: 0 },
] as const;

export default function PackageEnrollmentScreen() {
  const params = useLocalSearchParams<{
    packageId?: string;
    durationId?: string;
    renewal?: string;
  }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const packageId = Number(params.packageId);
  const durationId = Number(params.durationId);
  const [loadedItem, setItem] = useState<GymPackage | null>(null);
  const [apiDetailError, setApiDetailError] = useState("");
  const validPackageId = Number.isInteger(packageId) && packageId > 0;
  const item = loadedItem?.apiId === packageId ? loadedItem : null;
  const visibleApiError = validPackageId
    ? apiDetailError
    : "GoiTapID không hợp lệ.";
  const today = startOfDay(new Date());
  const [form, setForm] = useState<{
    name: string;
    phone: string;
    email: string;
    activationDate: string;
    homeClubId: string;
  }>({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    activationDate: localDate(today),
    homeClubId: homeClubs[0].id,
  });
  const [activationOption, setActivationOption] = useState("today");
  const [picker, setPicker] = useState<"activation" | "custom" | "club" | null>(
    null,
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("vietqr");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const submitting = useRef(false);
  const switchConfirmed = useRef(false);

  useEffect(() => {
    if (!validPackageId) return;

    let active = true;
    getActivePackageDetail(packageId)
      .then((detail) => {
        if (!active) return;
        setItem(packageFromApiDetail(detail));
        setApiDetailError("");
      })
      .catch((error) => {
        if (!active) return;
        setApiDetailError(
          `${
            error instanceof Error
              ? error.message
              : "Không tải được dữ liệu gói từ backend"
          }.`,
        );
      });

    return () => {
      active = false;
    };
  }, [packageId, validPackageId]);

  const option = item?.durations.find(
    (row) => row.durationId === durationId,
  );
  const pricing = option ? calculatePrice(option, appliedVoucher) : null;
  const club = homeClubs.find((row) => row.id === form.homeClubId);
  const dates = Array.from({ length: 31 }, (_, days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date;
  });
  const back = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({
          pathname: "/package-detail",
          params: { id: String(packageId) },
        });
  if (!item || !option || !pricing || !user)
    return (
      <SafeAreaView style={s.safe}>
        <Header back={back} />
        <View style={s.empty}>
          <Text style={s.title}>
            {visibleApiError || "Gói tập hoặc thời hạn không hợp lệ."}
          </Text>
          <Pressable style={s.primary} onPress={back}>
            <Text style={s.primaryText}>QUAY LẠI CHI TIẾT GÓI</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  const selectedItem = item;
  const selectedOption = option;
  const currentUser = user;
  function change<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
      submit: undefined,
    }));
  }
  function chooseActivation(id: string, days: number) {
    if (id === "custom") {
      setPicker("custom");
      return;
    }
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    setActivationOption(id);
    change("activationDate", localDate(date));
    setPicker(null);
  }
  function applyVoucher() {
    if (appliedVoucher?.code === voucherCode.trim().toUpperCase()) {
      setVoucherError("Mã này đã được áp dụng.");
      return;
    }
    const result = findVoucher(
      voucherCode,
      calculatePrice(selectedOption).subtotal,
    );
    setVoucherError(result.error);
    if (result.voucher) {
      setAppliedVoucher(result.voucher);
      setVoucherCode(result.voucher.code);
    }
  }
  async function submit() {
    if (submitting.current) return;
    const next: Errors = validateMemberForm(form);
    if (!termsAccepted) next.terms = "Bạn cần đồng ý điều khoản để tiếp tục.";
    if (Object.keys(next).length) {
      setErrors({
        ...next,
        submit: "Vui lòng kiểm tra các thông tin bắt buộc ở phía trên.",
      });
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    submitting.current = true;
    setIsSubmitting(true);
    setErrors({});
    try {
      if (selectedItem.availability !== "active")
        throw new Error("Gói hiện không mở đăng ký.");
      if (
        selectedItem.requiresStudentVerification &&
        (await getStudentVerification(currentUser.email))?.status !== "verified"
      )
        throw new Error("Thẻ HSSV chưa được xác minh.");
      const active = await getActiveMembership(currentUser.email);
      if (
        active &&
        active.packageId !== String(selectedItem.apiId) &&
        !switchConfirmed.current
      ) {
        const warning =
          "Bạn đang có gói đang hoạt động. Gói mới sẽ chờ thanh toán và không tự thay thế gói hiện tại. Nâng cấp chưa được hỗ trợ.";
        if (Platform.OS === "web") {
          if (globalThis.confirm(warning)) {
            switchConfirmed.current = true;
            setTimeout(() => {
              void submit();
            }, 0);
          }
        } else
          Alert.alert("Bạn đang có gói đang hoạt động", warning, [
            { text: "Hủy", style: "cancel" },
            {
              text: "Đăng ký gói tiếp theo",
              onPress: () => {
                switchConfirmed.current = true;
                void submit();
              },
            },
          ]);
        submitting.current = false;
        setIsSubmitting(false);
        return;
      }
      const renewal = params.renewal
        ? await getEnrollment(currentUser.email, params.renewal)
        : null;
      if (
        params.renewal &&
        (!renewal || renewal.packageId !== String(selectedItem.apiId))
      )
        throw new Error("Gói gia hạn không hợp lệ.");
      const activationDate = renewal
        ? renewal.expiryDate > localDate(today)
          ? renewal.expiryDate
          : localDate(today)
        : form.activationDate;
      if (!currentUser.accountId)
        throw new Error("Phiên đăng nhập chưa có TaiKhoanID từ backend.");
      if (!selectedOption.durationId)
        throw new Error("Thời hạn đã chọn không tồn tại trên backend.");

      const registration = await registerPackage({
        accountId: currentUser.accountId,
        packageId: selectedItem.apiId,
        durationId: selectedOption.durationId,
        activationDate,
        voucherCode: appliedVoucher?.code ?? null,
      });

      router.replace({
        pathname: "/package-payment",
        params: {
          registrationId: String(registration.DangKyID),
          paymentMethod: selectedPaymentMethod,
        },
      });
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Không thể lưu đơn đăng ký. Vui lòng thử lại.",
      });
      submitting.current = false;
      setIsSubmitting(false);
    }
  }
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <Header back={back} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.content,
            { paddingBottom: 116 + insets.bottom },
          ]}
        >
          <Stepper active={2} />
          <Card>
            <View style={s.summaryHead}>
              <View style={{ flex: 1 }}>
                <View style={s.pillRow}>
                  <Ionicons name="flash" color={C.lime} size={11} />
                  <Text style={s.pill}>{item.tier}</Text>
                </View>
                <Text style={s.packageName}>{item.name}</Text>
                <Text style={s.muted}>
                  Thời hạn: <Text style={s.white}>{option.months} Tháng</Text>
                  {option.bonusMonths ? (
                    <Text style={s.lime}>
                      {" "}
                      (+{option.bonusMonths} tháng tặng kèm)
                    </Text>
                  ) : null}
                </Text>
              </View>
              <View style={s.diamond}>
                <Ionicons name="diamond-outline" size={24} color={C.lime} />
              </View>
            </View>
            <View style={s.priceModule}>
              <View>
                <Text style={s.strike}>{formatVND(pricing.baseAmount)}</Text>
                <Text style={s.price}>{formatVND(pricing.subtotal)}</Text>
              </View>
              <Text style={s.save}>
                TIẾT KIỆM {formatVND(pricing.membershipDiscount)}
              </Text>
            </View>
            {item.apiId === 3 ? (
              <>
                <View style={s.giftHeading}>
                  <Ionicons name="gift-outline" color={C.mint} size={15} />
                  <Text style={s.giftTitle}>
                    BỘ ĐẶC QUYỀN & QUÀ TẶNG KÍCH HOẠT
                  </Text>
                </View>
                {enrollmentGifts.map((gift) => (
                  <View style={s.gift} key={gift.id}>
                    <Image source={gift.image} style={s.giftImage} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.giftName}>
                        {String(gift.quantity).padStart(2, "0")} {gift.name}
                      </Text>
                      <Text style={s.small}>{gift.detail}</Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      color={C.lime}
                      size={17}
                    />
                  </View>
                ))}
              </>
            ) : null}
          </Card>
          <Card>
            <View style={s.sectionHead}>
              <Text style={s.title}>Thông tin hội viên</Text>
              <Text style={s.label}>HỢP ĐỒNG ĐIỆN TỬ</Text>
            </View>
            <Field
              label="HỌ VÀ TÊN"
              icon="person-outline"
              value={form.name}
              onChangeText={(value) => change("name", value)}
              error={errors.name}
            />
            <Field
              label="SỐ ĐIỆN THOẠI LIÊN HỆ"
              icon="call-outline"
              value={form.phone}
              onChangeText={(value) => change("phone", value)}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <Field
              label="EMAIL NHẬN HỢP ĐỒNG E-CONTRACT"
              icon="mail-outline"
              value={form.email}
              onChangeText={(value) => change("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <Select
              label="NGÀY KÍCH HOẠT THẺ"
              value={
                activationOptions.find((row) => row.id === activationOption)
                  ?.label ?? form.activationDate
              }
              icon="calendar-outline"
              onPress={() => setPicker("activation")}
              error={errors.activationDate}
            />
            <Text style={s.hint}>
              Thời hạn thẻ được bảo lưu kích hoạt tối đa trong 30 ngày kể từ hôm
              nay.
            </Text>
            <Select
              label="CÂU LẠC BỘ CHÍNH (HOME CLUB)"
              value={club?.name ?? "Chọn câu lạc bộ"}
              icon="location-outline"
              onPress={() => setPicker("club")}
              error={errors.homeClubId}
            />
          </Card>
          <Card>
            <View style={s.sectionHead}>
              <Text style={s.title}>Mã giảm giá / Voucher</Text>
              {appliedVoucher ? (
                <Text style={s.limeLabel}>ĐÃ ÁP DỤNG 1 MÃ</Text>
              ) : null}
            </View>
            <View style={s.voucherRow}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={voucherCode}
                onChangeText={(value) => {
                  setVoucherCode(value.toUpperCase());
                  setVoucherError("");
                }}
                placeholder="NHẬP MÃ"
                placeholderTextColor={C.muted}
                autoCapitalize="characters"
              />
              <Pressable style={s.apply} onPress={applyVoucher}>
                <Text style={s.primaryText}>ÁP DỤNG</Text>
              </Pressable>
            </View>
            {voucherError ? <Text style={s.error}>{voucherError}</Text> : null}
            {appliedVoucher ? (
              <View style={s.applied}>
                <Text style={s.appliedText}>
                  Mã {appliedVoucher.code} đã giảm -
                  {formatVND(pricing.voucherDiscount)}
                </Text>
                <Pressable
                  onPress={() => {
                    setAppliedVoucher(null);
                    setVoucherCode("");
                    setVoucherError("");
                  }}
                >
                  <Ionicons
                    name="close-circle-outline"
                    color={C.muted}
                    size={19}
                  />
                </Pressable>
              </View>
            ) : null}
          </Card>
          <Card>
            <View style={s.sectionHead}>
              <Text style={s.title}>Phương thức thanh toán</Text>
              <Text style={s.secure}>♢ BẢO MẬT</Text>
            </View>
            {methods.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setSelectedPaymentMethod(method.id)}
                style={[
                  s.method,
                  selectedPaymentMethod === method.id && s.methodActive,
                ]}
              >
                <View style={s.methodIcon}>
                  <Ionicons
                    name={method.icon}
                    size={21}
                    color={method.id === "card" ? C.cyan : C.lime}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.methodTitleRow}>
                    <Text style={s.methodTitle}>{method.title}</Text>
                    {method.badge ? (
                      <Text style={s.methodBadge}>{method.badge}</Text>
                    ) : null}
                  </View>
                  <Text style={s.small}>{method.detail}</Text>
                </View>
                <View
                  style={[
                    s.radio,
                    selectedPaymentMethod === method.id && s.radioActive,
                  ]}
                >
                  {selectedPaymentMethod === method.id ? (
                    <View style={s.radioDot} />
                  ) : null}
                </View>
              </Pressable>
            ))}
          </Card>
          <Card>
            <Text style={s.title}>Bảng kê chi phí thanh toán</Text>
            <Cost
              label={`Giá gói ${option.months} tháng`}
              value={pricing.baseAmount}
            />
            <Cost
              label="Ưu đãi thời hạn / gói"
              value={-pricing.membershipDiscount}
              accent
            />
            {appliedVoucher ? (
              <Cost
                label={`Voucher (${appliedVoucher.code})`}
                value={-pricing.voucherDiscount}
                accent
              />
            ) : null}
            <Cost label="Phí" value={pricing.fees} />
            <View style={s.divider} />
            <View style={s.totalRow}>
              <View style={s.totalLabel}>
                <Text style={s.title}>Tổng thanh toán</Text>
                <Text style={s.small}>
                  Chỉ tạo đơn chờ thanh toán, chưa kích hoạt gói.
                </Text>
              </View>
              <Text style={s.total} numberOfLines={1}>
                {formatVND(pricing.finalAmount)}
              </Text>
            </View>
          </Card>
          <Pressable
            style={s.terms}
            onPress={() => {
              setTermsAccepted((value) => !value);
              setErrors((current) => ({ ...current, terms: undefined }));
            }}
          >
            <View style={[s.checkbox, termsAccepted && s.checked]}>
              {termsAccepted ? (
                <Ionicons name="checkmark" color={C.surfaceLowest} size={17} />
              ) : null}
            </View>
            <Text style={s.termsText}>
              Tôi xác nhận đồng ý với{" "}
              <Text style={s.link}>Điều khoản dịch vụ</Text>, quy chế phòng tập
              QA-Gym và điều khoản kích hoạt gói tập tự động.
            </Text>
          </Pressable>
          {errors.terms ? <Text style={s.error}>{errors.terms}</Text> : null}
          <View style={s.security}>
            <Ionicons
              name="shield-checkmark-outline"
              color={C.mint}
              size={17}
            />
            <Text style={s.small}>
              Thanh toán sẽ được xử lý bởi cổng thanh toán bảo mật khi được kết
              nối.
            </Text>
          </View>
          {errors.submit ? <Text style={s.error}>{errors.submit}</Text> : null}
        </ScrollView>
        <View
          style={[s.bottom, { paddingBottom: Math.max(insets.bottom, 10) }]}
        >
          <View style={s.bottomTotal}>
            <Text style={s.label}>TỔNG CẦN THANH TOÁN</Text>
            <Text style={s.bottomPrice} numberOfLines={1}>
              {formatVND(pricing.finalAmount)}
            </Text>
          </View>
          <Pressable
            disabled={isSubmitting}
            onPress={submit}
            style={[
              s.primary,
              s.submit,
              isSubmitting && s.disabled,
            ]}
          >
            <Text style={s.primaryText}>
              {isSubmitting ? "ĐANG TẠO ĐƠN..." : "TIẾN HÀNH THANH TOÁN"}
            </Text>
            <Ionicons name="arrow-forward" color={C.surfaceLowest} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <PickerModal
        visible={!!picker}
        title={
          picker === "club"
            ? "Chọn câu lạc bộ chính"
            : picker === "custom"
              ? "Chọn ngày kích hoạt"
              : "Ngày kích hoạt"
        }
        onClose={() => setPicker(null)}
      >
        {picker === "club"
          ? homeClubs.map((row) => (
              <Choice
                key={row.id}
                label={row.name}
                selected={form.homeClubId === row.id}
                onPress={() => {
                  change("homeClubId", row.id);
                  setPicker(null);
                }}
              />
            ))
          : picker === "custom"
            ? dates.map((date) => (
                <Choice
                  key={localDate(date)}
                  label={date.toLocaleDateString("vi-VN")}
                  selected={form.activationDate === localDate(date)}
                  onPress={() => {
                    change("activationDate", localDate(date));
                    setActivationOption("custom");
                    setPicker(null);
                  }}
                />
              ))
            : activationOptions.map((row) => (
                <Choice
                  key={row.id}
                  label={row.label}
                  selected={activationOption === row.id}
                  onPress={() => chooseActivation(row.id, row.days)}
                />
              ))}
      </PickerModal>
    </SafeAreaView>
  );
}

function Header({ back }: { back: () => void }) {
  return (
    <View style={s.header}>
      <Pressable onPress={back} hitSlop={12}>
        <Ionicons name="arrow-back" color={C.text} size={22} />
      </Pressable>
      <Text style={s.headerTitle}>EXERCISE DETAIL</Text>
      <Ionicons name="help-circle-outline" color={C.muted} size={19} />
      <View style={s.avatar}>
        <Ionicons name="person-outline" color={C.surfaceLowest} size={17} />
      </View>
    </View>
  );
}
function Stepper({ active }: { active: 1 | 2 | 3 }) {
  return (
    <View style={s.stepper}>
      {["CHỌN GÓI", "THÔNG TIN", "THANH TOÁN"].map((label, index) => {
        const step = index + 1;
        const done = step < active;
        return (
          <View style={s.step} key={label}>
            <View style={[s.stepCircle, step <= active && s.stepActive]}>
              {done ? (
                <Ionicons name="checkmark" color={C.surfaceLowest} size={14} />
              ) : (
                <Text
                  style={[s.stepNumber, step <= active && s.stepNumberActive]}
                >
                  {String(step).padStart(2, "0")}
                </Text>
              )}
            </View>
            <Text style={[s.stepLabel, step <= active && s.stepLabelActive]}>
              {label}
            </Text>
            {index < 2 ? (
              <View style={[s.track, step < active && s.trackActive]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}
function Field(
  props: React.ComponentProps<typeof TextInput> & {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    error?: string;
  },
) {
  const { label, icon, error, ...input } = props;
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, error && s.inputError]}>
        <Ionicons name={icon} color={C.muted} size={18} />
        <TextInput
          {...input}
          placeholderTextColor={C.muted}
          style={s.inputText}
        />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}
function Select({
  label,
  value,
  icon,
  onPress,
  error,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  error?: string;
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <Pressable onPress={onPress} style={[s.inputWrap, error && s.inputError]}>
        <Ionicons name={icon} color={C.muted} size={18} />
        <Text style={s.selectText} numberOfLines={2}>
          {value}
        </Text>
        <Ionicons name="chevron-down" color={C.muted} />
      </Pressable>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}
function Cost({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <View style={s.cost}>
      <Text style={s.muted}>{label}</Text>
      <Text style={[s.costValue, accent && s.lime]}>
        {value < 0 ? "-" : ""}
        {formatVND(Math.abs(value))}
      </Text>
    </View>
  );
}
function PickerModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={s.sectionHead}>
            <Text style={s.title}>{title}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" color={C.text} size={22} />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 460 }}>{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.choice, selected && s.methodActive]}>
      <Text style={s.selectText}>{label}</Text>
      {selected ? (
        <Ionicons name="checkmark-circle" color={C.lime} size={20} />
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  header: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceLow,
  },
  headerTitle: { color: C.text, fontSize: 14, fontWeight: "800", flex: 1 },
  avatar: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: C.text,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    padding: 12,
    gap: 14,
  },
  empty: { flex: 1, padding: 24, justifyContent: "center", gap: 16 },
  stepper: {
    flexDirection: "row",
    backgroundColor: C.surfaceLow,
    borderRadius: 12,
    padding: 12,
  },
  step: { flex: 1, alignItems: "center", position: "relative" },
  stepCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: C.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepActive: { backgroundColor: C.lime },
  stepNumber: { color: C.muted, fontSize: 10, fontWeight: "800" },
  stepNumberActive: { color: C.surfaceLowest },
  stepLabel: { color: C.muted, fontSize: 9, fontWeight: "800", marginTop: 5 },
  stepLabelActive: { color: C.lime },
  track: {
    position: "absolute",
    top: 12,
    left: "62%",
    width: "76%",
    height: 2,
    backgroundColor: C.surfaceHigh,
  },
  trackActive: { backgroundColor: C.lime },
  card: { backgroundColor: C.surface, borderRadius: 13, padding: 13, gap: 10 },
  summaryHead: { flexDirection: "row", gap: 10 },
  pillRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2b3511",
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  pill: {
    color: C.lime,
    fontSize: 9,
    fontWeight: "900",
    paddingHorizontal: 3,
    paddingVertical: 4,
  },
  packageName: { color: C.text, fontSize: 18, fontWeight: "800", marginTop: 5 },
  muted: { color: C.muted, fontSize: 12, flex: 1 },
  white: { color: C.text, fontWeight: "700" },
  lime: { color: C.lime },
  diamond: {
    width: 43,
    height: 43,
    borderRadius: 9,
    backgroundColor: C.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  priceModule: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surfaceLowest,
    borderRadius: 8,
    padding: 11,
    gap: 8,
  },
  strike: { color: C.muted, fontSize: 11, textDecorationLine: "line-through" },
  price: { color: C.lime, fontSize: 22, fontWeight: "900" },
  save: {
    color: C.surfaceLowest,
    backgroundColor: C.lime,
    fontSize: 9,
    fontWeight: "900",
    borderRadius: 5,
    padding: 6,
    overflow: "hidden",
  },
  giftHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  giftTitle: { color: C.mint, fontSize: 9, fontWeight: "900" },
  gift: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: C.surfaceLow,
    borderRadius: 8,
    padding: 7,
  },
  giftImage: { width: 40, height: 40, borderRadius: 7 },
  giftName: { color: C.text, fontSize: 11, fontWeight: "600" },
  small: { color: C.muted, fontSize: 10, lineHeight: 13, flexShrink: 1 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: { color: C.text, fontSize: 17, fontWeight: "800" },
  label: { color: C.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  field: { gap: 5 },
  inputWrap: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surfaceLowest,
    borderRadius: 8,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: { borderColor: C.error },
  inputText: { flex: 1, color: C.text, fontSize: 13, paddingVertical: 10 },
  selectText: { flex: 1, color: C.text, fontSize: 13 },
  hint: { color: C.muted, fontSize: 10, lineHeight: 13, marginTop: -5 },
  error: { color: C.error, fontSize: 11, lineHeight: 14 },
  voucherRow: { flexDirection: "row", gap: 7 },
  input: {
    minHeight: 48,
    backgroundColor: C.surfaceLowest,
    color: C.text,
    borderRadius: 8,
    paddingHorizontal: 11,
    fontSize: 12,
    fontWeight: "800",
  },
  apply: {
    minHeight: 48,
    paddingHorizontal: 15,
    backgroundColor: C.lime,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: C.surfaceLowest, fontSize: 11, fontWeight: "900" },
  limeLabel: { color: C.lime, fontSize: 9, fontWeight: "800" },
  applied: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.surfaceLow,
    borderRadius: 8,
    padding: 9,
  },
  appliedText: { color: C.text, fontSize: 11 },
  secure: { color: C.mint, fontSize: 9, fontWeight: "800" },
  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 9,
    borderRadius: 10,
    backgroundColor: C.surfaceLow,
    borderWidth: 1,
    borderColor: "transparent",
  },
  methodActive: { backgroundColor: C.surfaceHigh, borderColor: C.border },
  methodIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: C.surfaceLowest,
    alignItems: "center",
    justifyContent: "center",
  },
  methodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  methodTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },
  methodBadge: {
    color: C.mint,
    backgroundColor: "#143428",
    fontSize: 8,
    fontWeight: "900",
    padding: 3,
    borderRadius: 4,
    overflow: "hidden",
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: C.text,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: C.lime },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.lime },
  cost: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 2,
  },
  costValue: { color: C.text, fontSize: 12, fontWeight: "800" },
  divider: { height: 1, backgroundColor: C.surfaceHigh },
  totalRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  totalLabel: { flex: 1, minWidth: 0 },
  total: {
    color: C.lime,
    fontSize: 23,
    fontWeight: "900",
    flexShrink: 1,
    minWidth: 0,
    textAlign: "right",
  },
  terms: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: C.lime, borderColor: C.lime },
  termsText: { color: C.muted, flex: 1, fontSize: 11, lineHeight: 15 },
  link: { color: C.lime, textDecorationLine: "underline" },
  security: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  bottom: {
    backgroundColor: C.surfaceLowest,
    borderTopWidth: 1,
    borderTopColor: C.surfaceHigh,
    paddingHorizontal: 12,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bottomTotal: { flexShrink: 1, minWidth: 0, maxWidth: "42%" },
  bottomPrice: {
    color: C.lime,
    fontSize: 19,
    fontWeight: "900",
    flexShrink: 1,
  },
  primary: {
    minHeight: 48,
    backgroundColor: C.lime,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
  },
  submit: { flex: 1 },
  disabled: { opacity: 0.42 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.72)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    gap: 10,
    maxHeight: "75%",
  },
  choice: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
});
