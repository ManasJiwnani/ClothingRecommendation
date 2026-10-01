import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL!;

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const memoryStorage = {
  getItem: async (_key: string) => null,

  setItem: async (
    _key: string,
    _value: string
  ) => {},

  removeItem: async (_key: string) => {},
};

const storage =
  Platform.OS === "web"
    ? typeof window !== "undefined"
      ? window.localStorage
      : memoryStorage
    : AsyncStorage;

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage,

      autoRefreshToken: true,

      persistSession: true,

      detectSessionInUrl: false,

      flowType: "pkce",
    },
  }
);