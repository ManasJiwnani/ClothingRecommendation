import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Platform, View, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#745A38",
        tabBarInactiveTintColor: "#9A9893",

        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: Platform.OS === "web" ? 12 : 18,

          height: 72,

          backgroundColor: "#FBF9F6",
          borderRadius: 24,

          borderWidth: 1,
          borderColor: "#E5E0D8",

          elevation: 8,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,

          paddingTop: 7,
          paddingBottom: 7,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.4,
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{
                ios: focused ? "house.fill" : "house",
                android: "home",
                web: "home",
              }}
              size={21}
              tintColor={color}
            />
          ),
        }}
      />

      {/* CLOSET */}
      <Tabs.Screen
        name="closet"
        options={{
          title: "Closet",

          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "hanger",
                android: "checkroom",
                web: "checkroom",
              }}
              size={22}
              tintColor={color}
            />
          ),
        }}
      />

      {/* MIRROR - CENTER */}
      <Tabs.Screen
        name="mirror"
        options={{
          title: "Mirror",

          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.4,
            marginTop: 3,
            color: "#745A38",
          },

          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.mirrorButton,
                focused && styles.mirrorButtonFocused,
              ]}
            >
              <SymbolView
                name={{
                  ios: focused
                    ? "camera.viewfinder"
                    : "camera.viewfinder",
                  android: "photo_camera",
                  web: "photo_camera",
                }}
                size={25}
                tintColor="#FFEDDA"
              />
            </View>
          ),
        }}
      />

      {/* STYLIST */}
      <Tabs.Screen
        name="stylist"
        options={{
          title: "Stylist",

          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "sparkles",
                android: "auto_awesome",
                web: "auto_awesome",
              }}
              size={22}
              tintColor={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{
                ios: focused
                  ? "person.crop.circle.fill"
                  : "person.crop.circle",
                android: "account_circle",
                web: "account_circle",
              }}
              size={22}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  mirrorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,

    backgroundColor: "#1B1C1A",

    alignItems: "center",
    justifyContent: "center",

    marginTop: -20,

    borderWidth: 4,
    borderColor: "#FBF9F6",

    shadowColor: "#050505",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    elevation: 8,
  },

  mirrorButtonFocused: {
    backgroundColor: "#b7781f",
  },
});