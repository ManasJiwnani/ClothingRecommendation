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

      console.log("OAuth params:", params);

      if (!code) {
        console.log("No OAuth code found");
        router.replace("/auth/auth-error");
        return;
      }

      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("AUTH CALLBACK ERROR:", error);
        router.replace("/auth/auth-error");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/auth-error");
        return;
      }

      const { data: profile } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      // New Google user
      if (!profile) {
        await supabase
          .from("user_preferences")
          .insert({
            id: user.id,
            onboarding_completed: false,
          });

        router.replace("/onboarding/preferences" as any);
        return;
      }

      // Existing user
      if (profile.onboarding_completed) {
        router.replace("/tabs" as any);
      } else {
        router.replace("/onboarding/preferences" as any);
      }

    } catch (error) {
      console.error("CALLBACK ERROR:", error);
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