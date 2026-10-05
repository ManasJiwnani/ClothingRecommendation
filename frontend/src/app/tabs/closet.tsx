import {
  createClothing,
  getClothes,
  type ClothingItem,
} from "../../services/clothes";
import { getWeather } from "../../services/weather";
import { getCurrentCoordinates } from "../../services/location";
import { supabase } from "../../lib/supabase";
import {processClothingImage,getProcessedImageUrl} from "../../services/add_item";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { BottomTabInset, Fonts, Spacing } from "@/constants/theme";

type UploadMode = "single" | "outfit";

type WeatherData = {
  temperature?: number;
  feels_like?: number;
  precipitation?: number;
  rain?: number;
  weather_code?: number;
  city?: string;
  location?: string;
  temperature_category?: string;
  rain_category?: string;
  overall?: string;
};

const categories = [
  "All",
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
];

export default function ClosetScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showOutfits, setShowOutfits] = useState(false);
  const [query, setQuery] = useState("");

  const [clothes, setClothes] = useState<ClothingItem[]>([]);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const [showAddPiece, setShowAddPiece] = useState(false);

  const [uploadMode, setUploadMode] =
    useState<UploadMode>("single");

  const [imageUri, setImageUri] =
    useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const getCurrentUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Failed to get current user:", error);
      return null;
    }

    return user;
  };

  // =========================================================
  // LOAD CLOTHES
  // =========================================================

  useEffect(() => {
    const loadClothes = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) {
          console.error("No logged-in user found.");
          return;
        }

        const userId = user.id;

        console.log("Loading clothes for user:", userId);

        const data = await getClothes(userId);

        console.log("CLOTHES FROM BACKEND:", data);

        setClothes(data);
      } catch (error) {
        console.error(
          "Failed to load clothes:",
          error
        );
      }
    };

    loadClothes();
  }, []);

  // =========================================================
  // LOAD WEATHER
  // =========================================================

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setWeatherLoading(true);

        const user = await getCurrentUser();

        if (!user) {
          console.error("No logged-in user found.");
          setWeatherLoading(false);
          return;
        }

        const userId = user.id;

        const location = await getCurrentCoordinates();

        console.log(
          "Location:",
          location.latitude,
          location.longitude
        );

        // Send location to backend
        const data = await getWeather(
          userId,
          location.latitude,
          location.longitude
        );

        console.log(
          "WEATHER FROM BACKEND:",
          data
        );

        /*
         * Backend response:
         *
         * {
         *   user_id: "...",
         *   weather: {
         *     temperature: 24.6,
         *     feels_like: 27.2,
         *     precipitation: 0,
         *     rain: 0,
         *     weather_code: 0,
         *     ...
         *   },
         *   weather_context: {
         *     temperature: 24.6,
         *     temperature_category: "warm",
         *     rain_category: "dry",
         *     overall: "warm",
         *     weather_code: 0
         *   }
         * }
         */

        setWeather({
          ...data.weather,
          ...data.weather_context,
          city:
            data.city ||
            data.location ||
            data.weather?.city ||
            data.weather?.location ||
            "",
        });
      } catch (error) {
        console.error(
          "Failed to load weather:",
          error
        );
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeather();
  }, []);

  // =========================================================
  // WEATHER HELPERS
  // =========================================================

  const getTemperature = () => {
    if (
      weather?.temperature === undefined ||
      weather?.temperature === null
    ) {
      return "--";
    }

    return `${Math.round(
      weather.temperature
    )}°C`;
  };

  const getShortTemperature = () => {
    if (
      weather?.temperature === undefined ||
      weather?.temperature === null
    ) {
      return "--°";
    }

    return `${Math.round(
      weather.temperature
    )}°`;
  };

  const getCity = () => {
    if (weather?.city) {
      return weather.city.toUpperCase();
    }

    return "YOUR LOCATION";
  };

  const getWeatherCondition = () => {
    const code = weather?.weather_code;

    if (code === undefined || code === null) {
      return "Weather unavailable";
    }

    if (code === 0) {
      return "Clear skies";
    }

    if (
      code === 1 ||
      code === 2 ||
      code === 3
    ) {
      return "Partly cloudy";
    }

    if (
      code === 45 ||
      code === 48
    ) {
      return "Foggy";
    }

    if (
      code >= 51 &&
      code <= 57
    ) {
      return "Drizzle";
    }

    if (
      code >= 61 &&
      code <= 67
    ) {
      return "Rainy";
    }

    if (
      code >= 71 &&
      code <= 77
    ) {
      return "Snowy";
    }

    if (
      code >= 80 &&
      code <= 82
    ) {
      return "Rain showers";
    }

    if (
      code >= 95 &&
      code <= 99
    ) {
      return "Thunderstorms";
    }

    return "Current conditions";
  };

  const getWeatherIcon = () => {
    const code = weather?.weather_code;

    if (code === undefined || code === null) {
      return "cloud.fill";
    }

    if (code === 0) {
      return "sun.max.fill";
    }

    if (
      code === 1 ||
      code === 2
    ) {
      return "cloud.sun.fill";
    }

    if (code === 3) {
      return "cloud.fill";
    }

    if (
      code >= 51 &&
      code <= 67
    ) {
      return "cloud.rain.fill";
    }

    if (
      code >= 80 &&
      code <= 82
    ) {
      return "cloud.heavyrain.fill";
    }

    if (
      code >= 95 &&
      code <= 99
    ) {
      return "cloud.bolt.rain.fill";
    }

    return "cloud.fill";
  };

  const getWeatherAdvice = () => {
    const temperature =
      weather?.temperature;

    const rainCategory =
      weather?.rain_category;

    if (
      rainCategory === "rainy" ||
      rainCategory === "wet"
    ) {
      return "Keep an umbrella or water-resistant layer nearby.";
    }

    if (
      temperature !== undefined &&
      temperature < 10
    ) {
      return "Warm layers will help keep you comfortable throughout the day.";
    }

    if (
      temperature !== undefined &&
      temperature < 18
    ) {
      return "A light layer should keep you comfortable throughout the day.";
    }

    if (
      temperature !== undefined &&
      temperature < 27
    ) {
      return "Light layers should keep you comfortable throughout the day.";
    }

    if (
      temperature !== undefined &&
      temperature >= 27
    ) {
      return "Choose breathable, lightweight pieces for the warm day.";
    }

    return "Dress comfortably for today's conditions.";
  };

  // =========================================================
  // OPEN ADD PIECE
  // =========================================================

  function openAddPiece() {
    setShowAddPiece(true);
    setImageUri(null);
    setUploadMode("single");
  }

  function closeAddPiece() {
    setShowAddPiece(false);
    setImageUri(null);
    setUploadMode("single");
  }

  // =========================================================
  // SELECT UPLOAD MODE
  // =========================================================

  function selectUploadMode(
    mode: UploadMode
  ) {
    setUploadMode(mode);
    setImageUri(null);
  }

  // =========================================================
  // TAKE PHOTO
  // =========================================================

  async function takePhoto() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Allow camera access to photograph your item."
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.9,
        });

      if (
        !result.canceled &&
        result.assets?.length
      ) {
        setImageUri(
          result.assets[0].uri
        );
      }
    } catch (error) {
      console.error(
        "Camera error:",
        error
      );

      Alert.alert(
        "Camera error",
        "Something went wrong while opening the camera."
      );
    }
  }

  // =========================================================
  // UPLOAD PHOTO
  // =========================================================

  async function choosePhoto() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Allow photo access to choose an image."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.9,
        });

      if (
        !result.canceled &&
        result.assets?.length
      ) {
        setImageUri(
          result.assets[0].uri
        );
      }
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      Alert.alert(
        "Upload error",
        "Something went wrong while selecting the image."
      );
    }
  }

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  function removePhoto() {
    setImageUri(null);
  }

  // =========================================================
  // ANALYZE GARMENT
  // =========================================================

  async function analyzeGarment() {
    if (!imageUri) {
      Alert.alert(
        "Add a photo",
        "Please take a photo or upload an image first."
      );
      return;
    }

    try {
      setAnalyzing(true);

      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Sign in before adding clothing to your closet.");
      }
      const userId = user.id;

      console.log("================================");
      console.log("STARTING IMAGE PROCESSING");
      console.log("Mode:", uploadMode);
      console.log("Image:", imageUri);
      console.log("User:", userId);
      console.log("================================");

      /*
       * SINGLE
       * ------
       * Take Photo → process-image
       * Upload Photo → process-image
       *
       * OUTFIT
       * ------
       * Take Photo → process-outfit
       * Upload Photo → process-outfit
       */
      const result = await processClothingImage(
        imageUri,
        userId,
        uploadMode
      );

      console.log("AI PROCESSING RESULT:", result);

      const processedItems = Array.isArray(result) ? result : [result];
      if (processedItems.length === 0) {
        throw new Error("The AI service did not find any clothing items.");
      }

      const savedItems = await Promise.all(
        processedItems.map((item) => {
          const imageUrl = getProcessedImageUrl(item);
          if (!imageUrl) {
            throw new Error(
              "The AI service did not return a public image URL for a processed item."
            );
          }
          return createClothing(userId, {
            image_url: imageUrl,
            category: item.category,
            subcategory: item.subcategory,
            color: item.color,
            secondary_color: item.secondary_color,
            pattern: item.pattern,
            material: item.material,
            sleeve_type: item.sleeve_type,
            fit: item.fit,
            style: item.style,
            formality: item.formality,
            season: item.season,
            occasions: item.occasions,
            embedding: item.embedding,
          });
        })
      );

      setClothes((previous) => [...savedItems, ...previous]);
      setSelectedCategory("All");
      setShowOutfits(false);

      Alert.alert(
        uploadMode === "single" ? "Added to closet" : "Outfit processed",
        `${savedItems.length} clothing item${savedItems.length === 1 ? "" : "s"} saved to your closet.`
      );

      setImageUri(null);
      setShowAddPiece(false);
    } catch (error: unknown) {
      console.error("IMAGE PROCESSING ERROR:", error);

      Alert.alert(
        "Processing failed",
        error instanceof Error
          ? error.message
          : "Something went wrong while processing the image."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  // =========================================================
  // FILTER CLOTHES
  // =========================================================

  const visibleItems = clothes.filter(
    (item) => {
      const category =
        item.category ||
        item.clothing_type ||
        "";

      const normalizedCategory =
        category.toLowerCase();

      let categoryMatches = true;

      if (selectedCategory !== "All") {
        switch (selectedCategory) {
          case "Tops":
            categoryMatches =
              normalizedCategory.includes(
                "top"
              );
            break;

          case "Bottoms":
            categoryMatches =
              normalizedCategory.includes(
                "bottom"
              ) ||
              normalizedCategory.includes(
                "pant"
              ) ||
              normalizedCategory.includes(
                "jean"
              );
            break;

          case "Dresses":
            categoryMatches =
              normalizedCategory.includes(
                "dress"
              );
            break;

          case "Outerwear":
            categoryMatches =
              normalizedCategory.includes(
                "outer"
              );
            break;

          case "Shoes":
            categoryMatches =
              normalizedCategory.includes(
                "shoe"
              ) ||
              normalizedCategory.includes(
                "footwear"
              );
            break;

          default:
            categoryMatches = true;
        }
      }

      const searchText = [
        item.category,
        item.clothing_type,
        item.subcategory,
        item.color,
        item.secondary_color,
        item.pattern,
        item.material,
        item.sleeve_type,
        item.fit,
        item.style,
        ...(item.season || []),
        ...(item.occasions || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchMatches =
        query.trim().length === 0 ||
        searchText.includes(
          query.toLowerCase()
        );

      return (
        categoryMatches &&
        searchMatches
      );
    }
  );

  // =========================================================
  // CATEGORY LABEL
  // =========================================================

  function getCategoryLabel(
    item: ClothingItem
  ) {
    const category =
      item.category ||
      item.clothing_type ||
      "";

    const subcategory =
      item.subcategory || "";

    if (
      category &&
      subcategory
    ) {
      return `${category} · ${subcategory}`;
    }

    return (
      category ||
      subcategory ||
      "Clothing"
    );
  }

  // =========================================================
  // ADD PIECE SCREEN
  // =========================================================

  if (showAddPiece) {
    return (
      <View style={styles.container}>
        <SafeAreaView
          style={styles.safeArea}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={
              styles.addItemContent
            }
            showsVerticalScrollIndicator={
              true
            }
            keyboardShouldPersistTaps="handled"
          >
            {/* HEADER */}

            <View style={styles.header}>
              <View
                style={
                  styles.headerTop
                }
              >
                <View>
                  <Text
                    style={styles.kicker}
                  >
                    STYLE SENSE
                  </Text>

                  <Text
                    style={styles.heading}
                  >
                    Add a piece
                  </Text>

                  <Text
                    style={
                      styles.description
                    }
                  >
                    Add something new to your
                    wardrobe.
                  </Text>
                </View>

                <View
                  style={
                    styles.headerWeather
                  }
                >
                  <Text
                    style={styles.weatherText}
                  >
                    {getCity()}
                  </Text>

                  <Text
                    style={
                      styles.weatherTemperature
                    }
                  >
                    {getTemperature()}
                  </Text>
                </View>
              </View>
            </View>

            {/* BACK */}

            <Pressable
              onPress={closeAddPiece}
              style={styles.backButton}
            >
              <SymbolView
                name="chevron.left"
                size={18}
                tintColor="#444748"
              />

              <Text
                style={styles.backText}
              >
                My Wardrobe
              </Text>
            </Pressable>

            {/* UPLOAD TYPE */}

            <View
              style={
                styles.uploadSection
              }
            >
              <Text
                style={styles.sectionTitle}
              >
                What are you adding?
              </Text>

              <Text
                style={
                  styles.sectionDescription
                }
              >
                Choose how you want to add
                your wardrobe item.
              </Text>

              <View
                style={styles.modeRow}
              >
                {/* SINGLE ITEM */}

                <Pressable
                  onPress={() =>
                    selectUploadMode(
                      "single"
                    )
                  }
                  style={[
                    styles.modeCard,
                    uploadMode ===
                      "single" &&
                      styles.modeCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.modeIcon,
                      uploadMode ===
                        "single" &&
                        styles.modeIconSelected,
                    ]}
                  >
                    <SymbolView
                      name="tshirt"
                      size={24}
                      tintColor={
                        uploadMode ===
                        "single"
                          ? "#ffffff"
                          : "#745a38"
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.modeTitle,
                      uploadMode ===
                        "single" &&
                        styles.modeTitleSelected,
                    ]}
                  >
                    Single Item
                  </Text>

                  <Text
                    style={[
                      styles.modeDescription,
                      uploadMode ===
                        "single" &&
                        styles.modeDescriptionSelected,
                    ]}
                  >
                    One clothing or accessory
                  </Text>
                </Pressable>

                {/* WHOLE OUTFIT */}

                <Pressable
                  onPress={() =>
                    selectUploadMode(
                      "outfit"
                    )
                  }
                  style={[
                    styles.modeCard,
                    uploadMode ===
                      "outfit" &&
                      styles.modeCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.modeIcon,
                      uploadMode ===
                        "outfit" &&
                        styles.modeIconSelected,
                    ]}
                  >
                    <SymbolView
                      name="person.crop.rectangle"
                      size={24}
                      tintColor={
                        uploadMode ===
                        "outfit"
                          ? "#ffffff"
                          : "#745a38"
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.modeTitle,
                      uploadMode ===
                        "outfit" &&
                        styles.modeTitleSelected,
                    ]}
                  >
                    Whole Outfit
                  </Text>

                  <Text
                    style={[
                      styles.modeDescription,
                      uploadMode ===
                        "outfit" &&
                        styles.modeDescriptionSelected,
                    ]}
                  >
                    Your complete look
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* DESCRIPTION */}

            <View
              style={styles.modeInfo}
            >
              <View
                style={styles.infoDot}
              />

              <Text
                style={styles.infoText}
              >
                {uploadMode ===
                "single"
                  ? "Upload a clear photo of one clothing item or accessory."
                  : "Upload a photo of yourself wearing your complete outfit. AI can later identify each item separately."}
              </Text>
            </View>

            {/* CAMERA / UPLOAD */}

            <View
              style={styles.actions}
            >
              <Pressable
                onPress={takePhoto}
                style={
                  styles.actionButton
                }
              >
                <SymbolView
                  name="camera.fill"
                  size={28}
                  tintColor="#ffffff"
                />

                <Text
                  style={
                    styles.actionTitle
                  }
                >
                  Take photo
                </Text>

                <Text
                  style={
                    styles.actionSubtitle
                  }
                >
                  Use camera
                </Text>
              </Pressable>

              <Pressable
                onPress={choosePhoto}
                style={
                  styles.uploadButton
                }
              >
                <SymbolView
                  name="photo.fill"
                  size={28}
                  tintColor="#745a38"
                />

                <Text
                  style={
                    styles.uploadTitle
                  }
                >
                  Upload photo
                </Text>

                <Text
                  style={
                    styles.uploadSubtitle
                  }
                >
                  Choose from gallery
                </Text>
              </Pressable>
            </View>

            {/* PREVIEW */}

            <View
              style={styles.preview}
            >
              {imageUri ? (
                <>
                  <Image
                    source={{
                      uri: imageUri,
                    }}
                    style={styles.image}
                    contentFit="contain"
                  />

                  <Pressable
                    onPress={
                      removePhoto
                    }
                    style={
                      styles.removePhotoButton
                    }
                  >
                    <SymbolView
                      name="xmark"
                      size={18}
                      tintColor="#ffffff"
                    />
                  </Pressable>
                </>
              ) : (
                <View
                  style={
                    styles.emptyPreview
                  }
                >
                  <SymbolView
                    name={
                      uploadMode ===
                      "single"
                        ? "tshirt"
                        : "person.crop.rectangle"
                    }
                    size={38}
                    tintColor="#9b9892"
                  />

                  <Text
                    style={
                      styles.emptyPreviewText
                    }
                  >
                    {uploadMode ===
                    "single"
                      ? "Your item preview will appear here"
                      : "Your outfit preview will appear here"}
                  </Text>
                </View>
              )}
            </View>

            {/* HOW TO PHOTOGRAPH */}

            {!imageUri && (
              <View
                style={
                  styles.howToCard
                }
              >
                <View
                  style={
                    styles.howToIcon
                  }
                >
                  <SymbolView
                    name="lightbulb.fill"
                    size={20}
                    tintColor="#745a38"
                  />
                </View>

                <View
                  style={
                    styles.howToContent
                  }
                >
                  <Text
                    style={
                      styles.howToTitle
                    }
                  >
                    {uploadMode ===
                    "single"
                      ? "For a single item"
                      : "For a whole outfit"}
                  </Text>

                  <Text
                    style={
                      styles.howToText
                    }
                  >
                    {uploadMode ===
                    "single"
                      ? "Place the item clearly in the frame and use good lighting. Avoid heavily cluttered backgrounds."
                      : "Take a clear full-body photo where your outfit is visible. Good lighting makes item detection easier."}
                  </Text>
                </View>
              </View>
            )}

            {/* DETAILS */}

            {imageUri && (
              <View
                style={styles.details}
              >
                <View
                  style={
                    styles.metricRow
                  }
                >
                  <View
                    style={
                      styles.metricDot
                    }
                  />

                  <Text
                    style={styles.metric}
                  >
                    {uploadMode ===
                    "single"
                      ? "SINGLE ITEM"
                      : "WHOLE OUTFIT"}
                  </Text>
                </View>

                <Text
                  style={
                    styles.detailsTitle
                  }
                >
                  Ready to analyze
                </Text>

                <Text
                  style={
                    styles.detailsText
                  }
                >
                  {uploadMode ===
                  "single"
                    ? "This photo will be treated as one wardrobe item."
                    : "This photo will be treated as a complete outfit. Later, your AI pipeline can extract individual pieces from it."}
                </Text>
              </View>
            )}

            {/* ANALYZE */}

            <Pressable
              onPress={
                analyzeGarment
              }
              disabled={
                !imageUri || analyzing
              }
              style={[
                styles.analyzeButton,
                (!imageUri ||
                  analyzing) &&
                  styles.analyzeButtonDisabled,
              ]}
            >
              {analyzing ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />

                  <Text
                    style={
                      styles.analyzeText
                    }
                  >
                    Analyzing...
                  </Text>
                </>
              ) : (
                <>
                  <SymbolView
                    name="sparkles"
                    size={18}
                    tintColor="#ffffff"
                  />

                  <Text
                    style={
                      styles.analyzeText
                    }
                  >
                    {uploadMode ===
                    "single"
                      ? "Analyze item"
                      : "Analyze outfit"}
                  </Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // =========================================================
  // MAIN CLOSET SCREEN
  // =========================================================

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={styles.safeArea}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View
              style={styles.headerTop}
            >
              <View>
                <Text
                  style={styles.kicker}
                >
                  STYLE SENSE
                </Text>

                <Text
                  style={styles.heading}
                >
                  My Wardrobe
                </Text>

                <Text
                  style={styles.description}
                >
                  Everything you wear, all
                  in one place.
                </Text>
              </View>

              <View
                style={styles.headerRight}
              >
                <View
                  style={
                    styles.headerWeather
                  }
                >
                  <Text
                    style={
                      styles.weatherText
                    }
                  >
                    {getCity()}
                  </Text>

                  <Text
                    style={
                      styles.weatherTemperature
                    }
                  >
                    {weatherLoading
                      ? "--°"
                      : getShortTemperature()}
                  </Text>
                </View>

                <Pressable
                  onPress={
                    openAddPiece
                  }
                  style={
                    styles.addHeaderButton
                  }
                >
                  <SymbolView
                    name="plus"
                    size={16}
                    tintColor="#ffffff"
                  />

                  <Text
                    style={
                      styles.addHeaderText
                    }
                  >
                    Add
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* METRICS */}

          <View
            style={styles.metricRow}
          >
            <View
              style={styles.metricDot}
            />

            <Text
              style={styles.metric}
            >
              {clothes.length} PIECES
            </Text>

            <Text
              style={styles.metricSeparator}
            >
              ·
            </Text>

            <Text
              style={styles.metric}
            >
              12 SAVED OUTFITS
            </Text>
          </View>

          {/* SEARCH */}

          <View
            style={styles.searchRow}
          >
            <View
              style={styles.searchBox}
            >
              <SymbolView
                name="magnifyingglass"
                size={18}
                tintColor="#747878"
              />

              <TextInput
                value={query}
                onChangeText={
                  setQuery
                }
                placeholder="Search your wardrobe"
                placeholderTextColor="#8c8984"
                style={
                  styles.searchInput
                }
              />
            </View>

            <Pressable
              style={
                styles.filterButton
              }
              onPress={() => {
                Alert.alert(
                  "Filters",
                  "Category filters are available below."
                );
              }}
            >
              <SymbolView
                name="slider.horizontal.3"
                size={19}
                tintColor="#444748"
              />
            </Pressable>
          </View>

          {/* CLOTHES / OUTFITS */}

          <View
            style={
              styles.segmentedControl
            }
          >
            <Pressable
              onPress={() =>
                setShowOutfits(false)
              }
              style={[
                styles.segment,
                !showOutfits &&
                  styles.segmentSelected,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  !showOutfits &&
                    styles.segmentTextSelected,
                ]}
              >
                Clothes
              </Text>

              <Text
                style={styles.count}
              >
                {
                  clothes.filter(
                    (item) =>
                      item.clothing_type !==
                      "outfit"
                  ).length
                }
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setShowOutfits(true)
              }
              style={[
                styles.segment,
                showOutfits &&
                  styles.segmentSelected,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  showOutfits &&
                    styles.segmentTextSelected,
                ]}
              >
                Outfits
              </Text>

              <Text
                style={styles.count}
              >
                {
                  clothes.filter(
                    (item) =>
                      item.clothing_type ===
                      "outfit"
                  ).length
                }
              </Text>
            </Pressable>
          </View>

          {/* CATEGORY CHIPS */}

          {!showOutfits && (
            <ScrollView
              horizontal
              style={styles.categoryScroll}
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.chips
              }
            >
              {categories.map(
                (category) => (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setSelectedCategory(
                        category
                      )
                    }
                    style={[
                      styles.chip,
                      selectedCategory ===
                        category &&
                        styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategory ===
                          category &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                )
              )}
            </ScrollView>
          )}

          {/* CONTENT */}

          {showOutfits ? (
            <View
              style={
                styles.outfitContent
              }
            >
              {clothes.filter(
                (item) =>
                  item.clothing_type ===
                  "outfit"
              ).length === 0 ? (
                <View
                  style={
                    styles.emptyState
                  }
                >
                  <SymbolView
                    name="person.crop.rectangle"
                    size={42}
                    tintColor="#aaa69f"
                  />

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    No saved outfits yet
                  </Text>

                  <Text
                    style={
                      styles.emptyBody
                    }
                  >
                    Upload a whole outfit
                    to start building
                    your outfit collection.
                  </Text>

                  <Pressable
                    onPress={
                      openAddPiece
                    }
                    style={
                      styles.emptyButton
                    }
                  >
                    <Text
                      style={
                        styles.emptyButtonText
                      }
                    >
                      Add an outfit
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View
                  style={styles.grid}
                >
                  {clothes
                    .filter(
                      (item) =>
                        item.clothing_type ===
                        "outfit"
                    )
                    .map(
                      (item) => (
                        <View
                          key={
                            item.id
                          }
                          style={
                            styles.card
                          }
                        >
                          <View
                            style={
                              styles.cardImage
                            }
                          >
                            {item.image_url ? (
                              <Image
                                source={{
                                  uri: item.image_url,
                                }}
                                style={
                                  styles.clothingImage
                                }
                                contentFit="contain"
                              />
                            ) : (
                              <SymbolView
                                name="person.crop.rectangle"
                                size={42}
                                tintColor="#aaa69f"
                              />
                            )}

                            <View
                              style={
                                styles.wornBadge
                              }
                            >
                              <Text
                                style={
                                  styles.wornText
                                }
                              >
                                OUTFIT
                              </Text>
                            </View>
                          </View>

                          <Text
                            style={
                              styles.cardTitle
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {item.subcategory ||
                              "New Outfit"}
                          </Text>

                          <Text
                            style={
                              styles.cardDetail
                            }
                            numberOfLines={
                              1
                            }
                          >
                            Complete look
                          </Text>
                        </View>
                      )
                    )}
                </View>
              )}
            </View>
          ) : clothes.length ===
            0 ? (
            <View
              style={styles.emptyState}
            >
              <SymbolView
                name="tshirt"
                size={42}
                tintColor="#aaa69f"
              />

              <Text
                style={styles.emptyTitle}
              >
                Your closet is empty
              </Text>

              <Text
                style={styles.emptyBody}
              >
                Add your first clothing
                item or upload a whole
                outfit to get started.
              </Text>

              <Pressable
                onPress={openAddPiece}
                style={
                  styles.emptyButton
                }
              >
                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Add your first piece
                </Text>
              </Pressable>
            </View>
          ) : visibleItems.length ===
            0 ? (
            <View
              style={styles.emptyState}
            >
              <SymbolView
                name="magnifyingglass"
                size={40}
                tintColor="#aaa69f"
              />

              <Text
                style={styles.emptyTitle}
              >
                Nothing found
              </Text>

              <Text
                style={styles.emptyBody}
              >
                Try another search or
                category.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {visibleItems
                .filter(
                  (item) =>
                    item.clothing_type !==
                    "outfit"
                )
                .map((item) => (
                  <View
                    key={item.id}
                    style={styles.card}
                  >
                    <View
                      style={
                        styles.cardImage
                      }
                    >
                      {item.image_url ? (
                        <Image
                          source={{
                            uri: item.image_url,
                          }}
                          style={
                            styles.clothingImage
                          }
                          contentFit="contain"
                        />
                      ) : (
                        <SymbolView
                          name="tshirt"
                          size={42}
                          tintColor="#aaa69f"
                        />
                      )}

                      <View
                        style={
                          styles.wornBadge
                        }
                      >
                        <Text
                          style={
                            styles.wornText
                          }
                        >
                          {item.color ||
                            "CLOTHING"}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={
                        styles.cardTitle
                      }
                      numberOfLines={1}
                    >
                      {item.subcategory ||
                        item.category ||
                        item.clothing_type ||
                        "Clothing"}
                    </Text>

                    <Text
                      style={
                        styles.cardDetail
                      }
                      numberOfLines={1}
                    >
                      {getCategoryLabel(
                        item
                      )}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          {/* WEATHER CARD */}

          <View
            style={styles.weatherCard}
          >
            <View
              style={styles.weatherIcon}
            >
              <SymbolView
                name={getWeatherIcon()}
                size={23}
                tintColor="#745a38"
              />
            </View>

            <View
              style={styles.weatherContent}
            >
              <Text
                style={
                  styles.weatherCardKicker
                }
              >
                FOR TODAY
              </Text>

              <Text
                style={
                  styles.weatherCardTitle
                }
              >
                {weatherLoading
                  ? "Loading weather..."
                  : `${getTemperature()} · ${getWeatherCondition()}`}
              </Text>

              <Text
                style={
                  styles.weatherCardText
                }
              >
                {weatherLoading
                  ? "Getting your current weather conditions..."
                  : getWeatherAdvice()}
              </Text>
            </View>

            <SymbolView
              name="chevron.right"
              size={18}
              tintColor="#9b9892"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbf9f6",
  },

  safeArea: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#fbf9f6",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom:
      BottomTabInset + 32,
    gap: Spacing.two,
  },

  addItemContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop:Spacing.three,
    paddingBottom:BottomTabInset + 100,
      gap:Spacing.two,
  },

  header: {
    gap: 5,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
  },

  headerRight: {
    alignItems: "flex-end",
    gap: 10,
  },

  headerWeather: {
    alignItems: "flex-end",
    gap: 2,
  },

  weatherText: {
    color: "#747878",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    maxWidth: 100,
  },

  weatherTemperature: {
    color: "#745a38",
    fontFamily: Fonts.serif,
    fontSize: 18,
  },

  kicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#745a38",
  },

  heading: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "500",
    color: "#1b1c1a",
    marginTop: 4,
  },

  description: {
    fontSize: 14,
    color: "#747878",
    marginTop: 2,
  },

  addHeaderButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#1b1c1a",
  },

  addHeaderText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },

  backText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444748",
  },

  uploadSection: {
    gap: 5,
    paddingTop: 4,
  },

  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: "#1b1c1a",
  },

  sectionDescription: {
    fontSize: 13,
    color: "#747878",
    marginBottom: 10,
  },

  modeRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  modeCard: {
    flex: 1,
    minHeight: 150,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#efeeeb",
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
  },

  modeCardSelected: {
    backgroundColor: "#1b1c1a",
    borderColor: "#1b1c1a",
  },

  modeIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fedaae",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  modeIconSelected: {
    backgroundColor: "#745a38",
  },

  modeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1b1c1a",
    marginBottom: 4,
  },

  modeTitleSelected: {
    color: "#ffffff",
  },

  modeDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: "#747878",
  },

  modeDescriptionSelected: {
    color: "#d4d1ca",
  },

  modeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#f5f3f0",
  },

  infoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#745a38",
    marginTop: 5,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#747878",
  },

  actions: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  actionButton: {
    flex: 1,
    minHeight: 122,
    borderRadius: 12,
    backgroundColor: "#1b1c1a",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  uploadButton: {
    flex: 1,
    minHeight: 122,
    borderRadius: 12,
    backgroundColor: "#f5f3f0",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  actionTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  actionSubtitle: {
    color: "#bcbab5",
    fontSize: 11,
  },

  uploadTitle: {
    color: "#1b1c1a",
    fontSize: 14,
    fontWeight: "700",
  },

  uploadSubtitle: {
    color: "#747878",
    fontSize: 11,
  },

  preview: {
    width: "100%",
    aspectRatio: 1.05,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#dededb",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  removePhotoButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      "rgba(27,28,26,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 30,
  },

  emptyPreviewText: {
    fontSize: 13,
    color: "#8c8984",
    textAlign: "center",
  },

  howToCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#efeeeb",
  },

  howToIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fedaae",
    alignItems: "center",
    justifyContent: "center",
  },

  howToContent: {
    flex: 1,
  },

  howToTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1b1c1a",
    marginBottom: 4,
  },

  howToText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#747878",
  },

  details: {
    gap: 8,
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: "#efeeeb",
  },

  detailsTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: "#1b1c1a",
  },

  detailsText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#747878",
  },

  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#745a38",
  },

  metric: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#745a38",
  },

  metricSeparator: {
    color: "#aaa69f",
    fontSize: 12,
  },

  analyzeButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: "#1b1c1a",
  },

  analyzeButtonDisabled: {
    opacity: 0.6,
  },

  analyzeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },

  searchRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },

  searchBox: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: "#f0eeea",
    borderRadius: 12,
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: "#1b1c1a",
  },

  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f0eeea",
    alignItems: "center",
    justifyContent: "center",
  },

  segmentedControl: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: "#efeeeb",
    borderRadius: 12,
    marginTop: Spacing.one,
  },

  segment: {
    flex: 1,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 9,
  },

  segmentSelected: {
    backgroundColor: "#ffffff",
  },

  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#747878",
  },

  segmentTextSelected: {
    color: "#1b1c1a",
  },

  count: {
    fontSize: 10,
    color: "#747878",
    backgroundColor: "#e4e2df",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
  },

  chips: {
    gap: 8,
    paddingVertical: 6,
  },

  categoryScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },

  chip: {
    height: 34,
    paddingHorizontal: 15,
    borderRadius: 17,
    backgroundColor: "#efeeeb",
    alignItems: "center",
    justifyContent: "center",
  },

  chipSelected: {
    backgroundColor: "#1b1c1a",
  },

  chipText: {
    fontSize: 13,
    color: "#444748",
  },

  chipTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 22,
    paddingTop: 4,
  },

  card: {
    width: "48.2%",
  },

  cardImage: {
    aspectRatio: 0.78,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#dededb",
  },

  clothingImage: {
    width: "100%",
    height: "100%",
  },

  wornBadge: {
    position: "absolute",
    top: 9,
    right: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor:
      "rgba(255,255,255,0.88)",
  },

  wornText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#745a38",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1b1c1a",
    marginTop: 8,
  },

  cardDetail: {
    fontSize: 12,
    color: "#747878",
    marginTop: 2,
  },

  outfitContent: {
    flex: 1,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    gap: 10,
  },

  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: "#1b1c1a",
    textAlign: "center",
  },

  emptyBody: {
    fontSize: 14,
    color: "#747878",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 20,
  },

  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1b1c1a",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  // =======================================================
  // WEATHER CARD
  // =======================================================

  weatherCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#f0eeea",
    marginTop: 8,
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
});