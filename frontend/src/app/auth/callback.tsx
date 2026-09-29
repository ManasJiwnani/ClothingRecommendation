import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code =
        typeof params.code === "string"
          ? params.code
          : null;

      const type =
        typeof params.type === "string"
          ? params.type
          : "signup";

      if (!code) {
        router.replace("/auth/auth-error");
        return;
      }

      const { error } =
        await supabase.auth.exchangeCodeForSession(
          code
        );

      if (error) {
        console.error(
          "AUTH CALLBACK ERROR:",
          error
        );

        router.replace("/auth/auth-error");
        return;
      }

      if (type === "recovery") {
        router.replace("/auth/reset-password");
      } else {
        router.replace("/preferences");
      }
    } catch (error) {
      console.error(error);
      router.replace("/auth/auth-error");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />

      <Text style={{ marginTop: 15 }}>
        Verifying your account...
      </Text>
    </View>
  );
}