import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from "expo-router";

import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

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

        <Stack.Screen name="onboarding" />

        <Stack.Screen name="saved" />

        <Stack.Screen name="itinerary" />

        <Stack.Screen name="try_on" />

        <Stack.Screen name="add" />

        <Stack.Screen name="explore" />
      </Stack>
    </ThemeProvider>
  );
}