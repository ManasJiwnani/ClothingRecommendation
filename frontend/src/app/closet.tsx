import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, Spacing } from '@/constants/theme';

const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes'];

const wardrobeItems = [
  { name: 'White Oversized T-Shirt', detail: 'Tops · Organic cotton', symbol: 'checkroom', tone: '#e8e4dc' },
  { name: 'Washed Black Jeans', detail: 'Bottoms · Selvedge denim', symbol: 'checkroom', tone: '#b8b3ae' },
  { name: 'Court Leather Sneakers', detail: 'Shoes · Italian leather', symbol: 'steps', tone: '#d9d3c7' },
  { name: 'Raw Denim Jacket', detail: 'Outerwear · Indigo denim', symbol: 'checkroom', tone: '#8d9aa1' },
  { name: 'Cashmere Mock-Neck', detail: 'Tops · Fine gauge cashmere', symbol: 'checkroom', tone: '#a9a19a' },
  { name: 'Pleated Wool Trousers', detail: 'Bottoms · Virgin wool', symbol: 'checkroom', tone: '#777a78' },
] as const;

export default function ClosetScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOutfits, setShowOutfits] = useState(false);
  const [query, setQuery] = useState('');

  const visibleItems = wardrobeItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.detail.startsWith(selectedCategory);
    const matchesQuery = `${item.name} ${item.detail}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
              <ThemedText style={styles.kicker}>STYLE SENSE</ThemedText>
              <ThemedText type="subtitle" style={styles.heading}>My Wardrobe</ThemedText>
              </View>
              <View style={styles.headerWeather}><ThemedText style={styles.weatherText}>PARIS</ThemedText><ThemedText style={styles.weatherTemperature}>19°C</ThemedText></View>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricDot} />
            <ThemedText style={styles.metric}>84 PIECES · 12 SAVED OUTFITS</ThemedText>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={19} tintColor="#747878" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search your wardrobe"
                placeholderTextColor="#747878"
                style={styles.searchInput}
              />
            </View>
            <Pressable accessibilityLabel="Filter wardrobe" style={styles.filterButton}>
              <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'tune', web: 'tune' }} size={20} tintColor="#1b1c1a" />
            </Pressable>
          </View>

          <View style={styles.segmentedControl}>
            <Pressable onPress={() => setShowOutfits(false)} style={[styles.segment, !showOutfits && styles.segmentSelected]}>
              <SymbolView name={{ ios: 'hanger', android: 'checkroom', web: 'checkroom' }} size={17} tintColor="#1b1c1a" />
              <ThemedText style={styles.segmentText}>Clothes</ThemedText>
              <ThemedText style={styles.count}>84</ThemedText>
            </Pressable>
            <Pressable onPress={() => setShowOutfits(true)} style={[styles.segment, showOutfits && styles.segmentSelected]}>
              <SymbolView name={{ ios: 'wand.and.stars', android: 'auto_fix_high', web: 'auto_fix_high' }} size={17} tintColor="#1b1c1a" />
              <ThemedText style={styles.segmentText}>Outfits</ThemedText>
              <ThemedText style={styles.count}>12</ThemedText>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {categories.map((category) => (
              <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.chip, selectedCategory === category && styles.chipSelected]}>
                <ThemedText style={[styles.chipText, selectedCategory === category && styles.chipTextSelected]}>{category}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {showOutfits ? (
            <View style={styles.emptyState}>
              <SymbolView name={{ ios: 'wand.and.stars', android: 'auto_fix_high', web: 'auto_fix_high' }} size={30} tintColor="#745a38" />
              <ThemedText style={styles.emptyTitle}>Your saved edits</ThemedText>
              <ThemedText style={styles.emptyBody}>Your styled outfits will appear here.</ThemedText>
            </View>
          ) : (
            <View style={styles.grid}>
              {visibleItems.map((item) => (
                <View key={item.name} style={styles.card}>
                  <View style={[styles.cardImage, { backgroundColor: item.tone }]}>
                    <SymbolView name={{ ios: item.symbol === 'steps' ? 'shoeprints.fill' : 'tshirt', android: item.symbol, web: item.symbol }} size={64} tintColor="#fbf9f6" />
                    <View style={styles.wornBadge}><ThemedText style={styles.wornText}>WORN 14X</ThemedText></View>
                  </View>
                  <ThemedText style={styles.cardTitle} numberOfLines={1}>{item.name}</ThemedText>
                  <ThemedText style={styles.cardDetail} numberOfLines={1}>{item.detail}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fbf9f6' },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: BottomTabInset + 32, gap: Spacing.two },
  header: { gap: 5 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerWeather: { alignItems: 'flex-end', gap: 2 },
  weatherText: { color: '#747878', fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  weatherTemperature: { color: '#745a38', fontFamily: Fonts.serif, fontSize: 18 },
  kicker: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700', letterSpacing: 2, color: '#745a38' },
  heading: { fontFamily: Fonts.serif, fontSize: 32, lineHeight: 40, fontWeight: '500', marginTop: 4 },
  insightButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#efeeeb', alignItems: 'center', justifyContent: 'center' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metricDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#745a38' },
  metric: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: '#745a38' },
  searchRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  searchBox: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, backgroundColor: '#f0eeea', borderRadius: 12 },
  searchInput: { flex: 1, fontFamily: Fonts.sans, fontSize: 14, color: '#1b1c1a', paddingVertical: 0 },
  filterButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f0eeea', alignItems: 'center', justifyContent: 'center' },
  segmentedControl: { flexDirection: 'row', padding: 4, backgroundColor: '#efeeeb', borderRadius: 12, marginTop: Spacing.one },
  segment: { flex: 1, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9 },
  segmentSelected: { backgroundColor: '#ffffff', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)' },
  segmentText: { fontSize: 13, fontWeight: '600' },
  count: { fontSize: 10, color: '#747878', backgroundColor: '#e4e2df', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8 },
  chips: { gap: 8, paddingVertical: 6 },
  chip: { height: 34, paddingHorizontal: 15, borderRadius: 17, backgroundColor: '#efeeeb', alignItems: 'center', justifyContent: 'center' },
  chipSelected: { backgroundColor: '#1b1c1a' },
  chipText: { fontSize: 13, color: '#444748' },
  chipTextSelected: { color: '#ffffff', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 22, paddingTop: 4 },
  card: { width: '48.2%' },
  cardImage: { aspectRatio: 0.78, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  wornBadge: { position: 'absolute', top: 9, right: 9, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(251,249,246,0.88)' },
  wornText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: '#745a38' },
  cardTitle: { fontSize: 15, fontWeight: '600', marginTop: 8 },
  cardDetail: { fontSize: 12, color: '#747878', marginTop: 2 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyBody: { fontSize: 14, color: '#747878' },
});
