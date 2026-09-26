const API_URL = 'http://10.65.233.132:8000';

export type RecommendationPreset =
  | 'weather'
  | 'dinner'
  | 'meeting'
  | 'weekend';

export async function getDailyRecommendation(
  preset: RecommendationPreset,
  latitude: number,
  longitude: number
) {
  const response = await fetch(
    `${API_URL}/daily-recommendation`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preset,
        latitude,
        longitude,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
}