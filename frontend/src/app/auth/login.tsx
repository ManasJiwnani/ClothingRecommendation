import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // =====================================================
  // EMAIL LOGIN
  // =====================================================

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      console.log("LOGIN USER:", data.user);

      // Check user's onboarding status
      const { data: profile, error: profileError } =
        await supabase
          .from("user_profiles")
          .select("onboarding_completed")
          .eq("id", data.user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "PROFILE CHECK ERROR:",
          profileError
        );
      }

      if (
        profile &&
        profile.onboarding_completed === true
      ) {
        router.replace("/tabs" as any);
      } else {
        router.replace("/onboarding/preferences" as any);
      }
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);

      Alert.alert(
        "Error",
        error?.message || "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================
const handleGoogleLogin = async () => {
  try {
    setGoogleLoading(true);

    const redirectUrl =
      Platform.OS === "web"
        ? `${window.location.origin}/auth/callback`
        : "closet://auth/callback";

    console.log("GOOGLE REDIRECT:", redirectUrl);

    const { data, error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== "web",
        },
      });

    if (error) {
      console.error("GOOGLE OAUTH ERROR:", error);

      Alert.alert(
        "Google Login Failed",
        error.message
      );

      return;
    }

    // WEB
    // Supabase automatically redirects browser to Google.
    if (Platform.OS === "web") {
      return;
    }

    // MOBILE
    if (data?.url) {
      const result =
        await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

      console.log(
        "Google Auth Result:",
        result
      );
    }

  } catch (error: any) {
    console.error(
      "GOOGLE LOGIN ERROR:",
      error
    );

    Alert.alert(
      "Google Login Failed",
      error?.message ||
        "Unable to login with Google."
    );
  } finally {
    setGoogleLoading(false);
  }
};
  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={styles.container}>

      {/* TITLE */}

      <Text style={styles.title}>
        Welcome Back
      </Text>

      <Text style={styles.subtitle}>
        Sign in to continue to your wardrobe.
      </Text>

      {/* EMAIL */}

      <Text style={styles.label}>
        EMAIL
      </Text>

      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* PASSWORD */}

      <Text style={styles.label}>
        PASSWORD
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* FORGOT PASSWORD */}

      <TouchableOpacity
        onPress={() =>
          router.push("/auth/forgot-password")
        }
      >
        <Text style={styles.forgot}>
          Forgot password?
        </Text>
      </TouchableOpacity>

      {/* EMAIL LOGIN */}

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={handleLogin}
        disabled={loading || googleLoading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      {/* DIVIDER */}

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />

        <Text style={styles.orText}>
          OR
        </Text>

        <View style={styles.divider} />
      </View>

      {/* GOOGLE */}

      <TouchableOpacity
        style={[
          styles.googleButton,
          googleLoading &&
            styles.googleDisabled,
        ]}
        onPress={handleGoogleLogin}
        disabled={loading || googleLoading}
      >
        {googleLoading ? (
          <ActivityIndicator color="#111" />
        ) : (
          <>
            <Text style={styles.googleIcon}>
              G
            </Text>

            <Text style={styles.googleText}>
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* SIGN UP */}

      <TouchableOpacity
        onPress={() =>
          router.push("/auth/signup")
        }
      >
        <Text style={styles.signup}>
          Don't have an account?{" "}
          <Text style={styles.signupBold}>
            Sign up
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#F8F6F1",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    marginBottom: 30,
  },

  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#777",
    marginBottom: 8,
  },

  input: {
    height: 52,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD9D1",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 17,
    fontSize: 14,
    color: "#111",
  },

  forgot: {
    textAlign: "right",
    marginBottom: 20,
    color: "#555",
    fontSize: 12,
  },

  button: {
    height: 52,
    backgroundColor: "#111",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD9D1",
  },

  orText: {
    fontSize: 10,
    color: "#999",
    marginHorizontal: 12,
    fontWeight: "600",
  },

  googleButton: {
    height: 52,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8D5CE",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  googleDisabled: {
    opacity: 0.6,
  },

  googleIcon: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 10,
    color: "#4285F4",
  },

  googleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },

  signup: {
    textAlign: "center",
    marginTop: 24,
    color: "#777",
    fontSize: 12,
  },

  signupBold: {
    color: "#111",
    fontWeight: "700",
  },
});