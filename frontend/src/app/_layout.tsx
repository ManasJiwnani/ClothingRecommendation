import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
  router,
  type Href,
} from "expo-router";

import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("SESSION ERROR:", error);
          setLoading(false);
          return;
        }

        // User is already logged in
        if (session) {
          router.replace("/(tabs)" as Href);
        }
      } catch (error) {
        console.error("AUTH CHECK ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AUTH EVENT:", event);

        if (event === "SIGNED_OUT") {
          router.replace("/auth/login");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null;
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
      />
    </ThemeProvider>
  );
}