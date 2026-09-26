import { SymbolView } from 'expo-symbols';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';

export default function TryOnScreen() {
  const router = useRouter();

  // These will come from mirror.tsx later
  const { top, bottom } = useLocalSearchParams<{
    top?: string;
    bottom?: string;
  }>();

  // --------------------------------------------------
  // TEMPORARY HARDCODED VIRTUAL TRY-ON OUTPUT
  // --------------------------------------------------
  const hardcodedTryOnImage =
    'https://res.cloudinary.com/cipdrmjm/image/upload/v1789964350/closet_wardrobe/th867rctfqknjxy1l1m6.png';

  return (
    <ThemedView style={styles.container}>
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
              <ThemedText style={styles.kicker}>
                STYLE SENSE
              </ThemedText>

              <ThemedText style={styles.title}>
                Virtual Try-On
              </ThemedText>

              <ThemedText style={styles.subtitle}>
                See how your selected outfit looks on you.
              </ThemedText>
            </View>
          </View>

          {/* TRY-ON RESULT */}
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <ThemedText style={styles.resultKicker}>
                TRY-ON PREVIEW
              </ThemedText>

              <View style={styles.aiBadge}>
                <SymbolView
                  name={{
                    ios: 'sparkles',
                    android: 'auto_awesome',
                    web: 'auto_awesome',
                  }}
                  size={14}
                  tintColor="#745a38"
                />

                <ThemedText style={styles.aiBadgeText}>
                  AI PREVIEW
                </ThemedText>
              </View>
            </View>

            {/* HARD-CODED OUTPUT */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: hardcodedTryOnImage }}
                style={styles.tryOnImage}
                resizeMode="contain"
              />

              {/* TEMPORARY LABEL */}
              <View style={styles.previewLabel}>
                <ThemedText style={styles.previewLabelText}>
                  VIRTUAL TRY-ON
                </ThemedText>
              </View>
            </View>

            <View style={styles.resultInfo}>
              <ThemedText style={styles.resultTitle}>
                Your Outfit Preview
              </ThemedText>

              <ThemedText style={styles.resultDescription}>
                This is a temporary hardcoded preview. Your actual
                virtual try-on model will generate the final result here.
              </ThemedText>
            </View>
          </View>

          {/* SELECTED ITEMS */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionKicker}>
              SELECTED OUTFIT
            </ThemedText>

            <View style={styles.itemsRow}>

              {/* TOP */}
              <View style={styles.itemCard}>
                {top ? (
                  <Image
                    source={{ uri: top }}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.emptyItem}>
                    <SymbolView
                      name={{
                        ios: 'tshirt',
                        android: 'checkroom',
                        web: 'checkroom',
                      }}
                      size={24}
                      tintColor="#9b9892"
                    />
                  </View>
                )}

                <ThemedText style={styles.itemLabel}>
                  TOP
                </ThemedText>
              </View>

              {/* BOTTOM */}
              <View style={styles.itemCard}>
                {bottom ? (
                  <Image
                    source={{ uri: bottom }}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.emptyItem}>
                    <SymbolView
                      name={{
                        ios: 'rectangle',
                        android: 'checkroom',
                        web: 'checkroom',
                      }}
                      size={24}
                      tintColor="#9b9892"
                    />
                  </View>
                )}

                <ThemedText style={styles.itemLabel}>
                  BOTTOM
                </ThemedText>
              </View>

            </View>
          </View>

          {/* ACTIONS */}
          <View style={styles.actions}>

            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                // Later:
                // Call your actual virtual try-on API here
              }}
            >
              <SymbolView
                name={{
                  ios: 'arrow.clockwise',
                  android: 'refresh',
                  web: 'refresh',
                }}
                size={18}
                tintColor="#ffffff"
              />

              <ThemedText style={styles.primaryButtonText}>
                TRY AGAIN
              </ThemedText>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <SymbolView
                name={{
                  ios: 'chevron.left',
                  android: 'arrow_back',
                  web: 'arrow_back',
                }}
                size={18}
                tintColor="#745a38"
              />

              <ThemedText style={styles.secondaryButtonText}>
                CHANGE OUTFIT
              </ThemedText>
            </Pressable>

          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              STYLE SENSE · VIRTUAL FIT PREVIEW
            </ThemedText>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
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
    padding: Spacing.three,
    paddingBottom: 100,
    gap: 22,
  },

  // --------------------------------------------------
  // HEADER
  // --------------------------------------------------

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0eeea',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerText: {
    flex: 1,
  },

  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: '#745a38',
  },

  title: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 38,
    marginTop: 3,
  },

  subtitle: {
    color: '#747878',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },

  // --------------------------------------------------
  // RESULT CARD
  // --------------------------------------------------

  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    boxShadow: '0 5px 18px rgba(24, 22, 20, 0.10)',
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingTop: 3,
    paddingBottom: 10,
  },

  resultKicker: {
    color: '#745a38',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#f0eeea',
  },

  aiBadgeText: {
    color: '#745a38',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  imageContainer: {
    height: 470,
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f4f1ec',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  tryOnImage: {
    width: '90%',
    height: '90%',
  },

  previewLabel: {
    position: 'absolute',
    left: 12,
    top: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },

  previewLabelText: {
    color: '#745a38',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },

  resultInfo: {
    paddingHorizontal: 5,
    paddingTop: 14,
    paddingBottom: 4,
  },

  resultTitle: {
    fontFamily: Fonts.serif,
    fontSize: 21,
    marginBottom: 4,
  },

  resultDescription: {
    color: '#747878',
    fontSize: 12,
    lineHeight: 18,
  },

  // --------------------------------------------------
  // SELECTED OUTFIT
  // --------------------------------------------------

  section: {
    gap: 10,
  },

  sectionKicker: {
    color: '#745a38',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  itemsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  itemCard: {
    flex: 1,
    height: 125,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e2df',
    overflow: 'hidden',
    position: 'relative',
  },

  itemImage: {
    width: '100%',
    height: '100%',
  },

  emptyItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f1ec',
  },

  itemLabel: {
    position: 'absolute',
    bottom: 7,
    left: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.88)',
    color: '#745a38',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // --------------------------------------------------
  // ACTIONS
  // --------------------------------------------------

  actions: {
    gap: 9,
  },

  primaryButton: {
    height: 55,
    borderRadius: 13,
    backgroundColor: '#1b1c1a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  secondaryButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: '#f0eeea',
    borderWidth: 1,
    borderColor: '#e4e2df',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  secondaryButtonText: {
    color: '#745a38',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.9,
  },

  // --------------------------------------------------
  // FOOTER
  // --------------------------------------------------

  footer: {
    alignItems: 'center',
    paddingVertical: 5,
  },

  footerText: {
    color: '#747878',
    fontSize: 8,
    letterSpacing: 1.3,
    fontWeight: '700',
  },
});
