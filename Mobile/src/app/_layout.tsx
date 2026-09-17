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
      </Stack.Protected>
    </Stack>
  </>;
}
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
<<<<<<< HEAD
      <AnimatedSplashOverlay />
      <Stack initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product-detail" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="transaction-history" options={{ headerShown: false }} />
        <Stack.Screen name="password-change" options={{ headerShown: false }} />
        <Stack.Screen name="pt-detail" options={{ headerShown: false }} />
        <Stack.Screen name="pt-booking" options={{ headerShown: false }} />
        <Stack.Screen name="pt-schedule" options={{ headerShown: false }} />
      </Stack>
=======
      <AuthProvider><AuthStack /></AuthProvider>
>>>>>>> origin/HoangLe1
    </ThemeProvider>
  );
}
