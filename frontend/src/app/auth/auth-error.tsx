import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

export default function AuthErrorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>

      <Text style={styles.title}>
        Verification Failed
      </Text>

      <Text style={styles.text}>
        We couldn't verify your account. The link may
        have expired or may no longer be valid.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/auth/login")}
      >
        <Text style={styles.buttonText}>
          Back to Login
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
  },

  icon: {
    fontSize: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 15,
  },

  text: {
    textAlign: "center",
    color: "#666",
    lineHeight: 23,
  },

  button: {
    marginTop: 30,
    width: "100%",
    height: 52,
    backgroundColor: "#111",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});