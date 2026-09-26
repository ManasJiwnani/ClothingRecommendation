import { useState } from 'react';
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
  Dimensions,
} from 'react-native';
// import ThemedText from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
  category: 'top' | 'bottom' | 'accessory';
  image: any;
};

type Outfit = {
  id: string;
  title: string;
  occasion: string;
  vibe: string;
  top: ClothingItem;
  bottom: ClothingItem;
};

// =========================================================
// CLOTHING
// =========================================================

const TOPS: ClothingItem[] = [
  {
    id: 'top1',
    name: 'Black Top',
    category: 'top',
    image: require('../../assets/clothes/top1.png'),
  },
  {
    id: 'top2',
    name: 'Statement Top',
    category: 'top',
    image: require('../../assets/clothes/outfit1.png'),
  },
];

const BOTTOMS: ClothingItem[] = [
  {
    id: 'bottom1',
    name: 'Blue Jeans',
    category: 'bottom',
    image: require('../../assets/clothes/pant.png'),
  },
];

// =========================================================
// TOP-K DEMO OUTFITS
// =========================================================

const TOP_K_OUTFITS: Outfit[] = [
  {
    id: 'outfit1',
    title: 'Smart Casual',
    occasion: 'Everyday',
    vibe: 'Minimal',
    top: TOPS[0],
    bottom: BOTTOMS[0],
  },
  {
    id: 'outfit2',
    title: 'Presentation Ready',
    occasion: 'Office',
    vibe: 'Polished',
    top: TOPS[1],
    bottom: BOTTOMS[0],
  },
  {
    id: 'outfit3',
    title: 'Weekend Look',
    occasion: 'Weekend',
    vibe: 'Relaxed',
    top: TOPS[0],
    bottom: BOTTOMS[0],
  },
  {
    id: 'outfit4',
    title: 'City Chic',
    occasion: 'Outing',
    vibe: 'Trendy',
    top: TOPS[1],
    bottom: BOTTOMS[0],
  },
  {
    id: 'outfit5',
    title: 'Effortless Style',
    occasion: 'Casual',
    vibe: 'Comfortable',
    top: TOPS[0],
    bottom: BOTTOMS[0],
  },
];

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function MirrorScreen() {

  // =======================================================
  // FLOW STATE
  // =======================================================

  const [hasPrompt, setHasPrompt] = useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [command, setCommand] =
    useState('');

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
    useState(false);
  
  const router = useRouter();
  // =======================================================
  // ADD LAYER
  // =======================================================

  const [showLayerOptions, setShowLayerOptions] =
    useState(false);

  // =======================================================
  // CURRENT OUTFIT
  // =======================================================

  const currentOutfit =
    TOP_K_OUTFITS[currentOutfitIndex];

  // =======================================================
  // PROMPT
  // =======================================================

  const handleCommand = () => {

    const trimmedCommand =
      command.trim();

    if (
      !trimmedCommand ||
      isGenerating
    ) {
      return;
    }

    console.log(
      'AI Stylist prompt:',
      trimmedCommand
    );

    // Reset recommendation flow
    setLikedOutfits([]);

    setCurrentOutfitIndex(0);

    setSelectedOutfit(null);

    setSelectedTop(null);

    setSelectedBottom(null);

    setAdditionalLayer(null);

    setShowLikedLooks(false);

    setShowLayerOptions(false);

    setShowTryOn(false);

    setTryOnResult(false);

    setIsTryingOn(false);

    setIsGenerating(true);

    // DEMO API DELAY
    setTimeout(() => {

      setHasPrompt(true);

      setIsGenerating(false);

      setCommand('');

    }, 1000);
  };

  // =======================================================
  // NEXT OUTFIT
  // =======================================================

  const goToNextOutfit = () => {

    if (
      currentOutfitIndex <
      TOP_K_OUTFITS.length - 1
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

  const toggleLikeOutfit = (
    outfit: Outfit
  ) => {

    setLikedOutfits(previous => {

      const alreadyLiked =
        previous.some(
          item =>
            item.id === outfit.id
        );

      // UNLIKE
      if (alreadyLiked) {

        return previous.filter(
          item =>
            item.id !== outfit.id
        );

      }

      // LIKE
      return [
        ...previous,
        outfit,
      ];

    });
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
      outfit.bottom
    );

    setAdditionalLayer(null);

    setShowLayerOptions(false);

    setTryOnResult(false);

    setIsTryingOn(true);

    setShowLikedLooks(false);

    setTimeout(() => {
      setIsTryingOn(false);
      setTryOnResult(true);
  }, 1800);

  };

  // =======================================================
  // ADD LAYER
  // =======================================================

  const handleAddLayer = (
    item: ClothingItem
  ) => {

    setAdditionalLayer(item);

    setShowLayerOptions(false);
  };

  // =======================================================
  // START TRY ON
  // =======================================================

  const handleTryOn = (outfit: Outfit) => {
  setSelectedOutfit(outfit);

  setSelectedTop(outfit.top);
  setSelectedBottom(outfit.bottom);
  setAdditionalLayer(null);

  setShowLayerOptions(false);
  setShowLikedLooks(false);

  // Start virtual try-on immediately
  setIsTryingOn(true);
  setTryOnResult(false);

  // DEMO ONLY
  setTimeout(() => {
    setIsTryingOn(false);
    setTryOnResult(true);
  }, 1800);
};

  // =======================================================
  // BACK TO RECOMMENDATIONS
  // =======================================================

  const backToRecommendations = () => {

    setSelectedOutfit(null);

    setSelectedTop(null);

    setSelectedBottom(null);

    setAdditionalLayer(null);

    setShowLayerOptions(false);

    setTryOnResult(false);

    setIsTryingOn(false);

    setShowTryOn(false);

    setShowLikedLooks(false);
  };

  // =======================================================
  // RESET
  // =======================================================

  const restartStyling = () => {

    setHasPrompt(false);

    setCommand('');

    setIsGenerating(false);

    setCurrentOutfitIndex(0);

    setLikedOutfits([]);

    setShowLikedLooks(false);

    setSelectedOutfit(null);

    setSelectedTop(null);

    setSelectedBottom(null);

    setAdditionalLayer(null);

    setShowLayerOptions(false);

    setShowTryOn(false);

    setIsTryingOn(false);

    setTryOnResult(false);
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
          width:
            SCREEN_WIDTH - 40,
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
              source={
                item.top.image
              }
              style={
                styles.cardTop
              }
              resizeMode="contain"
            />

            <Image
              source={
                item.bottom.image
              }
              style={
                styles.cardBottom
              }
              resizeMode="contain"
            />

            {/* ========================================== */}
            {/* LIKE BUTTON */}
            {/* ========================================== */}

            <Pressable
              onPress={() =>
                toggleLikeOutfit(item)
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
                onPress={() => {
                  router.push({
                    pathname: '/try_on',
                    params: {
                      top: selectedTop?.image?.uri ?? '',
                      bottom: selectedBottom?.image?.uri ?? '',
                    },
                  });
                }}
                style={styles.tryOnButton}
              >
                <SymbolView
                  name={{
                    ios: 'viewfinder',
                    android: 'center_focus_strong',
                    web: 'center_focus_strong',
                  }}
                  size={20}
                  tintColor="#ffffff"
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
    event: any
  ) => {

    const offsetX =
      event.nativeEvent
        .contentOffset.x;

    const index =
      Math.round(
        offsetX /
          SCREEN_WIDTH
      );

    if (
      index >= 0 &&
      index <
        TOP_K_OUTFITS.length
    ) {

      setCurrentOutfitIndex(
        index
      );

    }
  };

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

      <View
        style={
          styles.header
        }
      >

        <Text
          style={
            styles.title
          }
        >
          MIRROR
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Your AI-powered styling space
        </Text>

      </View>

      {/* ================================================= */}
      {/* INITIAL MIRROR */}
      {/* ================================================= */}

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

            {/* MIRROR */}

            <View
              style={
                styles.tryOnMirror
              }
            >

              {/* MODEL */}

              <Image
                source={
                  WOMAN_IMAGE
                }
                style={
                  styles.modelImage
                }
                resizeMode="contain"
              />

              {/* TOP */}

              {selectedTop && (

                <Image
                  source={
                    selectedTop.image
                  }
                  style={
                    styles.mirrorTop
                  }
                  resizeMode="contain"
                />

              )}

              {/* BOTTOM */}

              {selectedBottom && (

                <Image
                  source={
                    selectedBottom.image
                  }
                  style={
                    styles.mirrorBottom
                  }
                  resizeMode="contain"
                />

              )}

              {/* ADDITIONAL LAYER */}

              {additionalLayer && (

                <Image
                  source={
                    additionalLayer.image
                  }
                  style={
                    styles.mirrorLayer
                  }
                  resizeMode="contain"
                />

              )}

            </View>

            {/* OUTFIT INFO */}

            <View
              style={
                styles.tryOnInfo
              }
            >

              <Text
                style={
                  styles.tryOnInfoTitle
                }
              >
                {selectedOutfit.title}
              </Text>

              <Text
                style={
                  styles.tryOnInfoSubtitle
                }
              >
                {selectedOutfit.occasion}
                {' • '}
                {selectedOutfit.vibe}
              </Text>

            </View>

            {/* ADD LAYER */}

            <Pressable
              onPress={() =>
                setShowLayerOptions(
                  previous =>
                    !previous
                )
              }
              style={
                styles.addLayerButton
              }
            >

              <Text
                style={
                  styles.addLayerButtonText
                }
              >
                + Add Layer
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

                {TOPS.map(
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

                      <Image
                        source={
                          item.image
                        }
                        style={
                          styles.layerOptionImage
                        }
                        resizeMode="contain"
                      />

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
                  currentOutfit
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
                  CREATE TRY-ON
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
                {TOP_K_OUTFITS.length}
              </Text>

            </View>

            {/* CAROUSEL */}

            <FlatList
              data={
                TOP_K_OUTFITS
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
                SCREEN_WIDTH
              }
              decelerationRate="fast"
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

              {TOP_K_OUTFITS.map(
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
                  outfit => (

                    <View
                      key={
                        outfit.id
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
                          source={
                            outfit.top.image
                          }
                          style={
                            styles.likedTop
                          }
                          resizeMode="contain"
                        />

                        <Image
                          source={
                            outfit.bottom.image
                          }
                          style={
                            styles.likedBottom
                          }
                          resizeMode="contain"
                        />

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
                            onPress={() =>
                              toggleLikeOutfit(
                                outfit
                              )
                            }
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

      <View
        style={
          styles.stylistContainer
        }
      >

        <Text
          style={
            styles.stylistLabel
          }
        >
          AI STYLIST
        </Text>

        <Text
          style={
            styles.stylistQuestion
          }
        >
          What are you dressing for
          today?
        </Text>

        <Text
          style={
            styles.stylistHint
          }
        >
          Tell me the occasion, mood,
          or style you're looking for.
        </Text>

        <View
          style={
            styles.promptRow
          }
        >

          <TextInput
            value={
              command
            }
            onChangeText={
              setCommand
            }
            placeholder="e.g. office presentation..."
            placeholderTextColor="#999"
            style={
              styles.promptInput
            }
            multiline
            editable={
              !isGenerating
            }
          />

          <Pressable
            onPress={
              handleCommand
            }
            disabled={
              isGenerating ||
              !command.trim()
            }
            style={[
              styles.sendButton,
              (!command.trim() ||
                isGenerating) &&
                styles.sendButtonDisabled,
            ]}
          >

            <Text
              style={
                styles.sendButtonText
              }
            >
              →
            </Text>

          </Pressable>

        </View>

        {isGenerating && (

          <View
            style={
              styles.generatingRow
            }
          >

            <ActivityIndicator
              size="small"
            />

            <Text
              style={
                styles.generatingText
              }
            >
              Finding looks for you...
            </Text>

          </View>

        )}

      </View>

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
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#1D1D1D',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#777',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
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
    height: '52%',
    top: '5%',
  },

  cardBottom: {
    position: 'absolute',
    width: '85%',
    height: '55%',
    bottom: '3%',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
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
    gap: 6,
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

  tryOnMirror: {
    height: 520,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#E9E5E0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  mirrorTop: {
    position: 'absolute',
    width: '55%',
    height: '42%',
    top: '22%',
    left: '22%',
  },

  mirrorBottom: {
    position: 'absolute',
    width: '58%',
    height: '45%',
    top: '50%',
    left: '21%',
  },

  mirrorLayer: {
    position: 'absolute',
    width: '50%',
    height: '35%',
    top: '18%',
    left: '25%',
  },

  tryOnInfo: {
    paddingVertical: 15,
  },

  tryOnInfoTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#222',
  },

  tryOnInfoSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: '#888',
  },

  // =======================================================
  // ADD LAYER
  // =======================================================

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
  height: 40,
  borderRadius: 10,
  backgroundColor: '#1b1c1a',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  marginTop: 12,
},

tryOnButtonDisabled: {
    opacity: 0.7,
  },

tryOnButtonText: {
  color: '#ffffff',
  fontSize: 12,
  fontWeight: '700',
  letterSpacing: 0.2,
  paddingHorizontal: 10,
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
    alignItems: 'flex-end',
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

