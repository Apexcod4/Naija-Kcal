import { Stack } from 'expo-router';
import { colors } from '../../src/theme/tokens';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.pot },
        animation: 'slide_from_right',
        animationDuration: 320,
        // A funnel should not be swipe-dismissable mid-way.
        gestureEnabled: false,
      }}
    />
  );
}
