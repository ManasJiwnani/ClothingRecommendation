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
import { supabase } from "../../lib/supabase";

export default function NameScreen() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      Alert.alert(
        "Enter your name",
        "Please tell us what we should call you."
      );
      return;
    }

    try {
      setLoading(true);

      // Get currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          "Authentication Error",
          "Please log in again."
        );

        router.replace("/auth/login");
        return;
      }

      console.log("NAME SCREEN USER:", user.id);

      // Check if profile already exists
      const { data: existingProfile, error: profileError } =
        await supabase
          .from("user_profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "PROFILE CHECK ERROR:",
          profileError
        );

        Alert.alert(
          "Error",
          "Unable to check your profile."
        );

        return;
      }

      let error;

      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from("user_profiles")
          .update({
            name: cleanName,
          })
          .eq("id", user.id);

        error = result.error;
      } else {
        // Create new profile
        const result = await supabase
          .from("user_profiles")
          .insert({
            id: user.id,
            name: cleanName,
            onboarding_completed: false,
          });

        error = result.error;
      }

      if (error) {
        console.error(
          "NAME SAVE ERROR:",
          error
        );

        Alert.alert(
          "Could not save name",
          error.message
        );

        return;
      }

      console.log(
        "NAME SAVED SUCCESSFULLY:",
        cleanName
      );

      // Continue to preferences
      router.replace("/onboarding/preferences");
    } catch (error: any) {
      console.error(
        "NAME SCREEN ERROR:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>

        <Text style={styles.eyebrow}>
          LET'S GET STARTED
        </Text>

        <Text style={styles.title}>
          What do we call you?
        </Text>

        <Text style={styles.subtitle}>
          Tell us your name so we can personalize
          your Closet AI experience.
        </Text>

        <Text style={styles.label}>
          YOUR NAME
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Purva"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Continue
            </Text>
          )}
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F1",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 25,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: "#745a38",
    marginBottom: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: "600",
    color: "#111",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#777",
    marginBottom: 35,
    maxWidth: 330,
  },

  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#777",
    marginBottom: 8,
  },

  input: {
    height: 54,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD9D1",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
    marginBottom: 18,
  },

  button: {
    height: 54,
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
    fontSize: 15,
    fontWeight: "600",
  },
});