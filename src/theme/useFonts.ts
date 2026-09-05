import { Archivo_800ExtraBold, Archivo_900Black } from '@expo-google-fonts/archivo';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';

/**
 * Registered family names must match the keys used in src/theme/typography.ts.
 * Archivo carries every number and headline; Inter carries the UI text.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Archivo_900: Archivo_900Black,
    Archivo_800: Archivo_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  return loaded;
}
