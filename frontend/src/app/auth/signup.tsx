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

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Error",
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo:
            "clothingrecommendation://auth/callback?type=signup",
        },
      });

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
        return;
      }

      console.log("SIGNUP DATA:", data);

      // If email confirmation is enabled in Supabase,
      // user will receive a verification email.
      if (data.user && !data.session) {
        router.replace({
          pathname: "/auth/verify-email",
          params: {
            email: email.trim().toLowerCase(),
          },
        });
      } else {
        // If email confirmation is disabled,
        // user may already have a session.
        router.replace("/onboarding/name");
      }
    } catch (error: any) {
      console.error(error);

      Alert.alert(
        "Error",
        error?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.subtitle}>
        Create your account to build your personal wardrobe.
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

      <View style={styles.inputContainer}>
        <SymbolView
          name={{ ios: "lock", android: "lock", web: "lock" }}
          size={17}
          tintColor="#8A8175"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <SymbolView
          name={{ ios: "checkmark.shield", android: "verified_user", web: "verified_user" }}
          size={17}
          tintColor="#8A8175"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <SymbolView
              name={{ ios: "person.badge.plus", android: "person_add", web: "person_add" }}
              size={18}
              tintColor="#fff"
            />
            <Text style={styles.buttonText}>Create Account</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/login")}>
        <View style={styles.loginRow}>
          <SymbolView
            name={{ ios: "arrow.left", android: "arrow_back", web: "arrow_back" }}
            size={15}
            tintColor="#555"
          />
          <Text style={styles.loginText}>Already have an account? Log in</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    color: "#666",
    marginBottom: 30,
    fontSize: 15,
  },

  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
  },

  inputContainer: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 15,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#111",
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  loginText: {
    color: "#555",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
});