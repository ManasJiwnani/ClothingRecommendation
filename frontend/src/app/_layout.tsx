import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
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
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error("SESSION ERROR:", error);
        }
      } catch (error) {
        console.error("AUTH CHECK ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
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