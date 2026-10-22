import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getCurrentCoordinates } from '../../services/location';
import { embedFashionQuery } from '../../services/ai-stylist';
import {
  getLayerRecommendations,
  getLikedOutfits,
  getRecommendations,
  likeOutfit,
  swapOutfitItem,
  unlikeOutfit,
} from '../../services/recommendation';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { SymbolView } from 'expo-symbols';
import { aiApiFetch } from '../../lib/api';

// =========================================================
// ASSETS
// =========================================================

const WOMAN_IMAGE = require('../../assets/woman.png');

// =========================================================
// TYPES
// =========================================================

type ClothingItem = {
  id: string;
  name: string;
  category: string;
  image: any;
  raw: Record<string, unknown>;
};

type Outfit = {
  id: string;
  title: string;
  occasion: string;
  vibe: string;
  top: ClothingItem;
  bottom?: ClothingItem;
  footwear?: ClothingItem;
  savedOutfitId?: string;
  raw: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toClothingItem(value: unknown): ClothingItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.id;
  const imageUrl = value.image_url;
  const name =
    [value.color, value.subcategory || value.category]
      .filter((part): part is string => typeof part === 'string' && !!part)
      .join(' ') || 'Closet item';

  return {
    id: id === undefined || id === null ? name : String(id),
    name,
    category: typeof value.category === 'string' ? value.category : 'clothing',
    image: typeof imageUrl === 'string' && imageUrl ? { uri: imageUrl } : null,
    raw: value,
  };
}

function toOutfit(value: unknown): Outfit | null {
  if (!isRecord(value)) {
    return null;
  }

  const storedOutfit = isRecord(value.outfit) ? value.outfit : value;
  const raw = isRecord(storedOutfit.outfit)
    ? storedOutfit.outfit
    : storedOutfit;
  const top = toClothingItem(raw.top || raw.dress);
  const bottom = toClothingItem(raw.bottom);
  const footwear = toClothingItem(raw.footwear);

  if (!top) {
    return null;
  }

  const title =
    typeof storedOutfit.title === 'string'
      ? storedOutfit.title
      : [top.name, bottom?.name, footwear?.name]
          .filter(Boolean)
          .join(' + ');

  return {
    id: `${top.id}-${bottom?.id || 'single'}-${footwear?.id || 'no-footwear'}`,
    title,
    occasion:
      typeof storedOutfit.occasion === 'string'
        ? storedOutfit.occasion
        : 'Personalized',
    vibe:
      typeof storedOutfit.vibe === 'string'
        ? storedOutfit.vibe
        : 'AI curated',
    top,
    bottom: bottom || undefined,
    footwear: footwear || undefined,
    savedOutfitId:
      typeof value.id === 'string' || typeof value.id === 'number'
        ? String(value.id)
        : undefined,
    raw: {
      title,
      occasion:
        typeof storedOutfit.occasion === 'string'
          ? storedOutfit.occasion
          : 'Personalized',
      vibe:
        typeof storedOutfit.vibe === 'string'
          ? storedOutfit.vibe
          : 'AI curated',
      outfit: raw,
    },
  };
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function MirrorScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const outfitCardWidth = Math.max(0, screenWidth - 40);

  // =======================================================
  // FLOW STATE
  // =======================================================

  const [hasPrompt, setHasPrompt] = useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [command, setCommand] =
    useState('');

  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [weatherNotice, setWeatherNotice] = useState<string | null>(null);

  const [layerOptions, setLayerOptions] = useState<ClothingItem[]>([]);
  const [swapOptions, setSwapOptions] = useState<ClothingItem[]>([]);
  const [swapCategory, setSwapCategory] = useState<string | null>(null);

  const [isLoadingLayers, setIsLoadingLayers] = useState(false);
  const [isLoadingSwaps, setIsLoadingSwaps] = useState(false);

  // =======================================================
  // CAROUSEL
  // =======================================================

  const [currentOutfitIndex, setCurrentOutfitIndex] =
    useState(0);

  // =======================================================
  // LIKED OUTFITS
  // =======================================================

  const [likedOutfits, setLikedOutfits] =
    useState<Outfit[]>([]);

  // =======================================================
  // LIKED LOOK SCREEN
  // =======================================================

  const [showLikedLooks, setShowLikedLooks] =
    useState(false);

  // =======================================================
  // SELECTED OUTFIT
  // =======================================================

  const [selectedOutfit, setSelectedOutfit] =
    useState<Outfit | null>(null);

  // =======================================================
  // SELECTED CLOTHING
  // =======================================================

  const [selectedTop, setSelectedTop] =
    useState<ClothingItem | null>(null);

  const [selectedBottom, setSelectedBottom] =
    useState<ClothingItem | null>(null);

  const [additionalLayer, setAdditionalLayer] =
    useState<ClothingItem | null>(null);

  // =======================================================
  // TRY-ON STATE
  // =======================================================

  const [showTryOn, setShowTryOn] =
    useState(false);

  const [isTryingOn, setIsTryingOn] =
    useState(false);

  const [tryOnResult, setTryOnResult] =
    useState<string | null>(null);

  const [tryOnError, setTryOnError] =
    useState<string | null>(null);

  const tryOnRequestId = useRef(0);

  // =======================================================
  // ADD LAYER
  // =======================================================

  const [showLayerOptions, setShowLayerOptions] =
    useState(false);

  // =======================================================
  // CURRENT OUTFIT
  // =======================================================

  const currentOutfit = outfits[currentOutfitIndex];

  const generateVirtualTryOn = async (
    top: ClothingItem | null,
    bottom: ClothingItem | null,
    footwear: ClothingItem | null
  ) => {
    const requestId = ++tryOnRequestId.current;
    const imageUrl = (item: ClothingItem | null) =>
      item &&
      isRecord(item.image) &&
      typeof item.image.uri === 'string'
        ? item.image.uri
        : null;
    const topUrl = imageUrl(top);
    const bottomUrl = imageUrl(bottom);
    const footwearUrl = imageUrl(footwear);

    if (!topUrl && !bottomUrl && !footwearUrl) {
      setTryOnResult(null);
      setTryOnError('This outfit has no available clothing images to try on.');
      setIsTryingOn(false);
      return;
    }

    setIsTryingOn(true);
    setTryOnResult(null);
    setTryOnError(null);

    try {
      const response = await aiApiFetch<{ image_url: string }>(
        '/virtual-try-on',
        {
          method: 'POST',
          body: JSON.stringify({
            top: topUrl,
            bottom: bottomUrl,
            shoes: footwearUrl,
          }),
        }
      );

      if (requestId !== tryOnRequestId.current) {
        return;
      }

      if (!response.image_url) {
        throw new Error('The virtual try-on service returned no image.');
      }

      setTryOnResult(response.image_url);
    } catch (error) {
      if (requestId !== tryOnRequestId.current) {
        return;
      }

      console.error('Failed to create virtual try-on:', error);
      setTryOnError(
        error instanceof Error
          ? error.message
          : 'Could not create the virtual try-on. Please try again.'
      );
    } finally {
      if (requestId === tryOnRequestId.current) {
        setIsTryingOn(false);
      }
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadLikedOutfits = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }
        if (!user) {
          return;
        }

        const response = await getLikedOutfits(user.id);
        if (isActive) {
          setLikedOutfits(
            response.outfits
              .map((outfit) => toOutfit(outfit))
              .filter((outfit): outfit is Outfit => outfit !== null)
          );
        }
      } catch (error) {
        console.error('Failed to load saved outfits:', error);
        if (isActive) {
          Alert.alert(
            'Could not load saved looks',
            error instanceof Error ? error.message : 'Please try again.'
          );
        }
      }
    };

    void loadLikedOutfits();
    return () => {
      isActive = false;
    };
  }, []);

  // =======================================================
  // PROMPT
  // =======================================================

  const handleCommand = async () => {

    const trimmedCommand =
      command.trim();

    if (
      !trimmedCommand ||
      isGenerating
    ) {
      return;
    }

    // Reset recommendation flow
    setCurrentOutfitIndex(0);
    setOutfits([]);
    setWeatherNotice(null);

    setSelectedOutfit(null);

    setSelectedTop(null);

    setSelectedBottom(null);

    setAdditionalLayer(null);

    setShowLikedLooks(false);

    setShowLayerOptions(false);

    setShowTryOn(false);

    setTryOnResult(null);
    setTryOnError(null);

    setIsTryingOn(false);

    setIsGenerating(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }
      if (!user) {
        throw new Error('Sign in to get outfit recommendations.');
      }

      const location = await getCurrentCoordinates();
      const query = await embedFashionQuery(trimmedCommand);
      if (
        query.embedding_dimensions !== 768 ||
        query.embedding.length !== 768
      ) {
        throw new Error('The AI service returned an invalid query embedding.');
      }

      const response = await getRecommendations(
        user.id,
        query.embedding,
        query.intent,
        location.latitude,
        location.longitude
      );
      const recommendations = response.recommendations
        .map((recommendation) => toOutfit(recommendation))
        .filter((outfit): outfit is Outfit => outfit !== null);
      if (recommendations.length === 0) {
        throw new Error(
          'No matching outfits were found. Add more items to your closet and try again.'
        );
      }

      setOutfits(recommendations);
      setWeatherNotice(response.weather_error ?? null);
      setHasPrompt(true);
      setCommand('');
    } catch (error) {
      console.error('Failed to generate outfit recommendations:', error);
      Alert.alert(
        'Could not generate looks',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // =======================================================
  // NEXT OUTFIT
  // =======================================================

  const goToNextOutfit = () => {

    if (
      currentOutfitIndex <
      outfits.length - 1
    ) {

      setCurrentOutfitIndex(
        previous => previous + 1
      );

    }
  };

  // =======================================================
  // PREVIOUS OUTFIT
  // =======================================================

  const goToPreviousOutfit = () => {

    if (
      currentOutfitIndex > 0
    ) {

      setCurrentOutfitIndex(
        previous => previous - 1
      );

    }
  };

  // =======================================================
  // LIKE / UNLIKE OUTFIT
  // =======================================================

  const toggleLikeOutfit = async (outfit: Outfit) => {
    const savedOutfit = likedOutfits.find(
      (item) => item.id === outfit.id
    );

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      if (!user) {
        throw new Error('Sign in to save an outfit.');
      }

      if (savedOutfit) {
        if (!savedOutfit.savedOutfitId) {
          throw new Error('Could not identify the saved look to remove.');
        }

        await unlikeOutfit(user.id, savedOutfit.savedOutfitId);
        setLikedOutfits((previous) =>
          previous.filter(
            (item) => item.savedOutfitId !== savedOutfit.savedOutfitId
          )
        );
        return;
      }

      const response = await likeOutfit(user.id, outfit.raw);
      const savedOutfitId = response.liked_outfit_id;
      if (!savedOutfitId) {
        throw new Error('The saved look could not be identified.');
      }

      setLikedOutfits((previous) => [
        {
          ...outfit,
          savedOutfitId,
        },
        ...previous,
      ]);
    } catch (error) {
      console.error('Failed to update saved outfit:', error);
      Alert.alert(
        'Could not update saved look',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  // =======================================================
  // CHECK IF OUTFIT IS LIKED
  // =======================================================

  const isOutfitLiked = (
    outfit: Outfit
  ) => {

    return likedOutfits.some(
      item =>
        item.id === outfit.id
    );

  };

  // =======================================================
  // SELECT LIKED OUTFIT
  // =======================================================

  const selectLikedOutfit = (
    outfit: Outfit
  ) => {

    setSelectedOutfit(outfit);

    setSelectedTop(
      outfit.top
    );

    setSelectedBottom(
      outfit.bottom || null
    );

    setAdditionalLayer(null);

    setShowLayerOptions(false);

    setShowTryOn(true);

    setShowLikedLooks(false);
    void generateVirtualTryOn(
      outfit.top,
      outfit.bottom || null,
      outfit.footwear || null
    );

  };

  // =======================================================
  // ADD LAYER
  // =======================================================

  const handleAddLayer = (
    item: ClothingItem
  ) => {

    setAdditionalLayer(item);
    setSelectedOutfit((current) =>
      current
        ? {
            ...current,
            raw: {
              ...current.raw,
              additional_layer: item.raw,
            },
          }
        : current
    );

    setShowLayerOptions(false);
  };

  const loadSwapOptions = async (category: 'top' | 'bottom') => {
    const targetOutfit = selectedOutfit || currentOutfit;
    if (!targetOutfit || isLoadingSwaps) {
      return;
    }

    try {
      setIsLoadingSwaps(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      if (!user) {
        throw new Error('Sign in to get outfit alternatives.');
      }

      const rawOutfit = targetOutfit.raw.outfit;
      if (!isRecord(rawOutfit)) {
        throw new Error('The selected outfit is missing its wardrobe data.');
      }
      const currentItem = rawOutfit[category];
      if (!isRecord(currentItem)) {
        throw new Error(`There is no ${category} to replace in this outfit.`);
      }
      const lockedItems = ['top', 'bottom', 'footwear', 'dress']
        .filter((key) => key !== category)
        .map((key) => rawOutfit[key])
        .filter(isRecord);
      const response = await swapOutfitItem(
        user.id,
        category,
        currentItem.id === undefined ? undefined : String(currentItem.id),
        lockedItems
      );
      const alternatives = response.alternatives
        .map((item) => toClothingItem(item))
        .filter((item): item is ClothingItem => item !== null);

      setSwapCategory(category);
      setSwapOptions(alternatives);
      if (alternatives.length === 0) {
        Alert.alert(
          'No alternatives found',
          `Add more ${category} items to your closet and try again.`
        );
      }
    } catch (error) {
      console.error('Failed to load outfit alternatives:', error);
      Alert.alert(
        'Could not load alternatives',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsLoadingSwaps(false);
    }
  };

  const applySwap = (item: ClothingItem) => {
    if (!selectedOutfit || !swapCategory) {
      return;
    }

    const nextOutfit = {
      ...selectedOutfit,
      ...(swapCategory === 'top' ? { top: item } : { bottom: item }),
      raw: {
        ...selectedOutfit.raw,
        outfit: {
          ...(isRecord(selectedOutfit.raw.outfit)
            ? selectedOutfit.raw.outfit
            : {}),
          [swapCategory]: item.raw,
        },
      },
    };
    setSelectedOutfit(nextOutfit);
    setSelectedTop(nextOutfit.top);
    setSelectedBottom(nextOutfit.bottom || null);
    setSwapOptions([]);
    setSwapCategory(null);
  };

  const loadLayerOptions = async () => {
    const targetOutfit = selectedOutfit || currentOutfit;
    if (!targetOutfit || isLoadingLayers) {
      return;
    }

    try {
      setIsLoadingLayers(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      if (!user) {
        throw new Error('Sign in to get layer recommendations.');
      }

      const outfitItems = [
        targetOutfit.raw.outfit,
      ].flatMap((outfit) => {
        if (!isRecord(outfit)) {
          return [];
        }
        return ['top', 'bottom', 'footwear', 'dress']
          .map((key) => outfit[key])
          .filter(isRecord)
          .map((item) => item.id)
          .filter(
            (id): id is string | number =>
              typeof id === 'string' || typeof id === 'number'
          )
          .map(String);
      });
      const response = await getLayerRecommendations(user.id, outfitItems);
      const recommendations = response.layer_recommendations
        .map((item) =>
          toClothingItem(
            isRecord(item.item)
              ? item.item
              : isRecord(item.clothing)
                ? item.clothing
                : item
          )
        )
        .filter((item): item is ClothingItem => item !== null);

      setLayerOptions(recommendations);
      setShowLayerOptions(true);
      if (recommendations.length === 0) {
        Alert.alert(
          'No layers available',
          'Add outerwear or layering pieces to your closet first.'
        );
      }
    } catch (error) {
      console.error('Failed to load layer recommendations:', error);
      Alert.alert(
        'Could not load layers',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsLoadingLayers(false);
    }
  };

  // =======================================================
  // START TRY ON
  // =======================================================

  const handleTryOn = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
    setSelectedTop(outfit.top);
    setSelectedBottom(outfit.bottom || null);
    setAdditionalLayer(null);
    setShowLayerOptions(false);
    setShowLikedLooks(false);
    setShowTryOn(true);
    void generateVirtualTryOn(
      outfit.top,
      outfit.bottom || null,
      outfit.footwear || null
    );
  };

  // =======================================================
  // BACK TO RECOMMENDATIONS
  // =======================================================

  const backToRecommendations = () => {
    tryOnRequestId.current += 1;

    setSelectedOutfit(null);

    setSelectedTop(null);

    setSelectedBottom(null);

    setAdditionalLayer(null);

    setShowLayerOptions(false);

    setTryOnResult(null);
    setTryOnError(null);

    setIsTryingOn(false);

    setShowTryOn(false);

    setShowLikedLooks(false);
  };

  // =======================================================
  // RESET
  // =======================================================

  const restartStyling = () => {
    tryOnRequestId.current += 1;

    setHasPrompt(false);

    setCommand('');

    setIsGenerating(false);

    setCurrentOutfitIndex(0);

    setOutfits([]);
    setLayerOptions([]);
    setSwapOptions([]);
    setSwapCategory(null);

    setShowLikedLooks(false);

    setSelectedOutfit(null);

    setSelectedTop(null);

    setSelectedBottom(null);

    setAdditionalLayer(null);

    setShowLayerOptions(false);

    setShowTryOn(false);

    setIsTryingOn(false);

    setTryOnResult(null);
    setTryOnError(null);
  };

  // =======================================================
  // CAROUSEL ITEM
  // =======================================================

  const renderOutfit = ({
    item,
  }: {
    item: Outfit;
  }) => {

    const liked =
      isOutfitLiked(item);

    return (

      <View
        style={{
          width: outfitCardWidth,
        }}
      >

        <View
          style={
            styles.outfitCard
            
          }
        >

          {/* ============================================ */}
          {/* CLOTHING */}
          {/* ============================================ */}

          <View
            style={
              styles.cardImageArea
            }
          >

            <Image
              source={item.top.image || undefined}
              style={
                styles.cardTop
              }
              resizeMode="contain"
            />

            {item.bottom?.image && (
              <Image
                source={item.bottom.image}
                style={styles.cardBottom}
                resizeMode="contain"
              />
            )}

            {item.footwear?.image && (
              <Image
                source={item.footwear.image}
                style={styles.cardFootwear}
                resizeMode="contain"
              />
            )}

            {/* ========================================== */}
            {/* LIKE BUTTON */}
            {/* ========================================== */}

            <Pressable
              onPress={() =>
                toggleLikeOutfit(item)
              }
              accessibilityRole="button"
              accessibilityLabel={
                liked ? 'Remove from liked looks' : 'Add to liked looks'
              }
              style={[
                styles.cardLikeButton,
                liked &&
                  styles.cardLikeButtonActive,
              ]}
            >

              <Text
                style={[
                  styles.cardLikeIcon,
                  liked &&
                    styles.cardLikeIconActive,
                ]}
              >
                ♥
              </Text>

            </Pressable>

          </View>

          {/* ============================================ */}
          {/* INFORMATION */}
          {/* ============================================ */}

          <View
            style={
              styles.cardInfo
            }
          >

            <View
              style={
                styles.cardInfoTop
              }
            >

              <View
                style={
                  styles.cardTextArea
                }
              >

                <Text
                  style={
                    styles.cardTitle
                  }
                >
                  {item.title}
                </Text>

                <View
                  style={
                    styles.tagRow
                  }
                >

                  <View
                    style={
                      styles.tag
                    }
                  >

                    <Text
                      style={
                        styles.tagText
                      }
                    >
                      {item.occasion}
                    </Text>

                  </View>

                  <View
                    style={
                      styles.tag
                    }
                  >

                    <Text
                      style={
                        styles.tagText
                      }
                    >
                      {item.vibe}
                    </Text>

                  </View>

                </View>

              </View>

              {/* ======================================== */}
              {/* TRY IT BUTTON */}
              {/* ======================================== */}
              <Pressable
                onPress={() => handleTryOn(item)}
                style={styles.tryOnButton}
                accessibilityRole="button"
                accessibilityLabel="Try on this look"
              >
                <SymbolView
                  name={{
                    ios: 'viewfinder',
                    android: 'center_focus_strong',
                    web: 'center_focus_strong',
                  }}
                  size={16}
                  tintColor="#E4C18F"
                />

                <Text style={styles.tryOnButtonText}>
                  TRY ON
                </Text>
              </Pressable>
            </View>

          </View>

        </View>

      </View>
    );
  };

  // =======================================================
  // CAROUSEL INDEX
  // =======================================================

  const handleCarouselScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (outfitCardWidth <= 0) {
      return;
    }

    const index = Math.round(
      event.nativeEvent.contentOffset.x / outfitCardWidth
    );

    if (index >= 0 && index < outfits.length) {
      setCurrentOutfitIndex(index);
    }
  };

  const renderStylistPrompt = () => (
    <View style={styles.stylistContainer}>
      <Text style={styles.stylistLabel}>AI STYLIST</Text>

      <Text style={styles.stylistQuestion}>
        What are you dressing for today?
      </Text>

      <Text style={styles.stylistHint}>
        Tell me the occasion, mood, or style you're looking for.
      </Text>

      <View style={styles.promptRow}>
        <TextInput
          value={command}
          onChangeText={setCommand}
          placeholder="e.g. office presentation..."
          placeholderTextColor="#999"
          style={styles.promptInput}
          multiline
          editable={!isGenerating}
        />

        <Pressable
          onPress={handleCommand}
          disabled={isGenerating || !command.trim()}
          style={[
            styles.sendButton,
            (!command.trim() || isGenerating) && styles.sendButtonDisabled,
          ]}
        >
          <Text style={styles.sendButtonText}>→</Text>
        </Pressable>
      </View>

      {isGenerating && (
        <View style={styles.generatingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.generatingText}>
            Finding looks for you...
          </Text>
        </View>
      )}
    </View>
  );

  // =======================================================
  // RENDER
  // =======================================================

  return (

    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.kicker}>CLOSET AI</ThemedText>
            <ThemedText style={styles.title}>Mirror Preview</ThemedText>
          </View>

        </View>

        <ThemedText style={styles.subtitle}>
          Your AI-powered styling space
        </ThemedText>

      </View>

      {/* ================================================= */}
      {/* INITIAL MIRROR */}
      {/* ================================================= */}

      {!hasPrompt && renderStylistPrompt()}

      {!hasPrompt && (

        <View
          style={
            styles.mirrorContainer
          }
        >

          <Text
            style={
              styles.sectionLabel
            }
          >
            MIRROR PREVIEW
          </Text>

          <View
            style={
              styles.mirrorCanvas
            }
          >

            <Image
              source={
                WOMAN_IMAGE
              }
              style={
                styles.modelImage
              }
              resizeMode="contain"
            />

          </View>

        </View>

      )}

      {/* ================================================= */}
      {/* VIRTUAL TRY-ON SCREEN */}
      {/* ================================================= */}

      {hasPrompt &&
        showTryOn &&
        selectedOutfit && (

          <View
            style={
              styles.tryOnScreen
            }
          >

            {/* HEADER */}

            <View
              style={
                styles.tryOnHeader
              }
            >

              <Pressable
                onPress={
                  backToRecommendations
                }
                style={
                  styles.backButton
                }
              >

                <Text
                  style={
                    styles.backButtonText
                  }
                >
                  ←
                </Text>

              </Pressable>

              <View
                style={
                  styles.tryOnHeaderText
                }
              >

                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  VIRTUAL TRY-ON
                </Text>

                <Text
                  style={
                    styles.selectedTitle
                  }
                >
                  {selectedOutfit.title}
                </Text>

              </View>

              {isOutfitLiked(
                selectedOutfit
              ) && (

                <Text
                  style={
                    styles.likedText
                  }
                >
                  ♥ LIKED
                </Text>

              )}

            </View>

            {/* TRY-ON PREVIEW */}

            <View style={styles.tryOnPreviewCard}>
              <View style={styles.tryOnItemsColumn}>
                {selectedTop?.image && (
                  <View style={styles.tryOnItemPreview}>
                    <Image
                      source={selectedTop.image}
                      style={styles.tryOnItemImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.tryOnItemLabel}>TOP</Text>
                  </View>
                )}

                {selectedBottom?.image && (
                  <View style={styles.tryOnItemPreview}>
                    <Image
                      source={selectedBottom.image}
                      style={styles.tryOnItemImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.tryOnItemLabel}>BOTTOM</Text>
                  </View>
                )}

                {additionalLayer?.image && (
                  <View style={styles.tryOnItemPreview}>
                    <Image
                      source={additionalLayer.image}
                      style={styles.tryOnItemImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.tryOnItemLabel}>LAYER</Text>
                  </View>
                )}
              </View>

              <View style={styles.tryOnModelColumn}>
                <Image
                  source={
                    tryOnResult
                      ? { uri: tryOnResult }
                      : WOMAN_IMAGE
                  }
                  style={styles.tryOnModelImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {isTryingOn && (
              <Text style={styles.tryOnStatus} selectable>
                Generating your virtual try-on...
              </Text>
            )}

            {tryOnError && (
              <Text style={styles.tryOnError} selectable>
                {tryOnError}
              </Text>
            )}

            <View style={styles.swapActions}>
              <Pressable
                onPress={() => loadSwapOptions('top')}
                disabled={isLoadingSwaps}
                accessibilityRole="button"
                accessibilityLabel="Swap top"
                style={({ pressed }) => [
                  styles.swapButton,
                  pressed && !isLoadingSwaps && styles.swapButtonPressed,
                  isLoadingSwaps && styles.swapButtonDisabled,
                ]}
              >
                <View style={styles.swapIconWrap}>
                  {isLoadingSwaps && swapCategory === 'top' ? (
                    <ActivityIndicator size="small" color="#745A38" />
                  ) : (
                    <SymbolView
                      name={{
                        ios: 'tshirt',
                        android: 'checkroom',
                        web: 'checkroom',
                      }}
                      size={17}
                      tintColor="#745A38"
                    />
                  )}
                </View>
                <View style={styles.swapButtonCopy}>
                  <Text style={styles.swapButtonTitle}>Swap top</Text>
                  <Text style={styles.swapButtonHint}>
                    {isLoadingSwaps && swapCategory === 'top'
                      ? 'Finding options'
                      : 'Choose another piece'}
                  </Text>
                </View>
                {!isLoadingSwaps && (
                  <SymbolView
                    name={{
                      ios: 'chevron.right',
                      android: 'chevron_right',
                      web: 'chevron_right',
                    }}
                    size={15}
                    tintColor="#8A8278"
                  />
                )}
              </Pressable>

              <Pressable
                onPress={() => loadSwapOptions('bottom')}
                disabled={isLoadingSwaps || !selectedOutfit.bottom}
                accessibilityRole="button"
                accessibilityLabel="Swap bottom"
                accessibilityState={{
                  disabled: isLoadingSwaps || !selectedOutfit.bottom,
                }}
                style={({ pressed }) => [
                  styles.swapButton,
                  (isLoadingSwaps || !selectedOutfit.bottom) &&
                    styles.swapButtonDisabled,
                  pressed &&
                    !isLoadingSwaps &&
                    !!selectedOutfit.bottom &&
                    styles.swapButtonPressed,
                ]}
              >
                <View style={styles.swapIconWrap}>
                  {isLoadingSwaps && swapCategory === 'bottom' ? (
                    <ActivityIndicator size="small" color="#745A38" />
                  ) : (
                    <SymbolView
                      name={{
                        ios: 'rectangle.split.2x1',
                        android: 'checkroom',
                        web: 'checkroom',
                      }}
                      size={17}
                      tintColor="#745A38"
                    />
                  )}
                </View>
                <View style={styles.swapButtonCopy}>
                  <Text style={styles.swapButtonTitle}>Swap bottom</Text>
                  <Text style={styles.swapButtonHint}>
                    {!selectedOutfit.bottom
                      ? 'Not available'
                      : isLoadingSwaps && swapCategory === 'bottom'
                        ? 'Finding options'
                        : 'Choose another piece'}
                  </Text>
                </View>
                {!isLoadingSwaps && (
                  <SymbolView
                    name={{
                      ios: 'chevron.right',
                      android: 'chevron_right',
                      web: 'chevron_right',
                    }}
                    size={15}
                    tintColor="#8A8278"
                  />
                )}
              </Pressable>
            </View>

            {swapOptions.length > 0 && (
              <View style={styles.layerOptions}>
                <Text style={styles.layerTitle}>
                  Choose a replacement {swapCategory}
                </Text>
                {swapOptions.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => applySwap(item)}
                    style={styles.layerOption}
                  >
                    {item.image && (
                      <Image
                        source={item.image}
                        style={styles.layerOptionImage}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={styles.layerOptionText}>{item.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* ADD LAYER */}

            <Pressable
              onPress={loadLayerOptions}
              disabled={isLoadingLayers}
              style={
                styles.addLayerButton
              }
            >

              <Text
                style={
                  styles.addLayerButtonText
                }
              >
                {isLoadingLayers ? 'Finding layers...' : '+ Add Layer'}
              </Text>

            </Pressable>

            {showLayerOptions && (

              <View
                style={
                  styles.layerOptions
                }
              >

                <Text
                  style={
                    styles.layerTitle
                  }
                >
                  Add another item
                </Text>

                {layerOptions.map(
                  item => (

                    <Pressable
                      key={
                        item.id
                      }
                      onPress={() =>
                        handleAddLayer(
                          item
                        )
                      }
                      style={
                        styles.layerOption
                      }
                    >

                      {item.image && (
                        <Image
                          source={item.image}
                          style={styles.layerOptionImage}
                          resizeMode="contain"
                        />
                      )}

                      <Text
                        style={
                          styles.layerOptionText
                        }
                      >
                        {item.name}
                      </Text>

                    </Pressable>

                  )
                )}

              </View>

            )}

            {/* TRY ON */}

            <Pressable
              onPress={() =>
                handleTryOn(
                  selectedOutfit
                )
              }
              disabled={
                isTryingOn
              }
              style={[
                styles.tryOnButton,
                isTryingOn &&
                  styles.tryOnButtonDisabled,
              ]}
            >

              {isTryingOn ? (

                <ActivityIndicator
                  color="#FFFFFF"
                />

              ) : (

                <Text
                  style={
                    styles.tryOnButtonText
                  }
                >
                  {tryOnError ? 'RETRY TRY-ON' : 'REGENERATE TRY-ON'}
                </Text>

              )}

            </Pressable>

            {/* CHANGE LOOK */}

            <Pressable
              onPress={
                backToRecommendations
              }
              style={
                styles.changeLookButton
              }
            >

              <Text
                style={
                  styles.changeLookText
                }
              >
                ← BACK TO RECOMMENDATIONS
              </Text>

            </Pressable>

          </View>

        )}

      {/* ================================================= */}
      {/* RECOMMENDATION CAROUSEL */}
      {/* ================================================= */}

      {hasPrompt &&
        currentOutfit &&
        !selectedOutfit &&
        !showLikedLooks &&
        !showTryOn &&
        !isGenerating && (

          <View
            style={
              styles.recommendationSection
            }
          >

            {/* HEADER */}

            <View
              style={
                styles.recommendationHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  RECOMMENDED LOOKS
                </Text>

                <Text
                  style={
                    styles.recommendationTitle
                  }
                >
                  Top picks for you
                </Text>

              </View>

              <Text
                style={
                  styles.counterText
                }
              >
                {currentOutfitIndex + 1}/
                {outfits.length}
              </Text>

            </View>

            {weatherNotice && (
              <Text style={styles.weatherNotice} selectable>
                {weatherNotice}
              </Text>
            )}

            {/* CAROUSEL */}

            <FlatList
              data={
                outfits
              }
              renderItem={
                renderOutfit
              }
              keyExtractor={
                item =>
                  item.id
              }
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={
                false
              }
              snapToInterval={
                outfitCardWidth
              }
              decelerationRate="fast"
              onScroll={handleCarouselScroll}
              scrollEventThrottle={16}
              onMomentumScrollEnd={
                handleCarouselScroll
              }
              contentContainerStyle={{
                paddingHorizontal: 0,
              }}
            />

            {/* DOTS */}

            <View
              style={
                styles.carouselDots
              }
            >

              {outfits.map(
                (_, index) => (

                  <View
                    key={
                      index
                    }
                    style={[
                      styles.carouselDot,
                      index ===
                        currentOutfitIndex &&
                        styles.carouselDotActive,
                    ]}
                  />

                )
              )}

            </View>

            <Text
              style={
                styles.swipeHint
              }
            >
              ← Swipe to explore looks →
            </Text>

            {/* VIEW LIKED */}

            {likedOutfits.length >
              0 && (

              <Pressable
                onPress={() =>
                  setShowLikedLooks(
                    true
                  )
                }
                style={
                  styles.viewLikedButton
                }
              >

                <Text
                  style={
                    styles.viewLikedButtonText
                  }
                >
                  VIEW LIKED LOOKS (
                  {
                    likedOutfits.length
                  })
                </Text>

              </Pressable>

            )}

          </View>

        )}

      {/* ================================================= */}
      {/* LIKED LOOKS */}
      {/* ================================================= */}

      {hasPrompt &&
        showLikedLooks &&
        !selectedOutfit &&
        !showTryOn && (

          <View
            style={
              styles.likedSection
            }
          >

            <View
              style={
                styles.likedHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  YOUR LIKED LOOKS
                </Text>

                <Text
                  style={
                    styles.likedTitle
                  }
                >
                  Choose a look
                </Text>

              </View>

              <Pressable
                onPress={
                  backToRecommendations
                }
              >

                <Text
                  style={
                    styles.backText
                  }
                >
                  ← BACK
                </Text>

              </Pressable>

            </View>

            {likedOutfits.length ===
            0 ? (

              <View
                style={
                  styles.emptyLiked
                }
              >

                <Text
                  style={
                    styles.emptyLikedTitle
                  }
                >
                  No liked looks yet
                </Text>

                <Pressable
                  onPress={
                    backToRecommendations
                  }
                  style={
                    styles.exploreButton
                  }
                >

                  <Text
                    style={
                      styles.exploreButtonText
                    }
                  >
                    EXPLORE LOOKS
                  </Text>

                </Pressable>

              </View>

            ) : (

              <View
                style={
                  styles.likedGrid
                }
              >

                {likedOutfits.map(
                  (outfit, index) => (

                    <View
                      key={
                        outfit.savedOutfitId ?? `${outfit.id}-${index}`
                      }
                      style={
                        styles.likedCard
                      }
                    >

                      <View
                        style={
                          styles.likedImageArea
                        }
                      >

                        <Image
                          source={outfit.top.image || undefined}
                          style={
                            styles.likedTop
                          }
                          resizeMode="contain"
                        />

                        {outfit.bottom?.image && (
                          <Image
                            source={outfit.bottom.image}
                            style={styles.likedBottom}
                            resizeMode="contain"
                          />
                        )}

                      </View>

                      <View
                        style={
                          styles.likedCardInfo
                        }
                      >

                        <Text
                          style={
                            styles.likedCardTitle
                          }
                        >
                          {outfit.title}
                        </Text>

                        <Text
                          style={
                            styles.likedCardSubtitle
                          }
                        >
                          {outfit.occasion}
                          {' • '}
                          {outfit.vibe}
                        </Text>

                        <View
                          style={
                            styles.likedActions
                          }
                        >

                          <Pressable
                            onPress={() => toggleLikeOutfit(outfit)}
                            accessibilityRole="button"
                            accessibilityLabel="Remove from liked looks"
                            style={
                              styles.unlikeButton
                            }
                          >

                            <Text
                              style={
                                styles.unlikeText
                              }
                            >
                              ♥
                            </Text>

                          </Pressable>

                          <Pressable
                            onPress={() =>
                              handleTryOn(
                                outfit
                              )
                            }
                            style={
                              styles.selectLookButton
                            }
                          >

                            <Text
                              style={
                                styles.selectLookText
                              }
                            >
                              TRY THIS LOOK
                            </Text>

                          </Pressable>

                        </View>

                      </View>

                    </View>

                  )
                )}

              </View>

            )}

            <Pressable
              onPress={
                backToRecommendations
              }
              style={
                styles.continueExploringButton
              }
            >

              <Text
                style={
                  styles.continueExploringText
                }
              >
                ← CONTINUE EXPLORING
              </Text>

            </Pressable>

          </View>

        )}

      {/* ================================================= */}
      {/* AI STYLIST */}
      {/* ================================================= */}

      {hasPrompt && renderStylistPrompt()}

    </ScrollView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },

  content: {
    padding: 20,
    paddingBottom: 60,
  },

  // =======================================================
  // HEADER
  // =======================================================

  header: {
    gap: 5,
    marginBottom: 20,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  kicker: {
     fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
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
    color: '#747878',
    fontSize: 14,
    lineHeight: 20,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#888',
    marginBottom: 8,
  },

  // =======================================================
  // MIRROR
  // =======================================================

  mirrorContainer: {
    marginBottom: 22,
  },

  mirrorCanvas: {
    height: 500,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E9E5E0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  modelImage: {
    width: '100%',
    height: '100%',
  },

  // =======================================================
  // RECOMMENDATIONS
  // =======================================================

  recommendationSection: {
    marginBottom: 25,
  },

  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },

  recommendationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },

  weatherNotice: {
    color: '#765A2D',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },

  counterText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },

  // =======================================================
  // OUTFIT CARD
  // =======================================================

  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E1DC',
  },

  cardImageArea: {
    height: 430,
    backgroundColor: '#F0ECE7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  cardTop: {
    position: 'absolute',
    width: '40%',
    height: '48%',
    top: '4%',
  },

  cardBottom: {
    position: 'absolute',
    width: '70%',
    height: '49%',
    bottom: '5%',
  },

  cardFootwear: {
    position: 'absolute',
    width: '28%',
    height: '16%',
    bottom: '2%',
    right: '6%',
  },

  // =======================================================
  // CARD LIKE
  // =======================================================

  cardLikeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.12)',
  },

  cardLikeButtonActive: {
    backgroundColor: '#E8F4EC',
  },

  cardLikeIcon: {
    fontSize: 22,
    color: '#999',
  },

  cardLikeIconActive: {
    color: '#2C8B55',
  },

  // =======================================================
  // CARD INFO
  // =======================================================

  cardInfo: {
    padding: 16,
  },

  cardInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardTextArea: {
    flex: 1,
    paddingRight: 10,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#222',
  },

  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F0ECE7',
  },

  tagText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },

  // =======================================================
  // TRY IT BUTTON
  // =======================================================

  tryItButton: {
    minWidth: 68,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  lensIcon: {
    width: 12,
    height: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,

  },

  lensInner: {
    width: 12,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ebd6d6',
  },

  tryItText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // =======================================================
  // DOTS
  // =======================================================

  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 15,
  },

  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5D0CA',
  },

  carouselDotActive: {
    width: 18,
    backgroundColor: '#222',
  },

  swipeHint: {
    textAlign: 'center',
    marginTop: 14,
    color: '#999',
    fontSize: 12,
  },

  // =======================================================
  // VIEW LIKED
  // =======================================================

  viewLikedButton: {
    marginTop: 14,
    backgroundColor: '#222',
    borderRadius: 15,
    paddingHorizontal: 22,
    paddingVertical: 13,
    alignItems: 'center',
  },

  viewLikedButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // =======================================================
  // LIKED LOOKS
  // =======================================================

  likedSection: {
    marginBottom: 25,
  },

  likedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },

  likedTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#222',
  },

  backText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#777',
    letterSpacing: 0.8,
  },

  likedGrid: {
    gap: 16,
  },

  likedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E1DC',
  },

  likedImageArea: {
    height: 300,
    backgroundColor: '#F0ECE7',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  likedTop: {
    position: 'absolute',
    width: '55%',
    height: '52%',
    top: '7%',
  },

  likedBottom: {
    position: 'absolute',
    width: '58%',
    height: '55%',
    bottom: '1%',
  },

  likedCardInfo: {
    padding: 16,
  },

  likedCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
  },

  likedCardSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },

  likedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },

  unlikeButton: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#E8F4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  unlikeText: {
    fontSize: 20,
    color: '#2C8B55',
  },

  selectLookButton: {
    flex: 1,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectLookText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  continueExploringButton: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  continueExploringText: {
    color: '#777',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  emptyLiked: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 35,
    alignItems: 'center',
  },

  emptyLikedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  exploreButton: {
    marginTop: 18,
    backgroundColor: '#222',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // =======================================================
  // VIRTUAL TRY-ON
  // =======================================================

  tryOnScreen: {
    marginBottom: 25,
  },

  tryOnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E1DC',
  },

  backButtonText: {
    fontSize: 22,
    color: '#222',
  },

  tryOnHeaderText: {
    flex: 1,
  },

  selectedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },

  likedText: {
    color: '#2C8B55',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  tryOnPreviewCard: {
    height: 460,
    flexDirection: 'row',
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#F0ECE7',
    borderWidth: 1,
    borderColor: '#E5E1DC',
  },

  tryOnItemsColumn: {
    width: '36%',
    padding: 8,
    gap: 8,
  },

  tryOnItemPreview: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1DC',
  },

  tryOnItemImage: {
    flex: 1,
    width: '100%',
  },

  tryOnItemLabel: {
    color: '#777',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingTop: 4,
  },

  tryOnModelColumn: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#E9E5E0',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E1DC',
  },

  tryOnModelImage: {
    width: '100%',
    height: '100%',
  },

  tryOnStatus: {
    marginTop: 10,
    color: '#745A38',
    fontSize: 13,
    textAlign: 'center',
  },

  tryOnError: {
    marginTop: 10,
    color: '#B42318',
    fontSize: 13,
    textAlign: 'center',
  },

  // =======================================================
  // ADD LAYER
  // =======================================================

  swapActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  swapButton: {
    flex: 1,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E1DC',
    backgroundColor: '#FFFFFF',
  },

  swapButtonPressed: {
    backgroundColor: '#F8F4EE',
    borderColor: '#C9B79F',
    transform: [{ scale: 0.98 }],
  },

  swapButtonDisabled: {
    opacity: 0.52,
  },

  swapIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F0EA',
  },

  swapButtonCopy: {
    flex: 1,
    gap: 3,
  },

  swapButtonTitle: {
    color: '#262522',
    fontSize: 12,
    fontWeight: '800',
  },

  swapButtonHint: {
    color: '#81796F',
    fontSize: 9,
    lineHeight: 13,
  },

  addLayerButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8D3CD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  addLayerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  layerOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E0DB',
  },

  layerTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    color: '#333',
  },

  layerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },

  layerOptionImage: {
    width: 55,
    height: 55,
  },

  layerOptionText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '600',
  },

  // =======================================================
  // CREATE TRY-ON
  // =======================================================

tryOnButton: {
  width: 132,
  height: 48,
  borderRadius: 12,
  backgroundColor: '#1b1c1a',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  marginTop: 12,
},

tryOnButtonDisabled: {
    opacity: 0.7,
  },

tryOnButtonText: {
  color: '#ffffff',
  fontSize: 10,
  fontWeight: '700',
  letterSpacing: 0.4,
},

  // =======================================================
  // LOADING
  // =======================================================

  
  // =======================================================
  // BACK
  // =======================================================

  changeLookButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },

  changeLookText: {
    color: '#777',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // =======================================================
  // AI STYLIST
  // =======================================================

  stylistContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9E5E0',
  },

  stylistLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#777',
  },

  stylistQuestion: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginTop: 7,
  },

  stylistHint: {
    fontSize: 13,
    color: '#888',
    marginTop: 5,
    marginBottom: 14,
  },

  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  promptInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 100,
    backgroundColor: '#F5F3F0',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222',
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.4,
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },

  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },

  generatingText: {
    fontSize: 13,
    color: '#777',
  },

  
});
