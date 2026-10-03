import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
  router,
} from "expo-router";

import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("SESSION ERROR:", error);

          if (mounted) {
            setLoading(false);
          }

          return;
        }

        console.log(
          "INITIAL SESSION:",
          session?.user?.email ?? "No session"
        );

        /*
         * --------------------------------------------------
         * NO USER LOGGED IN
         * --------------------------------------------------
         */

        if (!session) {
          if (mounted) {
            setLoading(false);
          }

          return;
        }

        /*
         * --------------------------------------------------
         * USER IS LOGGED IN
         * --------------------------------------------------
         *
         * Check whether onboarding/preferences are completed.
         */

        const { data: preferences, error: preferenceError } =
          await supabase
            .from("user_preferences")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .maybeSingle();

        if (preferenceError) {
          console.error(
            "PREFERENCE CHECK ERROR:",
            preferenceError
          );

          /*
           * If the preference row doesn't exist,
           * send the user to onboarding.
           */
          if (mounted) {
            setLoading(false);
          }

          return;
        }

        /*
         * --------------------------------------------------
         * PREFERENCES COMPLETED
         * --------------------------------------------------
         */

        if (preferences?.onboarding_completed === true) {
          console.log(
            "Preferences completed → Tabs"
          );

          router.replace("/tabs");
        }

        /*
         * --------------------------------------------------
         * PREFERENCES NOT COMPLETED
         * --------------------------------------------------
         */

        else {
          console.log(
            "Preferences not completed → Preferences"
          );

          router.replace("/onboarding/preferences");
        }

      } catch (error) {
        console.error(
          "AUTH CHECK ERROR:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    /*
     * --------------------------------------------------
     * AUTH STATE LISTENER
     * --------------------------------------------------
     */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(
          "AUTH EVENT:",
          event
        );

        /*
         * User logged out
         */
        if (event === "SIGNED_OUT") {
          router.replace("/auth/login");
        }

        /*
         * User just logged in
         */
        if (event === "SIGNED_IN" && session) {
          checkSession();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Don't render the navigation stack
   * until authentication is checked.
   */

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider
      value={
        colorScheme === "dark"
          ? DarkTheme
          : DefaultTheme
      }
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}