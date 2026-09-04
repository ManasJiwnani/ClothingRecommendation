import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.brandBlock}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}><View><ThemedText style={styles.appName}>STYLE SENSE</ThemedText><ThemedText style={{ fontFamily: Fonts.serif, fontSize: 32, lineHeight: 40, fontWeight: '500', marginTop: 4 }}>Dress with intention.</ThemedText></View><View style={styles.headerWeather}><ThemedText style={styles.weatherText}>PARIS</ThemedText><ThemedText style={styles.weatherTemperature}>19°C</ThemedText></View></View>
          <ThemedText style={styles.subtitle}>Your personal edit for every day.</ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  brandBlock: { alignSelf: 'stretch', alignItems: 'stretch', paddingTop: Spacing.three, position: 'relative', gap: 5 },
  appName: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#745a38',
  },
  headerWeather: { alignItems: 'flex-end', gap: 2 },
  weatherText: { color: '#747878', fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  weatherTemperature: { color: '#745a38', fontFamily: Fonts.serif, fontSize: 18 },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#60646C',
  },
});
