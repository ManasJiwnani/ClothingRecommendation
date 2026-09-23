import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

// =========================================================
// ASSETS
// =========================================================

const WOMAN_IMAGE = require('../assets/woman.png');

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
    image: require('../assets/clothes/top1.png'),
  },
  {
    id: 'top2',
    name: 'Statement Top',
    category: 'top',
    image: require('../assets/clothes/outfit1.png'),
  },
];

const BOTTOMS: ClothingItem[] = [
  {
    id: 'bottom1',
    name: 'Blue Jeans',
    category: 'bottom',
    image: require('../assets/clothes/pant.png'),
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

  // User has submitted the AI Stylist prompt
  const [hasPrompt, setHasPrompt] = useState(false);

  // AI recommendations are being generated
  const [isGenerating, setIsGenerating] = useState(false);

  // Current prompt
  const [command, setCommand] = useState('');

  // Current recommendation card
  const [currentOutfitIndex, setCurrentOutfitIndex] =
    useState(0);

  // All outfits the user liked
  const [likedOutfits, setLikedOutfits] =
    useState<Outfit[]>([]);

  // Whether user is currently viewing liked looks
  const [showLikedLooks, setShowLikedLooks] =
    useState(false);

  // Selected outfit from liked looks
  const [selectedOutfit, setSelectedOutfit] =
    useState<Outfit | null>(null);

  // Selected clothing layers
  const [selectedTop, setSelectedTop] =
    useState<ClothingItem | null>(null);

  const [selectedBottom, setSelectedBottom] =
    useState<ClothingItem | null>(null);

  const [additionalLayer, setAdditionalLayer] =
    useState<ClothingItem | null>(null);

  // Add Layer dropdown
  const [showLayerOptions, setShowLayerOptions] =
    useState(false);

  // Try-on states
  const [isTryingOn, setIsTryingOn] =
    useState(false);

  const [tryOnResult, setTryOnResult] =
    useState(false);

  // =======================================================
  // SWIPE STATE
  // =======================================================

  const position = useRef(
    new Animated.ValueXY({
      x: 0,
      y: 0,
    })
  ).current;

  const currentOutfit =
    TOP_K_OUTFITS[currentOutfitIndex];

  const allOutfitsExplored =
    currentOutfitIndex >= TOP_K_OUTFITS.length;

  // =======================================================
  // PROMPT
  // =======================================================

  const handleCommand = () => {
    const trimmedCommand = command.trim();

    if (!trimmedCommand || isGenerating) {
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

    setTryOnResult(false);
    setIsTryingOn(false);

    position.setValue({
      x: 0,
      y: 0,
    });

    setIsGenerating(true);

    // -----------------------------------------------------
    // DEMO DELAY
    // Later replace this with your API call
    // -----------------------------------------------------

    setTimeout(() => {
      setHasPrompt(true);
      setIsGenerating(false);
      setCommand('');
    }, 1000);
  };

  // =======================================================
  // SWIPE
  // =======================================================

  const completeSwipe = (
    direction: 'left' | 'right'
  ) => {
    if (!currentOutfit) {
      return;
    }

    const outfit = currentOutfit;

    // -----------------------------------------------------
    // RIGHT SWIPE = LIKE
    // -----------------------------------------------------

    if (direction === 'right') {
      setLikedOutfits((previous) => {
        const alreadyLiked = previous.some(
          (item) => item.id === outfit.id
        );

        if (alreadyLiked) {
          return previous;
        }

        return [...previous, outfit];
      });
    }

    // -----------------------------------------------------
    // LEFT SWIPE = PASS
    // -----------------------------------------------------

    Animated.timing(position, {
      toValue: {
        x:
          direction === 'right'
            ? SCREEN_WIDTH * 1.4
            : -SCREEN_WIDTH * 1.4,
        y: 0,
      },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({
        x: 0,
        y: 0,
      });

      setCurrentOutfitIndex(
        (previous) => previous + 1
      );
    });
  };

  // =======================================================
  // PAN RESPONDER
  // =======================================================

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        true,

      onMoveShouldSetPanResponder: (
        _,
        gesture
      ) => {
        return Math.abs(gesture.dx) > 10;
      },

      onPanResponderMove: (
        _,
        gesture
      ) => {
        position.setValue({
          x: gesture.dx,
          y: gesture.dy * 0.15,
        });
      },

      onPanResponderRelease: (
        _,
        gesture
      ) => {
        if (
          gesture.dx > SWIPE_THRESHOLD
        ) {
          completeSwipe('right');
        } else if (
          gesture.dx < -SWIPE_THRESHOLD
        ) {
          completeSwipe('left');
        } else {
          Animated.spring(position, {
            toValue: {
              x: 0,
              y: 0,
            },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // =======================================================
  // CARD ROTATION
  // =======================================================

  const cardRotate = position.x.interpolate({
    inputRange: [
      -SCREEN_WIDTH,
      0,
      SCREEN_WIDTH,
    ],
    outputRange: [
      '-12deg',
      '0deg',
      '12deg',
    ],
  });

  // =======================================================
  // LIKE LABEL
  // =======================================================

  const likeOpacity = position.x.interpolate({
    inputRange: [
      0,
      SWIPE_THRESHOLD,
    ],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // =======================================================
  // PASS LABEL
  // =======================================================

  const passOpacity = position.x.interpolate({
    inputRange: [
      -SWIPE_THRESHOLD,
      0,
    ],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // =======================================================
  // SELECT A LIKED LOOK
  // =======================================================

  const selectLikedOutfit = (
    outfit: Outfit
  ) => {
    setSelectedOutfit(outfit);

    setSelectedTop(outfit.top);

    setSelectedBottom(outfit.bottom);

    setAdditionalLayer(null);

    setShowLayerOptions(false);

    setTryOnResult(false);

    setIsTryingOn(false);

    setShowLikedLooks(false);
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
  // TRY ON
  // =======================================================

  const handleTryOn = () => {
    if (!selectedOutfit) {
      return;
    }

    setIsTryingOn(true);
    setTryOnResult(false);

    // -----------------------------------------------------
    // DEMO ONLY
    // Later replace with VTON API
    // -----------------------------------------------------

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

    setShowLikedLooks(false);

    position.setValue({
      x: 0,
      y: 0,
    });
  };

  // =======================================================
  // RESET EVERYTHING
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

    setIsTryingOn(false);
    setTryOnResult(false);

    position.setValue({
      x: 0,
      y: 0,
    });
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <ScrollView
      style={styles.container}
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
        <Text style={styles.title}>
          MIRROR
        </Text>

        <Text style={styles.subtitle}>
          Your AI-powered styling space
        </Text>
      </View>

      {/* ================================================= */}
      {/* STATE 1 */}
      {/* INITIAL WOMAN PHOTO */}
      {/* ================================================= */}

      {!hasPrompt && (
        <View
          style={styles.mirrorContainer}
        >
          <Text
            style={styles.sectionLabel}
          >
            MIRROR PREVIEW
          </Text>

          <View
            style={styles.mirrorCanvas}
          >
            <Image
              source={WOMAN_IMAGE}
              style={styles.modelImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      {/* ================================================= */}
      {/* AI STYLIST */}
      {/* ================================================= */}

      <View
        style={styles.stylistContainer}
      >
        <Text
          style={styles.stylistLabel}
        >
          AI STYLIST
        </Text>

        <Text
          style={styles.stylistQuestion}
        >
          What are you dressing for
          today?
        </Text>

        <Text
          style={styles.stylistHint}
        >
          Tell me the occasion, mood,
          or style you're looking for.
        </Text>

        <View
          style={styles.promptRow}
        >
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
              style={styles.sendButtonText}
            >
              →
            </Text>
          </Pressable>
        </View>

        {isGenerating && (
          <View
            style={styles.generatingRow}
          >
            <ActivityIndicator
              size="small"
            />

            <Text
              style={styles.generatingText}
            >
              Finding looks for you...
            </Text>
          </View>
        )}
      </View>

      {/* ================================================= */}
      {/* STATE 2 */}
      {/* RECOMMENDATION CARDS */}
      {/* ================================================= */}

      {hasPrompt &&
        !selectedOutfit &&
        !showLikedLooks &&
        !isGenerating && (
          <View
            style={
              styles.recommendationSection
            }
          >
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
                  Swipe to explore
                </Text>
              </View>

              <Text
                style={styles.counterText}
              >
                {Math.min(
                  currentOutfitIndex + 1,
                  TOP_K_OUTFITS.length
                )}
                /
                {TOP_K_OUTFITS.length}
              </Text>
            </View>

            {/* ----------------------------------------- */}
            {/* CURRENT CARD */}
            {/* ----------------------------------------- */}

            {currentOutfit ? (
              <>
                <View
                  style={styles.cardWrapper}
                >
                  {/* LIKE */}
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.swipeLabel,
                      styles.likeLabel,
                      {
                        opacity:
                          likeOpacity,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.likeLabelText
                      }
                    >
                      LIKE
                    </Text>
                  </Animated.View>

                  {/* PASS */}
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.swipeLabel,
                      styles.passLabel,
                      {
                        opacity:
                          passOpacity,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.passLabelText
                      }
                    >
                      PASS
                    </Text>
                  </Animated.View>

                  <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                      styles.outfitCard,
                      {
                        transform: [
                          {
                            translateX:
                              position.x,
                          },
                          {
                            translateY:
                              position.y,
                          },
                          {
                            rotate:
                              cardRotate,
                          },
                        ],
                      },
                    ]}
                  >
                    {/* --------------------------------- */}
                    {/* TRANSPARENT CLOTHING ONLY */}
                    {/* --------------------------------- */}

                    <View
                      style={
                        styles.cardImageArea
                      }
                    >
                      <Image
                        source={
                          currentOutfit.top
                            .image
                        }
                        style={
                          styles.cardTop
                        }
                        resizeMode="contain"
                      />

                      <Image
                        source={
                          currentOutfit
                            .bottom
                            .image
                        }
                        style={
                          styles.cardBottom
                        }
                        resizeMode="contain"
                      />
                    </View>

                    <View
                      style={
                        styles.cardInfo
                      }
                    >
                      <Text
                        style={
                          styles.cardTitle
                        }
                      >
                        {
                          currentOutfit.title
                        }
                      </Text>

                      <View
                        style={
                          styles.tagRow
                        }
                      >
                        <View
                          style={styles.tag}
                        >
                          <Text
                            style={
                              styles.tagText
                            }
                          >
                            {
                              currentOutfit.occasion
                            }
                          </Text>
                        </View>

                        <View
                          style={styles.tag}
                        >
                          <Text
                            style={
                              styles.tagText
                            }
                          >
                            {
                              currentOutfit.vibe
                            }
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                </View>

                {/* ------------------------------------- */}
                {/* BUTTONS */}
                {/* ------------------------------------- */}

                <View
                  style={styles.actionRow}
                >
                  <Pressable
                    onPress={() =>
                      completeSwipe(
                        'left'
                      )
                    }
                    style={[
                      styles.actionButton,
                      styles.passButton,
                    ]}
                  >
                    <Text
                      style={
                        styles.passButtonText
                      }
                    >
                      ✕
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      completeSwipe(
                        'right'
                      )
                    }
                    style={[
                      styles.actionButton,
                      styles.likeButton,
                    ]}
                  >
                    <Text
                      style={
                        styles.likeButtonText
                      }
                    >
                      ♥
                    </Text>
                  </Pressable>
                </View>

                <Text
                  style={styles.swipeHint}
                >
                  ← Swipe left to pass •
                  Swipe right to like →
                </Text>
              </>
            ) : (
              /* --------------------------------------- */
              /* ALL K OUTFITS EXPLORED */
              /* --------------------------------------- */

              <View
                style={styles.finishedCard}
              >
                <Text
                  style={
                    styles.finishedIcon
                  }
                >
                  ✓
                </Text>

                <Text
                  style={
                    styles.finishedTitle
                  }
                >
                  All looks explored
                </Text>

                <Text
                  style={
                    styles.finishedText
                  }
                >
                  You've gone through all{' '}
                  {TOP_K_OUTFITS.length}{' '}
                  recommendations.
                </Text>

                <Text
                  style={
                    styles.likedCount
                  }
                >
                  ♥ {likedOutfits.length}{' '}
                  look
                  {likedOutfits.length !==
                    1
                    ? 's'
                    : ''}{' '}
                  saved
                </Text>

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
                      VIEW LIKED LOOKS
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={
                    restartStyling
                  }
                  style={
                    styles.startOverButton
                  }
                >
                  <Text
                    style={
                      styles.startOverText
                    }
                  >
                    START OVER
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

      {/* ================================================= */}
      {/* LIKED LOOKS */}
      {/* ================================================= */}

      {hasPrompt &&
        showLikedLooks &&
        !selectedOutfit && (
          <View
            style={styles.likedSection}
          >
            <View
              style={
                styles.likedHeader
              }
            >
              <View>
                <Text
                  style={styles.sectionLabel}
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
                  (outfit) => (
                    <View
                      key={outfit.id}
                      style={
                        styles.likedCard
                      }
                    >
                      {/* CLOTHING ONLY */}
                      <View
                        style={
                          styles.likedImageArea
                        }
                      >
                        <Image
                          source={
                            outfit.top
                              .image
                          }
                          style={
                            styles.likedTop
                          }
                          resizeMode="contain"
                        />

                        <Image
                          source={
                            outfit
                              .bottom
                              .image
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
                          {
                            outfit.title
                          }
                        </Text>

                        <Text
                          style={
                            styles.likedCardSubtitle
                          }
                        >
                          {
                            outfit.occasion
                          }{' '}
                          •{' '}
                          {outfit.vibe}
                        </Text>

                        <Pressable
                          onPress={() =>
                            selectLikedOutfit(
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
                            SELECT THIS LOOK
                          </Text>
                        </Pressable>
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
      {/* STATE 3 */}
      {/* SELECTED LOOK ON MODEL */}
      {/* ================================================= */}

      {selectedOutfit && (
        <>
          <View
            style={
              styles.selectedMirrorContainer
            }
          >
            <View
              style={
                styles.selectedHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  MIRROR PREVIEW
                </Text>

                <Text
                  style={
                    styles.selectedTitle
                  }
                >
                  {selectedOutfit.title}
                </Text>
              </View>

              <Text
                style={styles.likedText}
              >
                ♥ LIKED
              </Text>
            </View>

            <View
              style={styles.mirrorCanvas}
            >
              {/* --------------------------------------- */}
              {/* MODEL */}
              {/* --------------------------------------- */}

              <Image
                source={WOMAN_IMAGE}
                style={styles.modelImage}
                resizeMode="contain"
              />

              {/* --------------------------------------- */}
              {/* TOP */}
              {/* --------------------------------------- */}

              {selectedTop && (
                <Image
                  source={
                    selectedTop.image
                  }
                  style={styles.mirrorTop}
                  resizeMode="contain"
                />
              )}

              {/* --------------------------------------- */}
              {/* BOTTOM */}
              {/* --------------------------------------- */}

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

              {/* --------------------------------------- */}
              {/* EXTRA LAYER */}
              {/* --------------------------------------- */}

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

              {/* --------------------------------------- */}
              {/* TRY ON LOADING */}
              {/* --------------------------------------- */}

              {isTryingOn && (
                <View
                  style={
                    styles.loadingOverlay
                  }
                >
                  <ActivityIndicator
                    size="large"
                    color="#ffffff"
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Creating try-on
                    preview...
                  </Text>
                </View>
              )}

              {/* --------------------------------------- */}
              {/* TRY ON RESULT */}
              {/* --------------------------------------- */}

              {tryOnResult &&
                !isTryingOn && (
                  <View
                    style={
                      styles.previewBadge
                    }
                  >
                    <Text
                      style={
                        styles.previewBadgeText
                      }
                    >
                      ✓ TRY-ON PREVIEW
                    </Text>
                  </View>
                )}
            </View>
          </View>

          {/* ================================================= */}
          {/* ADD LAYER */}
          {/* ================================================= */}

          <View
            style={styles.layerSection}
          >
            <Pressable
              onPress={() =>
                setShowLayerOptions(
                  (previous) =>
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

                {TOPS.map((item) => (
                  <Pressable
                    key={item.id}
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
                      source={item.image}
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
                ))}
              </View>
            )}
          </View>

          {/* ================================================= */}
          {/* TRY ON */}
          {/* ================================================= */}

          <Pressable
            onPress={handleTryOn}
            disabled={isTryingOn}
            style={[
              styles.tryOnButton,
              isTryingOn &&
                styles.tryOnButtonDisabled,
            ]}
          >
            {isTryingOn ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text
                style={
                  styles.tryOnButtonText
                }
              >
                TRY ON THIS LOOK
              </Text>
            )}
          </Pressable>

          {/* ================================================= */}
          {/* CHANGE LOOK */}
          {/* ================================================= */}

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
        </>
      )}
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

  // =======================================================
  // LABEL
  // =======================================================

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

  selectedMirrorContainer: {
    marginTop: 4,
    marginBottom: 18,
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

  // =======================================================
  // AI STYLIST
  // =======================================================

  stylistContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
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
  // SWIPE CARD
  // =======================================================

  cardWrapper: {
    minHeight: 550,
    position: 'relative',
    justifyContent: 'center',
  },

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
    width: '65%',
    height: '52%',
    top: '8%',
  },

  cardBottom: {
    position: 'absolute',
    width: '68%',
    height: '55%',
    bottom: '2%',
  },

  cardInfo: {
    padding: 18,
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
  // SWIPE LABELS
  // =======================================================

  swipeLabel: {
    position: 'absolute',
    top: 35,
    zIndex: 10,
    borderWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  likeLabel: {
    right: 20,
    borderColor: '#1C8B52',
    transform: [
      {
        rotate: '12deg',
      },
    ],
  },

  passLabel: {
    left: 20,
    borderColor: '#C84B4B',
    transform: [
      {
        rotate: '-12deg',
      },
    ],
  },

  likeLabelText: {
    color: '#1C8B52',
    fontSize: 20,
    fontWeight: '900',
  },

  passLabelText: {
    color: '#C84B4B',
    fontSize: 20,
    fontWeight: '900',
  },

  // =======================================================
  // ACTION BUTTONS
  // =======================================================

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginTop: 22,
  },

  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED8',
  },

  passButton: {
    borderColor: '#D96B6B',
  },

  likeButton: {
    borderColor: '#4E9E70',
  },

  passButtonText: {
    fontSize: 28,
    color: '#C84B4B',
  },

  likeButtonText: {
    fontSize: 28,
    color: '#2C8B55',
  },

  swipeHint: {
    textAlign: 'center',
    marginTop: 14,
    color: '#999',
    fontSize: 12,
  },

  // =======================================================
  // ALL OUTFITS EXPLORED
  // =======================================================

  finishedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    minHeight: 380,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderWidth: 1,
    borderColor: '#E5E1DC',
  },

  finishedIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F4EC',
    color: '#2C8B55',
    textAlign: 'center',
    lineHeight: 60,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 15,
  },

  finishedTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#222',
  },

  finishedText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },

  likedCount: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#2C8B55',
  },

  viewLikedButton: {
    marginTop: 22,
    backgroundColor: '#222',
    borderRadius: 15,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },

  viewLikedButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  startOverButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  startOverText: {
    color: '#777',
    fontSize: 11,
    fontWeight: '700',
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

  selectLookButton: {
    marginTop: 14,
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
  // SELECTED LOOK
  // =======================================================

  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  selectedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },

  likedText: {
    color: '#2C8B55',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },

  // =======================================================
  // ADD LAYER
  // =======================================================

  layerSection: {
    marginBottom: 15,
  },

  addLayerButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8D3CD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addLayerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  layerOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 10,
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
  // TRY ON
  // =======================================================

  tryOnButton: {
    height: 55,
    borderRadius: 17,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  tryOnButtonDisabled: {
    opacity: 0.7,
  },

  tryOnButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  // =======================================================
  // LOADING
  // =======================================================

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },

  previewBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // =======================================================
  // CHANGE LOOK
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
});