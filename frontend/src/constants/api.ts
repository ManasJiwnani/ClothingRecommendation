import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8000'
    : 'http://10.25.230.248:8000';