import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, Spacing } from '@/constants/theme';

import womanImage from '../assets/woman.png';
import goldHoops from '../assets/goldHoops.png';
import leatherBelt from '../assets/leatherBelt.png';
import shoulderBag from '../assets/shoulderBag.png';
import whiteSneakers from '../assets/whiteSneakers.png';


type Vibe = {
  id: string;
  label: string;
  icon: string;
};

type Occasion = {
  id: string;
  label: string;
  icon: string;
};

type Outfit = {
  name: string;
  description: string;
  top: string;
  bottom: string;
  shoes: string;
  accessory: string;
};

const vibes: Vibe[] = [
  {
    id: 'effortless',
    label: 'Effortless',
    icon: 'sparkles',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    icon: 'circle',
  },
  {
    id: 'casual',
    label: 'Casual',
    icon: 'sun.max.fill',
  },
  {
    id: 'polished',
    label: 'Polished',
    icon: 'briefcase.fill',
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: 'moon.fill',
  },
  {
    id: 'feminine',
    label: 'Feminine',
    icon: 'heart.fill',
  },
];

const occasions: Occasion[] = [
  {
    id: 'college',
    label: 'College',
    icon: 'book.fill',
  },
  {
    id: 'presentation',
    label: 'Presentation',
    icon: 'briefcase.fill',
  },
  {
    id: 'casual-day',
    label: 'Casual day',
    icon: 'sun.max.fill',
  },
  {
    id: 'dinner',
    label: 'Dinner',
    icon: 'fork.knife',
  },
  {
    id: 'party',
    label: 'Party',
    icon: 'party.popper.fill',
  },
];

const outfitMap: Record<string, Record<string, Outfit>> = {
  effortless: {
    college: {
      name: 'Easy Campus',
      description: 'Comfortable, relaxed and effortless.',
      top: 'Relaxed White Tee',
      bottom: 'Straight Blue Jeans',
      shoes: 'White Sneakers',
      accessory: 'Canvas Tote',
    },
    presentation: {
      name: 'Effortless Smart',
      description: 'Polished without looking overdone.',
      top: 'White Button-Up',
      bottom: 'Tailored Black Trousers',
      shoes: 'Loafers',
      accessory: 'Minimal Watch',
    },
    'casual-day': {
      name: 'Everyday Ease',
      description: 'Simple pieces for an easy day.',
      top: 'Neutral T-Shirt',
      bottom: 'Straight Jeans',
      shoes: 'White Sneakers',
      accessory: 'Shoulder Bag',
    },
    dinner: {
      name: 'Relaxed Dinner',
      description: 'Simple with a little sophistication.',
      top: 'Satin Neutral Top',
      bottom: 'Black Trousers',
      shoes: 'Low Heels',
      accessory: 'Small Shoulder Bag',
    },
    party: {
      name: 'Easy Night Out',
      description: 'Relaxed pieces with a statement finish.',
      top: 'Statement Top',
      bottom: 'Dark Straight Jeans',
      shoes: 'Heeled Sandals',
      accessory: 'Statement Earrings',
    },
  },

  minimal: {
    college: {
      name: 'Clean Campus',
      description: 'Clean silhouettes and neutral tones.',
      top: 'Cream Knit Top',
      bottom: 'Black Straight Pants',
      shoes: 'White Sneakers',
      accessory: 'Black Tote',
    },
    presentation: {
      name: 'Modern Minimal',
      description: 'Sharp, clean and presentation ready.',
      top: 'Crisp White Shirt',
      bottom: 'Black Tailored Trousers',
      shoes: 'Black Loafers',
      accessory: 'Structured Bag',
    },
    'casual-day': {
      name: 'Minimal Everyday',
      description: 'Neutral layers with clean lines.',
      top: 'Cream T-Shirt',
      bottom: 'Black Wide-Leg Pants',
      shoes: 'Clean Sneakers',
      accessory: 'Minimal Crossbody',
    },
    dinner: {
      name: 'Minimal Evening',
      description: 'Elegant without unnecessary details.',
      top: 'Black Fitted Top',
      bottom: 'Wide-Leg Trousers',
      shoes: 'Black Heels',
      accessory: 'Gold Earrings',
    },
    party: {
      name: 'Modern Night',
      description: 'A simple silhouette with impact.',
      top: 'Black Statement Top',
      bottom: 'Tailored Black Pants',
      shoes: 'Heeled Sandals',
      accessory: 'Metallic Bag',
    },
  },

  casual: {
    college: {
      name: 'Campus Casual',
      description: 'Easy, comfortable and ready for the day.',
      top: 'Oversized Graphic Tee',
      bottom: 'Blue Mom Jeans',
      shoes: 'Sneakers',
      accessory: 'Crossbody Bag',
    },
    presentation: {
      name: 'Casual Smart',
      description: 'Comfortable with a polished finish.',
      top: 'Striped Shirt',
      bottom: 'Beige Trousers',
      shoes: 'Loafers',
      accessory: 'Leather Tote',
    },
    'casual-day': {
      name: 'Weekend Casual',
      description: 'An easy outfit for a relaxed day.',
      top: 'Oversized Tee',
      bottom: 'Relaxed Jeans',
      shoes: 'Sneakers',
      accessory: 'Crossbody Bag',
    },
    dinner: {
      name: 'Casual Dinner',
      description: 'Relaxed but still put together.',
      top: 'Fitted Knit Top',
      bottom: 'Straight Jeans',
      shoes: 'Ankle Boots',
      accessory: 'Small Bag',
    },
    party: {
      name: 'Casual Party',
      description: 'Relaxed denim with a little edge.',
      top: 'Statement Tee',
      bottom: 'Dark Jeans',
      shoes: 'Platform Sneakers',
      accessory: 'Mini Bag',
    },
  },

  polished: {
    college: {
      name: 'Polished Campus',
      description: 'Structured pieces made comfortable.',
      top: 'White Oxford Shirt',
      bottom: 'Beige Tailored Pants',
      shoes: 'Loafers',
      accessory: 'Leather Tote',
    },
    presentation: {
      name: 'Boardroom Ready',
      description: 'Sharp, confident and presentation ready.',
      top: 'White Button-Up Shirt',
      bottom: 'Black Tailored Trousers',
      shoes: 'Classic Loafers',
      accessory: 'Structured Handbag',
    },
    'casual-day': {
      name: 'Refined Casual',
      description: 'Relaxed proportions with polished details.',
      top: 'Neutral Blouse',
      bottom: 'Tailored Beige Pants',
      shoes: 'Clean Loafers',
      accessory: 'Leather Bag',
    },
    dinner: {
      name: 'Dinner Ready',
      description: 'Elegant tailoring for an evening out.',
      top: 'Silk Blouse',
      bottom: 'Black Tailored Pants',
      shoes: 'Pointed Heels',
      accessory: 'Structured Clutch',
    },
    party: {
      name: 'Polished Night',
      description: 'Elegant tailoring with a statement finish.',
      top: 'Satin Blouse',
      bottom: 'Black Wide-Leg Pants',
      shoes: 'Heeled Sandals',
      accessory: 'Statement Bag',
    },
  },

  evening: {
    college: {
      name: 'Evening Campus',
      description: 'A little elevated without going overboard.',
      top: 'Dark Knit Top',
      bottom: 'Straight Black Jeans',
      shoes: 'Ankle Boots',
      accessory: 'Shoulder Bag',
    },
    presentation: {
      name: 'After Hours',
      description: 'Professional with an evening edge.',
      top: 'Black Blouse',
      bottom: 'Tailored Trousers',
      shoes: 'Pointed Heels',
      accessory: 'Minimal Clutch',
    },
    'casual-day': {
      name: 'Soft Evening',
      description: 'Comfortable pieces with an elevated feel.',
      top: 'Satin Tank',
      bottom: 'Relaxed Trousers',
      shoes: 'Mules',
      accessory: 'Shoulder Bag',
    },
    dinner: {
      name: 'Dinner Glow',
      description: 'Elegant and understated for dinner.',
      top: 'Satin Black Top',
      bottom: 'Black Trousers',
      shoes: 'Strappy Heels',
      accessory: 'Gold Jewelry',
    },
    party: {
      name: 'Night Out',
      description: 'A statement look made for the evening.',
      top: 'Statement Black Top',
      bottom: 'Sleek Black Skirt',
      shoes: 'Heeled Sandals',
      accessory: 'Statement Earrings',
    },
  },

  feminine: {
    college: {
      name: 'Soft Campus',
      description: 'Feminine details with everyday comfort.',
      top: 'Soft Blouse',
      bottom: 'Straight Jeans',
      shoes: 'Ballet Flats',
      accessory: 'Mini Shoulder Bag',
    },
    presentation: {
      name: 'Soft Professional',
      description: 'Elegant and polished with softer details.',
      top: 'Cream Blouse',
      bottom: 'Tailored Trousers',
      shoes: 'Low Heels',
      accessory: 'Structured Bag',
    },
    'casual-day': {
      name: 'Soft Everyday',
      description: 'Light, comfortable and feminine.',
      top: 'Floral Blouse',
      bottom: 'Straight Jeans',
      shoes: 'Ballet Flats',
      accessory: 'Small Shoulder Bag',
    },
    dinner: {
      name: 'Romantic Dinner',
      description: 'Soft textures and elegant details.',
      top: 'Satin Blouse',
      bottom: 'Flowy Skirt',
      shoes: 'Heeled Sandals',
      accessory: 'Delicate Jewelry',
    },
    party: {
      name: 'Party Romance',
      description: 'A feminine look with a statement finish.',
      top: 'Elegant Statement Top',
      bottom: 'Flowy Midi Skirt',
      shoes: 'Heels',
      accessory: 'Statement Earrings',
    },
  },
};

const wardrobeElevators = [
  {
    id: '1',
    name: 'Minimal Gold Hoops',
    category: 'JEWELLERY',
    price: '₹699',
    image: goldHoops,
    link: 'https://www.myntra.com/earrings/aksha+collection/aksha-collection-circular-hoop-earrings/42142234/buy',
  },
  {
    id: '2',
    name: 'Classic Leather Belt',
    category: 'ACCESSORY',
    price: '₹899',
    image: leatherBelt,
    link: 'https://www.myntra.com/belts/halden/halden-men-leather-formal-belt/28366292/buy',
  },
  {
    id: '3',
    name: 'Structured Shoulder Bag',
    category: 'BAG',
    price: '₹1,499',
    image: shoulderBag,
    link: 'https://www.myntra.com/handbags/allen+solly/allen-solly-croc-textured-structured-shoulder-bag/37675026/buy',
  },
  {
    id: '4',
    name: 'Classic White Sneakers',
    category: 'FOOTWEAR',
    price: '₹1,799',
    image: whiteSneakers,
    link: 'https://www.myntra.com/casual-shoes/liberty/liberty-lucy--luke-kids-white-memory-foam-slip-on-casual-shoes/40311118/buy',
  },
];

export default function HomeScreen() {
  const [selectedVibe, setSelectedVibe] =
    useState('polished');

  const [selectedOccasion, setSelectedOccasion] =
    useState('presentation');

  const currentOutfit =
    outfitMap[selectedVibe]?.[selectedOccasion] ||
    outfitMap.polished.presentation;

  function selectVibe(vibe: string) {
    setSelectedVibe(vibe);
  }

  function selectOccasion(occasion: string) {
    setSelectedOccasion(occasion);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.kicker}>
                  STYLE SENSE
                </Text>

                <Text style={styles.greeting}>
                  Good morning, Gauri
                </Text>
              </View>

              <View style={styles.weather}>
                <Text style={styles.weatherCity}>
                  PARIS
                </Text>

                <Text style={styles.temperature}>
                  19°C
                </Text>
              </View>
            </View>

            <Text style={styles.heroHeading}>
              Dress for the day.
            </Text>

            <Text style={styles.heroDescription}>
              Your wardrobe, your mood, your moment.
            </Text>
          </View>

          {/* ================================================= */}
          {/* VIBE */}
          {/* ================================================= */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionKicker}>
                  WHAT'S YOUR VIBE?
                </Text>

                <Text style={styles.sectionTitle}>
                  Set the mood
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {vibes.map((vibe) => {
                const selected =
                  selectedVibe === vibe.id;

                return (
                  <Pressable
                    key={vibe.id}
                    onPress={() =>
                      selectVibe(vibe.id)
                    }
                    style={[
                      styles.vibeChip,
                      selected &&
                      styles.vibeChipSelected,
                    ]}
                  >
                    <SymbolView
                      name={vibe.icon}
                      size={15}
                      tintColor={
                        selected
                          ? '#ffffff'
                          : '#745a38'
                      }
                    />

                    <Text
                      style={[
                        styles.vibeText,
                        selected &&
                        styles.vibeTextSelected,
                      ]}
                    >
                      {vibe.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ================================================= */}
          {/* TODAY'S LOOK */}
          {/* ================================================= */}

          <View style={styles.lookSection}>
            <View style={styles.lookHeader}>
              <View>
                <Text style={styles.sectionKicker}>
                  TODAY'S LOOK
                </Text>

                <Text style={styles.lookTitle}>
                  {currentOutfit.name}
                </Text>
              </View>

              <View style={styles.aiBadge}>
                <SymbolView
                  name="sparkles"
                  size={13}
                  tintColor="#745a38"
                />

                <Text style={styles.aiBadgeText}>
                  CURATED
                </Text>
              </View>
            </View>

            <View style={styles.lookCard}>
              <View style={styles.modelContainer}>
                <Image
                  source={womanImage}
                  style={styles.modelImage}
                  contentFit="cover"
                />

                <View style={styles.modelOverlay} />

                <View style={styles.modelLabel}>
                  <Text style={styles.modelLabelKicker}>
                    STYLE SENSE
                  </Text>

                  <Text style={styles.modelLabelText}>
                    {currentOutfit.description}
                  </Text>
                </View>
              </View>

              <View style={styles.outfitInfo}>
                <Text style={styles.outfitDescription}>
                  A look built around your
                  {' '}
                  {selectedVibe}
                  {' '}
                  mood for a
                  {' '}
                  {selectedOccasion}.
                </Text>

                <View style={styles.outfitItems}>
                  <OutfitItem
                    label="TOP"
                    value={currentOutfit.top}
                  />

                  <OutfitItem
                    label="BOTTOM"
                    value={currentOutfit.bottom}
                  />

                  <OutfitItem
                    label="SHOES"
                    value={currentOutfit.shoes}
                  />

                  <OutfitItem
                    label="ACCESSORY"
                    value={currentOutfit.accessory}
                  />
                </View>

                <Pressable
                  style={styles.mirrorButton}
                >
                  <Text style={styles.mirrorButtonText}>
                    Try this in Mirror
                  </Text>

                  <SymbolView
                    name="arrow.right"
                    size={17}
                    tintColor="#ffffff"
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* ================================================= */}
          {/* WEATHER */}
          {/* ================================================= */}

          <View style={styles.weatherCard}>
            <View style={styles.weatherIcon}>
              <SymbolView
                name="sun.max.fill"
                size={23}
                tintColor="#745a38"
              />
            </View>

            <View style={styles.weatherContent}>
              <Text style={styles.weatherCardKicker}>
                FOR TODAY
              </Text>

              <Text style={styles.weatherCardTitle}>
                19°C · Clear skies
              </Text>

              <Text style={styles.weatherCardText}>
                Light layers should keep you comfortable
                throughout the day.
              </Text>
            </View>

            <SymbolView
              name="chevron.right"
              size={18}
              tintColor="#9b9892"
            />
          </View>


          {/* ================================================= */}
          {/* QUICK ACCESS */}
          {/* ================================================= */}

          <View style={styles.section}>
            <Text style={styles.sectionKicker}>
              QUICK ACCESS
            </Text>

            <View style={styles.quickAccessRow}>
              <Pressable style={styles.quickCard}>
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

                  <Text style={styles.quickDescription}>
                    See your saved items
                  </Text>
                </View>

                <SymbolView
                  name="chevron.right"
                  size={16}
                  tintColor="#9b9892"
                />
              </Pressable>

              <Pressable style={styles.quickCard}>
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

                  <Text style={styles.quickDescription}>
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

          {/* ================================================= */}
          {/* ELEVATE YOUR WARDROBE */}
          {/* ================================================= */}

          <View style={styles.section}>
            <View style={styles.recentHeader}>
              <View>
                <Text style={styles.sectionKicker}>
                  ELEVATE YOUR WARDROBE
                </Text>

                <Text style={styles.sectionTitle}>
                  Pieces worth adding
                </Text>
              </View>

              <Pressable>
                <Text style={styles.seeAll}>
                  Explore
                </Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            >
              {wardrobeElevators.map((item) => (
                <View
                  key={item.id}
                  style={styles.productCard}
                >
                  <Image
                    source={item.image}
                    style={styles.productImage}
                    contentFit="cover"
                  />

                  <Text style={styles.productCategory}>
                    {item.category}
                  </Text>

                  <Text
                    style={styles.productName}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text style={styles.productPrice}>
                    {item.price}
                  </Text>

                  <Pressable
                    style={styles.shopRow}
                    onPress={() => Linking.openURL(item.link)}
                  >
                    <Text style={styles.shopText}>
                      Explore online
                    </Text>

                    <SymbolView
                      name="arrow.up.right"
                      size={13}
                      tintColor="#745a38"
                    />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
          {/* ================================================= */}
          {/* BOTTOM SPACE */}
          {/* ================================================= */}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// =========================================================
// OUTFIT ITEM COMPONENT
// =========================================================

function OutfitItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.outfitItem}>
      <Text style={styles.outfitItemLabel}>
        {label}
      </Text>

      <Text
        style={styles.outfitItemValue}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },

  safeArea: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },

  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: 120,
    gap: 24,
  },

  // -------------------------------------------------------
  // HEADER
  // -------------------------------------------------------

  header: {
    gap: 8,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#745a38',
  },

  greeting: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    lineHeight: 30,
    color: '#1b1c1a',
    marginTop: 4,
  },

  weather: {
    alignItems: 'flex-end',
    gap: 1,
  },

  weatherCity: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#747878',
  },

  temperature: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    color: '#745a38',
  },

  heroHeading: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '500',
    color: '#1b1c1a',
    marginTop: 8,
  },

  heroDescription: {
    fontSize: 14,
    color: '#747878',
  },

  // -------------------------------------------------------
  // SECTIONS
  // -------------------------------------------------------

  section: {
    gap: 9,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  sectionKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#745a38',
  },

  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 21,
    color: '#1b1c1a',
    marginTop: 2,
  },

  horizontalList: {
    gap: 8,
    paddingVertical: 5,
  },

  // -------------------------------------------------------
  // VIBE
  // -------------------------------------------------------

  vibeChip: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#efeeeb',
  },

  vibeChipSelected: {
    backgroundColor: '#1b1c1a',
  },

  vibeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444748',
  },

  vibeTextSelected: {
    color: '#ffffff',
  },

  // -------------------------------------------------------
  // TODAY'S LOOK
  // -------------------------------------------------------

  lookSection: {
    gap: 10,
  },

  lookHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  lookTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: '#1b1c1a',
    marginTop: 3,
  },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fedaae',
  },

  aiBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#745a38',
  },

  lookCard: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#efeeeb',
  },

  modelContainer: {
    width: '100%',
    height: 410,
    backgroundColor: '#dededb',
    position: 'relative',
  },

  modelImage: {
    width: '100%',
    height: '100%',
  },

  modelOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  modelLabel: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },

  modelLabelKicker: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#ffffff',
  },

  modelLabelText: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    lineHeight: 24,
    color: '#ffffff',
    marginTop: 3,
  },

  outfitInfo: {
    padding: 18,
    gap: 15,
  },

  outfitDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#747878',
  },

  outfitItems: {
    gap: 0,
    borderTopWidth: 1,
    borderTopColor: '#dedbd6',
  },

  outfitItem: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#dedbd6',
  },

  outfitItemLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#745a38',
  },

  outfitItemValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: '#444748',
    marginLeft: 20,
  },

  mirrorButton: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#1b1c1a',
  },

  mirrorButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // -------------------------------------------------------
  // WEATHER
  // -------------------------------------------------------

  weatherCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#f0eeea',
  },

  weatherIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fedaae',
  },

  weatherContent: {
    flex: 1,
    gap: 2,
  },

  weatherCardKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#745a38',
  },

  weatherCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b1c1a',
  },

  weatherCardText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#747878',
  },

  // -------------------------------------------------------
  // OCCASION
  // -------------------------------------------------------

  occasionCard: {
    minWidth: 105,
    height: 82,
    paddingHorizontal: 13,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#efeeeb',
  },

  occasionCardSelected: {
    backgroundColor: '#1b1c1a',
  },

  occasionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444748',
  },

  occasionTextSelected: {
    color: '#ffffff',
  },

  // -------------------------------------------------------
  // QUICK ACCESS
  // -------------------------------------------------------

  quickAccessRow: {
    flexDirection: 'row',
    gap: 10,
  },

  quickCard: {
    flex: 1,
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#efeeeb',
  },

  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fedaae',
  },

  quickText: {
    flex: 1,
  },

  quickTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b1c1a',
  },

  quickDescription: {
    fontSize: 10,
    color: '#747878',
    marginTop: 2,
  },

  // -------------------------------------------------------
  // ELEVATE YOUR WARDROBE
  // -------------------------------------------------------

  recentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  seeAll: {
    fontSize: 11,
    fontWeight: '700',
    color: '#745a38',
    paddingBottom: 2,
  },

  recentList: {
    gap: 16,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },

  productCard: {
    width: 150,
    marginRight: 16,

  },

  productImage: {
    width: 150,
    height: 155,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dededb',
  },

  productCategory: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#745a38',
    marginTop: 8,
  },

  productName: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#1b1c1a',
    marginTop: 4,
    minHeight: 32,
  },

  productPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#745a38',
    marginTop: 5,
  },

  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  shopText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#747878',
  },
  bottomSpace: {
    height: 10,
  },
});