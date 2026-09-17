import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

function AuthStack() {
  const { ready, user } = useAuth();
  if (!ready) return null;
  return <>
    <AnimatedSplashOverlay />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="reset-password" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
        <Stack.Screen name="packages" />
        <Stack.Screen name="product" />
        <Stack.Screen name="pt" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="product-detail" />
        <Stack.Screen name="package-detail" />
        <Stack.Screen name="package-enrollment" />
        <Stack.Screen name="package-payment" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="transaction-history" />
        <Stack.Screen name="password-change" />
        <Stack.Screen name="pt-detail" />
        <Stack.Screen name="pt-booking" />
        <Stack.Screen name="pt-schedule" />
      </Stack.Protected>
    </Stack>
  </>;
}
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider><AuthStack /></AuthProvider>
    </ThemeProvider>
  );
}
