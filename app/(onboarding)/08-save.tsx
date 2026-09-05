import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import OnboardingScreen from '../../src/components/onboarding/OnboardingScreen';
import PrimaryButton from '../../src/components/onboarding/PrimaryButton';
import PressableScale from '../../src/components/PressableScale';
import { colors, material, radii, space } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

/**
 * Screen 08 — save and notify.
 *
 * Framed as backup rather than signup, and it is the first thing the app has
 * asked for. The decline path is explicit and equally weighted.
 *
 * UI ONLY. No authentication is wired anywhere on this screen.
 */
export default function SaveScreen() {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  // TODO(phase-3): no authentication is wired. These only advance the funnel.
  const onSignIn = () => setShowAlert(true);

  const next = () => router.push('/(onboarding)/09-paywall');

  const secondary = (label: string, onPress: () => void) => (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.98}
      style={{
        height: 56,
        borderRadius: radii.cta,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: material.glass.backgroundColor,
        borderWidth: material.glass.borderWidth,
        borderColor: material.glass.borderColor,
      }}
    >
      <Text style={[t.rowTitle, { fontSize: 16 }]}>{label}</Text>
    </PressableScale>
  );

  return (
    <OnboardingScreen
      title={'Keep your plan\nsafe'}
      subtitle="The app already works. This is only a backup — and it's the first thing we've asked you for."
      footer={
        <PressableScale
          accessibilityRole="button"
          onPress={next}
          hitSlop={10}
          style={{ alignItems: 'center', paddingVertical: 8 }}
        >
          <Text style={[t.body, { color: colors.muted }]}>
            Not now — keep it on this phone only
          </Text>
        </PressableScale>
      }
    >
      <View style={{ gap: 10 }}>
        <PrimaryButton label="Continue with Apple" variant="cream" onPress={onSignIn} />
        {secondary('Continue with Google', onSignIn)}
        {/* Phone number is not optional in these markets. */}
        {secondary('Continue with phone number', onSignIn)}
      </View>

      {showAlert ? (
        <View
          style={{
            position: 'absolute',
            top: -200,
            left: -space.gutterOnboarding,
            right: -space.gutterOnboarding,
            bottom: -400,
            backgroundColor: colors.scrim,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              backgroundColor: colors.iosAlert,
              borderRadius: 14,
              padding: 20,
              gap: 8,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={[t.rowTitle, { fontSize: 17, textAlign: 'center' }]}>
              Allow notifications?
            </Text>
            {/* Honest copy: say exactly what will be sent. */}
            <Text style={[t.body, { textAlign: 'center' }]}>
              One nudge at dinner time. Nothing else.
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, alignSelf: 'stretch' }}>
              <View style={{ flex: 1 }}>
                {secondary("Don't allow", () => {
                  setShowAlert(false);
                  next();
                })}
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label="Allow"
                  onPress={() => {
                    // TODO(phase-3): no notification permission is requested.
                    setShowAlert(false);
                    next();
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </OnboardingScreen>
  );
}
