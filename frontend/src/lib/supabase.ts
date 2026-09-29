import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Use AsyncStorage on mobile and localStorage on web
const storage =
  Platform.OS === "web"
    ? {
        getItem: (key: string) => {
          if (typeof window === "undefined") return null;
          return Promise.resolve(window.localStorage.getItem(key));
        },

        setItem: (key: string, value: string) => {
          if (typeof window === "undefined") return;
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        },

        removeItem: (key: string) => {
          if (typeof window === "undefined") return;
          window.localStorage.removeItem(key);
          return Promise.resolve();
        },
      }
    : AsyncStorage;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);