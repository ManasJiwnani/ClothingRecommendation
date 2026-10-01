import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";

const STEPS = 6;

type Preferences = {
  styles: string[];
  colorPalette: string[];
  bodyType: string;
  skinTone: string;
  gender: string;
  height: string;
  weight: string;
  patterns: string[];
};

const STYLE_OPTIONS = [
  {
    id: "old_money",
    title: "Old Money",
    subtitle: "Timeless & refined",
  },
  {
    id: "minimalist_scandi",
    title: "Minimalist Scandi",
    subtitle: "Clean & effortless",
  },
  {
    id: "parisian_chic",
    title: "Parisian Chic",
    subtitle: "Elegant & relaxed",
  },
  {
    id: "elevated_utility",
    title: "Elevated Utility",
    subtitle: "Functional & modern",
  },
  {
    id: "streetwear",
    title: "Modern Streetwear",
    subtitle: "Bold & relaxed",
  },
  {
    id: "feminine",
    title: "Feminine",
    subtitle: "Soft & polished",
  },
];

const COLOR_OPTIONS = [
  {
    id: "warm_neutrals",
    title: "Warm Neutrals",
    colors: ["#C9B6A0", "#A88F7A", "#806D5C"],
  },
  {
    id: "monochrome",
    title: "Monochrome",
    colors: ["#171717", "#777777", "#E5E5E5"],
  },
  {
    id: "earth_olive",
    title: "Earth & Olive",
    colors: ["#81755B", "#8B8061", "#B0A486"],
  },
  {
    id: "soft_pastels",
    title: "Soft Pastels",
    colors: ["#DCCED1", "#C5D0D4", "#E8DCC7"],
  },
  {
    id: "jewel_tones",
    title: "Jewel Tones",
    colors: ["#722F37", "#315B5A", "#4C4268"],
  },
  {
    id: "coastal_navy",
    title: "Coastal Navy",
    colors: ["#1E354A", "#577387", "#D8D6CC"],
  },
];

const BODY_OPTIONS = [
  {
    id: "inverted_triangle",
    title: "Inverted Triangle",
    subtitle: "Athletic",
  },
  {
    id: "rectangle",
    title: "Rectangle",
    subtitle: "Slender",
  },
  {
    id: "hourglass",
    title: "Hourglass",
    subtitle: "Balanced curves",
  },
  {
    id: "oval",
    title: "Oval",
    subtitle: "Soft curve",
  },
  {
    id: "pear",
    title: "Pear",
    subtitle: "Bottom balanced",
  },
  {
    id: "apple",
    title: "Apple",
    subtitle: "Fuller middle",
  },
];

const SKIN_OPTIONS = [
  {
    id: "fair_cool",
    title: "Fair / Cool",
    subtitle: "Rosy",
    color: "#E9C8B9",
  },
  {
    id: "fair_warm",
    title: "Fair / Warm",
    subtitle: "Peachy",
    color: "#E4B49D",
  },
  {
    id: "medium_olive",
    title: "Medium / Olive",
    subtitle: "Neutral",
    color: "#B98C6C",
  },
  {
    id: "medium_warm",
    title: "Medium / Warm",
    subtitle: "Honey",
    color: "#A87450",
  },
  {
    id: "deep_warm",
    title: "Deep / Warm",
    subtitle: "Chestnut",
    color: "#74452F",
  },
  {
    id: "deep_cool",
    title: "Deep / Cool",
    subtitle: "Espresso",
    color: "#49362F",
  },
];

const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Non-binary",
  "Prefer not to say",
];

const PATTERN_OPTIONS = [
  "Solids",
  "Stripes",
  "Checks",
  "Florals",
  "Polka Dots",
  "Abstract",
  "Animal Print",
  "Prints",
];

export default function PreferencesScreen() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState<Preferences>({
    styles: [],
    colorPalette: [],
    bodyType: "",
    skinTone: "",
    gender: "",
    height: "",
    weight: "",
    patterns: [],
  });

  // =====================================================
  // MULTI SELECT
  // =====================================================

  const toggleArrayValue = (
    field: "styles" | "colorPalette" | "patterns",
    value: string
  ) => {
    setPreferences((prev) => {
      const current = prev[field];

      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  // =====================================================
  // NEXT / CONTINUE
  // =====================================================

  const handleContinue = async () => {
    if (step < STEPS) {
      setStep(step + 1);
      return;
    }

    await savePreferences();
  };

  // =====================================================
  // SKIP
  // =====================================================

  const handleSkip = async () => {
    if (step < STEPS) {
      setStep(step + 1);
      return;
    }

    await savePreferences();
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }

    setStep(step - 1);
  };

  // =====================================================
  // SAVE TO SUPABASE
  // =====================================================

  const savePreferences = async () => {
    try {
      setSaving(true);

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

      const { error } = await supabase
        .from("user_preferences")
        .upsert(
          {
            id: user.id,

            gender: preferences.gender || null,

            skin_tone: preferences.skinTone || null,

            height: preferences.height
              ? Number(preferences.height)
              : null,

            weight: preferences.weight
              ? Number(preferences.weight)
              : null,

            body_type: preferences.bodyType || null,

            style_preferences:
              preferences.styles.length > 0
                ? preferences.styles
                : null,

            color_palette:
              preferences.colorPalette.length > 0
                ? preferences.colorPalette
                : null,

            pattern_preferences:
              preferences.patterns.length > 0
                ? preferences.patterns
                : null,

            onboarding_completed: true,
          },
          {
            onConflict: "id",
          }
        );

      if (error) {
        console.error(
          "SAVE PREFERENCES ERROR:",
          error
        );

        Alert.alert(
          "Unable to save",
          error.message
        );

        return;
      }

      console.log("PREFERENCES SAVED");

      router.replace("/tabs" as any);
    } catch (error: any) {
      console.error(
        "SAVE PREFERENCES ERROR:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
          "Unable to save your preferences."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // HEADER
  // =====================================================

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          disabled={saving}
        >
          <Text style={styles.skipText}>
            SKIP
          </Text>
        </Pressable>

        <View style={styles.profileCircle}>
          <Text style={styles.profileIcon}>
            ♙
          </Text>
        </View>
      </View>
    );
  };

  // =====================================================
  // PROGRESS
  // =====================================================

  const renderProgress = (label: string) => {
    return (
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          STEP {step} OF {STEPS} • {label}
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(step / STEPS) * 100}%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  // =====================================================
  // STYLE SCREEN
  // =====================================================

  const renderStyleStep = () => {
    return (
      <>
        {renderProgress("STYLE ARCHETYPE")}

        <Text style={styles.title}>
          What styles do you prefer?
        </Text>

        <Text style={styles.subtitle}>
          Select one or more aesthetic
          silhouettes.
        </Text>

        <View style={styles.selectedInfo}>
          <Text style={styles.selectedLabel}>
            ✦ CURATED PREFERENCES
          </Text>

          <Text style={styles.selectedCount}>
            {preferences.styles.length} selected
          </Text>
        </View>

        <View style={styles.grid}>
          {STYLE_OPTIONS.map((item, index) => {
            const selected =
              preferences.styles.includes(item.id);

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  toggleArrayValue(
                    "styles",
                    item.id
                  )
                }
                style={[
                  styles.styleCard,
                  selected &&
                    styles.selectedDarkCard,
                ]}
              >
                <View
                  style={[
                    styles.cardImagePlaceholder,
                    selected &&
                      styles.darkPlaceholder,
                  ]}
                >
                  <Text
                    style={[
                      styles.cardNumber,
                      selected &&
                        styles.whiteText,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>

                {selected && (
                  <View
                    style={styles.checkCircle}
                  >
                    <Text style={styles.checkText}>
                      ✓
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.cardTitle,
                    selected &&
                      styles.whiteText,
                  ]}
                >
                  {item.title}
                </Text>

                <Text
                  style={[
                    styles.cardSubtitle,
                    selected &&
                      styles.selectedSubText,
                  ]}
                >
                  {item.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  };

  // =====================================================
  // COLOR SCREEN
  // =====================================================

  const renderColorStep = () => {
    return (
      <>
        {renderProgress("COLOR PALETTE")}

        <Text style={styles.title}>
          What colors do you prefer?
        </Text>

        <Text style={styles.subtitle}>
          Choose your signature wardrobe
          palette.
        </Text>

        <View style={styles.grid}>
          {COLOR_OPTIONS.map((item) => {
            const selected =
              preferences.colorPalette.includes(
                item.id
              );

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  toggleArrayValue(
                    "colorPalette",
                    item.id
                  )
                }
                style={[
                  styles.colorCard,
                  selected &&
                    styles.selectedColorCard,
                ]}
              >
                <View style={styles.swatches}>
                  {item.colors.map(
                    (color, index) => (
                      <View
                        key={index}
                        style={[
                          styles.swatch,
                          {
                            backgroundColor:
                              color,
                          },
                        ]}
                      />
                    )
                  )}
                </View>

                {selected && (
                  <View
                    style={styles.checkCircle}
                  >
                    <Text style={styles.checkText}>
                      ✓
                    </Text>
                  </View>
                )}

                <Text style={styles.colorTitle}>
                  {item.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomHint}>
          <Text style={styles.sparkle}>✦</Text>

          <Text style={styles.hintText}>
            {preferences.colorPalette.length}{" "}
            palette
            {preferences.colorPalette.length !==
            1
              ? "s"
              : ""}{" "}
            selected for your capsule
          </Text>
        </View>
      </>
    );
  };

  // =====================================================
  // BODY TYPE
  // =====================================================

  const renderBodyStep = () => {
    return (
      <>
        {renderProgress("BODY SILHOUETTE")}

        <Text style={styles.title}>
          What is your body type?
        </Text>

        <Text style={styles.subtitle}>
          Calibrates drape, hemlines, and
          tailoring.
        </Text>

        <View style={styles.grid}>
          {BODY_OPTIONS.map((item) => {
            const selected =
              preferences.bodyType === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    bodyType: item.id,
                  }))
                }
                style={[
                  styles.bodyCard,
                  selected &&
                    styles.selectedDarkCard,
                ]}
              >
                <View
                  style={[
                    styles.bodyIconBox,
                    selected &&
                      styles.darkPlaceholder,
                  ]}
                >
                  <Text
                    style={[
                      styles.bodySymbol,
                      selected &&
                        styles.whiteText,
                    ]}
                  >
                    ◇
                  </Text>
                </View>

                {selected && (
                  <View
                    style={styles.checkCircle}
                  >
                    <Text style={styles.checkText}>
                      ✓
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.cardTitle,
                    selected &&
                      styles.whiteText,
                  ]}
                >
                  {item.title}
                </Text>

                <Text
                  style={[
                    styles.cardSubtitle,
                    selected &&
                      styles.selectedSubText,
                  ]}
                >
                  {item.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  };

  // =====================================================
  // SKIN TONE
  // =====================================================

  const renderSkinStep = () => {
    return (
      <>
        {renderProgress("SKIN UNDERTONE")}

        <Text style={styles.title}>
          What is your skin tone?
        </Text>

        <Text style={styles.subtitle}>
          Optimizes flattering color harmony
          and contrast.
        </Text>

        <View style={styles.skinGrid}>
          {SKIN_OPTIONS.map((item) => {
            const selected =
              preferences.skinTone === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    skinTone: item.id,
                  }))
                }
                style={[
                  styles.skinCard,
                  selected &&
                    styles.selectedSkinCard,
                ]}
              >
                <View
                  style={[
                    styles.skinCircle,
                    {
                      backgroundColor:
                        item.color,
                    },
                  ]}
                />

                {selected && (
                  <View
                    style={styles.skinCheck}
                  >
                    <Text style={styles.checkText}>
                      ✓
                    </Text>
                  </View>
                )}

                <Text style={styles.skinTitle}>
                  {item.title}
                </Text>

                <Text
                  style={styles.skinSubtitle}
                >
                  {item.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  };

  // =====================================================
  // BODY MEASUREMENTS
  // =====================================================

  const renderMeasurementsStep = () => {
    return (
      <>
        {renderProgress("YOUR PROFILE")}

        <Text style={styles.title}>
          Tell us about you
        </Text>

        <Text style={styles.subtitle}>
          These help us recommend better
          proportions and fits.
        </Text>

        <Text style={styles.inputLabel}>
          GENDER
        </Text>

        <View style={styles.genderGrid}>
          {GENDER_OPTIONS.map((gender) => {
            const selected =
              preferences.gender === gender;

            return (
              <Pressable
                key={gender}
                onPress={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    gender,
                  }))
                }
                style={[
                  styles.genderButton,
                  selected &&
                    styles.genderSelected,
                ]}
              >
                <Text
                  style={[
                    styles.genderText,
                    selected &&
                      styles.genderSelectedText,
                  ]}
                >
                  {gender}
                </Text>

                {selected && (
                  <Text
                    style={styles.smallCheck}
                  >
                    ✓
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>
          HEIGHT
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.measureInput}
            placeholder="e.g. 165"
            keyboardType="numeric"
            value={preferences.height}
            onChangeText={(value) =>
              setPreferences((prev) => ({
                ...prev,
                height: value,
              }))
            }
          />

          <View style={styles.unitBox}>
            <Text style={styles.unitText}>
              cm
            </Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>
          WEIGHT
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.measureInput}
            placeholder="e.g. 55"
            keyboardType="numeric"
            value={preferences.weight}
            onChangeText={(value) =>
              setPreferences((prev) => ({
                ...prev,
                weight: value,
              }))
            }
          />

          <View style={styles.unitBox}>
            <Text style={styles.unitText}>
              kg
            </Text>
          </View>
        </View>
      </>
    );
  };

  // =====================================================
  // PATTERNS
  // =====================================================

  const renderPatternStep = () => {
    return (
      <>
        {renderProgress("PATTERN PREFERENCE")}

        <Text style={styles.title}>
          Which patterns do you like?
        </Text>

        <Text style={styles.subtitle}>
          Tell us what you would love to see
          in your wardrobe.
        </Text>

        <View style={styles.patternGrid}>
          {PATTERN_OPTIONS.map((pattern) => {
            const selected =
              preferences.patterns.includes(
                pattern
              );

            return (
              <Pressable
                key={pattern}
                onPress={() =>
                  toggleArrayValue(
                    "patterns",
                    pattern
                  )
                }
                style={[
                  styles.patternCard,
                  selected &&
                    styles.patternSelected,
                ]}
              >
                <View
                  style={[
                    styles.patternPreview,
                    selected &&
                      styles.patternPreviewSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.patternSymbol,
                      selected &&
                        styles.whiteText,
                    ]}
                  >
                    {pattern === "Solids"
                      ? "●"
                      : pattern === "Stripes"
                      ? "|||"
                      : pattern === "Checks"
                      ? "▦"
                      : pattern === "Florals"
                      ? "✿"
                      : pattern ===
                        "Polka Dots"
                      ? "•••"
                      : pattern ===
                        "Animal Print"
                      ? "♢"
                      : "✦"}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.patternText,
                    selected &&
                      styles.whiteText,
                  ]}
                >
                  {pattern}
                </Text>

                {selected && (
                  <View
                    style={styles.patternCheck}
                  >
                    <Text style={styles.checkText}>
                      ✓
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomHint}>
          <Text style={styles.sparkle}>✦</Text>

          <Text style={styles.hintText}>
            {preferences.patterns.length}{" "}
            pattern
            {preferences.patterns.length !==
            1
              ? "s"
              : ""}{" "}
            selected
          </Text>
        </View>
      </>
    );
  };

  // =====================================================
  // CONTENT
  // =====================================================

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderStyleStep();

      case 2:
        return renderColorStep();

      case 3:
        return renderBodyStep();

      case 4:
        return renderSkinStep();

      case 5:
        return renderMeasurementsStep();

      case 6:
        return renderPatternStep();

      default:
        return null;
    }
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}

          <Pressable
            style={[
              styles.continueButton,
              saving &&
                styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={saving}
          >
            <Text style={styles.continueText}>
              {saving
                ? "SAVING..."
                : step === STEPS
                ? "COMPLETE PROFILE"
                : "CONTINUE"}
            </Text>

            {!saving && step < STEPS && (
              <Text style={styles.continueArrow}>
                →
              </Text>
            )}
          </Pressable>

          <View style={styles.stepDots}>
            {Array.from({
              length: STEPS,
            }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index + 1 === step &&
                    styles.activeDot,
                ]}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F6F1",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8F6F1",
  },

  header: {
    height: 62,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },

  backArrow: {
    fontSize: 30,
    color: "#222",
    fontWeight: "300",
  },

  skipText: {
    position: "absolute",
    right: 65,
    top: 25,
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#777",
    fontWeight: "600",
  },

  profileCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  profileIcon: {
    color: "#fff",
    fontSize: 16,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 35,
  },

  progressSection: {
    marginTop: 8,
    marginBottom: 27,
  },

  progressText: {
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: "700",
    color: "#777",
    marginBottom: 9,
  },

  progressTrack: {
    height: 2,
    backgroundColor: "#DDD9D1",
    width: "100%",
  },

  progressFill: {
    height: 2,
    backgroundColor: "#111",
  },

  title: {
    fontFamily: "serif",
    fontSize: 27,
    lineHeight: 34,
    color: "#171717",
    textAlign: "center",
    marginBottom: 9,
  },

  subtitle: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 23,
  },

  selectedInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  selectedLabel: {
    fontSize: 9,
    letterSpacing: 1,
    color: "#888",
    fontWeight: "700",
  },

  selectedCount: {
    fontSize: 10,
    color: "#777",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  styleCard: {
    width: "48%",
    minHeight: 190,
    backgroundColor: "#EFEEE9",
    borderRadius: 12,
    marginBottom: 14,
    overflow: "hidden",
    paddingBottom: 13,
    position: "relative",
    borderWidth: 1,
    borderColor: "#E4E1DA",
  },

  selectedDarkCard: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  cardImagePlaceholder: {
    height: 116,
    backgroundColor: "#DDD9D1",
    justifyContent: "center",
    alignItems: "center",
  },

  darkPlaceholder: {
    backgroundColor: "#222",
  },

  cardNumber: {
    fontSize: 22,
    color: "#999",
    fontWeight: "300",
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#222",
    marginTop: 11,
    marginHorizontal: 12,
  },

  cardSubtitle: {
    fontSize: 9,
    color: "#888",
    marginTop: 4,
    marginHorizontal: 12,
  },

  selectedSubText: {
    color: "#AAA",
  },

  whiteText: {
    color: "#FFF",
  },

  checkCircle: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  checkText: {
    color: "#111",
    fontSize: 12,
    fontWeight: "700",
  },

  colorCard: {
    width: "48%",
    minHeight: 125,
    backgroundColor: "#F0EEE9",
    borderRadius: 12,
    marginBottom: 14,
    padding: 15,
    position: "relative",
    borderWidth: 1,
    borderColor: "#E3E0D8",
  },

  selectedColorCard: {
    borderColor: "#111",
    borderWidth: 1.5,
  },

  swatches: {
    flexDirection: "row",
    marginBottom: 17,
    height: 25,
    alignItems: "center",
  },

  swatch: {
    width: 27,
    height: 27,
    borderRadius: 14,
    marginRight: -4,
    borderWidth: 1,
    borderColor: "#EEE",
  },

  colorTitle: {
    fontSize: 11,
    color: "#333",
    fontWeight: "500",
  },

  bottomHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 17,
  },

  sparkle: {
    fontSize: 15,
    marginRight: 7,
  },

  hintText: {
    fontSize: 10,
    color: "#777",
  },

  bodyCard: {
    width: "48%",
    minHeight: 160,
    backgroundColor: "#EFEEE9",
    borderRadius: 12,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E2DED6",
  },

  bodyIconBox: {
    width: 72,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 9,
  },

  bodySymbol: {
    fontSize: 48,
    color: "#555",
    fontWeight: "200",
  },

  skinGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  skinCard: {
    width: "31%",
    alignItems: "center",
    marginBottom: 25,
    position: "relative",
  },

  selectedSkinCard: {
    opacity: 1,
  },

  skinCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "#EEE8DF",
    marginBottom: 9,
  },

  skinCheck: {
    position: "absolute",
    right: 4,
    top: -2,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  skinTitle: {
    fontSize: 10,
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
  },

  skinSubtitle: {
    fontSize: 9,
    color: "#888",
    marginTop: 2,
  },

  inputLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#777",
    marginTop: 13,
    marginBottom: 9,
  },

  genderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  genderButton: {
    width: "48%",
    minHeight: 48,
    backgroundColor: "#EFEEE9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD9D1",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  genderSelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  genderText: {
    color: "#444",
    fontSize: 11,
  },

  genderSelectedText: {
    color: "#FFF",
  },

  smallCheck: {
    position: "absolute",
    right: 12,
    color: "#FFF",
    fontWeight: "700",
  },

  inputRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 3,
  },

  measureInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#EFEEE9",
    borderWidth: 1,
    borderColor: "#DDD9D1",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 13,
    color: "#222",
  },

  unitBox: {
    width: 62,
    height: 50,
    marginLeft: 8,
    backgroundColor: "#E9E6DE",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  unitText: {
    fontSize: 11,
    color: "#555",
  },

  patternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  patternCard: {
    width: "48%",
    height: 110,
    backgroundColor: "#EFEEE9",
    borderRadius: 12,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E0DDD6",
    padding: 13,
    justifyContent: "space-between",
    position: "relative",
  },

  patternSelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  patternPreview: {
    height: 55,
    backgroundColor: "#E4E1DA",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  patternPreviewSelected: {
    backgroundColor: "#222",
  },

  patternSymbol: {
    fontSize: 22,
    color: "#777",
    letterSpacing: 3,
  },

  patternText: {
    fontSize: 11,
    color: "#333",
    fontWeight: "600",
  },

  patternCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  continueButton: {
    width: "100%",
    height: 53,
    backgroundColor: "#111",
    borderRadius: 11,
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.55,
  },

  continueText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  continueArrow: {
    color: "#FFF",
    fontSize: 17,
    marginLeft: 8,
  },

  stepDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D0CCC4",
    marginHorizontal: 3,
  },

  activeDot: {
    width: 18,
    backgroundColor: "#111",
  },
});