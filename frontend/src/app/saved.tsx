import { useCallback, useState } from "react";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { getLikedOutfits, unlikeOutfit } from "@/services/recommendation";
import { Fonts, Spacing } from "@/constants/theme";

type SavedOutfit = {
  id: string;
  outfit: Record<string, unknown>;
};

type OutfitPiece = {
  key: string;
  name: string;
  category: string;
  imageUrl?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPieces(outfit: Record<string, unknown>): OutfitPiece[] {
  const candidates = [
    { key: "top", label: "TOP", item: outfit.top || outfit.dress },
    { key: "bottom", label: "BOTTOM", item: outfit.bottom },
    { key: "footwear", label: "SHOES", item: outfit.footwear },
    { key: "accessory", label: "ACCESSORY", item: outfit.accessory },
  ];

  return candidates.flatMap(({ key, label, item }) => {
    if (!isRecord(item)) {
      return [];
    }

    const name = [
      item.color,
      item.subcategory || item.category,
    ]
      .filter((value): value is string => typeof value === "string" && !!value)
      .join(" ");

    return [
      {
        key,
        name: name || label.toLowerCase(),
        category: label,
        imageUrl:
          typeof item.image_url === "string" && item.image_url
            ? item.image_url
            : undefined,
      },
    ];
  });
}

function getOutfitTitle(outfit: Record<string, unknown>, pieces: OutfitPiece[]) {
  if (typeof outfit.title === "string" && outfit.title.trim()) {
    return outfit.title.trim();
  }

  return pieces.map((piece) => piece.name).join(" · ") || "Saved look";
}

function parseSavedOutfits(values: Record<string, unknown>[]): SavedOutfit[] {
  return values.flatMap((value) => {
    const outfit = isRecord(value.outfit) ? value.outfit : null;
    const id =
      typeof value.id === "string" || typeof value.id === "number"
        ? String(value.id)
        : "";

    return outfit && id ? [{ id, outfit }] : [];
  });
}

export default function SavedScreen() {
  const router = useRouter();
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedOutfitId, setExpandedOutfitId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadSavedOutfits = async () => {
        setIsLoading(true);
        setLoadingError(null);

        try {
          const {
            data: { session },
            error: authError,
          } = await supabase.auth.getSession();
          if (authError) {
            throw authError;
          }
          const user = session?.user;
          if (!user) {
            throw new Error("Sign in to view your saved outfits.");
          }

          const response = await getLikedOutfits(user.id);
          if (isActive) {
            setSavedOutfits(parseSavedOutfits(response.outfits));
          }
        } catch (error) {
          console.error("Failed to load saved outfits:", error);
          if (isActive) {
            setLoadingError(
              error instanceof Error
                ? error.message
                : "Saved outfits could not be loaded. Please try again."
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      void loadSavedOutfits();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const removeSavedOutfit = async (savedOutfitId: string) => {
    if (removingId) {
      return;
    }

    setRemovingId(savedOutfitId);
    setActionError(null);

    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();
      if (authError) {
        throw authError;
      }
      const user = session?.user;
      if (!user) {
        throw new Error("Sign in to remove a saved outfit.");
      }

      await unlikeOutfit(user.id, savedOutfitId);
      setSavedOutfits((current) =>
        current.filter((savedOutfit) => savedOutfit.id !== savedOutfitId)
      );
    } catch (error) {
      console.error("Failed to remove saved outfit:", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "The outfit could not be removed. Please try again."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const shareOutfit = async (outfit: Record<string, unknown>) => {
    const pieces = getPieces(outfit);
    const title = getOutfitTitle(outfit, pieces);

    try {
      await Share.share({
        message: `Check out this saved look: ${title}${
          pieces.length
            ? `\n${pieces.map((piece) => piece.name).join(" · ")}`
            : ""
        }`,
      });
    } catch (error) {
      console.error("Failed to share saved outfit:", error);
    }
  };

  const tryOnOutfit = (outfit: Record<string, unknown>) => {
    const top = isRecord(outfit.top) ? outfit.top : outfit.dress;
    const bottom = isRecord(outfit.bottom)
      ? outfit.bottom
      : outfit.footwear;
    const topImage = isRecord(top) ? top.image_url : undefined;
    const bottomImage = isRecord(bottom) ? bottom.image_url : undefined;

    if (typeof topImage !== "string" && typeof bottomImage !== "string") {
      setActionError("This saved look has no garment images to try on.");
      return;
    }

    setActionError(null);
    router.push({
      pathname: "/virtualtry_on" as any,
      params: {
        top: typeof topImage === "string" ? topImage : "",
        bottom: typeof bottomImage === "string" ? bottomImage : "",
      },
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/tabs");
                }
              }}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "chevron.left",
                  android: "arrow_back",
                  web: "arrow_back",
                }}
                size={17}
                tintColor="#4e4438"
              />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.kicker}>CLOSET AI</Text>
              <Text style={styles.title}>Saved Outfits</Text>
              <Text style={styles.subtitle}>
                Your favorite looks, ready when you are.
              </Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.statusCard}>
              <ActivityIndicator color="#745a38" />
              <Text style={styles.statusText}>Loading your saved outfits...</Text>
            </View>
          ) : loadingError ? (
            <View style={styles.statusCard}>
              <Text style={styles.errorText} accessibilityRole="alert">
                {loadingError}
              </Text>
            </View>
          ) : savedOutfits.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <SymbolView name="bookmark" size={24} tintColor="#745a38" />
              </View>
              <Text style={styles.emptyTitle}>No saved outfits yet</Text>
              <Text style={styles.emptyText}>
                Tap the bookmark on a daily recommendation to keep that look
                here.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {savedOutfits.map((savedOutfit) => {
                const pieces = getPieces(savedOutfit.outfit);
                const title = getOutfitTitle(savedOutfit.outfit, pieces);
                const isExpanded = expandedOutfitId === savedOutfit.id;
                const topPiece = isRecord(savedOutfit.outfit.top)
                  ? savedOutfit.outfit.top
                  : isRecord(savedOutfit.outfit.dress)
                    ? savedOutfit.outfit.dress
                    : null;
                const lowerPiece = isRecord(savedOutfit.outfit.bottom)
                  ? savedOutfit.outfit.bottom
                  : isRecord(savedOutfit.outfit.footwear)
                    ? savedOutfit.outfit.footwear
                    : null;
                const canTryOn =
                  typeof topPiece?.image_url === "string" ||
                  typeof lowerPiece?.image_url === "string";

                return (
                  <View key={savedOutfit.id} style={styles.card}>
                    <View style={styles.imageGrid}>
                      {pieces.length === 0 && (
                        <View style={styles.noPiecesFallback}>
                          <SymbolView
                            name="tshirt"
                            size={28}
                            tintColor="#aaa69f"
                          />
                        </View>
                      )}
                      {pieces.slice(0, 4).map((piece) => (
                        <View
                          key={piece.key}
                          style={styles.pieceImageWrap}
                        >
                          {piece.imageUrl ? (
                            <Image
                              source={{ uri: piece.imageUrl }}
                              style={styles.pieceImage}
                              contentFit="contain"
                            />
                          ) : (
                            <View style={styles.pieceImageFallback}>
                              <SymbolView
                                name="tshirt"
                                size={20}
                                tintColor="#aaa69f"
                              />
                            </View>
                          )}
                        </View>
                      ))}
                      <View pointerEvents="none" style={styles.lookBadge}>
                        <Text style={styles.lookBadgeText}>YOUR LOOK</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${title} from saved outfits`}
                        accessibilityState={{
                          disabled: removingId === savedOutfit.id,
                        }}
                        disabled={removingId === savedOutfit.id}
                        onPress={() => void removeSavedOutfit(savedOutfit.id)}
                        style={[
                          styles.removeButton,
                          removingId === savedOutfit.id &&
                            styles.removeButtonDisabled,
                        ]}
                      >
                        {removingId === savedOutfit.id ? (
                          <ActivityIndicator size="small" color="#745a38" />
                        ) : (
                          <SymbolView
                            name={{
                              ios: "xmark",
                              android: "close",
                              web: "close",
                            }}
                            size={15}
                            tintColor="#1b1c1a"
                          />
                        )}
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${isExpanded ? "Hide" : "Show"} actions for ${title}`}
                        accessibilityState={{ expanded: isExpanded }}
                        onPress={() =>
                          setExpandedOutfitId(isExpanded ? null : savedOutfit.id)
                        }
                        style={styles.expandButton}
                      >
                        <SymbolView
                          name={{
                            ios: isExpanded ? "chevron.up" : "ellipsis",
                            android: isExpanded ? "expand_less" : "more_horiz",
                            web: isExpanded ? "expand_less" : "more_horiz",
                          }}
                          size={17}
                          tintColor="#1b1c1a"
                        />
                      </Pressable>
                    </View>

                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        <View style={styles.cardActions}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Try on ${title}`}
                            accessibilityState={{ disabled: !canTryOn }}
                            disabled={!canTryOn}
                            onPress={() => tryOnOutfit(savedOutfit.outfit)}
                            style={({ pressed }) => [
                              styles.tryOnButton,
                              !canTryOn && styles.actionButtonDisabled,
                              pressed && styles.actionButtonPressed,
                            ]}
                          >
                            <SymbolView
                              name="camera.viewfinder"
                              size={14}
                              tintColor="#ffddb4"
                            />
                            <Text style={styles.tryOnText}>Try on</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Share ${title}`}
                            onPress={() => void shareOutfit(savedOutfit.outfit)}
                            style={({ pressed }) => [
                              styles.shareButton,
                              pressed && styles.actionButtonPressed,
                            ]}
                          >
                            <SymbolView
                              name="square.and.arrow.up"
                              size={14}
                              tintColor="#745a38"
                            />
                            <Text style={styles.shareText}>Share</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {actionError && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {actionError}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbf9f6",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: 80,
    gap: 22,
  },
  header: {
    alignItems: "flex-start",
    gap: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#e8e3dc",
    backgroundColor: "#f0eeea",
  },
  backButtonPressed: {
    backgroundColor: "#e7e2da",
    transform: [{ scale: 0.96 }],
  },
  headerText: {
    gap: 2,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: "#745a38",
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "500",
    color: "#1b1c1a",
    marginTop: 4,
  },
  subtitle: {
    maxWidth: 330,
    fontSize: 12,
    lineHeight: 18,
    color: "#747878",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  card: {
    width: "48.5%",
    overflow: "hidden",
    borderRadius: 16,
    padding: 7,
    backgroundColor: "#fbf9f6",
    borderWidth: 1,
    borderColor: "#e8e3dc",
  },
  imageGrid: {
    width: "100%",
    aspectRatio: 0.84,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: 1,
    overflow: "hidden",
    position: "relative",
    borderRadius: 12,
    backgroundColor: "#f3f0eb",
  },
  pieceImageWrap: {
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  pieceImage: {
    width: "100%",
    height: "100%",
  },
  pieceImageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noPiecesFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  lookBadge: {
    position: "absolute",
    top: 7,
    left: 7,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "rgba(251, 249, 246, 0.95)",
  },
  lookBadgeText: {
    color: "#745a38",
    fontSize: 6,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbf9f6",
    boxShadow: "0 2px 8px rgba(24, 22, 20, 0.14)",
  },
  removeButtonDisabled: {
    opacity: 0.65,
  },
  expandButton: {
    position: "absolute",
    right: 7,
    bottom: 7,
    minWidth: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingHorizontal: 7,
    backgroundColor: "#fbf9f6",
    boxShadow: "0 2px 8px rgba(24, 22, 20, 0.14)",
  },
  expandedContent: {
    marginTop: 10,
  },
  cardActions: {
    flexDirection: "row",
    gap: 6,
  },
  tryOnButton: {
    flex: 1,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 10,
    backgroundColor: "#1b1c1a",
  },
  tryOnText: {
    color: "#ffddb4",
    fontSize: 10,
    fontWeight: "700",
  },
  shareButton: {
    flex: 1,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 10,
    backgroundColor: "#efeeeb",
  },
  shareText: {
    color: "#745a38",
    fontSize: 10,
    fontWeight: "700",
  },
  actionButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  statusCard: {
    minHeight: 110,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#f0eeea",
  },
  statusText: {
    color: "#745a38",
    fontSize: 13,
  },
  errorText: {
    color: "#8b302b",
    fontSize: 13,
    lineHeight: 19,
  },
  emptyCard: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 34,
    borderRadius: 16,
    backgroundColor: "#f0eeea",
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fedaae",
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: "#1b1c1a",
  },
  emptyText: {
    maxWidth: 280,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "#747878",
  },
});
