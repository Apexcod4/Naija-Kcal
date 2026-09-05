import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { colors } from '../src/theme/tokens';
import { useAppFonts } from '../src/theme/useFonts';

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
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="detect" />
        {/* The handoff asks for Portion to rise as a sheet over Detect. */}
        <Stack.Screen name="portion" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
