import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import GlassCard from '../../src/components/GlassCard';
import OnboardingScreen from '../../src/components/onboarding/OnboardingScreen';
import PrimaryButton from '../../src/components/onboarding/PrimaryButton';
import PressableScale from '../../src/components/PressableScale';
import StatusCard from '../../src/components/StatusCard';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, material, radii, space, tint } from '../../src/theme/tokens';
import { fonts, type as t } from '../../src/theme/typography';

const MIN = 1;
const MAX = 12;
const INITIALS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

/**
 * Screen 06 — household. Sets the divisor for shared-bowl logging.
 */
export default function HouseholdScreen() {
  const router = useRouter();
  const current = useAppStore((s) => s.profile.householdSize);
  const setProfile = useAppStore((s) => s.setProfile);

  const [size, setSize] = useState(current);

  const step = (delta: number) => setSize((n) => Math.max(MIN, Math.min(MAX, n + delta)));

  const circle = (label: string, onPress: () => void, accessibilityLabel: string) => (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: material.glass.backgroundColor,
        borderWidth: material.glass.borderWidth,
        borderColor: material.glass.borderColor,
      }}
    >
      <Text style={{ color: colors.cream, fontSize: 26, lineHeight: 30 }}>{label}</Text>
    </PressableScale>
  );

  return (
    <OnboardingScreen
      progress={56}
      title={'Who eats from\nthe pot?'}
      footer={
        <PrimaryButton
          label="Continue"
          onPress={() => {
            setProfile({ householdSize: size });
            router.push('/(onboarding)/07-plan');
          }}
        />
      }
    >
      <GlassCard radius={radii.hero}>
        <View style={{ padding: space.cardPad, gap: 18, alignItems: 'center' }}>
          <Text style={t.eyebrow}>Adults sharing the bowl</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
            {circle('−', () => step(-1), 'Fewer adults')}
            <Text
              accessible
              accessibilityLabel={`${size} adults`}
              maxFontSizeMultiplier={1.4}
              style={{
                fontFamily: fonts.display,
                fontSize: 64,
                letterSpacing: -2.4,
                color: colors.cream,
                minWidth: 90,
                textAlign: 'center',
              }}
            >
              {size}
            </Text>
            {circle('+', () => step(1), 'More adults')}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {INITIALS.slice(0, size).map((initial) => (
              <View
                key={initial}
                style={[
                  {
                    width: 38,
                    height: 38,
                    borderRadius: radii.tileSm,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  tint(colors.cream, 0.08, 0.16),
                ]}
              >
                <Text style={[t.rowTitle, { fontSize: 13 }]}>{initial}</Text>
              </View>
            ))}
          </View>
        </View>
      </GlassCard>

      {/* Load-bearing: this is the only place the app explains why the share
          step sometimes vanishes from logging. */}
      <StatusCard accent={colors.palm}>
        <Text style={[t.rowTitle, { lineHeight: 21 }]}>
          Cooking alone? Set this to 1 and the share step disappears from logging.
        </Text>
      </StatusCard>
    </OnboardingScreen>
  );
}
