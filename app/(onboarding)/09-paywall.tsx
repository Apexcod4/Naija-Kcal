import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import OnboardingScreen from '../../src/components/onboarding/OnboardingScreen';
import PrimaryButton from '../../src/components/onboarding/PrimaryButton';
import PressableScale from '../../src/components/PressableScale';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, material, radii, space } from '../../src/theme/tokens';
import { fonts, type as t } from '../../src/theme/typography';

const BENEFITS = [
  'Every dish on your phone, offline',
  'Pair logging in wraps, ladles and dericas',
  'Share-of-bowl so the household is not counted as you',
  'Your week, read back as one sentence',
];

type PlanId = 'yearly' | 'monthly';

/**
 * Screen 09 — paywall.
 *
 * UI ONLY. Nothing here transacts, and no free-tier gate is enforced —
 * the handoff's open decision #3 is still open.
 *
 * USSD and bank transfer are load-bearing payment rails in these markets,
 * not decorative chips, so they carry the same visual weight as Card.
 */
const METHODS = ['Card', 'Bank transfer', 'USSD', 'Apple Pay'];

export default function Paywall() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [plan, setPlan] = useState<PlanId>('yearly');

  const finish = () => {
    // TODO(phase-3): no payment is wired. This only ends onboarding.
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const planCard = (
    id: PlanId,
    title: string,
    price: string,
    note?: string,
    badge?: string
  ) => {
    const selected = plan === id;
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${title}, ${price}`}
        onPress={() => setPlan(id)}
        scaleTo={0.985}
        style={{
          borderRadius: radii.card,
          padding: space.cardPad,
          gap: 4,
          backgroundColor: selected ? colors.bonnet : material.glass.backgroundColor,
          borderWidth: selected ? 1 : material.glass.borderWidth,
          borderColor: selected ? colors.bonnet : material.glass.borderColor,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[t.rowTitle, { fontSize: 16, flex: 1, color: selected ? colors.bonnetInk : colors.cream }]}
          >
            {title}
          </Text>
          {badge ? (
            <View
              style={{
                borderRadius: radii.chip,
                paddingVertical: 3,
                paddingHorizontal: 8,
                backgroundColor: selected ? colors.bonnetInk : colors.ugu,
              }}
            >
              <Text
                style={[t.tabLabel, { color: selected ? colors.bonnet : colors.bonnetInk }]}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          maxFontSizeMultiplier={1.5}
          style={{
            fontFamily: fonts.display,
            fontSize: 24,
            letterSpacing: -0.8,
            color: selected ? colors.bonnetInk : colors.cream,
          }}
        >
          {price}
        </Text>
        {note ? (
          <Text style={[t.rowMeta, { color: selected ? colors.bonnetInk : colors.muted }]}>
            {note}
          </Text>
        ) : null}
      </PressableScale>
    );
  };

  return (
    <OnboardingScreen
      title={"You've logged one meal free.\nKeep going?"}
      footer={
        <>
          <PrimaryButton label="Start my plan" haptic="success" onPress={finish} />
          <Text style={[t.rowMeta, { textAlign: 'center' }]}>
            No payment due now · cancel in two taps
          </Text>
        </>
      }
    >
      <View style={{ gap: 12 }}>
        {BENEFITS.map((b) => (
          <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: colors.uguText, fontSize: 15 }}>✓</Text>
            <Text style={[t.rowTitle, { flex: 1 }]}>{b}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 10 }}>
        {planCard('yearly', 'Yearly', '₦1,250/mo', '₦15,000 once', 'SAVE 62%')}
        {planCard('monthly', 'Monthly', '₦3,300', 'Billed every month')}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={t.eyebrow}>Pay with</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {METHODS.map((m) => (
            <View
              key={m}
              style={{
                borderRadius: radii.chip,
                paddingVertical: 9,
                paddingHorizontal: 14,
                backgroundColor: material.glass.backgroundColor,
                borderWidth: material.glass.borderWidth,
                borderColor: material.glass.borderColor,
              }}
            >
              <Text style={t.chip}>{m}</Text>
            </View>
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
}
