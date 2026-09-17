import { Redirect } from 'expo-router';

export default function AdminGuard() {
  return <Redirect href="/(tabs)/profile" />;
}
