import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ShopPage({ title, children }: { title: string; children: ReactNode }) {
  return <SafeAreaView style={checkoutStyles.screen}>
    <View style={checkoutStyles.container}>
      <View style={checkoutStyles.header}>
        <Pressable accessibilityLabel="Quay lại" onPress={() => router.canGoBack() ? router.back() : router.replace('/product')} style={{ padding: 10 }}>
          <FontAwesome name="arrow-left" size={18} color="#d9ff00" />
        </Pressable>
        <Text style={checkoutStyles.heading}>{title}</Text>
        <Pressable accessibilityLabel="Đơn hàng của tôi" onPress={() => router.push('/orders')} style={{ padding: 10 }}>
          <FontAwesome name="list-alt" size={20} color="#d9ff00" />
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={checkoutStyles.content}>{children}</ScrollView>
    </View>
  </SafeAreaView>;
}
export function ShopButton({ title, onPress, disabled = false, secondary = false }: {
  title: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
}) {
  return <Pressable onPress={onPress} disabled={disabled} style={[checkoutStyles.button, secondary && checkoutStyles.secondary, disabled && { opacity: 0.4 }]}>
    <Text style={[checkoutStyles.buttonText, secondary && { color: '#d9ff00' }]}>{title}</Text>
  </Pressable>;
}
export function ShopField({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ gap: 6 }}><Text style={checkoutStyles.muted}>{label}</Text>
    <TextInput accessibilityLabel={label} placeholderTextColor="#849080" {...props} style={[checkoutStyles.input, props.style]} />
  </View>;
}
export function ShopRow({ label, value }: { label: string; value: string }) {
  return <View style={checkoutStyles.row}><Text style={[checkoutStyles.muted, { flex: 1 }]}>{label}</Text><Text style={[checkoutStyles.text, { flex: 1, textAlign: 'right' }]}>{value}</Text></View>;
}
export const checkoutStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101210' },
  container: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8 },
  content: { padding: 16, gap: 14, paddingBottom: 36 },
  heading: { fontSize: 17, fontWeight: '800', color: '#eff5e8' },
  text: { color: '#eff5e8', fontSize: 14, lineHeight: 21 },
  muted: { color: '#a6b0a0', fontSize: 13, lineHeight: 20 },
  accent: { color: '#d9ff00', fontSize: 23, fontWeight: '800' },
  error: { color: '#ffaaa0', fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: '#202521', borderRadius: 12, padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  input: { borderWidth: 1, borderColor: '#414b3b', borderRadius: 8, color: '#eff5e8', padding: 12, fontSize: 15, minHeight: 46 },
  button: { minHeight: 48, padding: 12, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d9ff00' },
  secondary: { backgroundColor: '#293024', borderWidth: 1, borderColor: '#647332' },
  buttonText: { color: '#182000', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  image: { width: 66, height: 66, borderRadius: 8, backgroundColor: '#101210' },
});
