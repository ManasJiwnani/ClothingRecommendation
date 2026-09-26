import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
 
import { Fonts, Spacing } from '@/constants/theme';
 
import goldHoops from '../assets/goldHoops.png';
import leatherBelt from '../assets/leatherBelt.png';
import shoulderBag from '../assets/shoulderBag.png';
import whiteSneakers from '../assets/clothes/whiteSneakers.png';
 
const savedItems = [
  {
    id: '1',
    name: 'Minimal Gold Hoops',
    category: 'JEWELLERY',
    price: '₹699',
    image: goldHoops,
    saved: 'Saved recently',
  },
  {
    id: '2',
    name: 'Classic Leather Belt',
    category: 'ACCESSORY',
    price: '₹899',
    image: leatherBelt,
    saved: 'Saved recently',
  },
  {
    id: '3',
    name: 'Structured Shoulder Bag',
    category: 'BAG',
    price: '₹1,499',
    image: shoulderBag,
    saved: 'Saved recently',
  },
  {
    id: '4',
    name: 'Classic White Sneakers',
    category: 'FOOTWEAR',
    price: '₹1,799',
    image: whiteSneakers,
    saved: 'Saved recently',
  },
];
 
export default function SavedScreen() {
  const router = useRouter();
 
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
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <SymbolView
                name="arrow.left"
                size={18}
                tintColor="#1b1c1a"
              />
            </Pressable>
 
            <View style={styles.headerText}>
              <Text style={styles.kicker}>
                YOUR COLLECTION
              </Text>
 
              <Text style={styles.title}>
                Saved Items
              </Text>
 
              <Text style={styles.description}>
                Pieces you've saved for later.
              </Text>
            </View>
 
          </View>
 
 
          {/* SUMMARY */}
 
          <View style={styles.summaryCard}>
 
            <View style={styles.summaryIcon}>
              <SymbolView
                name="heart.fill"
                size={21}
                tintColor="#745a38"
              />
            </View>
 
            <View style={styles.summaryContent}>
              <Text style={styles.summaryKicker}>
                YOUR SAVED COLLECTION
              </Text>
 
              <Text style={styles.summaryTitle}>
                {savedItems.length} pieces saved
              </Text>
 
              <Text style={styles.summaryText}>
                Your favorite pieces are kept here
                for easy access.
              </Text>
            </View>
 
          </View>
 
 
          {/* SAVED ITEMS */}
 
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>
                SAVED PIECES
              </Text>
 
              <Text style={styles.sectionTitle}>
                Your favorites
              </Text>
            </View>
          </View>
 
 
          <View style={styles.grid}>
 
            {savedItems.map((item) => (
              <View
                key={item.id}
                style={styles.card}
              >
 
                <View style={styles.imageContainer}>
                  <Image
                    source={item.image}
                    style={styles.image}
                    contentFit="cover"
                  />
 
                  <View style={styles.heartButton}>
                    <SymbolView
                      name="heart.fill"
                      size={15}
                      tintColor="#745a38"
                    />
                  </View>
                </View>
 
                <Text style={styles.category}>
                  {item.category}
                </Text>
 
                <Text
                  style={styles.name}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
 
                <Text style={styles.price}>
                  {item.price}
                </Text>
 
                <Text style={styles.savedText}>
                  {item.saved}
                </Text>
 
              </View>
            ))}
 
          </View>
 
 
          {/* EMPTY FUTURE STATE */}
 
          <View style={styles.infoCard}>
 
            <SymbolView
              name="sparkles"
              size={20}
              tintColor="#745a38"
            />
 
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Build your collection
              </Text>
 
              <Text style={styles.infoText}>
                Save pieces you love and come back
                to them whenever you're planning
                your next look.
              </Text>
            </View>
 
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
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: 80,
    gap: 24,
  },
 
  header: {
    gap: 16,
  },
 
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#efeeeb',
  },
 
  headerText: {
    gap: 4,
  },
 
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#745a38',
  },
 
  title: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    color: '#1b1c1a',
  },
 
  description: {
    fontSize: 13,
    color: '#747878',
  },
 
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f0eeea',
  },
 
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fedaae',
  },
 
  summaryContent: {
    flex: 1,
    gap: 2,
  },
 
  summaryKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#745a38',
  },
 
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b1c1a',
  },
 
  summaryText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#747878',
  },
 
  sectionHeader: {
    marginTop: 2,
  },
 
  sectionKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#745a38',
  },
 
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    color: '#1b1c1a',
    marginTop: 3,
  },
 
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },
 
  card: {
    width: '47.5%',
  },
 
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#dededb',
  },
 
  image: {
    width: '100%',
    height: '100%',
  },
 
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbf9f6',
  },
 
  category: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#745a38',
    marginTop: 9,
  },
 
  name: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: '#1b1c1a',
    marginTop: 4,
  },
 
  price: {
    fontSize: 12,
    fontWeight: '700',
    color: '#745a38',
    marginTop: 5,
  },
 
  savedText: {
    fontSize: 9,
    color: '#9b9892',
    marginTop: 4,
  },
 
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 15,
    backgroundColor: '#efeeeb',
  },
 
  infoContent: {
    flex: 1,
  },
 
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b1c1a',
  },
 
  infoText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#747878',
    marginTop: 3,
  },
});
 