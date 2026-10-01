import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();

  const email =
    typeof params.email === "string"
      ? params.email
      : "";

  const resendEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Email address not found.");
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo:
          "clothingrecommendation://auth/callback?type=signup",
      },
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert(
      "Email Sent",
      "A new verification email has been sent."
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✉️</Text>

      <Text style={styles.title}>Verify your email</Text>

      <Text style={styles.description}>
        We sent a verification link to:
      </Text>

      <Text style={styles.email}>{email}</Text>

      <Text style={styles.description}>
        Please open your email and click the verification
        link to activate your account.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/auth/login")}
      >
        <Text style={styles.buttonText}>
          Go to Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resendEmail}>
        <Text style={styles.resend}>
          Didn't receive it? Resend email
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  icon: {
    fontSize: 55,
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 15,
  },

  description: {
    textAlign: "center",
    color: "#666",
    lineHeight: 23,
    marginBottom: 10,
  },

  email: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },

  button: {
    width: "100%",
    height: 52,
    backgroundColor: "#111",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  resend: {
    marginTop: 20,
    color: "#555",
    textDecorationLine: "underline",
  },
});