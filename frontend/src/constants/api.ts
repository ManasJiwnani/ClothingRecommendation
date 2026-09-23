import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8000'
    : 'http://10.65.233.132:8000';