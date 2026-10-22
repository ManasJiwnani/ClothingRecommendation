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
  ActivityIndicator,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Fonts, Spacing } from '@/constants/theme';

import casual from '../../assets/casual.jpg';
import effortless from '../../assets/effortless.jpg';
import ethnic from '../../assets/ethnic.jpg';
import evening from '../../assets/evening.jpg';
import minimal from '../../assets/minimal.jpg';
import feminine from '../../assets/feminine.jpg';
import goldHoops from '../../assets/goldHoops.png';
import leatherBelt from '../../assets/leatherBelt.png';
import shoulderBag from '../../assets/shoulderBag.png';
import whiteSneakers from '../../assets/clothes/whiteSneakers.png';

import { ThemedText } from '@/components/themed-text';
import { useUserName } from '@/hooks/use-user-name';
// import { ThemedView } from '@/components/themed-view';
type Vibe = {
  id: string;
  label: string;

  icon:
  | 'sparkles'
  | 'circle'
  | 'sun.max.fill'
  | 'briefcase.fill'
  | 'moon.fill'
  | 'heart.fill';
};

type Occasion = {
  id: string;
  label: string;
  icon:
  | 'book.fill'
  | 'briefcase.fill'
  | 'sun.max.fill'
  | 'fork.knife'
  | 'party.popper.fill';
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
    id: 'ethnic',
    label: 'Ethnic',
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

const styleBuyLinks: Record<string, string> = {
  effortless: 'https://www.myntra.com/',
  minimal: 'https://www.myntra.com/',
  casual: 'https://www.myntra.com/',
  ethnic: 'https://www.myntra.com/',
  evening: 'https://www.myntra.com/',
  feminine: 'https://www.myntra.com/',
};

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

  ethnic: {
    college: {
      name: 'Traditional Campus',
      description: 'Elegant and grounded with classic Indian silhouettes.',
      top: 'White Cotton Kurta',
      bottom: 'Beige Straight Trousers',
      shoes: 'Leather Kolhapuris',
      accessory: 'Handcrafted Tote',
    },
    presentation: {
      name: 'Boardroom in Banarasi',
      description: 'Refined and authoritative with a heritage touch.',
      top: 'Ivory Shirt with Indian Collar',
      bottom: 'Black Chino Trousers',
      shoes: 'Brown Oxfords',
      accessory: 'Structured Leather Bag',
    },
    'casual-day': {
      name: 'Refined Everyday',
      description: 'Traditional ease with polished detail.',
      top: 'Muted Kurta Set',
      bottom: 'Tailored Beige Pants',
      shoes: 'Minimal Sandals',
      accessory: 'Cotton Sling Bag',
    },
    dinner: {
      name: 'Heritage Evening',
      description: 'Graceful tailoring for a refined evening out.',
      top: 'Silk Kurta with Embroidery',
      bottom: 'Black Straight Trousers',
      shoes: 'Gold Heeled Sandals',
      accessory: 'Statement Jhumkas',
    },
    party: {
      name: 'Festive Polished',
      description: 'Traditional elegance with a modern festive finish.',
      top: 'Satin Anarkali Kurta',
      bottom: 'Black Straight Pants',
      shoes: 'Elegant Heels',
      accessory: 'Embroidered Clutch',
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
  const userName = useUserName();

  const [selectedVibe, setSelectedVibe] =
    useState('ethnic');

  const [selectedOccasion, setSelectedOccasion] =
    useState('presentation');

  function selectVibe(vibe: string) {
    setSelectedVibe(vibe);
  }

  function selectOccasion(occasion: string) {
    setSelectedOccasion(occasion);
  }

  const styleImageRatios: Record<string, number> = {
    effortless: 736 / 1104,
    minimal: 1024 / 1426,
    casual: 1080 / 1920,
    ethnic: 1084 / 1448,
    evening: 1151 / 2046,
    feminine: 736 / 1308,
  };

  const stylePins = vibes.map((vibe) => ({
    vibe,
    image:
      {
        effortless,
        minimal,
        casual,
        ethnic,
        evening,
        feminine,
      }[vibe.id] ?? ethnic,
      imageAspectRatio: styleImageRatios[vibe.id] ?? 2 / 3,
      buyLink: styleBuyLinks[vibe.id],
      outfit:
        outfitMap[vibe.id]?.[selectedOccasion] ??
        outfitMap.ethnic.presentation,
  }));

  const styleFeedColumns = [
    [
      { type: 'look' as const, item: stylePins[0] },
      { type: 'product' as const, item: wardrobeElevators[0] },
      { type: 'look' as const, item: stylePins[2] },
      { type: 'product' as const, item: wardrobeElevators[2] },
      { type: 'look' as const, item: stylePins[4] },
    ],
    [
      { type: 'look' as const, item: stylePins[1] },
      { type: 'product' as const, item: wardrobeElevators[1] },
      { type: 'look' as const, item: stylePins[3] },
      { type: 'product' as const, item: wardrobeElevators[3] },
      { type: 'look' as const, item: stylePins[5] },
    ],
  ];

  const renderStylePin = (pin: (typeof stylePins)[number]) => {
    const selected = pin.vibe.id === selectedVibe;

    return (
      <View
        key={pin.vibe.id}
        style={[
          styles.stylePin,
          selected && styles.stylePinSelected,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={`Select ${pin.vibe.label} look`}
          onPress={() => selectVibe(pin.vibe.id)}
        >
          <View
            style={[
              styles.stylePinImageWrap,
              { aspectRatio: pin.imageAspectRatio },
            ]}
          >
            <Image
              source={pin.image}
              style={styles.stylePinImage}
              contentFit="contain"
            />
            <View style={styles.stylePinImageShade} />
            <View style={styles.stylePinTag}>
              <SymbolView
                name={pin.vibe.icon}
                size={12}
                tintColor="#745a38"
              />
              <Text style={styles.stylePinTagText}>
                {pin.vibe.label.toUpperCase()}
              </Text>
            </View>
            {selected && (
              <View style={styles.selectedPinBadge}>
                <SymbolView name="checkmark" size={12} tintColor="#ffffff" />
              </View>
            )}
          </View>

          <View style={styles.stylePinInfo}>
            <Text style={styles.stylePinTitle} numberOfLines={2}>
              {pin.outfit.name}
            </Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Buy the ${pin.vibe.label} look`}
          onPress={() => Linking.openURL(pin.buyLink)}
          style={styles.buyNowButton}
        >
          <Text style={styles.buyNowText}>Buy now</Text>
          <SymbolView name="arrow.up.right" size={12} tintColor="#ffffff" />
        </Pressable>
      </View>
    );
  };

  const renderWardrobePin = (item: (typeof wardrobeElevators)[number]) => (
    <View key={`wardrobe-${item.id}`} style={styles.wardrobePin}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Explore ${item.name}`}
        onPress={() => Linking.openURL(item.link)}
      >
        <View style={styles.wardrobeImageWrap}>
          <Image
            source={item.image}
            style={styles.wardrobeImage}
            contentFit="contain"
          />
          <View style={styles.wardrobeCategory}>
            <Text style={styles.wardrobeCategoryText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.wardrobeInfo}>
          <Text style={styles.wardrobeName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.wardrobePrice}>{item.price}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Shop ${item.name}`}
        onPress={() => Linking.openURL(item.link)}
        style={({ pressed }) => [
          styles.wardrobeShopButton,
          pressed && styles.wardrobeShopButtonPressed,
        ]}
      >
        <Text style={styles.wardrobeShopText}>Explore online</Text>
        <SymbolView name="arrow.up.right" size={12} tintColor="#745a38" />
      </Pressable>
    </View>
  );

  const renderFeedItem = (feedItem: (typeof styleFeedColumns)[number][number]) =>
    feedItem.type === 'look'
      ? renderStylePin(feedItem.item)
      : renderWardrobePin(feedItem.item);

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
                <ThemedText style={styles.kicker}>
                  CLOSET AI
                </ThemedText>

                <ThemedText
                  style={{
                    fontFamily: Fonts.serif,
                    fontSize: 32,
                    lineHeight: 40,
                    fontWeight: "500",
                    color: "#1b1c1a",
                    marginTop: 4,
                  }}
                >
                  {userName
                    ? `Bonjour, ${userName.split(/\s+/)[0]}`
                    : 'Bonjour'}
                </ThemedText>
              </View>

            </View>

            <ThemedText style={styles.subtitle}>
              Discover handpicked outfits tailored to your personal vibe.            </ThemedText>
          </View>


          <View style={styles.feedHeader}>
            <View>
              <Text style={styles.sectionKicker}>Elevate Your Wardrobe</Text>
              <Text style={styles.lookTitle}>Looks for you.</Text>
            </View>
            <View style={styles.feedCount}>
              <Text style={styles.feedCountText}>
                {vibes.length + wardrobeElevators.length} picks
              </Text>
            </View>
          </View>

          <View style={styles.styleFeed}>
            {styleFeedColumns.map((column, index) => (
              <View key={`style-column-${index}`} style={styles.styleFeedColumn}>
                {column.map(renderFeedItem)}
              </View>
            ))}
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
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + 32,
    gap: Spacing.two,
  },

  // -------------------------------------------------------
  // HEADER
  // -------------------------------------------------------
  header: {
    gap: 5,
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

  subtitle: {
    color: '#747878',
    fontSize: 12,
    lineHeight: 20,
    maxWidth: 350,
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

  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  lookTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: '#1b1c1a',
    marginTop: 3,
  },

  feedCount: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#efeeeb',
  },

  feedCountText: {
    color: '#747878',
    fontSize: 10,
    fontWeight: '600',
  },

  recommendationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },

  recommendationStatusText: {
    color: '#745a38',
    fontSize: 12,
  },

  recommendationError: {
    color: '#9b3030',
    fontSize: 12,
    lineHeight: 18,
  },

  styleFeed: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  styleFeedColumn: {
    flex: 1,
    gap: 14,
  },

  stylePin: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e3dc',
  },

  stylePinSelected: {
    borderWidth: 2,
    borderColor: '#745a38',
  },

  stylePinImageWrap: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#dededb',
  },

  stylePinImage: {
    width: '100%',
    height: '100%',
  },

  stylePinImageShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 44,
    backgroundColor: 'rgba(27, 28, 26, 0.12)',
  },

  stylePinTag: {
    position: 'absolute',
    top: 9,
    left: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 249, 246, 0.94)',
  },

  stylePinTagText: {
    color: '#745a38',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  selectedPinBadge: {
    position: 'absolute',
    right: 9,
    bottom: 9,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#1b1c1a',
  },

  stylePinInfo: {
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 2,
  },

  stylePinTitle: {
    color: '#1b1c1a',
    fontFamily: Fonts.serif,
    fontSize: 14,
    lineHeight: 18,
  },

  buyNowButton: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: '#efeeeb',
  },

  buyNowText: {
    color: '#745a38',
    fontSize: 10,
    fontWeight: '700',
  },

  wardrobePin: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e3dc',
  },

  wardrobeImageWrap: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#eeece8',
  },

  wardrobeImage: {
    width: '100%',
    height: '100%',
  },

  wardrobeCategory: {
    position: 'absolute',
    top: 9,
    left: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 249, 246, 0.95)',
  },

  wardrobeCategoryText: {
    color: '#745a38',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  wardrobeInfo: {
    paddingHorizontal: 10,
    paddingTop: 9,
    gap: 3,
  },

  wardrobeName: {
    color: '#1b1c1a',
    fontFamily: Fonts.serif,
    fontSize: 14,
    lineHeight: 18,
  },

  wardrobePrice: {
    color: '#745a38',
    fontSize: 10,
    fontWeight: '700',
  },

  wardrobeShopButton: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 10,
    marginTop: 7,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#efeeeb',
  },

  wardrobeShopButtonPressed: {
    backgroundColor: '#e5dfd6',
    transform: [{ scale: 0.98 }],
  },

  wardrobeShopText: {
    color: '#745a38',
    fontSize: 10,
    fontWeight: '700',
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

  bottomSpace: {
    height: 10,
  },
});