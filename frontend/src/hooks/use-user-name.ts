import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function getMetadataName(user: {
  user_metadata?: Record<string, unknown>;
  email?: string;
}) {
  const metadataName =
    user.user_metadata?.full_name ?? user.user_metadata?.name;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  return user.email?.split("@")[0] ?? "";
}

export function useUserName() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadUserName = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }
        if (!user) {
          if (isActive) setUserName("");
          return;
        }

        const fallbackName = getMetadataName(user);
        if (isActive) setUserName(fallbackName);

        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (isActive) {
          setUserName(
            typeof profile?.name === "string" && profile.name.trim()
              ? profile.name.trim()
              : fallbackName
          );
        }
      } catch (error) {
        console.error("Failed to load signed-in user's name:", error);
      }
    };

    void loadUserName();
    return () => {
      isActive = false;
    };
  }, []);

  return userName;
}
