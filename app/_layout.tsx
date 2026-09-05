import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { colors } from '../src/theme/tokens';
import { useAppFonts } from '../src/theme/useFonts';

/** The handoff's push timing: 300-350ms. */
const PUSH_MS = 320;

export default function RootLayout() {
  const fontsReady = useAppFonts();

  // Hold on the app background rather than flashing unstyled text — every
  // number in this app is set in Archivo, so unstyled fallbacks are jarring.
  if (!fontsReady) return <View style={{ flex: 1, backgroundColor: colors.pot }} />;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.pot },
          animation: 'slide_from_right',
          animationDuration: PUSH_MS,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="scan" />
        <Stack.Screen name="detect" />
        {/* Portion rises as a sheet over Detect rather than pushing laterally. */}
        <Stack.Screen
          name="portion"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </>
  );
}
