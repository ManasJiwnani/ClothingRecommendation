import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, Spacing } from '@/constants/theme';

const presets = [
  'Today\'s Weather',
  'Dinner in Brera',
  'Casual Meeting',
  'Weekend Gallery',
];

const occasions = ['Work', 'Weekend', 'Evening'];

/*
 * TEMPORARY MOCK DATA
 *
 * These URLs represent the individual transparent clothing
 * images that will eventually come from your backend.
 *
 * Replace these URLs with your actual image URLs.
 */
const looks = [
  {
    title: 'Modern Atelier',
    note: 'A relaxed everyday look with a clean, effortless silhouette.',
    occasion: 'WORK · SMART CASUAL',

    items: {
      top: 'https://res.cloudinary.com/cipdrmjm/image/upload/v1789714178/closet_wardrobe/k2zr1rltdyljfr9sjnn7.png',
      bottom: 'https://res.cloudinary.com/cipdrmjm/image/upload/v1789984654/closet_wardrobe/w0ggbtoqaya4l850tqfh.png',
      shoes: 'https://res.cloudinary.com/cipdrmjm/image/upload/v1789964461/closet_wardrobe/dq7dau60f6sysqqgh6ec.png',
    },
  },

  {
    title: 'Weekend Edit',
    note: 'An easy combination designed for a relaxed weekend mood.',
    occasion: 'WEEKEND · CASUAL',

    items: {
      top: 'https://res.cloudinary.com/cipdrmjm/image/upload/v1789964350/closet_wardrobe/th867rctfqknjxy1l1m6.png',
      bottom: 'https://res.cloudinary.com/cipdrmjm/image/upload/v1789984654/closet_wardrobe/w0ggbtoqaya4l850tqfh.png',
      shoes: 'https://res.cloudinary.com/cipdrmjm/image/upload/v1789964461/closet_wardrobe/dq7dau60f6sysqqgh6ec.png',
    },
  },
] as const;

export default function StylistScreen() {
  const [occasion, setOccasion] = useState('Work');
  const [lookIndex, setLookIndex] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isWorn, setIsWorn] = useState(false);

  const look = looks[lookIndex];

  const shuffleLook = () => {
    setLookIndex((current) => (current + 1) % looks.length);
    setIsWorn(false);
    setIsSaved(false);
  };

   const shareLook = async () => {
       try {
         await Share.share({
           message: `Check out my ${look.title} outfit from Style Sense!`,
         });
       } catch (error) {
         console.log('Share error:', error);
       }
     };
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <ThemedText style={styles.kicker}>
                  STYLE SENSE
                </ThemedText>

                <ThemedText
                  style={{
                    fontFamily: Fonts.serif,
                    fontSize: 32,
                    lineHeight: 40,
                    fontWeight: '500',
                    marginTop: 4,
                  }}
                >
                  Bonjour, Elena
                </ThemedText>
              </View>

              <View style={styles.headerWeather}>
                <ThemedText style={styles.weatherText}>
                  PARIS
                </ThemedText>

                <ThemedText style={styles.weatherTemperature}>
                  19°C
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.subtitle}>
              Your stylist has styled an outfit for your day in Paris.
            </ThemedText>
          </View>

          {/* PRESETS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetRow}
          >
            {presets.map((preset, index) => (
              <Pressable
                key={preset}
                onPress={() => setPrompt(`Curate: ${preset}`)}
                style={[
                  styles.preset,
                  index === 0 && styles.presetSelected,
                ]}
              >
                <ThemedText style={styles.presetEmoji}>
                  {['☀', '◌', '▣', '✦'][index]}
                </ThemedText>

                <ThemedText
                  style={[
                    styles.presetText,
                    index === 0 && styles.presetTextSelected,
                  ]}
                >
                  {preset}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {/* OUTFIT CARD */}
          <View style={styles.lookCard}>

            {/* CARD HEADER */}
            <View style={styles.outfitCardHeader}>
              <View>
                <ThemedText style={styles.lookKicker}>
                  CURATED RECOMMENDATION
                </ThemedText>

                <ThemedText style={styles.lookTitle}>
                  {look.title}
                </ThemedText>
              </View>

              <Pressable
                accessibilityLabel="Save outfit"
                onPress={() =>
                  setIsSaved((current) => !current)
                }
                style={styles.saveButton}
              >
                <SymbolView
                  name={{
                    ios: isSaved
                      ? 'bookmark.fill'
                      : 'bookmark',
                    android: isSaved
                      ? 'bookmark'
                      : 'bookmark_border',
                    web: isSaved
                      ? 'bookmark'
                      : 'bookmark_border',
                  }}
                  size={19}
                  tintColor="#745a38"
                />
              </Pressable>
            </View>

            {/* OUTFIT CANVAS */}
            <View style={styles.outfitCanvas}>

              <View style={styles.canvasLabel}>
                <ThemedText style={styles.canvasLabelText}>
                  YOUR LOOK
                </ThemedText>
              </View>

              {/* TOP */}
              <Image
                source={{ uri: look.items.top }}
                style={styles.topItem}
                resizeMode="contain"
              />

              {/* BOTTOM */}
              <Image
                source={{ uri: look.items.bottom }}
                style={styles.bottomItem}
                resizeMode="contain"
              />

              {/* SHOES */}
              <Image
                source={{ uri: look.items.shoes }}
                style={styles.shoesItem}
                resizeMode="contain"
              />


            </View>

            {/* OUTFIT INFORMATION */}
            <View style={styles.outfitInfo}>
              <View style={styles.outfitInfoLeft}>
                <ThemedText style={styles.outfitOccasion}>
                  {look.occasion}
                </ThemedText>

                <ThemedText style={styles.outfitDescription}>
                  {look.note}
                </ThemedText>
              </View>

              <View style={styles.weatherBadge}>
                <ThemedText style={styles.weatherBadgeTemp}>
                  19°
                </ThemedText>

                <ThemedText style={styles.weatherBadgeText}>
                  PARIS
                </ThemedText>
              </View>
            </View>

            {/* ACTIONS */}
            <View style={styles.cardActions}>

              {/* SHARE */}
              
              <Pressable
                onPress={shareLook}
                style={styles.cardActionSecondary}
              >
                <SymbolView
                  name={{
                    ios: 'square.and.arrow.up',
                    android: 'share',
                    web: 'share',
                  }}
                  size={20}
                  tintColor="#745a38"
                />

                <ThemedText style={styles.cardActionText}>
                  SHARE
                </ThemedText>
              </Pressable>

              {/* WEAR TODAY */}
              <Pressable
                onPress={() =>
                  setIsWorn((current) => !current)
                }
                style={styles.cardActionPrimary}
              >
                <SymbolView
                  name={{
                    ios: isWorn
                      ? 'checkmark.circle.fill'
                      : 'checkmark',
                    android: 'check',
                    web: 'check',
                  }}
                  size={18}
                  tintColor="#ffddb4"
                />

                <ThemedText style={styles.cardActionPrimaryText}>
                  {isWorn ? 'WORN TODAY' : 'WEAR TODAY'}
                </ThemedText>
              </Pressable>

              {/* SHUFFLE */}
              <Pressable
                onPress={shuffleLook}
                style={styles.cardActionSecondary}
              >
                <SymbolView
                  name={{
                    ios: 'shuffle',
                    android: 'shuffle',
                    web: 'shuffle',
                  }}
                  size={20}
                  tintColor="#745a38"
                />

                <ThemedText style={styles.cardActionText}>
                  SHUFFLE
                </ThemedText>
              </Pressable>

            </View>
          </View>

          {/* PROMPT */}
          <View style={styles.promptBox}>
            <SymbolView
              name={{
                ios: 'wand.and.stars',
                android: 'auto_awesome',
                web: 'auto_awesome',
              }}
              size={18}
              tintColor="#745a38"
            />

            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Ask Élise to refine this look"
              placeholderTextColor="#747878"
              style={styles.promptInput}
            />

            <Pressable
              accessibilityLabel="Send to Elise"
              onPress={() => setPrompt('')}
              style={styles.sendButton}
            >
              <SymbolView
                name={{
                  ios: 'arrow.up',
                  android: 'arrow_upward',
                  web: 'arrow_upward',
                }}
                size={17}
                tintColor="#ffddb4"
              />
            </Pressable>
          </View>

          {/* FOOTER */}
          <View style={styles.colophon}>
            <ThemedText style={styles.colophonText}>
              STYLE SENSE · EDITED WITH INTENTION
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
    paddingBottom: BottomTabInset + 120,
    gap: Spacing.three,
  },

  header: {
    gap: 5,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#745a38',
  },

  subtitle: {
    color: '#747878',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 290,
  },

  headerWeather: {
    alignItems: 'flex-end',
    gap: 2,
  },

  weatherText: {
    color: '#747878',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },

  weatherTemperature: {
    color: '#745a38',
    fontFamily: Fonts.serif,
    fontSize: 18,
  },

  presetRow: {
    gap: 8,
  },

  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#f0eeea',
  },

  presetSelected: {
    backgroundColor: '#1b1c1a',
  },

  presetEmoji: {
    color: '#745a38',
    fontSize: 14,
  },

  presetText: {
    color: '#1b1c1a',
    fontSize: 12,
    fontWeight: '600',
  },

  presetTextSelected: {
    color: '#ffffff',
  },

  lookCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    boxShadow: '0 5px 18px rgba(24, 22, 20, 0.10)',
  },

  outfitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingTop: 3,
    paddingBottom: 10,
  },

  lookKicker: {
    color: '#745a38',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  lookTitle: {
    fontFamily: Fonts.serif,
    fontSize: 25,
    lineHeight: 31,
    marginTop: 3,
  },

  saveButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0eeea',
  },

  /*
   * MAIN OUTFIT CANVAS
   */
  outfitCanvas: {
    width: '100%',
    height: 430,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f4f1ec',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  canvasLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },

  canvasLabelText: {
    color: '#745a38',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
  },

  /*
   * INDIVIDUAL CLOTHING LAYERS
   */

  topItem: {
    position: 'absolute',
    width: '72%',
    height: '42%',
    top: '7%',
    zIndex: 4,
  },

  bottomItem: {
    position: 'absolute',
    width: '58%',
    height: '38%',
    top: '40%',
    zIndex: 3,
  },

  shoesItem: {
    position: 'absolute',
    width: '45%',
    height: '18%',
    bottom: '4%',
    zIndex: 2,
  },

  bagItem: {
    position: 'absolute',
    width: '30%',
    height: '28%',
    right: '7%',
    top: '38%',
    zIndex: 5,
  },

  outfitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 5,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
  },

  outfitInfoLeft: {
    flex: 1,
  },

  outfitOccasion: {
    color: '#745a38',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 5,
  },

  outfitDescription: {
    color: '#606260',
    fontSize: 12,
    lineHeight: 17,
  },

  weatherBadge: {
    alignItems: 'flex-end',
    paddingLeft: 8,
  },

  weatherBadgeTemp: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#745a38',
  },

  weatherBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#747878',
    marginTop: 1,
  },

  cardActions: {
    flexDirection: 'row',
    gap: 7,
    paddingTop: 4,
  },

  cardActionSecondary: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: '#f0eeea',
    borderWidth: 1,
    borderColor: '#e4e2df',
  },

  cardActionPrimary: {
    flex: 1.5,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#1b1c1a',
  },

  cardActionText: {
    color: '#444748',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.9,
  },

  cardActionPrimaryText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  promptBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: '#f5f3f0',
    borderWidth: 1,
    borderColor: '#e4e2df',
  },

  promptInput: {
    flex: 1,
    color: '#1b1c1a',
    fontSize: 14,
    paddingVertical: 0,
  },

  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1c1a',
  },

  colophon: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },

  colophonText: {
    color: '#747878',
    fontSize: 8,
    letterSpacing: 1.3,
    fontWeight: '700',
  },
});