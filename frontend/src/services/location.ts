import * as Location from "expo-location";

export type CurrentCoordinates = {
  latitude: number;
  longitude: number;
};

const LOCATION_CACHE_DURATION_MS = 5 * 60 * 1000;

let cachedCoordinates: {
  value: CurrentCoordinates;
  timestamp: number;
} | null = null;
let permissionRequest: Promise<Location.LocationPermissionResponse> | null =
  null;
let coordinatesRequest: Promise<CurrentCoordinates> | null = null;

async function ensureForegroundPermission() {
  let permission = await Location.getForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    if (!permission.canAskAgain) {
      throw new Error(
        "Location access is disabled. Enable it in your device or browser settings."
      );
    }

    if (!permissionRequest) {
      permissionRequest = Location.requestForegroundPermissionsAsync().finally(
        () => {
          permissionRequest = null;
        }
      );
    }

    permission = await permissionRequest;
  }

  if (permission.status !== "granted") {
    throw new Error(
      "Allow location access to get local weather and outfit recommendations."
    );
  }
}

export async function getCurrentCoordinates(): Promise<CurrentCoordinates> {
  if (
    cachedCoordinates &&
    Date.now() - cachedCoordinates.timestamp < LOCATION_CACHE_DURATION_MS
  ) {
    return cachedCoordinates.value;
  }

  await ensureForegroundPermission();

  if (!coordinatesRequest) {
    coordinatesRequest = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
      .then(({ coords }) => {
        const value = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        cachedCoordinates = { value, timestamp: Date.now() };
        return value;
      })
      .finally(() => {
        coordinatesRequest = null;
      });
  }

  return coordinatesRequest;
}
