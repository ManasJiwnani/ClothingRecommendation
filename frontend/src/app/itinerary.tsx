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
 
const itinerary = [
  {
    id: '1',
    day: 'DAY 01',
    date: '12 OCT',
    city: 'Paris',
    activity: 'Arrival & City Walk',
    outfit: 'Effortless Smart',
    pieces: [
      'White Button-Up',
      'Straight Blue Jeans',
      'White Sneakers',
      'Structured Shoulder Bag',
    ],
    weather: '19°C · Clear',
    icon: 'figure.walk',
  },
  {
    id: '2',
    day: 'DAY 02',
    date: '13 OCT',
    city: 'Paris',
    activity: 'Museum & Café Day',
    outfit: 'Minimal Everyday',
    pieces: [
      'Cream T-Shirt',
      'Black Wide-Leg Pants',
      'Clean Sneakers',
      'Minimal Crossbody',
    ],
    weather: '18°C · Partly cloudy',
    icon: 'building.columns',
  },
  {
    id: '3',
    day: 'DAY 03',
    date: '14 OCT',
    city: 'Paris',
    activity: 'Dinner in the City',
    outfit: 'Minimal Evening',
    pieces: [
      'Black Fitted Top',
      'Wide-Leg Trousers',
      'Black Heels',
      'Gold Earrings',
    ],
    weather: '16°C · Clear',
    icon: 'fork.knife',
  },
  {
    id: '4',
    day: 'DAY 04',
    date: '15 OCT',
    city: 'Paris',
    activity: 'Shopping & Café',
    outfit: 'Refined Casual',
    pieces: [
      'Neutral Blouse',
      'Tailored Beige Pants',
      'Clean Loafers',
      'Leather Bag',
    ],
    weather: '17°C · Sunny',
    icon: 'bag.fill',
  },
] as const;
 
export default function ItineraryScreen() {
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
                tintColor="#000000"
              />
            </Pressable>
 
            <Text style={styles.kicker}>
              STYLE PLANNER
            </Text>
 
            <Text style={styles.title}>
              Your Itinerary
            </Text>
 
            <Text style={styles.description}>
              Outfits planned around your trip,
              activities and the weather.
            </Text>
 
          </View>
 
 
          {/* TRIP SUMMARY */}
 
          <View style={styles.tripCard}>
 
            <View style={styles.tripTop}>
 
              <View>
                <Text style={styles.tripKicker}>
                  UPCOMING TRIP
                </Text>
 
                <Text style={styles.tripTitle}>
                  Paris, France
                </Text>
              </View>
 
              <View style={styles.locationIcon}>
                <SymbolView
                  name="location.fill"
                  size={19}
                  tintColor="#745a38"
                />
              </View>
 
            </View>
 
            <View style={styles.tripDivider} />
 
            <View style={styles.tripDetails}>
 
              <View>
                <Text style={styles.detailLabel}>
                  DATES
                </Text>
 
                <Text style={styles.detailValue}>
                  12 – 15 October
                </Text>
              </View>
 
              <View>
                <Text style={styles.detailLabel}>
                  DAYS
                </Text>
 
                <Text style={styles.detailValue}>
                  4 days
                </Text>
              </View>
 
              <View>
                <Text style={styles.detailLabel}>
                  LOOKS
                </Text>
 
                <Text style={styles.detailValue}>
                  4 planned
                </Text>
              </View>
 
            </View>
 
          </View>
 
 
          {/* DAILY LOOKS */}
 
          <View style={styles.sectionHeader}>
 
            <Text style={styles.sectionKicker}>
              DAILY PLAN
            </Text>
 
            <Text style={styles.sectionTitle}>
              Looks for every moment
            </Text>
 
          </View>
 
 
          {itinerary.map((item) => (
            <View
              key={item.id}
              style={styles.dayCard}
            >
 
              {/* DAY HEADER */}
 
              <View style={styles.dayHeader}>
 
                <View style={styles.dayNumber}>
                  <Text style={styles.dayNumberText}>
                    {item.id}
                  </Text>
                </View>
 
                <View style={styles.dayInfo}>
 
                  <View style={styles.dayMeta}>
                    <Text style={styles.day}>
                      {item.day}
                    </Text>
 
                    <Text style={styles.date}>
                      {item.date}
                    </Text>
                  </View>
 
                  <Text style={styles.city}>
                    {item.city}
                  </Text>
 
                </View>
 
                <View style={styles.activityIcon}>
                  <SymbolView
                    name={item.icon}
                    size={18}
                    tintColor="#745a38"
                  />
                </View>
 
              </View>
 
 
              {/* ACTIVITY */}
 
              <View style={styles.activityBox}>
 
                <Text style={styles.activityLabel}>
                  PLAN
                </Text>
 
                <Text style={styles.activity}>
                  {item.activity}
                </Text>
 
                <View style={styles.weatherRow}>
 
                  <SymbolView
                    name="sun.max.fill"
                    size={13}
                    tintColor="#745a38"
                  />
 
                  <Text style={styles.weatherText}>
                    {item.weather}
                  </Text>
 
                </View>
 
              </View>
 
 
              {/* OUTFIT */}
 
              <View style={styles.outfitBox}>
 
                <View style={styles.outfitHeader}>
 
                  <View>
                    <Text style={styles.outfitKicker}>
                      PLANNED LOOK
                    </Text>
 
                    <Text style={styles.outfitName}>
                      {item.outfit}
                    </Text>
                  </View>
 
                  <View style={styles.sparkle}>
                    <SymbolView
                      name="sparkles"
                      size={14}
                      tintColor="#745a38"
                    />
                  </View>
 
                </View>
 
 
                <View style={styles.pieces}>
 
                  {item.pieces.map((piece, index) => (
                    <View
                      key={piece}
                      style={styles.piece}
                    >
                      <View style={styles.pieceDot}>
                        <Text style={styles.pieceNumber}>
                          {index + 1}
                        </Text>
                      </View>
 
                      <Text style={styles.pieceText}>
                        {piece}
                      </Text>
                    </View>
                  ))}
 
                </View>
 
              </View>
 
            </View>
          ))}
 
 
          {/* FOOTER */}
 
          <View style={styles.footerCard}>
 
            <SymbolView
              name="sparkles"
              size={20}
              tintColor="#745a38"
            />
 
            <View style={styles.footerContent}>
 
              <Text style={styles.footerTitle}>
                Your trip, styled
              </Text>
 
              <Text style={styles.footerText}>
                Your itinerary keeps your outfits
                organized so you can focus on enjoying
                the trip.
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
    gap: 22,
  },
 
  header: {
    gap: 5,
  },
 
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#efeeeb',
    marginBottom: 12,
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
    lineHeight: 19,
    color: '#747878',
    maxWidth: 330,
  },
 
  tripCard: {
    padding: 17,
    borderRadius: 17,
    backgroundColor: '#f0eeea',
  },
 
  tripTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
 
  tripKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#745a38',
  },
 
  tripTitle: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    color: '#1b1c1a',
    marginTop: 3,
  },
 
  locationIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fedaae',
  },
 
  tripDivider: {
    height: 1,
    backgroundColor: '#dedbd6',
    marginVertical: 15,
  },
 
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
 
  detailLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#745a38',
  },
 
  detailValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444748',
    marginTop: 3,
  },
 
  sectionHeader: {
    gap: 3,
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
  },
 
  dayCard: {
    overflow: 'hidden',
    borderRadius: 17,
    backgroundColor: '#efeeeb',
  },
 
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e9e7e2',
  },
 
  dayNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1c1a',
  },
 
  dayNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
 
  dayInfo: {
    flex: 1,
    marginLeft: 11,
  },
 
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
 
  day: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#745a38',
  },
 
  date: {
    fontSize: 9,
    color: '#9b9892',
  },
 
  city: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#1b1c1a',
    marginTop: 2,
  },
 
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fedaae',
  },
 
  activityBox: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#dedbd6',
  },
 
  activityLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#745a38',
  },
 
  activity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b1c1a',
    marginTop: 3,
  },
 
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
  },
 
  weatherText: {
    fontSize: 10,
    color: '#747878',
  },
 
  outfitBox: {
    padding: 16,
  },
 
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
 
  outfitKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#745a38',
  },
 
  outfitName: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    color: '#1b1c1a',
    marginTop: 2,
  },
 
  sparkle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fedaae',
  },
 
  pieces: {
    marginTop: 13,
    gap: 8,
  },
 
  piece: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
 
  pieceDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dedbd6',
  },
 
  pieceNumber: {
    fontSize: 9,
    fontWeight: '700',
    color: '#745a38',
  },
 
  pieceText: {
    flex: 1,
    fontSize: 11,
    color: '#444748',
  },
 
  footerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 15,
    backgroundColor: '#f0eeea',
  },
 
  footerContent: {
    flex: 1,
  },
 
  footerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b1c1a',
  },
 
  footerText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#747878',
    marginTop: 3,
  },
});
 