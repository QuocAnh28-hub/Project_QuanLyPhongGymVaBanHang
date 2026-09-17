import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
    </ThemeProvider>
  );
}
