import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, Spacing } from '@/constants/theme';

type OptionLayer = {
  id: string;
  kicker: string;
  question: string;
  helper: string;
  type: 'single' | 'multi';
  options: { id: string; label: string; swatch?: string }[];
};

type OpenLayer = {
  id: string;
  kicker: string;
  question: string;
  helper: string;
  type: 'open';
  placeholder: string;
};

type Layer = OptionLayer | OpenLayer;

const layers: Layer[] = [
  {
    id: 'bodyShape',
    kicker: 'LAYER 1 · BODY SHAPE',
    question: 'Which body shape best describes you?',
    helper: 'This helps us recommend cuts and silhouettes that fit you well.',
    type: 'single',
    options: [
      { id: 'hourglass', label: 'Hourglass' },
      { id: 'pear', label: 'Pear' },
      { id: 'apple', label: 'Apple' },
      { id: 'rectangle', label: 'Rectangle' },
      { id: 'invertedTriangle', label: 'Inverted Triangle' },
      { id: 'athletic', label: 'Athletic' },
    ],
  },
  {
    id: 'skinTone',
    kicker: 'LAYER 2 · SKIN TONE',
    question: "What's your skin tone?",
    helper: 'We use this to suggest colors and finishes that flatter you.',
    type: 'single',
    options: [
      { id: 'fair', label: 'Fair', swatch: '#f3dcc6' },
      { id: 'light', label: 'Light', swatch: '#eac9a4' },
      { id: 'medium', label: 'Medium', swatch: '#cc9a6d' },
      { id: 'olive', label: 'Olive', swatch: '#b3854f' },
      { id: 'tan', label: 'Tan', swatch: '#8a5b32' },
      { id: 'deep', label: 'Deep', swatch: '#5a3a22' },
    ],
  },
  {
    id: 'styleAesthetic',
    kicker: 'LAYER 3 · STYLE AESTHETIC',
    question: 'Which aesthetics feel like you?',
    helper: 'Pick as many as you like — this shapes the moods we curate for.',
    type: 'multi',
    options: [
      { id: 'minimalist', label: 'Minimalist' },
      { id: 'oldMoney', label: 'Old Money' },
      { id: 'streetwear', label: 'Streetwear' },
      { id: 'boho', label: 'Boho' },
      { id: 'edgy', label: 'Edgy' },
      { id: 'romantic', label: 'Romantic' },
      { id: 'classic', label: 'Classic' },
      { id: 'sporty', label: 'Sporty' },
    ],
  },
  {
    id: 'fitPreference',
    kicker: 'LAYER 4 · FIT & SILHOUETTE',
    question: 'What fit do you feel most comfortable in?',
    helper: 'Select every fit you reach for regularly.',
    type: 'multi',
    options: [
      { id: 'fitted', label: 'Fitted' },
      { id: 'relaxed', label: 'Relaxed' },
      { id: 'oversized', label: 'Oversized' },
      { id: 'tailored', label: 'Tailored' },
      { id: 'structured', label: 'Structured' },
      { id: 'flowy', label: 'Flowy' },
    ],
  },
  {
    id: 'colorPalette',
    kicker: 'LAYER 5 · COLOR PALETTE',
    question: 'Which palettes do you gravitate toward?',
    helper: 'Choose all that describe your closet, or the one you want more of.',
    type: 'multi',
    options: [
      { id: 'neutrals', label: 'Neutrals', swatch: '#d9d3c7' },
      { id: 'earthTones', label: 'Earth Tones', swatch: '#8d6a4a' },
      { id: 'pastels', label: 'Pastels', swatch: '#f2d6d6' },
      { id: 'brights', label: 'Brights', swatch: '#d94b4b' },
      { id: 'monochrome', label: 'Monochrome', swatch: '#2c2c2c' },
      { id: 'jewelTones', label: 'Jewel Tones', swatch: '#3a5a6b' },
    ],
  },
  {
    id: 'occasions',
    kicker: 'LAYER 6 · OCCASIONS',
    question: 'What do you dress for most?',
    helper: 'This tells us which parts of your wardrobe to prioritize.',
    type: 'multi',
    options: [
      { id: 'work', label: 'Work' },
      { id: 'college', label: 'College' },
      { id: 'weekend', label: 'Weekend' },
      { id: 'eveningsOut', label: 'Evenings Out' },
      { id: 'travel', label: 'Travel' },
      { id: 'athleisure', label: 'Gym & Athleisure' },
    ],
  },
  {
    id: 'styleNotes',
    kicker: 'LAYER 7 · IN YOUR WORDS',
    question: 'Anything else about your style you want us to know?',
    helper: 'Fits, fabrics, colors you avoid, a look you keep coming back to — anything helps.',
    type: 'open',
    placeholder: 'e.g. I avoid synthetic fabrics and love a good statement blazer...',
  },
  {
    id: 'inspiration',
    kicker: 'LAYER 8 · INSPIRATION',
    question: 'Any brands or style icons you love?',
    helper: 'Optional, but it helps us calibrate your recommendations faster.',
    type: 'open',
    placeholder: 'e.g. COS, Toteme, Zendaya\'s red carpet looks...',
  },
];

export default function PreferencesScreen() {
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});

  const layer = layers[stepIndex];
  const isLastStep = stepIndex === layers.length - 1;
  const isFirstStep = stepIndex === 0;

  function toggleOption(layerId: string, optionId: string, multi: boolean) {
    setSelections((current) => {
      const existing = current[layerId] || [];

      if (multi) {
        const alreadySelected = existing.includes(optionId);
        return {
          ...current,
          [layerId]: alreadySelected
            ? existing.filter((id) => id !== optionId)
            : [...existing, optionId],
        };
      }

      return { ...current, [layerId]: [optionId] };
    });
  }

  function canContinue() {
    if (layer.type === 'open') return true;

    const answered = selections[layer.id] || [];
    return answered.length > 0;
  }

  function goNext() {
    if (!canContinue()) return;

    if (isLastStep) {
      router.replace('/');
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function goBack() {
    if (isFirstStep) {
      router.back();
      return;
    }

    setStepIndex((current) => current - 1);
  }

  function skipForNow() {
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* PROGRESS */}
          <View style={styles.progressRow}>
            <Pressable
              onPress={goBack}
              accessibilityLabel="Go back"
              hitSlop={10}
              style={styles.backButton}
            >
              <SymbolView
                name={{
                  ios: 'chevron.left',
                  android: 'chevron_left',
                  web: 'chevron_left',
                }}
                size={19}
                tintColor="#444748"
              />
            </Pressable>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((stepIndex + 1) / layers.length) * 100}%`,
                  },
                ]}
              />
            </View>

            <Pressable onPress={skipForNow} hitSlop={10}>
              <Text style={styles.skipText}>SKIP</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.stepCount}>
              {stepIndex + 1} OF {layers.length}
            </Text>

            <Text style={styles.kicker}>{layer.kicker}</Text>

            <Text style={styles.question}>{layer.question}</Text>

            <Text style={styles.helper}>{layer.helper}</Text>

            {layer.type === 'open' ? (
              <View style={styles.openBox}>
                <TextInput
                  value={openAnswers[layer.id] || ''}
                  onChangeText={(text) =>
                    setOpenAnswers((current) => ({
                      ...current,
                      [layer.id]: text,
                    }))
                  }
                  placeholder={layer.placeholder}
                  placeholderTextColor="#9b9892"
                  multiline
                  style={styles.openInput}
                />
              </View>
            ) : (
              <View style={styles.optionGrid}>
                {layer.options.map((option) => {
                  const selected = (
                    selections[layer.id] || []
                  ).includes(option.id);

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() =>
                        toggleOption(
                          layer.id,
                          option.id,
                          layer.type === 'multi'
                        )
                      }
                      style={[
                        styles.optionCard,
                        selected && styles.optionCardSelected,
                      ]}
                    >
                      {option.swatch && (
                        <View
                          style={[
                            styles.swatch,
                            { backgroundColor: option.swatch },
                            selected && styles.swatchSelected,
                          ]}
                        />
                      )}

                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>

                      <View style={styles.optionCheck}>
                        <SymbolView
                          name={{
                            ios:
                              layer.type === 'multi'
                                ? selected
                                  ? 'checkmark.square.fill'
                                  : 'square'
                                : selected
                                ? 'largecircle.fill.circle'
                                : 'circle',
                            android: selected
                              ? 'check_circle'
                              : 'radio_button_unchecked',
                            web: selected
                              ? 'check_circle'
                              : 'radio_button_unchecked',
                          }}
                          size={17}
                          tintColor={selected ? '#1b1c1a' : '#c4c7c7'}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {layer.type === 'multi' && (
              <Text style={styles.multiHint}>
                Multiple choice — select as many as apply.
              </Text>
            )}
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Pressable
              onPress={goNext}
              disabled={!canContinue()}
              style={[
                styles.nextButton,
                !canContinue() && styles.nextButtonDisabled,
              ]}
            >
              <Text style={styles.nextText}>
                {isLastStep ? 'Finish setup' : 'Continue'}
              </Text>
              <SymbolView
                name={{
                  ios: isLastStep ? 'checkmark' : 'arrow.right',
                  android: isLastStep ? 'check' : 'arrow_forward',
                  web: isLastStep ? 'check' : 'arrow_forward',
                }}
                size={16}
                tintColor="#ffffff"
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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

  flex: {
    flex: 1,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.three,
    paddingTop: 6,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#efeeeb',
  },

  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e4e2df',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#1b1c1a',
  },

  skipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#9b9892',
  },

  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: 6,
  },

  stepCount: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#9b9892',
  },

  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: '#745a38',
    marginTop: 6,
  },

  question: {
    fontFamily: Fonts.serif,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '500',
    color: '#1b1c1a',
    marginTop: 8,
  },

  helper: {
    fontSize: 13,
    lineHeight: 19,
    color: '#747878',
    marginTop: 8,
    marginBottom: 22,
    maxWidth: 320,
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  optionCard: {
    minWidth: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 13,
    paddingVertical: 14,
    borderRadius: 13,
    backgroundColor: '#f0eeea',
    borderWidth: 1,
    borderColor: '#e4e2df',
  },

  optionCardSelected: {
    backgroundColor: '#1b1c1a',
    borderColor: '#1b1c1a',
  },

  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(27,28,26,0.12)',
  },

  swatchSelected: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },

  optionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1b1c1a',
  },

  optionTextSelected: {
    color: '#ffffff',
  },

  optionCheck: {
    marginLeft: 2,
  },

  multiHint: {
    marginTop: 14,
    fontSize: 11,
    color: '#9b9892',
  },

  openBox: {
    minHeight: 140,
    borderRadius: 14,
    backgroundColor: '#f0eeea',
    borderWidth: 1,
    borderColor: '#e4e2df',
    padding: 16,
  },

  openInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: '#1b1c1a',
    textAlignVertical: 'top',
  },

  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: 10,
    paddingBottom: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#e4e2df',
    backgroundColor: '#fbf9f6',
  },

  nextButton: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#1b1c1a',
  },

  nextButtonDisabled: {
    opacity: 0.4,
  },

  nextText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
