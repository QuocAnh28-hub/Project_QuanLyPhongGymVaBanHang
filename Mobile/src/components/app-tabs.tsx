import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelVisibilityMode="labeled"
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Tổng quan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="packages">
        <NativeTabs.Trigger.Label>Gói tập</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="card_membership" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="product">
        <NativeTabs.Trigger.Label>Sản phẩm</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="pt">
        <NativeTabs.Trigger.Label>HLV</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="fitness_center" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Cá nhân</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
