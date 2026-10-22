import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: "exp://YOUR_EXPO_URL/--/auth/callback?type=recovery",
        }
      );

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert(
        "Check your email",
        "We sent you a password reset link."
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Unable to send reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>

      <Text style={styles.description}>
        Enter your email and we&apos;ll send you a link to reset your password.
      </Text>

      <View style={styles.inputContainer}>
        <SymbolView
          name={{ ios: "envelope", android: "mail", web: "mail" }}
          size={17}
          tintColor="#8A8175"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <SymbolView
              name={{ ios: "paperplane", android: "send", web: "send" }}
              size={16}
              tintColor="#fff"
            />
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
      >
        <View style={styles.backRow}>
          <SymbolView
            name={{ ios: "arrow.left", android: "arrow_back", web: "arrow_back" }}
            size={15}
            tintColor="#555"
          />
          <Text style={styles.back}>Back to Login</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 15,
  },

  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
    lineHeight: 23,
  },

  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
  },

  inputContainer: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  button: {
    height: 52,
    backgroundColor: "#111",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  back: {
    color: "#555",
  },

  backRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
});