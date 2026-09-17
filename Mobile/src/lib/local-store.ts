import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ponytail: small local development records; use a database when records outgrow SecureStore values.
export async function readLocal(key: string) {
  return Platform.OS === 'web' ? globalThis.localStorage?.getItem(key) ?? null : SecureStore.getItemAsync(key);
}
export async function writeLocal(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    if (value === null) globalThis.localStorage?.removeItem(key);
    else globalThis.localStorage?.setItem(key, value);
  } else if (value === null) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value);
}
