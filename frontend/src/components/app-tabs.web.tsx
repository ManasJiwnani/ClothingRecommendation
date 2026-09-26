import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';

import { SymbolView } from 'expo-symbols';

import {
  Pressable,
  useColorScheme,
  View,
  StyleSheet,
} from 'react-native';

import { ThemedText } from './themed-text';

import { Colors, Fonts } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      {/* SCREEN CONTENT */}
      <TabSlot style={styles.tabSlot} />

      {/* BOTTOM NAVIGATION */}
      <TabList asChild>
        <CustomTabList>

          {/* HOME */}
          <TabTrigger
            name="index"
            href="/tabs"
            asChild
          >
            <TabButton
              icon="home"
              label="Home"
            />
          </TabTrigger>

          {/* CLOSET */}
          <TabTrigger
            name="closet"
            href="/tabs/closet"
            asChild
          >
            <TabButton
              icon="checkroom"
              label="Closet"
            />
          </TabTrigger>

          {/* MIRROR - CENTER BUTTON */}
          <TabTrigger
            name="mirror"
            href="/tabs/mirror"
            asChild
          >
            <TabButton
              icon="camera"
              label="Mirror"
              isAdd
            />
          </TabTrigger>

          {/* STYLIST */}
          <TabTrigger
            name="stylist"
            href="/tabs/stylist"
            asChild
          >
            <TabButton
              icon="auto_awesome"
              label="Stylist"
            />
          </TabTrigger>

          {/* PROFILE */}
          <TabTrigger
            name="profile"
            href="/tabs/profile"
            asChild
          >
            <TabButton
              icon="account_circle"
              label="Profile"
            />
          </TabTrigger>

        </CustomTabList>
      </TabList>
    </Tabs>
  );
}


/* =========================================================
   ICON TYPES
========================================================= */

type WebIcon =
  | 'home'
  | 'checkroom'
  | 'camera'
  | 'auto_awesome'
  | 'account_circle';


/* =========================================================
   TAB BUTTON
========================================================= */

type TabButtonProps = TabTriggerSlotProps & {
  icon: WebIcon;
  label: string;
  isAdd?: boolean;
};

export function TabButton({
  icon,
  label,
  isAdd,
  isFocused,
  ...props
}: TabButtonProps) {

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabButton,
        pressed && styles.pressed,
      ]}
    >

      {/* ICON */}
      <View
        style={[
          styles.iconWrap,
          isAdd && styles.mirrorIconWrap,
        ]}
      >

        <View
          style={[
            styles.iconCircle,
            isAdd && styles.mirrorCircle,
          ]}
        >

          <SymbolView
            name={{
              android: icon,
              web: icon,
            }}
            size={isAdd ? 28 : 23}
            tintColor={
              isAdd
                ? '#ffffff'
                : isFocused
                  ? '#111111'
                  : '#55504b'
            }
          />

        </View>

      </View>


      {/* LABEL */}
      <ThemedText
        style={[
          styles.label,
          isFocused && !isAdd && styles.activeLabel,
        ]}
      >
        {label}
      </ThemedText>

    </Pressable>
  );
}


/* =========================================================
   BOTTOM TAB CONTAINER
========================================================= */

export function CustomTabList(props: TabListProps) {

  const scheme = useColorScheme();

  const colors =
    Colors[
      scheme === 'unspecified'
        ? 'light'
        : scheme
    ];

  return (
    <View
      {...props}
      style={[
        styles.tabListContainer,
        {
          borderTopColor: colors.backgroundElement,
        },
      ]}
    >

      <View style={styles.innerContainer}>
        {props.children}
      </View>

    </View>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* -------------------------------------------------------
     SCREEN CONTENT
  ------------------------------------------------------- */

  tabSlot: {
    flex: 1,
  },


  /* -------------------------------------------------------
     BOTTOM BAR
  ------------------------------------------------------- */

  tabListContainer: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    height: 78,

    backgroundColor: '#fbf9f6',

    borderTopWidth: 1,
    borderTopColor: '#e5e1dc',

    zIndex: 100,

    boxShadow:
      '0 -2px 10px rgba(0, 0, 0, 0.06)',
  },


  /* -------------------------------------------------------
     INNER ROW
  ------------------------------------------------------- */

  innerContainer: {
    width: '100%',
    height: '100%',

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',
  },


  /* -------------------------------------------------------
     INDIVIDUAL TAB
  ------------------------------------------------------- */

  tabButton: {
    flex: 1,

    height: 78,

    alignItems: 'center',
    justifyContent: 'center',

    paddingTop: 6,

    gap: 2,

    position: 'relative',
  },


  pressed: {
    opacity: 0.65,
  },


  /* -------------------------------------------------------
     NORMAL ICON
  ------------------------------------------------------- */

  iconWrap: {
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',
  },


  iconCircle: {
    width: 32,
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',
  },


  /* -------------------------------------------------------
     MIRROR CENTER ICON
  ------------------------------------------------------- */

  mirrorIconWrap: {
    height: 45,

    width: 66,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: -24,

    zIndex: 20,
  },


  mirrorCircle: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: '#050505',

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: '#ffffff',

    boxShadow:
      '0 3px 8px rgba(0, 0, 0, 0.25)',
  },


  /* -------------------------------------------------------
     LABEL
  ------------------------------------------------------- */

  label: {
    color: '#4c4a48',

    fontFamily: Fonts.sans,

    fontSize: 10,

    fontWeight: '700',

    letterSpacing: 0.3,

    textTransform: 'uppercase',

    marginTop: 1,
  },


  activeLabel: {
    color: '#111111',
  },

});