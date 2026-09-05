import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { shouldShowOnboarding } from '../src/logic/gate';
import { useAppStore } from '../src/state/useAppStore';
import { colors } from '../src/theme/tokens';
import { useAppFonts } from '../src/theme/useFonts';

/** The handoff's push timing: 300-350ms. */
const PUSH_MS = 320;

export default function RootLayout() {
  const fontsReady = useAppFonts();
  const router = useRouter();
  const segments = useSegments();

  const showOnboarding = useAppStore(shouldShowOnboarding);

  // Wait for AsyncStorage to rehydrate before routing, or a returning user
  // flashes the funnel on every cold start.
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated || !fontsReady) return;
    const inOnboarding = segments[0] === '(onboarding)';
    if (showOnboarding && !inOnboarding) {
      router.replace('/(onboarding)/01-scan');
    }
  }, [hydrated, fontsReady, showOnboarding, segments, router]);

  // Hold on the app background rather than flashing unstyled text — every
  // number in this app is set in Archivo, so unstyled fallbacks are jarring.
  if (!fontsReady || !hydrated) return <View style={{ flex: 1, backgroundColor: colors.pot }} />;

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
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="scan" />
        <Stack.Screen name="detect" />
        <Stack.Screen name="library" />
        <Stack.Screen name="barcode" />
        <Stack.Screen name="dish/[id]" />
        {/* Portion rises as a sheet over Detect rather than pushing laterally. */}
        <Stack.Screen
          name="portion"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </>
  );
}
