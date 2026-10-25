import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { embedFashionQuery } from '@/services/ai-stylist';
import {
  getRecommendations,
  type OutfitRecommendation,
} from '@/services/recommendation';

type GeneratedItinerary = {
  destination: string;
  days: number;
  requestedLooks: number;
  brief: string;
  looks: OutfitRecommendation[];
};

const MAX_LOOKS = 20;
const MAX_DAYS = 30;
const OUTFIT_PIECES = ['dress', 'top', 'bottom', 'footwear', 'accessory'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getPieceLabel(item: Record<string, unknown>) {
  const label = [item.color, item.subcategory ?? item.category, item.name]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');

  return label || 'Wardrobe piece';
}

function formatNumber(value: number) {
  return String(value).padStart(2, '0');
}

export default function ItineraryScreen() {
  const [destination, setDestination] = useState('');
  const [daysInput, setDaysInput] = useState('4');
  const [looksInput, setLooksInput] = useState('4');
  const [brief, setBrief] = useState('');
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateItinerary = async () => {
    const place = destination.trim();
    const requestBrief = brief.trim();
    const days = Number(daysInput);
    const requestedLooks = Number(looksInput);

    if (!place) {
      setError('Enter the place you are visiting.');
      return;
    }
    if (!requestBrief) {
      setError('Describe what you would like to do or the style of looks you need.');
      return;
    }
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
      setError(`Enter a trip length from 1 to ${MAX_DAYS} days.`);
      return;
    }
    if (!Number.isInteger(requestedLooks) || requestedLooks < 1 || requestedLooks > MAX_LOOKS) {
      setError(`Choose between 1 and ${MAX_LOOKS} looks.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }
      if (!user) {
        throw new Error('Sign in to get itinerary looks from your closet.');
      }

      const query = `Plan ${requestedLooks} outfit looks for a ${days}-day trip to ${place}. ${requestBrief}`;
      const embeddedQuery = await embedFashionQuery(query);
      if (
        embeddedQuery.embedding_dimensions !== 768 ||
        embeddedQuery.embedding.length !== 768
      ) {
        throw new Error('The AI service returned an invalid query embedding. Please try again.');
      }

      const response = await getRecommendations(
        user.id,
        embeddedQuery.embedding,
        embeddedQuery.intent,
        null,
        null,
        requestedLooks
      );

      setItinerary({
        destination: place,
        days,
        requestedLooks,
        brief: requestBrief,
        looks: response.recommendations.slice(0, requestedLooks),
      });
    } catch (requestError) {
      console.error('Failed to generate itinerary:', requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Your itinerary could not be generated. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Text style={styles.kicker}>CLOSET AI</Text>
            <Text style={styles.title}>Your Itinerary</Text>
            <Text style={styles.description}>
              Tell us where you are going and what you have planned. We’ll build
              trip looks from your closet.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Plan a trip</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DESTINATION</Text>
              <TextInput
                accessibilityLabel="Trip destination"
                value={destination}
                onChangeText={setDestination}
                placeholder="e.g. Paris, France"
                placeholderTextColor="#96928b"
                returnKeyType="next"
                style={styles.input}
              />
            </View>

            <View style={styles.countFields}>
              <View style={[styles.field, styles.countField]}>
                <Text style={styles.fieldLabel}>DAYS</Text>
                <TextInput
                  accessibilityLabel="Number of trip days"
                  value={daysInput}
                  onChangeText={setDaysInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={styles.input}
                />
              </View>
              <View style={[styles.field, styles.countField]}>
                <Text style={styles.fieldLabel}>LOOKS</Text>
                <TextInput
                  accessibilityLabel="Number of outfit looks"
                  value={looksInput}
                  onChangeText={setLooksInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>WHAT’S ON YOUR TRIP?</Text>
              <TextInput
                accessibilityLabel="Trip activities and outfit request"
                value={brief}
                onChangeText={setBrief}
                placeholder="Museums, long walks, and a nice dinner. I want comfortable, polished looks."
                placeholderTextColor="#96928b"
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.briefInput]}
              />
            </View>

            {error ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={generateItinerary}
              style={({ pressed }) => [
                styles.generateButton,
                pressed && !isLoading && styles.generateButtonPressed,
                isLoading && styles.generateButtonDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <SymbolView
                    name={{
                      ios: 'sparkles',
                      android: 'auto_awesome',
                      web: 'auto_awesome',
                    }}
                    size={17}
                    tintColor="#ffffff"
                  />
                  <Text style={styles.generateButtonText}>Plan my looks</Text>
                </>
              )}
            </Pressable>
          </View>

          {itinerary ? (
            <>
              <View style={styles.tripCard}>
                <View style={styles.tripTop}>
                  <View style={styles.tripHeading}>
                    <Text style={styles.tripKicker}>YOUR TRIP</Text>
                    <Text style={styles.tripTitle}>{itinerary.destination}</Text>
                  </View>
                  <View style={styles.locationIcon}>
                    <SymbolView
                      name={{
                        ios: 'location.fill',
                        android: 'location_on',
                        web: 'location_on',
                      }}
                      size={19}
                      tintColor="#745a38"
                    />
                  </View>
                </View>
                <View style={styles.tripDivider} />
                <View style={styles.tripDetails}>
                  <View>
                    <Text style={styles.detailLabel}>DAYS</Text>
                    <Text style={styles.detailValue}>
                      {itinerary.days} {itinerary.days === 1 ? 'day' : 'days'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>LOOKS</Text>
                    <Text style={styles.detailValue}>
                      {itinerary.looks.length} / {itinerary.requestedLooks}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionKicker}>DAILY PLAN</Text>
                <Text style={styles.sectionTitle}>Looks for every moment</Text>
              </View>

              <View style={styles.briefCard}>
                <Text style={styles.briefLabel}>YOUR TRIP BRIEF</Text>
                <Text style={styles.briefText}>{itinerary.brief}</Text>
              </View>

              {itinerary.looks.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No looks found yet</Text>
                  <Text style={styles.emptyText}>
                    Try a different trip description, or add more clothing to
                    your closet before generating looks again.
                  </Text>
                </View>
              ) : (
                <>
                  {itinerary.looks.length < itinerary.requestedLooks ? (
                    <View style={styles.noticeCard}>
                      <Text style={styles.noticeText}>
                        We found {itinerary.looks.length} of{' '}
                        {itinerary.requestedLooks} requested looks in your
                        closet.
                      </Text>
                    </View>
                  ) : null}

                  {itinerary.looks.map((recommendation, index) => {
                    const outfit = recommendation.outfit;
                    const dayNumber = (index % itinerary.days) + 1;
                    const lookNumber = Math.floor(index / itinerary.days) + 1;
                    const pieces = OUTFIT_PIECES.flatMap((key) => {
                      const item = outfit[key];
                      return isRecord(item) ? [{ key, item }] : [];
                    });
                    const outfitType =
                      typeof outfit.type === 'string' && outfit.type.trim()
                        ? outfit.type
                        : 'Closet look';

                    return (
                      <View key={`${index}-${outfitType}`} style={styles.dayCard}>
                        <View style={styles.dayHeader}>
                          <View style={styles.dayNumber}>
                            <Text style={styles.dayNumberText}>
                              {formatNumber(dayNumber)}
                            </Text>
                          </View>
                          <View style={styles.dayInfo}>
                            <View style={styles.dayMeta}>
                              <Text style={styles.day}>
                                DAY {formatNumber(dayNumber)}
                              </Text>
                              <Text style={styles.date}>
                                LOOK {formatNumber(lookNumber)}
                              </Text>
                            </View>
                            <Text style={styles.city} numberOfLines={1}>
                              {itinerary.destination}
                            </Text>
                          </View>
                          <View style={styles.activityIcon}>
                            <SymbolView
                              name={{
                                ios: 'sparkles',
                                android: 'auto_awesome',
                                web: 'auto_awesome',
                              }}
                              size={17}
                              tintColor="#745a38"
                            />
                          </View>
                        </View>

                        <View style={styles.activityBox}>
                          <Text style={styles.activityLabel}>PLANNED FOR</Text>
                          <Text style={styles.activity} numberOfLines={3}>
                            {itinerary.brief}
                          </Text>
                        </View>

                        <View style={styles.outfitBox}>
                          <View style={styles.outfitHeader}>
                            <View>
                              <Text style={styles.outfitKicker}>PLANNED LOOK</Text>
                              <Text style={styles.outfitName}>{outfitType}</Text>
                            </View>
                            <View style={styles.sparkle}>
                              <SymbolView
                                name={{
                                  ios: 'hanger',
                                  android: 'checkroom',
                                  web: 'checkroom',
                                }}
                                size={17}
                                tintColor="#745a38"
                              />
                            </View>
                          </View>

                          <View style={styles.pieces}>
                            {pieces.length > 0 ? (
                              pieces.map(({ key, item }, pieceIndex) => (
                                <View key={`${key}-${pieceIndex}`} style={styles.piece}>
                                  <View style={styles.pieceDot}>
                                    <Text style={styles.pieceNumber}>
                                      {pieceIndex + 1}
                                    </Text>
                                  </View>
                                  {typeof item.image_url === 'string' &&
                                  item.image_url.length > 0 ? (
                                    <Image
                                      source={{ uri: item.image_url }}
                                      contentFit="cover"
                                      style={styles.pieceImage}
                                    />
                                  ) : (
                                    <View style={styles.pieceImageFallback}>
                                      <SymbolView
                                        name={{
                                          ios: 'tshirt',
                                          android: 'checkroom',
                                          web: 'checkroom',
                                        }}
                                        size={15}
                                        tintColor="#745a38"
                                      />
                                    </View>
                                  )}
                                  <Text style={styles.pieceText} numberOfLines={2}>
                                    {getPieceLabel(item)}
                                  </Text>
                                </View>
                              ))
                            ) : (
                              <Text style={styles.pieceText}>
                                Outfit details are unavailable.
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </>
          ) : null}
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
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: 100,
    gap: 18,
  },
  header: {
    gap: 5,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#745a38',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '500',
    color: '#1b1c1a',
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: '#747878',
    maxWidth: 380,
  },
  formCard: {
    gap: 14,
    padding: 17,
    borderRadius: 17,
    backgroundColor: '#f0eeea',
  },
  formTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: '#1b1c1a',
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#745a38',
  },
  input: {
    minHeight: 45,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dedbd6',
    borderRadius: 10,
    backgroundColor: '#fbf9f6',
    color: '#1b1c1a',
    fontSize: 14,
  },
  countFields: {
    flexDirection: 'row',
    gap: 12,
  },
  countField: {
    flex: 1,
  },
  briefInput: {
    minHeight: 96,
    paddingTop: 12,
  },
  errorText: {
    color: '#a7332b',
    fontSize: 12,
    lineHeight: 18,
  },
  generateButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#1b1c1a',
  },
  generateButtonPressed: {
    opacity: 0.85,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
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
  tripHeading: {
    flex: 1,
    paddingRight: 12,
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
    gap: 32,
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
    marginTop: 3,
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
  briefCard: {
    gap: 5,
    padding: 14,
    borderRadius: 13,
    backgroundColor: '#f0eeea',
  },
  briefLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#745a38',
  },
  briefText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#444748',
  },
  noticeCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff1dc',
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#745a38',
  },
  emptyCard: {
    gap: 6,
    padding: 17,
    borderRadius: 15,
    backgroundColor: '#f0eeea',
  },
  emptyTitle: {
    color: '#1b1c1a',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: '#747878',
    fontSize: 12,
    lineHeight: 18,
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
    fontVariant: ['tabular-nums'],
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
    color: '#77736d',
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
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#1b1c1a',
    marginTop: 4,
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
    textTransform: 'capitalize',
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
    minHeight: 34,
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
  pieceImage: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#e4e1db',
  },
  pieceImageFallback: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4e1db',
  },
  pieceText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#444748',
  },
});
