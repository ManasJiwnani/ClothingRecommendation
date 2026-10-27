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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SymbolView } from 'expo-symbols';
import { aiApiFetch } from '../lib/api';
import {
  getTryOnFallbackImage,
  TRY_ON_FALLBACK_DELAY_MS,
} from '../services/try-on-fallback';

const WOMAN_IMAGE = require('../assets/woman.png');

export default function TryOnScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const params = useLocalSearchParams<{
    top?: string;
    bottom?: string;
    intent?: string;
  }>();

  const [isTryingOn, setIsTryingOn] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [showTryOnFallback, setShowTryOnFallback] = useState(false);
  const [tryOnError, setTryOnError] = useState<string | null>(null);
  const [activePiece, setActivePiece] = useState<'top' | 'bottom' | null>(null);

  const topImage =
    typeof params.top === 'string' && params.top.length > 0
      ? params.top
      : null;

  const bottomImage =
    typeof params.bottom === 'string' && params.bottom.length > 0
      ? params.bottom
      : null;
  const intent = typeof params.intent === 'string' ? params.intent : '';
  const fallbackImage = getTryOnFallbackImage(intent);

  const createTryOn = async () => {
    if (!topImage && !bottomImage) {
      return;
    }

    setIsTryingOn(true);
    setTryOnResult(null);
    setShowTryOnFallback(false);
    setTryOnError(null);
    const fallbackTimer = setTimeout(
      () => setShowTryOnFallback(true),
      TRY_ON_FALLBACK_DELAY_MS
    );

    try {
      const response = await aiApiFetch<{ image_url: string }>(
        '/virtual-try-on',
        {
          method: 'POST',
          body: JSON.stringify({
            top: topImage,
            bottom: bottomImage,
            shoes: null,
          }),
        }
      );

      if (!response.image_url) {
        throw new Error('The virtual try-on service returned no image.');
      }

      setTryOnResult(response.image_url);
      setShowTryOnFallback(false);
    } catch (error) {
      console.error('Failed to create virtual try-on:', error);
      setShowTryOnFallback(true);
      setTryOnError(
        error instanceof Error
          ? error.message
          : 'Could not create the virtual try-on. Please try again.'
      );
    } finally {
      clearTimeout(fallbackTimer);
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
                Preview your pieces, then create your look.
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>YOUR OUTFIT</Text>
              <Text style={styles.sectionTitle}>Selected pieces</Text>
            </View>
            <View style={styles.pieceCount}>
              <Text style={styles.pieceCountText}>
                {(topImage ? 1 : 0) + (bottomImage ? 1 : 0)} PIECES
              </Text>
            </View>
          </View>

          {/* TRY-ON PREVIEW */}

          <View
            style={[
              styles.previewCard,
              { height: Math.min(500, Math.max(360, windowHeight * 0.56)) },
            ]}
          >
            <View style={styles.itemsColumn}>
              {topImage && (
                <Pressable
                  onPress={() => setActivePiece('top')}
                  accessibilityRole="button"
                  accessibilityLabel="Focus top garment"
                  accessibilityState={{ selected: activePiece === 'top' }}
                  style={({ pressed }) => [
                    styles.itemPreview,
                    activePiece === 'top' && styles.itemPreviewActive,
                    pressed && styles.itemPreviewPressed,
                  ]}
                >
                  <Image
                    source={{ uri: topImage }}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemLabel}>TOP</Text>
                    {activePiece === 'top' && (
                      <SymbolView
                        name={{
                          ios: 'checkmark.circle.fill',
                          android: 'check_circle',
                          web: 'check_circle',
                        }}
                        size={14}
                        tintColor="#745a38"
                      />
                    )}
                  </View>
                </Pressable>
              )}

              {bottomImage && (
                <Pressable
                  onPress={() => setActivePiece('bottom')}
                  accessibilityRole="button"
                  accessibilityLabel="Focus bottom garment"
                  accessibilityState={{ selected: activePiece === 'bottom' }}
                  style={({ pressed }) => [
                    styles.itemPreview,
                    activePiece === 'bottom' && styles.itemPreviewActive,
                    pressed && styles.itemPreviewPressed,
                  ]}
                >
                  <Image
                    source={{ uri: bottomImage }}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemLabel}>BOTTOM</Text>
                    {activePiece === 'bottom' && (
                      <SymbolView
                        name={{
                          ios: 'checkmark.circle.fill',
                          android: 'check_circle',
                          web: 'check_circle',
                        }}
                        size={14}
                        tintColor="#745a38"
                      />
                    )}
                  </View>
                </Pressable>
              )}
            </View>

            <View style={styles.modelColumn}>
              <View style={styles.modelBadge}>
                <SymbolView
                  name={{
                    ios: tryOnResult ? 'sparkles' : 'person.crop.rectangle',
                    android: tryOnResult ? 'auto_awesome' : 'person',
                    web: tryOnResult ? 'auto_awesome' : 'person',
                  }}
                  size={12}
                  tintColor="#745a38"
                />
                <Text style={styles.modelBadgeText}>
                  {tryOnResult
                    ? 'YOUR LOOK'
                    : showTryOnFallback && fallbackImage
                      ? 'STYLE PREVIEW'
                      : 'MODEL PREVIEW'}
                </Text>
              </View>

              <Image
                source={
                  tryOnResult
                    ? { uri: tryOnResult }
                    : showTryOnFallback && fallbackImage
                      ? fallbackImage
                      : WOMAN_IMAGE
                }
                style={styles.modelImage}
                resizeMode="contain"
              />

              {isTryingOn && !showTryOnFallback && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.loadingTitle}>Creating your look</Text>
                  <Text style={styles.loadingText}>
                    Your virtual try-on is being prepared...
                  </Text>
                </View>
              )}
              {tryOnResult && !isTryingOn && (
                <View style={styles.resultBadge}>
                  <SymbolView
                    name={{
                      ios: 'checkmark.circle.fill',
                      android: 'check_circle',
                      web: 'check_circle',
                    }}
                    size={14}
                    tintColor="#745a38"
                  />
                  <Text style={styles.resultBadgeText}>TRY-ON READY</Text>
                </View>
              )}
            </View>
          </View>

          {(showTryOnFallback || tryOnError) && !tryOnResult && (
            <View style={styles.fallbackNotice}>
              <SymbolView
                name={{
                  ios: 'info.circle.fill',
                  android: 'info',
                  web: 'info',
                }}
                size={17}
                tintColor="#745a38"
              />
              <Text style={styles.fallbackNoticeText} selectable>
                {fallbackImage
                  ? 'Style reference only — this is not your generated try-on, so it may not match the garments on the left.'
                  : 'The preview does not show your selected garments.'}
                {isTryingOn
                  ? ' Your try-on is still processing.'
                  : tryOnError
                    ? ' The try-on could not be created.'
                    : ''}
              </Text>
            </View>
          )}

          <Text style={styles.interactionHint}>
            Tap a clothing piece to focus it in your outfit.
          </Text>

          {tryOnError && (
            <View style={styles.errorBox}>
              <SymbolView
                name={{
                  ios: 'exclamationmark.triangle',
                  android: 'warning',
                  web: 'warning',
                }}
                size={16}
                tintColor="#a23b32"
              />
              <Text style={styles.errorText} selectable>
                {tryOnError}
              </Text>
            </View>
          )}

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
                onPress={createTryOn}
                disabled={isTryingOn}
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
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
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

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionKicker: {
    color: '#8a7b68',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
  },

  sectionTitle: {
    color: '#1b1c1a',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 3,
  },

  pieceCount: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#eee9e2',
  },

  pieceCountText: {
    color: '#745a38',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  /* TRY-ON PREVIEW */

  previewCard: {
    width: '100%',
    height: 460,
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#f1eee9',
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e4e2df',
  },

  itemsColumn: {
    width: '36%',
    padding: 8,
    gap: 8,
  },

  itemPreview: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e2df',
    overflow: 'hidden',
  },

  itemPreviewActive: {
    borderColor: '#b18b5b',
    borderWidth: 2,
    backgroundColor: '#fffdf9',
  },

  itemPreviewPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  itemFooter: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },

  itemImage: {
    flex: 1,
    width: '100%',
  },

  itemLabel: {
    color: '#625b52',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  modelColumn: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#e9e5e0',
    borderLeftWidth: 1,
    borderLeftColor: '#e4e2df',
  },

  modelImage: {
    width: '100%',
    height: '100%',
  },

  modelBadge: {
    position: 'absolute',
    zIndex: 2,
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },

  modelBadgeText: {
    color: '#625b52',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  interactionHint: {
    color: '#8a8278',
    fontSize: 11,
    marginTop: -10,
    marginBottom: 14,
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

  fallbackNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 12,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: '#f3ede3',
    borderWidth: 1,
    borderColor: '#e4d8c6',
  },

  fallbackNoticeText: {
    flex: 1,
    color: '#625b52',
    fontSize: 12,
    lineHeight: 17,
  },

  resultBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff1ef',
    borderWidth: 1,
    borderColor: '#f0d0cc',
    marginBottom: 12,
  },

  errorText: {
    flex: 1,
    color: '#a23b32',
    fontSize: 12,
    lineHeight: 17,
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