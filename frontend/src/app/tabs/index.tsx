import { useEffect, useRef, useState } from "react";
import { aiApiFetch, apiFetch } from "../../lib/api";
import { getWeather } from "../../services/weather";
import { getCurrentCoordinates } from "../../services/location";
import { embedFashionQuery } from "../../services/ai-stylist";
import {
  getDailyRecommendation,
  getRecommendations,
  type DailyRecommendationResponse,
  type OutfitRecommendation,
  type RecommendationPreset,
} from "../../services/recommendation";
import { supabase } from "../../lib/supabase";

import { Image as ExpoImage } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import shirt2 from "../../assets/clothes/shirt2.png";
import pants2 from "../../assets/clothes/pants2.png";
import whiteSneakers from "../../assets/clothes/whiteSneakers.png";
import jeans from "../../assets/clothes/jeans.jpg";
import offshoulders from "../../assets/clothes/offshoulders.jpg";
import shirt from "../../assets/clothes/shirt.png";
import pants from "../../assets/clothes/pants.png";
import blouse from "../../assets/clothes/outfit1.png";
import tailoredPants from "../../assets/clothes/outfit2.png";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BottomTabInset,
  Fonts,
  Spacing,
} from "@/constants/theme";

const WOMAN_IMAGE = require("../../assets/woman.png");
const MALE_MODEL_IMAGE = require("../../assets/model2.png");

function getModelImageForGender(gender?: string | null): ImageSourcePropType {
  const normalizedGender = (gender ?? "").trim().toLowerCase();
  return normalizedGender.includes("male") ? MALE_MODEL_IMAGE : WOMAN_IMAGE;
}

// ============================================================
// PRESETS
// ============================================================

const presets = [
  {
    label: "Today's Weather",
    emoji: "☀",
    looks: [
      {
        title: "Weather Ready",
        note: "A comfortable everyday combination for a clear day in the city.",
        occasion: "EVERYDAY · RELAXED",
        items: {
          top: shirt2,
          bottom: pants2,
          shoes: whiteSneakers,
        },
      },
      {
        title: "Soft Layers",
        note: "A light blouse and tailored trousers keep the day feeling effortless.",
        occasion: "DAYTIME · POLISHED",
        items: {
          top: blouse,
          bottom: pants2,
          shoes: whiteSneakers,
        },
      },
    ],
  },

  {
    label: "Dinner in Brera",
    emoji: "◌",
    looks: [
      {
        title: "Brera After Dark",
        note: "A statement off-shoulder top paired with relaxed denim for dinner.",
        occasion: "EVENING · DINNER",
        items: {
          top: offshoulders,
          bottom: jeans,
          shoes: whiteSneakers,
        },
      },
      {
        title: "Evening Minimal",
        note: "A refined dark top and denim make an easy, understated dinner look.",
        occasion: "EVENING · SMART CASUAL",
        items: {
          top: shirt2,
          bottom: jeans,
          shoes: whiteSneakers,
        },
      },
    ],
  },

  {
    label: "Casual Meeting",
    emoji: "▣",
    looks: [
      {
        title: "Modern Atelier",
        note: "A relaxed everyday look with a clean, effortless silhouette.",
        occasion: "WORK · SMART CASUAL",
        items: {
          top: blouse,
          bottom: tailoredPants,
          shoes: whiteSneakers,
        },
      },
      {
        title: "Creative Office",
        note: "A simple dark top with tailored trousers feels polished but comfortable.",
        occasion: "WORK · CREATIVE",
        items: {
          top: shirt2,
          bottom: pants2,
          shoes: whiteSneakers,
        },
      },
    ],
  },

  {
    label: "Weekend Gallery",
    emoji: "✦",
    looks: [
      {
        title: "Weekend Edit",
        note: "An easy combination designed for a relaxed weekend mood.",
        occasion: "WEEKEND · CASUAL",
        items: {
          top: shirt,
          bottom: pants,
          shoes: whiteSneakers,
        },
      },
      {
        title: "Gallery Stroll",
        note: "A soft statement top and relaxed denim make a comfortable gallery look.",
        occasion: "WEEKEND · CULTURE",
        items: {
          top: offshoulders,
          bottom: jeans,
          shoes: whiteSneakers,
        },
      },
    ],
  },
];

const occasions = ["Work", "Weekend", "Evening"];
const recommendationPresets: RecommendationPreset[] = [
  "weather",
  "dinner",
  "meeting",
  "weekend",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getItemLabel(value: unknown) {
  if (!isRecord(value)) {
    return "";
  }

  return [value.color, value.subcategory || value.category]
    .filter((part): part is string => typeof part === "string" && !!part)
    .join(" ");
}

function getItemImage(value: unknown): ImageSourcePropType | undefined {
  if (!isRecord(value) || typeof value.image_url !== "string") {
    return undefined;
  }

  return { uri: value.image_url };
}

function getItemImageUrl(value: unknown) {
  return isRecord(value) && typeof value.image_url === "string"
    ? value.image_url
    : "";
}

function getWeatherLocationErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    switch (error.code) {
      case 1:
        return "Location permission is blocked. Allow Location for localhost:8081 in your browser's site settings, then try again.";
      case 2:
        return "Your device could not determine its location. Check that Location Services are on and try again.";
      case 3:
        return "Location lookup timed out. Check your connection or device location settings, then try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Weather could not be loaded. Check your browser's location permission and try again.";
}


// ============================================================
// SCREEN
// ============================================================

export default function StylistScreen() {

  const [occasion, setOccasion] = useState("Work");

  const [selectedPresetIndex, setSelectedPresetIndex] =
    useState(0);

  const [lookIndex, setLookIndex] = useState(0);

  const [prompt, setPrompt] = useState("");
  const [queryRecommendations, setQueryRecommendations] =
    useState<OutfitRecommendation[]>([]);
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [queryRecommendationLoading, setQueryRecommendationLoading] =
    useState(false);
  const [queryRecommendationError, setQueryRecommendationError] =
    useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);

  const [isWorn, setIsWorn] = useState(false);

  const router = useRouter();

  // ==========================================================
  // WEATHER STATE
  // ==========================================================

  const [weather, setWeather] = useState<any>(null);

  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherRetry, setWeatherRetry] = useState(0);
  const [dailyRecommendation, setDailyRecommendation] =
    useState<DailyRecommendationResponse | null>(null);
  const [dailyRecommendationLoading, setDailyRecommendationLoading] =
    useState(true);
  const [dailyRecommendationError, setDailyRecommendationError] =
    useState<string | null>(null);
  const [dailyRecommendationRetry, setDailyRecommendationRetry] = useState(0);
  const [showDailyTryOn, setShowDailyTryOn] = useState(false);
  const [dailyTryOnLoading, setDailyTryOnLoading] = useState(false);
  const [dailyTryOnResult, setDailyTryOnResult] = useState<string | null>(null);
  const [dailyTryOnError, setDailyTryOnError] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);
  const dailyTryOnRequestId = useRef(0);

  const submitPrompt = async () => {
    const query = prompt.trim();
    if (!query || queryRecommendationLoading) {
      return;
    }

    setQueryRecommendationLoading(true);
    setQueryRecommendationError(null);
    setQueryRecommendations([]);
    setSubmittedQuery(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }
      if (!user) {
        throw new Error("Sign in to get recommendations from your closet.");
      }

      const location = await getCurrentCoordinates();
      const embeddedQuery = await embedFashionQuery(query);
      if (
        embeddedQuery.embedding_dimensions !== 768 ||
        embeddedQuery.embedding.length !== 768
      ) {
        throw new Error(
          "The AI service returned an invalid query embedding. Please try again."
        );
      }

      const response = await getRecommendations(
        user.id,
        embeddedQuery.embedding,
        embeddedQuery.intent,
        location.latitude,
        location.longitude
      );

      setSubmittedQuery(query);
      setQueryRecommendations(response.recommendations.slice(0, 5));
      setPrompt("");
    } catch (error) {
      console.error("Failed to get outfit recommendations:", error);
      setQueryRecommendationError(
        error instanceof Error
          ? error.message
          : "Recommendations could not be loaded. Please try again."
      );
    } finally {
      setQueryRecommendationLoading(false);
    }
  };

  // ==========================================================
  // LOAD WEATHER
  // ==========================================================

  useEffect(() => {
    let isActive = true;

    const loadUserGender = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          setUserGender(null);
          return;
        }

        const { data, error: genderError } = await supabase
          .from("user_preferences")
          .select("gender")
          .eq("id", user.id)
          .maybeSingle();

        if (genderError) {
          console.error("Failed to load user gender:", genderError);
          setUserGender(null);
          return;
        }

        if (isActive) {
          setUserGender(data?.gender ?? null);
        }
      } catch (error) {
        console.error("Failed to read user gender:", error);
        if (isActive) {
          setUserGender(null);
        }
      }
    };

    void loadUserGender();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);

      try {
        const userId = "user001";

        const location = await getCurrentCoordinates();
        const data = await getWeather(
          userId,
          location.latitude,
          location.longitude
        );

        if (isActive) {
          setWeather(data);
        }

      } catch (error) {
        console.error(
          "Failed to load local weather:",
          error instanceof Error
            ? error.message
            : typeof error === "object" && error !== null && "code" in error
              ? { code: error.code, message: "Browser geolocation failed" }
              : error
        );
        if (isActive) {
          setWeather(null);
          setWeatherError(getWeatherLocationErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setWeatherLoading(false);
        }
      }
    };

    void loadWeather();
    return () => {
      isActive = false;
    };
  }, [weatherRetry]);

  useEffect(() => {
    let isActive = true;

    const loadDailyRecommendation = async () => {
      dailyTryOnRequestId.current += 1;
      setShowDailyTryOn(false);
      setDailyTryOnLoading(false);
      setDailyTryOnResult(null);
      setDailyTryOnError(null);
      setDailyRecommendationLoading(true);
      setDailyRecommendationError(null);
      setDailyRecommendation(null);
      setLookIndex(0);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) {
          throw authError;
        }
        if (!user) {
          throw new Error("Sign in to get recommendations from your closet.");
        }

        const location = await getCurrentCoordinates();
        const response = await getDailyRecommendation(
          user.id,
          recommendationPresets[selectedPresetIndex],
          location.latitude,
          location.longitude
        );
        if (response.recommendations.length === 0) {
          if (response.available_clothes === 0) {
            throw new Error(
              "No clothing items are saved in your closet for this account. Add clothing and try again."
            );
          }

          if (
            typeof response.available_clothes === "number" &&
            response.available_clothes > 0 &&
            response.generated_outfits === 0
          ) {
            throw new Error(
              `Found ${response.available_clothes} closet item(s), but couldn't build a complete outfit. Add at least a top and bottom or a dress, then try again.`
            );
          }

          throw new Error(
            "No complete outfit was returned. Add a top and bottom or a dress to your closet, then try again."
          );
        }

        if (isActive) {
          setDailyRecommendation(response);
        }
      } catch (error) {
        console.error("Failed to load home daily recommendation:", error);
        if (isActive) {
          setDailyRecommendationError(
            error instanceof Error
              ? error.message
              : "Daily recommendation could not be loaded. Please try again."
          );
        }
      } finally {
        if (isActive) {
          setDailyRecommendationLoading(false);
        }
      }
    };

    void loadDailyRecommendation();
    return () => {
      isActive = false;
    };
  }, [dailyRecommendationRetry, selectedPresetIndex]);


  // ==========================================================
  // WEATHER VALUES
  // ==========================================================

  const temperature =
    weather?.weather?.temperature;

  const feelsLike =
    weather?.weather?.feels_like;

  const weatherCode =
    weather?.weather?.weather_code;

  const temperatureCategory =
    weather?.weather_context?.temperature_category;

  const rainCategory =
    weather?.weather_context?.rain_category;

  const weatherOverall =
    weather?.weather_context?.overall;


  // ==========================================================
  // WEATHER CONDITION
  // ==========================================================

  const getWeatherCondition = () => {

    if (weatherLoading) {
      return "Checking weather...";
    }

    if (!weather) {
      return "Weather unavailable";
    }


    switch (weatherCode) {

      case 0:
        return "Clear skies";

      case 1:
      case 2:
      case 3:
        return "Partly cloudy";

      case 45:
      case 48:
        return "Foggy";

      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
        return "Drizzle";

      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
        return "Rainy";

      case 71:
      case 73:
      case 75:
      case 77:
        return "Snowy";

      case 80:
      case 81:
      case 82:
        return "Rain showers";

      case 95:
      case 96:
      case 99:
        return "Thunderstorm";

      default:
        return "Current conditions";
    }
  };


  // ==========================================================
  // WEATHER DESCRIPTION
  // ==========================================================

  const getWeatherDescription = () => {

    if (weatherLoading) {

      return "Checking today's weather...";
    }


    if (!weather) {

      return "Weather information unavailable.";
    }


    if (
      rainCategory === "rainy"
    ) {

      return "Rainy conditions today. Consider a light waterproof layer.";
    }


    if (
      rainCategory === "wet"
    ) {

      return "There may be some rain today. A light layer could be useful.";
    }


    if (
      temperatureCategory === "hot"
    ) {

      return "It's warm today. Light and breathable clothing will keep you comfortable.";
    }


    if (
      temperatureCategory === "warm"
    ) {

      return "Light layers should keep you comfortable throughout the day.";
    }


    if (
      temperatureCategory === "cool"
    ) {

      return "A light layer will help keep you comfortable today.";
    }


    if (
      temperatureCategory === "cold"
    ) {

      return "You'll want warmer layers to stay comfortable today.";
    }


    return "Dress comfortably for today's conditions.";
  };


  // ==========================================================
  // WEATHER ICON
  // ==========================================================

  const getWeatherIcon = () => {

    if (
      rainCategory === "rainy" ||
      rainCategory === "wet"
    ) {

      return "cloud.rain.fill";
    }


    if (
      temperatureCategory === "hot" ||
      temperatureCategory === "warm"
    ) {

      return "sun.max.fill";
    }


    return "cloud.sun.fill";
  };


  // ==========================================================
  // CURRENT PRESET
  // ==========================================================

  const selectedPreset =
    presets[selectedPresetIndex];

  const staticLook =
    selectedPreset.looks[lookIndex % selectedPreset.looks.length];
  const selectedDailyOutfit =
    dailyRecommendation?.recommendations[lookIndex]?.outfit;
  const dailyTop = selectedDailyOutfit?.top || selectedDailyOutfit?.dress;
  const dailyTryOnGarments = [
    {
      key: "top",
      label: selectedDailyOutfit?.dress ? "Dress" : "Top",
      imageUrl: getItemImageUrl(dailyTop),
      name: getItemLabel(dailyTop),
    },
    {
      key: "bottom",
      label: "Bottom",
      imageUrl: getItemImageUrl(selectedDailyOutfit?.bottom),
      name: getItemLabel(selectedDailyOutfit?.bottom),
    },
    {
      key: "footwear",
      label: "Footwear",
      imageUrl: getItemImageUrl(selectedDailyOutfit?.footwear),
      name: getItemLabel(selectedDailyOutfit?.footwear),
    },
  ].filter((garment) => garment.imageUrl);
  const look = selectedDailyOutfit
    ? {
        title:
          [
            getItemLabel(dailyTop),
            getItemLabel(selectedDailyOutfit.bottom),
            getItemLabel(selectedDailyOutfit.footwear),
          ]
            .filter(Boolean)
            .join(" + ") || `${selectedPreset.label} look`,
        note: `A personalized look from your closet for ${selectedPreset.label.toLowerCase()}.`,
        occasion:
          typeof dailyRecommendation?.intent.occasion === "string"
            ? dailyRecommendation.intent.occasion.toUpperCase()
            : selectedPreset.label.toUpperCase(),
        items: {
          top: getItemImage(dailyTop),
          bottom: getItemImage(selectedDailyOutfit.bottom),
          shoes: getItemImage(selectedDailyOutfit.footwear),
        },
      }
    : staticLook;

  const createDailyTryOn = async () => {
    const requestId = ++dailyTryOnRequestId.current;
    if (!selectedDailyOutfit || dailyTryOnGarments.length === 0) {
      setDailyTryOnError("This recommended outfit has no available clothing images.");
      setShowDailyTryOn(true);
      return;
    }

    setShowDailyTryOn(true);
    setDailyTryOnLoading(true);
    setDailyTryOnResult(null);
    setDailyTryOnError(null);

    try {
      const response = await aiApiFetch<{ image_url: string }>(
        "/virtual-try-on",
        {
          method: "POST",
          body: JSON.stringify({
            top: getItemImageUrl(dailyTop) || null,
            bottom: getItemImageUrl(selectedDailyOutfit.bottom) || null,
            shoes: getItemImageUrl(selectedDailyOutfit.footwear) || null,
          }),
        }
      );

      if (requestId !== dailyTryOnRequestId.current) {
        return;
      }
      if (!response.image_url) {
        throw new Error("The virtual try-on service returned no image.");
      }

      setDailyTryOnResult(response.image_url);
    } catch (error) {
      if (requestId !== dailyTryOnRequestId.current) {
        return;
      }
      console.error("Failed to create Home virtual try-on:", error);
      setDailyTryOnError(
        error instanceof Error
          ? error.message
          : "Could not create the virtual try-on. Please try again."
      );
    } finally {
      if (requestId === dailyTryOnRequestId.current) {
        setDailyTryOnLoading(false);
      }
    }
  };


  // ==========================================================
  // SHUFFLE
  // ==========================================================

  const shuffleLook = () => {
    dailyTryOnRequestId.current += 1;
    setShowDailyTryOn(false);
    setDailyTryOnLoading(false);
    setDailyTryOnResult(null);
    setDailyTryOnError(null);

    const lookCount =
      dailyRecommendation?.recommendations.length ||
      selectedPreset.looks.length;

    setLookIndex(
      (current) =>
        (current + 1) % lookCount
    );

    setIsWorn(false);

    setIsSaved(false);
  };


  // ==========================================================
  // SHARE
  // ==========================================================

  const shareLook = async () => {

    try {

      await Share.share({

        message:
          `Check out my ${look.title} outfit from CLOSET AI!`,

      });

    } catch (error) {

      console.log(
        "Share error:",
        error
      );
    }
  };


  // ==========================================================
  // BACKEND TEST
  // ==========================================================

  useEffect(() => {

    const testBackend = async () => {

      try {

        const data =
          await apiFetch("/");

        console.log(
          "Backend response:",
          data
        );

      } catch (error) {

        console.error(
          "Backend error:",
          error
        );
      }
    };


    testBackend();

  }, []);


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <ThemedView style={styles.container}>

      <SafeAreaView style={styles.safeArea}>

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >


          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>

            <View style={styles.headerTop}>

              <View>

                <Text style={styles.kicker}>
                  CLOSET AI
                </Text>

                <Text style={styles.greeting}>
                  Good morning
                </Text>

              </View>


              {/* DYNAMIC WEATHER */}

              <View style={styles.weather}>

                <Text style={styles.weatherCity}>
                  TODAY
                </Text>

                <Text style={styles.temperature}>

                  {weatherLoading
                    ? "--"
                    : typeof temperature === "number"
                      ? `${Math.round(temperature)}°C`
                      : "--"}

                </Text>

              </View>

            </View>


            <Text style={styles.heroHeading}>
              Dress for the day.
            </Text>

            <Text style={styles.heroDescription}>
              Your wardrobe, your mood, your moment.
            </Text>

            {weatherError && (
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#fff8ec",
                  borderRadius: 12,
                  marginTop: 12,
                  padding: 12,
                }}
              >
                <Text style={{ color: "#704e2f", maxWidth: 280 }}>
                  {weatherError}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setWeatherRetry((attempt) => attempt + 1)}
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ color: "#704e2f", fontWeight: "700" }}>
                    Try location again
                  </Text>
                </Pressable>
              </View>
            )}

          </View>

          {/* ==================================================
              PRESETS
          ================================================== */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetRow}
          >

            {presets.map(
              (preset, index) => (

                <Pressable
                  key={preset.label}

                  onPress={() => {
                    dailyTryOnRequestId.current += 1;
                    setShowDailyTryOn(false);
                    setDailyTryOnLoading(false);
                    setDailyTryOnResult(null);
                    setDailyTryOnError(null);

                    setSelectedPresetIndex(
                      index
                    );

                    setLookIndex(0);

                    setIsWorn(false);

                    setIsSaved(false);
                  }}

                  style={[
                    styles.preset,

                    index ===
                      selectedPresetIndex &&
                      styles.presetSelected,
                  ]}
                >

                  <ThemedText
                    style={styles.presetEmoji}
                  >
                    {preset.emoji}
                  </ThemedText>


                  <ThemedText
                    style={[
                      styles.presetText,

                      index ===
                        selectedPresetIndex &&
                        styles.presetTextSelected,
                    ]}
                  >
                    {preset.label}
                  </ThemedText>

                </Pressable>

              )
            )}

          </ScrollView>


          {/* ==================================================
              OUTFIT CARD
          ================================================== */}

          {dailyRecommendationLoading ? (
            <View style={styles.dailyRecommendationStatus}>
              <ActivityIndicator size="small" color="#745a38" />
              <Text style={styles.dailyRecommendationStatusText}>
                Finding a look from your closet...
              </Text>
            </View>
          ) : dailyRecommendationError ? (
            <View style={styles.dailyRecommendationError}>
              <Text style={styles.dailyRecommendationErrorText} selectable>
                {dailyRecommendationError}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setDailyRecommendationRetry((attempt) => attempt + 1)
                }
              >
                <Text style={styles.dailyRecommendationRetry}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : dailyRecommendation && (
          <View style={styles.lookCard}>


            {/* CARD HEADER */}

            <View style={styles.outfitCardHeader}>

              <View>

                <ThemedText
                  style={styles.lookKicker}
                >
                  CURATED RECOMMENDATION
                </ThemedText>


                <ThemedText
                  style={styles.lookTitle}
                >
                  {look.title}
                </ThemedText>

              </View>


              <Pressable
                accessibilityLabel="Save outfit"

                onPress={() =>
                  setIsSaved(
                    (current) => !current
                  )
                }

                style={styles.saveButton}
              >

                <SymbolView
                  name={{
                    ios: isSaved
                      ? "bookmark.fill"
                      : "bookmark",

                    android: isSaved
                      ? "bookmark"
                      : "bookmark_border",

                    web: isSaved
                      ? "bookmark"
                      : "bookmark_border",
                  }}

                  size={19}

                  tintColor="#745a38"
                />

              </Pressable>

            </View>


            {/* ==================================================
                OUTFIT CANVAS
            ================================================== */}

            {showDailyTryOn ? (
              <View style={styles.dailyTryOnStage}>
                <View style={styles.dailyTryOnGarments}>
                  {dailyTryOnGarments.map((garment) => (
                    <View key={garment.key} style={styles.dailyTryOnGarmentCard}>
                      <Text style={styles.dailyTryOnGarmentLabel}>
                        {garment.label}
                      </Text>
                      <Image
                        source={{ uri: garment.imageUrl }}
                        style={styles.dailyTryOnGarmentImage}
                        resizeMode="contain"
                      />
                      <Text
                        style={styles.dailyTryOnGarmentName}
                        numberOfLines={1}
                      >
                        {garment.name}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.dailyTryOnModel}>
                  <View style={styles.canvasLabel}>
                    <ThemedText style={styles.canvasLabelText}>
                      {dailyTryOnResult ? "VIRTUAL TRY-ON" : "MODEL"}
                    </ThemedText>
                  </View>
                  <Image
                    source={
                      dailyTryOnResult
                        ? { uri: dailyTryOnResult }
                        : getModelImageForGender(userGender)
                    }
                    style={styles.dailyTryOnModelImage}
                    resizeMode="contain"
                  />
                  {dailyTryOnLoading && (
                    <View style={styles.dailyTryOnLoading}>
                      <ActivityIndicator size="small" color="#745a38" />
                      <Text style={styles.dailyTryOnLoadingText}>
                        Creating your look...
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.outfitCanvas}>
                <View style={styles.canvasLabel}>
                  <ThemedText style={styles.canvasLabelText}>
                    YOUR LOOK
                  </ThemedText>
                </View>
                {look.items.top && (
                  <Image
                    source={look.items.top}
                    style={styles.topItem}
                    resizeMode="contain"
                  />
                )}
                {look.items.bottom && (
                  <Image
                    source={look.items.bottom}
                    style={styles.bottomItem}
                    resizeMode="contain"
                  />
                )}
                {look.items.shoes && (
                  <Image
                    source={look.items.shoes}
                    style={styles.shoesItem}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}

            {showDailyTryOn && dailyTryOnError && (
              <Text style={styles.dailyTryOnError} selectable>
                {dailyTryOnError}
              </Text>
            )}


            {/* ==================================================
                OUTFIT INFORMATION
            ================================================== */}

            <View style={styles.outfitInfo}>

              <View style={styles.outfitInfoLeft}>

                <ThemedText
                  style={styles.outfitOccasion}
                >
                  {look.occasion}
                </ThemedText>


                <ThemedText
                  style={styles.outfitDescription}
                >
                  {look.note}
                </ThemedText>

              </View>

              {dailyRecommendation.weather_error && (
                <Text style={styles.dailyWeatherNotice} selectable>
                  {dailyRecommendation.weather_error}
                </Text>
              )}


              {/* DYNAMIC WEATHER BADGE */}

              <View style={styles.weatherBadge}>

                <ThemedText
                  style={styles.weatherBadgeTemp}
                >

                  {typeof dailyRecommendation.weather?.temperature === "number"
                    ? `${Math.round(
                        dailyRecommendation.weather.temperature
                      )}°`
                    : typeof temperature === "number"
                      ? `${Math.round(temperature)}°`
                      : "--"}

                </ThemedText>


                <ThemedText
                  style={styles.weatherBadgeText}
                >
                  TODAY
                </ThemedText>

              </View>

            </View>


            {/* ==================================================
                ACTIONS
            ================================================== */}

            <View style={styles.cardActions}>


              {/* SHARE */}

              <Pressable
                onPress={shareLook}
                style={
                  styles.cardActionSecondary
                }
              >

                <SymbolView
                  name={{
                    ios: "square.and.arrow.up",
                    android: "share",
                    web: "share",
                  }}

                  size={20}

                  tintColor="#745a38"
                />

                <ThemedText
                  style={styles.cardActionText}
                >
                  SHARE
                </ThemedText>

              </Pressable>


              {/* TRY ON */}

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (showDailyTryOn && dailyTryOnResult) {
                    setShowDailyTryOn(false);
                    return;
                  }
                  void createDailyTryOn();
                }}
                disabled={dailyTryOnLoading}

                style={
                  styles.cardActionPrimary
                }
              >

                <SymbolView
                  name={{
                    ios: "camera.viewfinder",
                    android: "camera",
                    web: "camera",
                  }}

                  size={18}

                  tintColor="#ffddb4"
                />

                <ThemedText
                  style={
                    styles.cardActionPrimaryText
                  }
                >
                  {dailyTryOnLoading
                    ? "CREATING..."
                    : dailyTryOnError
                      ? "RETRY TRY ON"
                      : showDailyTryOn && dailyTryOnResult
                        ? "BACK TO OUTFIT"
                        : "TRY ON"}
                </ThemedText>

              </Pressable>


              {/* SHUFFLE */}

              <Pressable
                onPress={shuffleLook}
                style={
                  styles.cardActionSecondary
                }
              >

                <SymbolView
                  name={{
                    ios: "shuffle",
                    android: "shuffle",
                    web: "shuffle",
                  }}

                  size={20}

                  tintColor="#745a38"
                />

                <ThemedText
                  style={styles.cardActionText}
                >
                  SHUFFLE
                </ThemedText>

              </Pressable>

            </View>

          </View>
          )}


          {/* ==================================================
              PROMPT
          ================================================== */}

          <View style={styles.promptBox}>

            <SymbolView
              name={{
                ios: "wand.and.stars",
                android: "auto_awesome",
                web: "auto_awesome",
              }}

              size={18}

              tintColor="#745a38"
            />


            <TextInput
              value={prompt}
              onChangeText={setPrompt}

              placeholder="Ask Élise what to wear..."

              placeholderTextColor="#747878"

              style={styles.promptInput}
              returnKeyType="send"
              onSubmitEditing={() => void submitPrompt()}
            />


            <Pressable
              accessibilityLabel="Send to Elise"
              accessibilityRole="button"
              disabled={!prompt.trim() || queryRecommendationLoading}
              onPress={() => void submitPrompt()}
              style={[
                styles.sendButton,
                (!prompt.trim() || queryRecommendationLoading) &&
                  styles.sendButtonDisabled,
              ]}
            >
              {queryRecommendationLoading ? (
                <ActivityIndicator size="small" color="#ffddb4" />
              ) : (
                <SymbolView
                  name={{
                    ios: "arrow.up",
                    android: "arrow_upward",
                    web: "arrow_upward",
                  }}
                  size={17}
                  tintColor="#ffddb4"
                />
              )}

            </Pressable>

          </View>

          {queryRecommendationError && (
            <View style={styles.queryError}>
              <Text style={styles.queryErrorText}>
                {queryRecommendationError}
              </Text>
            </View>
          )}

          {submittedQuery && !queryRecommendationLoading && (
            <View style={styles.queryResults}>
              <View style={styles.queryResultsHeader}>
                <View>
                  <Text style={styles.sectionKicker}>
                    YOUR CLOSET, STYLED
                  </Text>
                  <Text style={styles.queryResultsTitle}>
                    Looks for “{submittedQuery}”
                  </Text>
                </View>
                <Text style={styles.resultCount}>
                  {queryRecommendations.length} / 5
                </Text>
              </View>

              {queryRecommendations.length === 0 ? (
                <Text style={styles.noQueryResults}>
                  No outfit combinations matched this request. Add more
                  clothing items to your closet or try another prompt.
                </Text>
              ) : (
                queryRecommendations.map((recommendation, index) => {
                  const outfit = recommendation.outfit;
                  const pieces = [
                    { label: "TOP", item: outfit.top || outfit.dress },
                    { label: "BOTTOM", item: outfit.bottom },
                    { label: "SHOES", item: outfit.footwear },
                    { label: "ACCESSORY", item: outfit.accessory },
                  ].filter(
                    (
                      piece
                    ): piece is {
                      label: string;
                      item: Record<string, unknown>;
                    } => piece.item !== undefined
                  );

                  return (
                    <View
                      key={`${submittedQuery}-${index}`}
                      style={styles.recommendationCard}
                    >
                      <Text style={styles.recommendationTitle}>
                        LOOK {index + 1}
                      </Text>
                      <View style={styles.recommendationPieces}>
                        {pieces.map(({ label, item }, pieceIndex) => {
                          const imageUrl =
                            typeof item.image_url === "string"
                              ? item.image_url
                              : null;
                          const itemName = [
                            item.color,
                            item.subcategory || item.category,
                          ]
                            .filter(
                              (value): value is string =>
                                typeof value === "string" && value.length > 0
                            )
                            .join(" ");

                          return (
                            <View
                              key={`${label}-${pieceIndex}`}
                              style={styles.recommendationPiece}
                            >
                              {imageUrl ? (
                                <ExpoImage
                                  source={{ uri: imageUrl }}
                                  style={styles.recommendationImage}
                                  contentFit="contain"
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.recommendationImage,
                                    styles.recommendationImageFallback,
                                  ]}
                                >
                                  <SymbolView
                                    name="tshirt"
                                    size={22}
                                    tintColor="#aaa69f"
                                  />
                                </View>
                              )}
                              <Text style={styles.recommendationPieceLabel}>
                                {label}
                              </Text>
                              <Text
                                style={styles.recommendationPieceName}
                                numberOfLines={2}
                              >
                                {itemName || "Closet item"}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}


          {/* ==================================================
              DYNAMIC WEATHER CARD
          ================================================== */}

          <View style={styles.weatherCard}>


            {/* WEATHER ICON */}

            <View style={styles.weatherIcon}>

              <SymbolView
                name={getWeatherIcon()}
                size={23}
                tintColor="#745a38"
              />

            </View>


            {/* WEATHER CONTENT */}

            <View style={styles.weatherContent}>

              <Text
                style={styles.weatherCardKicker}
              >
                FOR TODAY
              </Text>


              <Text
                style={styles.weatherCardTitle}
              >

                {weatherLoading

                  ? "Checking weather..."

                  : `${Math.round(
                      temperature
                    )}°C · ${getWeatherCondition()}`}

              </Text>


              <Text
                style={styles.weatherCardText}
              >
                {getWeatherDescription()}
              </Text>

            </View>


            <SymbolView
              name="chevron.right"
              size={18}
              tintColor="#9b9892"
            />

          </View>


          {/* ==================================================
              QUICK ACCESS
          ================================================== */}

          <View style={styles.section}>

            <Text style={styles.sectionKicker}>
              QUICK ACCESS
            </Text>


            <View
              style={styles.quickAccessRow}
            >


              {/* SAVED */}

              <Pressable
                onPress={() =>
                  router.push("/saved" as any)
                }

                style={styles.quickCard}
              >

                <View style={styles.quickIcon}>

                  <SymbolView
                    name="plus"
                    size={19}
                    tintColor="#745a38"
                  />

                </View>


                <View style={styles.quickText}>

                  <Text style={styles.quickTitle}>
                    Saved Items
                  </Text>


                  <Text
                    style={
                      styles.quickDescription
                    }
                  >
                    See your saved items
                  </Text>

                </View>


                <SymbolView
                  name="chevron.right"
                  size={16}
                  tintColor="#9b9892"
                />

              </Pressable>


              {/* ITINERARY */}

              <Pressable
                onPress={() =>
                  router.push("/itinerary" as any)
                }

                style={styles.quickCard}
              >

                <View style={styles.quickIcon}>

                  <SymbolView
                    name="camera.metering.center.weighted"
                    size={19}
                    tintColor="#745a38"
                  />

                </View>


                <View style={styles.quickText}>

                  <Text style={styles.quickTitle}>
                    Itinerary
                  </Text>


                  <Text
                    style={
                      styles.quickDescription
                    }
                  >
                    Outfits for your next trip
                  </Text>

                </View>


                <SymbolView
                  name="chevron.right"
                  size={16}
                  tintColor="#9b9892"
                />

              </Pressable>

            </View>

          </View>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <View style={styles.colophon}>

            <ThemedText
              style={styles.colophonText}
            >
              CLOSET AI · EDITED WITH INTENTION
            </ThemedText>

          </View>

        </ScrollView>

      </SafeAreaView>

    </ThemedView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fbf9f6",
  },

  safeArea: {
    flex: 1,
  },

  content: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + 120,
    gap: Spacing.three,
  },


  // ----------------------------------------------------------
  // HEADER
  // ----------------------------------------------------------

  header: {
    gap: 8,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  kicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#745a38",
  },

  greeting: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    lineHeight: 30,
    color: "#1b1c1a",
    marginTop: 4,
  },

  weather: {
    alignItems: "flex-end",
    gap: 1,
  },

  weatherCity: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#747878",
  },

  temperature: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    color: "#745a38",
  },

  heroHeading: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "500",
    color: "#1b1c1a",
    marginTop: 8,
  },

  heroDescription: {
    fontSize: 14,
    color: "#747878",
  },


  // ----------------------------------------------------------
  // WEATHER CARD
  // ----------------------------------------------------------

  weatherCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#f0eeea",
  },

  weatherIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fedaae",
  },

  weatherContent: {
    flex: 1,
    gap: 2,
  },

  weatherCardKicker: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#745a38",
  },

  weatherCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1b1c1a",
  },

  weatherCardText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#747878",
  },


  // ----------------------------------------------------------
  // PRESETS
  // ----------------------------------------------------------

  presetRow: {
    gap: 8,
  },

  preset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "#f0eeea",
  },

  presetSelected: {
    backgroundColor: "#1b1c1a",
  },

  presetEmoji: {
    color: "#745a38",
    fontSize: 14,
  },

  presetText: {
    color: "#1b1c1a",
    fontSize: 12,
    fontWeight: "600",
  },

  presetTextSelected: {
    color: "#ffffff",
  },


  // ----------------------------------------------------------
  // LOOK CARD
  // ----------------------------------------------------------

  lookCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 12,
    boxShadow:
      "0 5px 18px rgba(24, 22, 20, 0.10)",
  },

  dailyRecommendationStatus: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#f0eeea",
  },

  dailyRecommendationStatusText: {
    color: "#745a38",
    fontSize: 13,
  },

  dailyRecommendationError: {
    gap: 10,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#fff1ee",
  },

  dailyRecommendationErrorText: {
    color: "#8b302b",
    fontSize: 13,
    lineHeight: 19,
  },

  dailyRecommendationRetry: {
    color: "#745a38",
    fontSize: 13,
    fontWeight: "700",
  },

  dailyWeatherNotice: {
    color: "#765a2d",
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 5,
    paddingTop: 8,
  },

  outfitCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingTop: 3,
    paddingBottom: 10,
  },

  lookKicker: {
    color: "#745a38",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  lookTitle: {
    fontFamily: Fonts.serif,
    fontSize: 12,
    lineHeight: 31,
    marginTop: 3,
  },

  saveButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0eeea",
  },


  // ----------------------------------------------------------
  // OUTFIT CANVAS
  // ----------------------------------------------------------

  outfitCanvas: {
    width: "100%",
    height: 410,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#f4f1ec",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  dailyTryOnStage: {
    width: "100%",
    height: 410,
    flexDirection: "row",
    gap: 9,
  },

  dailyTryOnGarments: {
    width: "35%",
    gap: 7,
  },

  dailyTryOnGarmentCard: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    borderRadius: 13,
    padding: 7,
    backgroundColor: "#f4f1ec",
    borderWidth: 1,
    borderColor: "#e6e0d7",
  },

  dailyTryOnGarmentLabel: {
    alignSelf: "flex-start",
    color: "#745a38",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  dailyTryOnGarmentImage: {
    width: "100%",
    flex: 1,
    minHeight: 0,
  },

  dailyTryOnGarmentName: {
    alignSelf: "stretch",
    color: "#606260",
    fontSize: 9,
    textAlign: "center",
  },

  dailyTryOnModel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "#f4f1ec",
    position: "relative",
  },

  dailyTryOnModelImage: {
    width: "100%",
    height: "100%",
  },

  dailyTryOnLoading: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  dailyTryOnLoadingText: {
    color: "#745a38",
    fontSize: 10,
    fontWeight: "600",
  },

  dailyTryOnError: {
    color: "#8b302b",
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 5,
    paddingTop: 8,
  },

  canvasLabel: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor:
      "rgba(255,255,255,0.82)",
  },

  canvasLabelText: {
    color: "#745a38",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.1,
  },


  // ----------------------------------------------------------
  // CLOTHING
  // ----------------------------------------------------------

  topItem: {
    position: "absolute",
    width: "40%",
    height: "48%",
    top: "4%",
    zIndex: 4,
  },

  bottomItem: {
    position: "absolute",
    width: "70%",
    height: "49%",
    bottom: "5%",
    zIndex: 3,
  },

  shoesItem: {
    position: "absolute",
    width: "28%",
    height: "16%",
    bottom: "2%",
    right: "6%",
    zIndex: 2,
  },

  bagItem: {
    position: "absolute",
    width: "30%",
    height: "28%",
    right: "7%",
    top: "38%",
    zIndex: 5,
  },


  // ----------------------------------------------------------
  // OUTFIT INFO
  // ----------------------------------------------------------

  outfitInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 5,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
  },

  outfitInfoLeft: {
    flex: 1,
  },

  outfitOccasion: {
    color: "#745a38",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginBottom: 5,
  },

  outfitDescription: {
    color: "#606260",
    fontSize: 12,
    lineHeight: 17,
  },

  weatherBadge: {
    alignItems: "flex-end",
    paddingLeft: 8,
  },

  weatherBadgeTemp: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: "#745a38",
  },

  weatherBadgeText: {
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#747878",
    marginTop: 1,
  },


  // ----------------------------------------------------------
  // ACTIONS
  // ----------------------------------------------------------

  cardActions: {
    flexDirection: "row",
    gap: 7,
    paddingTop: 4,
  },

  cardActionSecondary: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: "#f0eeea",
    borderWidth: 1,
    borderColor: "#e4e2df",
  },

  cardActionPrimary: {
    flex: 1.5,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#1b1c1a",
  },

  cardActionText: {
    color: "#444748",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.9,
  },

  cardActionPrimaryText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },


  // ----------------------------------------------------------
  // PROMPT
  // ----------------------------------------------------------

  promptBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: "#f5f3f0",
    borderWidth: 1,
    borderColor: "#e4e2df",
  },

  promptInput: {
    flex: 1,
    color: "#1b1c1a",
    fontSize: 14,
    paddingVertical: 0,
  },

  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1b1c1a",
  },

  sendButtonDisabled: {
    opacity: 0.55,
  },

  queryError: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff1ee",
  },

  queryErrorText: {
    color: "#9b3030",
    fontSize: 13,
    lineHeight: 19,
  },

  queryResults: {
    gap: 10,
  },

  queryResultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  queryResultsTitle: {
    color: "#1b1c1a",
    fontFamily: Fonts.serif,
    fontSize: 21,
    lineHeight: 27,
    marginTop: 3,
  },

  resultCount: {
    color: "#745a38",
    fontSize: 11,
    fontWeight: "700",
  },

  recommendationCard: {
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e8e4de",
  },

  recommendationTitle: {
    color: "#745a38",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  recommendationPieces: {
    flexDirection: "row",
    gap: 8,
  },

  recommendationPiece: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  recommendationImage: {
    width: "100%",
    aspectRatio: 0.9,
    borderRadius: 10,
    backgroundColor: "#f4f1ec",
  },

  recommendationImageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  recommendationPieceLabel: {
    color: "#745a38",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.7,
  },

  recommendationPieceName: {
    color: "#1b1c1a",
    fontSize: 10,
    lineHeight: 14,
  },

  noQueryResults: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f5f3f0",
    color: "#606260",
    fontSize: 13,
    lineHeight: 19,
  },


  // ----------------------------------------------------------
  // QUICK ACCESS
  // ----------------------------------------------------------

  section: {
    gap: 10,
  },

  sectionKicker: {
    color: "#745a38",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  quickAccessRow: {
    flexDirection: "row",
    gap: 10,
  },

  quickCard: {
    flex: 1,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#f4f1ec",
    borderWidth: 1,
    borderColor: "#e4e2df",
  },

  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8efe2",
    marginRight: 9,
  },

  quickText: {
    flex: 1,
  },

  quickTitle: {
    color: "#1b1c1a",
    fontSize: 13,
    fontWeight: "700",
  },

  quickDescription: {
    color: "#747878",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },


  // ----------------------------------------------------------
  // FOOTER
  // ----------------------------------------------------------

  colophon: {
    alignItems: "center",
    paddingVertical: Spacing.two,
  },

  colophonText: {
    color: "#747878",
    fontSize: 8,
    letterSpacing: 1.3,
    fontWeight: "700",
  },

});