import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';

type GuideRule = {
  number: string;
  title: string;
  status: string;
  icon: 'check_circle' | 'wb_sunny' | 'contrast' | 'crop_free';
  description: string;
};

const rules: GuideRule[] = [
  {
    number: '01',
    title: 'Flat & Unfolded',
    status: 'DO',
    icon: 'check_circle',
    description: 'Lay the garment completely flat with sleeves and collar neatly styled. Avoid wrinkles, bunched fabric, or folded sections.',
  },
  {
    number: '02',
    title: 'Natural, Diffused Light',
    status: 'DAYLIGHT',
    icon: 'wb_sunny',
    description: 'Shoot in bright daylight or near a window. Avoid harsh yellow overhead lamps and direct camera flash to preserve true tonal values.',
  },
  {
    number: '03',
    title: 'High-Contrast Neutral Ground',
    status: 'NEUTRAL',
    icon: 'contrast',
    description: 'Place on a plain backdrop (light linen, oak floor, or travertine stone) so the silhouette contour and drape edges remain crisp.',
  },
  {
    number: '04',
    title: 'Include Key Details',
    status: 'FULL FRAME',
    icon: 'crop_free',
    description: 'Ensure the entire silhouette stays within the frame without clipping hem or cuffs. Micro-texture and care labels can be captured next.',
  },
];

const materialIcon = (icon: GuideRule['icon']) => ({ ios: icon, android: icon, web: icon });

function RuleCard({ rule }: { rule: GuideRule }) {
  return (
    <View style={styles.ruleCard}>
      <View style={styles.numberBadge}>
        <ThemedText style={styles.number}>{rule.number}</ThemedText>
      </View>
      <View style={styles.ruleContent}>
        <View style={styles.ruleHeading}>
          <ThemedText style={styles.ruleTitle}>{rule.title}</ThemedText>
          <View style={styles.status}>
            <SymbolView name={materialIcon(rule.icon)} size={14} tintColor="#745a38" />
            <ThemedText style={styles.statusText}>{rule.status}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.ruleDescription}>{rule.description}</ThemedText>
      </View>
    </View>
  );
}

export function HowToPhotographCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <SymbolView name={{ ios: 'camera', android: 'photo_camera', web: 'photo_camera' }} size={20} tintColor="#745a38" />
          <ThemedText style={styles.title}>How to Photograph for Best AI Analysis</ThemedText>
        </View>
        <ThemedText style={styles.badge}>CAPTURE GUIDE</ThemedText>
      </View>

      <ThemedText style={styles.description}>
        Follow these 4 atelier rules to ensure instant classification, accurate drape estimation, and neural weave parsing.
      </ThemedText>

      <View style={styles.rules}>
        {rules.map((rule) => <RuleCard key={rule.number} rule={rule} />)}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerTitle}>
          <SymbolView name={{ ios: 'checkmark.seal', android: 'verified', web: 'verified' }} size={16} tintColor="#745a38" />
          <ThemedText style={styles.footerText}>ATELIER PRECISION ASSURED</ThemedText>
        </View>
        <ThemedText style={styles.footerHint}>Tap shutter above to launch</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#efeeeb',
    gap: 16,
    boxShadow: '0 2px 8px rgba(27, 28, 26, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e2df',
  },
  headerTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 13, lineHeight: 17, fontWeight: '600' },
  badge: { fontSize: 8, lineHeight: 12, fontWeight: '700', letterSpacing: 0.9, color: '#5a4222', backgroundColor: '#fedaae', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  description: { fontSize: 11, lineHeight: 16, color: '#747878' },
  rules: { gap: 12 },
  ruleCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 8, backgroundColor: '#ffffff', boxShadow: '0 1px 5px rgba(27, 28, 26, 0.04)' },
  numberBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eae8e5', marginTop: 2 },
  number: { fontSize: 10, fontWeight: '700', color: '#745a38' },
  ruleContent: { flex: 1, gap: 5 },
  ruleHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  ruleTitle: { flex: 1, fontSize: 13, lineHeight: 17, fontWeight: '600' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 1 },
  statusText: { fontSize: 9, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8, color: '#745a38' },
  ruleDescription: { fontSize: 11, lineHeight: 16, color: '#747878' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e4e2df' },
  footerTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontFamily: Fonts.sans, fontSize: 9, lineHeight: 14, fontWeight: '700', letterSpacing: 1.1, color: '#745a38' },
  footerHint: { fontSize: 10, lineHeight: 14, color: '#747878', textAlign: 'right' },
});
