import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SymbolView } from 'expo-symbols';

export default function TryOnScreen() {
  const params = useLocalSearchParams<{
    top?: string;
    bottom?: string;
  }>();

  const [isTryingOn, setIsTryingOn] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);

  const topImage =
    typeof params.top === 'string' && params.top.length > 0
      ? params.top
      : null;

  const bottomImage =
    typeof params.bottom === 'string' && params.bottom.length > 0
      ? params.bottom
      : null;

  const createTryOn = async () => {
    if (!topImage && !bottomImage) {
      return;
    }

    try {
      setIsTryingOn(true);
      setTryOnResult(null);

      /*
       * =====================================================
       * VIRTUAL TRY-ON API
       * =====================================================
       *
       * Replace this section with your FastAPI endpoint.
       *
       * Example:
       *
       * const response = await fetch(
       *   'http://YOUR_IP:8000/virtual-try-on',
       *   {
       *     method: 'POST',
       *     headers: {
       *       'Content-Type': 'application/json',
       *     },
       *     body: JSON.stringify({
       *       top: topImage,
       *       bottom: bottomImage,
       *       user_image: USER_IMAGE_URL,
       *     }),
       *   }
       * );
       *
       * const data = await response.json();
       *
       * setTryOnResult(data.image_url);
       *
       */

      // TEMPORARY DEMO DELAY
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Temporary result.
      // Replace this with the image URL returned by your backend.
      setTryOnResult(null);
    } catch (error) {
      console.error('Try-on error:', error);
    } finally {
      setIsTryingOn(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <SymbolView
                name={{
                  ios: 'chevron.left',
                  android: 'arrow_back',
                  web: 'arrow_back',
                }}
                size={20}
                tintColor="#1b1c1a"
              />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.kicker}>
                VIRTUAL MIRROR
              </Text>

              <Text style={styles.title}>
                Try It On
              </Text>

              <Text style={styles.subtitle}>
                See how your selected outfit looks on you.
              </Text>
            </View>
          </View>

          {/* TRY-ON CANVAS */}

          <View style={styles.canvas}>
            <View style={styles.canvasLabel}>
              <Text style={styles.canvasLabelText}>
                OUTFIT PREVIEW
              </Text>
            </View>

            {/* TOP */}

            {topImage && (
              <Image
                source={{ uri: topImage }}
                style={styles.topItem}
                resizeMode="contain"
              />
            )}

            {/* BOTTOM */}

            {bottomImage && (
              <Image
                source={{ uri: bottomImage }}
                style={styles.bottomItem}
                resizeMode="contain"
              />
            )}

            {/* LOADING */}

            {isTryingOn && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator
                  size="large"
                  color="#ffffff"
                />

                <Text style={styles.loadingTitle}>
                  Creating your look
                </Text>

                <Text style={styles.loadingText}>
                  Your virtual try-on is being prepared...
                </Text>
              </View>
            )}

            {/* RESULT */}

            {tryOnResult && !isTryingOn && (
              <View style={styles.resultContainer}>
                <Image
                  source={{ uri: tryOnResult }}
                  style={styles.resultImage}
                  resizeMode="contain"
                />

                <View style={styles.resultBadge}>
                  <Text style={styles.resultBadgeText}>
                    ✓ TRY-ON COMPLETE
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* SELECTED ITEMS */}

          <View style={styles.section}>
            <Text style={styles.sectionKicker}>
              SELECTED OUTFIT
            </Text>

            <View style={styles.itemsRow}>
              {/* TOP CARD */}

              {topImage && (
                <View style={styles.itemCard}>
                  <View style={styles.itemImageContainer}>
                    <Image
                      source={{ uri: topImage }}
                      style={styles.itemImage}
                      resizeMode="contain"
                    />
                  </View>

                  <Text style={styles.itemLabel}>
                    TOP
                  </Text>
                </View>
              )}

              {/* BOTTOM CARD */}

              {bottomImage && (
                <View style={styles.itemCard}>
                  <View style={styles.itemImageContainer}>
                    <Image
                      source={{ uri: bottomImage }}
                      style={styles.itemImage}
                      resizeMode="contain"
                    />
                  </View>

                  <Text style={styles.itemLabel}>
                    BOTTOM
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* CREATE TRY ON */}

          {!tryOnResult && (
            <Pressable
              onPress={createTryOn}
              disabled={isTryingOn || (!topImage && !bottomImage)}
              style={[
                styles.tryOnButton,
                isTryingOn && styles.tryOnButtonDisabled,
              ]}
            >
              {isTryingOn ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#ffddb4"
                  />

                  <Text style={styles.tryOnButtonText}>
                    CREATING TRY-ON...
                  </Text>
                </>
              ) : (
                <>
                  <SymbolView
                    name={{
                      ios: 'camera.viewfinder',
                      android: 'camera',
                      web: 'camera',
                    }}
                    size={21}
                    tintColor="#ffddb4"
                  />

                  <Text style={styles.tryOnButtonText}>
                    CREATE TRY-ON
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* RESULT ACTIONS */}

          {tryOnResult && (
            <View style={styles.resultActions}>
              <Pressable
                onPress={() => {
                  setTryOnResult(null);
                }}
                style={styles.secondaryButton}
              >
                <SymbolView
                  name={{
                    ios: 'arrow.clockwise',
                    android: 'refresh',
                    web: 'refresh',
                  }}
                  size={18}
                  tintColor="#745a38"
                />

                <Text style={styles.secondaryButtonText}>
                  TRY AGAIN
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  BACK TO MIRROR
                </Text>
              </Pressable>
            </View>
          )}

          {/* INFO */}

          <View style={styles.infoBox}>
            <SymbolView
              name={{
                ios: 'sparkles',
                android: 'auto_awesome',
                web: 'auto_awesome',
              }}
              size={18}
              tintColor="#745a38"
            />

            <Text style={styles.infoText}>
              Your selected clothing pieces will be placed
              on your photo to create a virtual try-on.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },

  safeArea: {
    flex: 1,
  },

  content: {
    padding: 18,
    paddingBottom: 50,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0eeea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  kicker: {
    color: '#745a38',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 3,
  },

  title: {
    color: '#1b1c1a',
    fontSize: 30,
    fontWeight: '500',
    marginBottom: 4,
  },

  subtitle: {
    color: '#747878',
    fontSize: 13,
    lineHeight: 19,
  },

  /* CANVAS */

  canvas: {
    width: '100%',
    height: 520,
    borderRadius: 20,
    backgroundColor: '#f1eee9',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  canvasLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },

  canvasLabelText: {
    color: '#745a38',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
  },

  topItem: {
    position: 'absolute',
    width: '72%',
    height: '42%',
    top: '8%',
    zIndex: 4,
  },

  bottomItem: {
    position: 'absolute',
    width: '58%',
    height: '38%',
    top: '40%',
    zIndex: 3,
  },

  /* LOADING */

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(27,28,26,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },

  loadingTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 15,
  },

  loadingText: {
    color: '#d7d4cf',
    fontSize: 12,
    marginTop: 6,
  },

  /* RESULT */

  resultContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultImage: {
    width: '100%',
    height: '100%',
  },

  resultBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  resultBadgeText: {
    color: '#745a38',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },

  /* SECTION */

  section: {
    marginBottom: 18,
  },

  sectionKicker: {
    color: '#745a38',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
  },

  itemsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  itemCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 8,
  },

  itemImageContainer: {
    height: 100,
    borderRadius: 10,
    backgroundColor: '#f4f1ec',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemImage: {
    width: '90%',
    height: '90%',
  },

  itemLabel: {
    color: '#747878',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
    marginLeft: 3,
  },

  /* BUTTON */

  tryOnButton: {
    height: 56,
    borderRadius: 13,
    backgroundColor: '#1b1c1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },

  tryOnButtonDisabled: {
    opacity: 0.65,
  },

  tryOnButtonText: {
    color: '#ffddb4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  /* RESULT ACTIONS */

  resultActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#f0eeea',
    borderWidth: 1,
    borderColor: '#e4e2df',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  secondaryButtonText: {
    color: '#745a38',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  primaryButton: {
    flex: 1.3,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1b1c1a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  /* INFO */

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#f5f3f0',
    borderWidth: 1,
    borderColor: '#e4e2df',
    marginTop: 5,
  },

  infoText: {
    flex: 1,
    color: '#747878',
    fontSize: 11,
    lineHeight: 16,
  },
});