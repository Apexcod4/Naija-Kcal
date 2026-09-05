import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import FoodTile from '../../src/components/FoodTile';
import GlassCard from '../../src/components/GlassCard';
import OnboardingScreen from '../../src/components/onboarding/OnboardingScreen';
import PrimaryButton from '../../src/components/onboarding/PrimaryButton';
import { DETECTED_PAIR } from '../../src/data/detectedPair';
import { colors, radii, space } from '../../src/theme/tokens';
import { fonts, type as t } from '../../src/theme/typography';

/** The pair the stubbed recogniser returns, priced at one wrap and one ladle. */
const DEMO_KCAL = 610;

const SPECS = [
  { title: '340 dishes on this phone', meta: 'Nothing to download before you eat.' },
  { title: '0 MB of data per scan', meta: 'Recognition runs on the device.' },
  { title: 'Measured in wraps, ladles and dericas', meta: 'Not in generic servings.' },
];

/**
 * Screen 02 — the proof beat.
 *
 * No progress bar. This screen replaces Cal AI's entire comparison-chart and
 * objection-handling block, so it stays short and factual: what just happened,
 * and the three facts that make it credible.
 */
export default function Proof() {
  const router = useRouter();
  const [soup, swallow] = DETECTED_PAIR;

  return (
    <OnboardingScreen
      footer={
        <PrimaryButton
          label="Set up my targets"
          onPress={() => router.push('/(onboarding)/03-goal')}
        />
      }
    >
      <View>
        <Text style={[t.eyebrow, { color: colors.uguText }]}>Matched offline in 0.4s</Text>
        <Text style={[t.detectTitle, { marginTop: 10 }]}>
          {soup.name} and {swallow.name.toLowerCase()}
        </Text>
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 56,
            letterSpacing: -2.2,
            color: colors.bonnet,
            marginTop: 6,
          }}
        >
          {DEMO_KCAL} kcal
        </Text>
      </View>

      <GlassCard radius={radii.hero}>
        <View style={{ padding: space.cardPad, gap: 16 }}>
          {SPECS.map((s) => (
            <View key={s.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: radii.tileSm,
                  backgroundColor: colors.ugu,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.bonnetInk, fontSize: 15 }}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={t.rowTitle}>{s.title}</Text>
                <Text style={[t.rowMeta, { marginTop: 2 }]}>{s.meta}</Text>
              </View>
            </View>
          ))}
        </View>
      </GlassCard>

      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <FoodTile colour={soup.colour} size={34} plate={false} />
        <FoodTile colour={swallow.colour} size={34} plate={false} />
        <Text style={[t.rowMeta, { flex: 1 }]}>
          Recognised as a pair, not as two separate items.
        </Text>
      </View>
    </OnboardingScreen>
  );
}
