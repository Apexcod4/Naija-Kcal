import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Profile and onboarding state only — nothing secret. Auth tokens, when they
 * exist, belong in expo-secure-store rather than here.
 */
export const appStorage = createJSONStorage(() => AsyncStorage);
