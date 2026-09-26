import { Tabs } from 'expo-router';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { View, StyleSheet } from 'react-native';

type TabIconName = {
  ios?: SFSymbol;
  android?: AndroidSymbol;
  web?: AndroidSymbol;
};

type TabIconProps = {
  focused: boolean;
  name: TabIconName;
  forceBlackBackground?: boolean;
};

function TabIcon({ focused, name, forceBlackBackground = false }: TabIconProps) {
  const isMirrorTab = forceBlackBackground;

  return (
    <View
      style={[
        styles.iconContainer,
        isMirrorTab && styles.mirrorIconContainer,
      ]}
    >
      <SymbolView
        name={name}
        size={isMirrorTab ? 24 : 30}
        tintColor={isMirrorTab ? '#ffffff' : focused ? '#111111' : '#555555'}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: true,

        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#555555',

        tabBarStyle: {
          height: 93,
          backgroundColor: '#fbf9f6',

          borderTopWidth: 1,
          borderTopColor: '#e5e2de',

          paddingTop: 10,
          paddingBottom: 5,

          elevation: 0,

          shadowColor: '#0b0b0b',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0,
          shadowRadius: 6,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.1,
          marginTop: 2,
        },

        tabBarItemStyle: {
          flex: 1,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        
        options={{
          title: 'HOME',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name={{
                ios: 'house.fill',
                android: 'home',
                web: 'home',
              }}
            />
          ),
        }}
      />

      {/* CLOSET */}
      <Tabs.Screen
        name="closet"
        options={{
          title: 'CLOSET',

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name={{
                ios: 'hanger',
                android: 'checkroom',
                web: 'checkroom',
              }}
            />
          ),
        }}
      />

      {/* MIRROR */}
      <Tabs.Screen
        name="mirror"
        options={{
          title: 'MIRROR',

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              forceBlackBackground
              name={{
                ios: 'camera.aperture',
                android: 'camera',
                web: 'camera',
              }}
            />
          ),
        }}
      />

      {/* STYLIST */}
      <Tabs.Screen
        name="stylist"
        options={{
          title: 'STYLIST',

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name={{
                ios: 'sparkles',
                android: 'auto_awesome',
                web: 'auto_awesome',
              }}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name={{
                ios: 'person.crop.circle',
                android: 'account_circle',
                web: 'account_circle',
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },

  mirrorIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


// import { Tabs } from 'expo-router';
// import { SymbolView } from 'expo-symbols';
// import { View, StyleSheet } from 'react-native';

// export default function TabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,

//         tabBarShowLabel: true,

//         tabBarActiveTintColor: '#111111',
//         tabBarInactiveTintColor: '#555555',

//         tabBarStyle: {
//           height: 82,
//           backgroundColor: '#fbf9f6',
//           borderTopWidth: 1,
//           borderTopColor: '#e5e2de',

//           paddingTop: 6,
//           paddingBottom: 6,

//           elevation: 0,
//           shadowOpacity: 0,
//         },

//         tabBarLabelStyle: {
//           fontSize: 11,
//           fontWeight: '700',
//           letterSpacing: 0.3,
//           marginTop: 2,
//         },
//       }}
//     >

//       {/* HOME */}
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'HOME',

//           tabBarIcon: ({ focused }) => (
//             <SymbolView
//               name={{
//                 ios: 'house.fill',
//                 android: 'home',
//                 web: 'home',
//               }}
//               size={22}
//               tintColor={focused ? '#111111' : '#555555'}
//             />
//           ),
//         }}
//       />

//       {/* CLOSET */}
//       <Tabs.Screen
//         name="closet"
//         options={{
//           title: 'CLOSET',

//           tabBarIcon: ({ focused }) => (
//             <SymbolView
//               name={{
//                 ios: 'hanger',
//                 android: 'checkroom',
//                 web: 'checkroom',
//               }}
//               size={23}
//               tintColor={focused ? '#111111' : '#555555'}
//             />
//           ),
//         }}
//       />

//       {/* MIRROR */}
//       <Tabs.Screen
//         name="mirror"
//         options={{
//           title: 'MIRROR',
//           tabBarIcon: ({ focused }) => (
//             <SymbolView
//               name={{
//                 ios: 'camera.aperture',
//                 android: 'camera',
//                 web: 'camera',
//               }}
//               size={25}
//               tintColor={focused ? '#111111' : '#555555'}
//             />
//           ),
//         }}
//       />

//       {/* STYLIST */}
//       <Tabs.Screen
//         name="stylist"
//         options={{
//           title: 'STYLIST',

//           tabBarIcon: ({ focused }) => (
//             <SymbolView
//               name={{
//                 ios: 'sparkles',
//                 android: 'auto_awesome',
//                 web: 'auto_awesome',
//               }}
//               size={23}
//               tintColor={focused ? '#111111' : '#555555'}
//             />
//           ),
//         }}
//       />

//       {/* PROFILE */}
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'PROFILE',

//           tabBarIcon: ({ focused }) => (
//             <SymbolView
//               name={{
//                 ios: 'person.fill',
//                 android: 'person',
//                 web: 'account_circle',
//               }}
//               size={23}
//               tintColor={focused ? '#111111' : '#555555'}
//             />
//           ),
//         }}
//       />

//     </Tabs>
//   );
// }

// const styles = StyleSheet.create({});