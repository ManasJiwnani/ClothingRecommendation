const OFFICE_FORMAL_IMAGE = require('../assets/intent-fallbacks/office-formal.png');
const OFFICE_PRESENTATION_IMAGE = require('../assets/intent-fallbacks/office-presentation.png');
const CASUAL_EVENING_IMAGE = require('../assets/intent-fallbacks/casual-evening.png');
const CLASSIC_CHIC_IMAGE = require('../assets/intent-fallbacks/classic-chic.png');
const TRADITIONAL_FESTIVE_IMAGE = require('../assets/intent-fallbacks/traditional-festive.png');
const TRADITIONAL_SAREE_IMAGE = require('../assets/intent-fallbacks/traditional-saree.png');
const BRUNCH_IMAGE = require('../assets/intent-fallbacks/brunch.png');
export const TRY_ON_FALLBACK_DELAY_MS = 15_000;

export function getTryOnFallbackImage(intent: string) {
  const normalize = (value: string) =>
    ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
  const normalizedIntent = normalize(intent);
  const includesAny = (terms: string[]) =>
    terms.some((term) => normalizedIntent.includes(normalize(term)));

  if (
    includesAny([
      'saree',
      'sari',
      'wedding',
      'festival',
      'festive',
      'indian',
      'ethnic',
      'traditional',
      'lehenga',
      'diwali',
      'garba',
    ])
  ) {
    return includesAny(['saree', 'sari'])
      ? TRADITIONAL_SAREE_IMAGE
      : TRADITIONAL_FESTIVE_IMAGE;
  }

  if (
    includesAny([
      'classic',
      'chic',
      'elegant',
      'semi formal',
      'semiformal',
    ])
  ) {
    return CLASSIC_CHIC_IMAGE;

  }

  if (
    includesAny([
      'brunch',
      'daytime',
      'day',
      'lunch',
      'afternoon',
      'casual',
    ])
  ) {
    return BRUNCH_IMAGE;

  }

  if (
    includesAny([
      'casual',
      'dinner',
      'date',
      'night',
      'romantic',
      'evening',
    ])
  ) {
    return CASUAL_EVENING_IMAGE;
  }

  if (includesAny(['presentation', 'presentations'])) {
    return OFFICE_PRESENTATION_IMAGE;
  }

  if (
    includesAny([
      'office',
      'meeting',
      'formal',
      'work',
      'professional',
    ])
  ) {
    return OFFICE_FORMAL_IMAGE;
  }

  return null;
}
