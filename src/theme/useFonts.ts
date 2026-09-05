import { Archivo_800ExtraBold } from '@expo-google-fonts/archivo/800ExtraBold';
import { Archivo_900Black } from '@expo-google-fonts/archivo/900Black';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { useFonts } from 'expo-font';

/**
 * Registered family names must match the keys used in src/theme/typography.ts.
 * Archivo carries every number and headline; Inter carries the UI text.
 *
 * Imported per weight rather than from the package root: the root entrypoint
 * drags all 18 faces (every weight plus italics) into the bundle, and this app
 * uses seven.
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
