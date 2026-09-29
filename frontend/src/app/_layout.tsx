import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
  router,
} from "expo-router";

import * as SplashScreen from "expo-splash-screen";

import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { supabase } from "../lib/supabase";
import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        router.replace("/tabs");
      } else {
        router.replace("/auth/login");
      }

      setSessionChecked(true);

      await SplashScreen.hideAsync();
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        if (session) {
          router.replace("/tabs");
        } else {
          router.replace("/auth/login");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!sessionChecked) {
    return <AnimatedSplashOverlay />;
  }

  return (
    <ThemeProvider
      value={
        colorScheme === "dark"
          ? DarkTheme
          : DefaultTheme
      }
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen name="auth" />

        <Stack.Screen name="tabs" />

        <Stack.Screen name="saved" />

        <Stack.Screen name="itinerary" />

        <Stack.Screen name="try_on" />

        <Stack.Screen name="add" />

        <Stack.Screen name="explore" />
      </Stack>
    </ThemeProvider>
  );
}