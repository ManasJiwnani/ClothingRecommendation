import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, Fonts } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="home" label="Home" />
          </TabTrigger>
          <TabTrigger name="closet" href="/closet" asChild>
            <TabButton icon="checkroom" label="Closet" />
          </TabTrigger>
          {/* <TabTrigger name="add" href="/add" asChild>
            <TabButton icon="add" label="" isAdd />
          </TabTrigger> */}
          <TabTrigger name="mirror" href="/mirror" asChild>
            <TabButton icon="camera" label="Mirror" isAdd />
          </TabTrigger>
          <TabTrigger name="stylist" href="/stylist" asChild>
            <TabButton icon="auto_awesome" label="Stylist" />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="account_circle" label="Profile" />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type WebIcon = 'home' | 'checkroom' | 'camera' | 'auto_awesome' | 'account_circle';
type TabButtonProps = TabTriggerSlotProps & { icon: WebIcon; label: string; isAdd?: boolean };

export function TabButton({ icon, label, isAdd, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, isAdd && styles.addButton]}>
        <SymbolView
          tintColor={isAdd ? '#f6efe7' : isFocused ? '#111111' : '#555555'}
          name={{ android: icon, web: icon }}
          size={isAdd ? 30 : 28}
        />
      </View>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={[styles.tabListContainer, { borderBottomColor: colors.text }]}>
      <View style={styles.innerContainer}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    height: 90,
    backgroundColor: '#fbf9f6',
    borderBottomWidth: 3,
    borderBottomColor: '#6556f5',
  },
  innerContainer: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#050505',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
    transform: [{ translateY: -10 }],
  },
  label: {
    color: '#4c4a48',
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
