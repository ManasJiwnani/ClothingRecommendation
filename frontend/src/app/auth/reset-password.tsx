import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const updatePassword = async () => {
    if (password.length < 6) {
      Alert.alert(
        "Error",
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Error",
        "Passwords do not match."
      );
      return;
    }

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert(
      "Success",
      "Your password has been updated.",
      [
        {
          text: "Login",
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace("/auth/login");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create New Password
      </Text>

      <View style={styles.inputContainer}>
        <SymbolView
          name={{ ios: "lock", android: "lock", web: "lock" }}
          size={17}
          tintColor="#8A8175"
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
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
        onPress={updatePassword}
      >
        <>
          <SymbolView
            name={{ ios: "checkmark", android: "check", web: "check" }}
            size={17}
            tintColor="#fff"
          />
          <Text style={styles.buttonText}>Update Password</Text>
        </>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 30,
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
    marginBottom: 15,
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
});