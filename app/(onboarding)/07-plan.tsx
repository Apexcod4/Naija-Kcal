import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import GlassCard from '../../src/components/GlassCard';
import OnboardingScreen from '../../src/components/onboarding/OnboardingScreen';
import PrimaryButton from '../../src/components/onboarding/PrimaryButton';
import ProgressRing from '../../src/components/ProgressRing';
import StatusCard from '../../src/components/StatusCard';
import { bmr, dailyTarget, macroTargets, tdee } from '../../src/logic/body';
import { RING } from '../../src/logic/rings';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, food, radii, space } from '../../src/theme/tokens';
import { fonts, type as t } from '../../src/theme/typography';

/** The handoff's worked example of a day at target. */
const EXAMPLE_DAY = [
  { name: 'Akara & pap', kcal: 310, colour: food.akara },
  { name: 'Jollof rice, chicken', kcal: 847, colour: food.jollof },
  { name: 'Egusi & pounded yam', kcal: 612, colour: food.egusi },
];

const GOAL_WEEKS = 12;

/**
 * Screen 07 — plan ready. The payoff.
 *
 * No progress bar: the funnel is over. "BUILT FROM 6 ANSWERS" names the cost
 * the app did not charge — six questions rather than Cal AI's twenty screens.
 */
export default function PlanReady() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);

  const target = dailyTarget(
    tdee(bmr(profile.sex, profile.weightKg, profile.heightCm, profile.age), profile.activity),
    profile.goal
  );
  const macros = macroTargets(target);

  const eaten = EXAMPLE_DAY.reduce((a, m) => a + m.kcal, 0);
  const spare = Math.max(0, target - eaten);

  const goalDate = new Date();
  goalDate.setDate(goalDate.getDate() + GOAL_WEEKS * 7);
  const goalLabel = goalDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

  const macroCards = [
    { label: 'Carbs', grams: macros.carbs, colour: colors.palm },
    { label: 'Protein', grams: macros.protein, colour: colors.ugu },
    { label: 'Fat', grams: macros.fat, colour: colors.sky },
  ];

  return (
    <OnboardingScreen
      footer={
        <PrimaryButton
          label="Save my plan"
          haptic="success"
          onPress={() => {
            setProfile({ dailyTarget: target, macroTargets: macros });
            router.push('/(onboarding)/08-save');
          }}
        />
      }
    >
      <View>
        <Text style={[t.eyebrow, { color: colors.uguText }]}>Built from 6 answers</Text>
        <Text style={[t.screenTitle, { marginTop: 8 }]}>Your plan is ready</Text>
      </View>

      <GlassCard radius={radii.hero}>
        <View style={{ padding: space.cardPad, alignItems: 'center', gap: 12 }}>
          <ProgressRing
            {...RING.planReady}
            diameter={150}
            value={target}
            target={target}
            colour={colors.bonnet}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 50 }}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={{
                  fontFamily: fonts.display,
                  fontSize: 34,
                  letterSpacing: -1.2,
                  color: colors.cream,
                }}
              >
                {target.toLocaleString()}
              </Text>
              <Text style={[t.rowMeta, { fontSize: 11 }]}>kcal a day</Text>
            </View>
          </ProgressRing>

          <View style={{ flexDirection: 'row', gap: 9, alignSelf: 'stretch' }}>
            {macroCards.map((m) => (
              <View key={m.label} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.colour }}
                />
                <Text maxFontSizeMultiplier={1.6} style={[t.metric, { fontSize: 16 }]}>
                  {m.grams}g
                </Text>
                <Text style={t.tabLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </GlassCard>

      {/* The target expressed as an actual day of food, not an abstract number. */}
      <GlassCard radius={radii.hero}>
        <View style={{ padding: space.cardPad, gap: 12 }}>
          <Text style={t.eyebrow}>What that looks like</Text>
          {EXAMPLE_DAY.map((m) => (
            <View
              key={m.name}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View
                style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.colour }}
              />
              <Text style={[t.rowTitle, { flex: 1 }]}>{m.name}</Text>
              <Text maxFontSizeMultiplier={1.6} style={t.metric}>
                {m.kcal}
              </Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[t.rowTitle, { flex: 1, color: colors.muted }]}>To spare</Text>
            <Text maxFontSizeMultiplier={1.6} style={[t.metric, { color: colors.uguText }]}>
              {spare}
            </Text>
          </View>
        </View>
      </GlassCard>

      <StatusCard accent={colors.bonnet}>
        <Text style={[t.rowTitle, { lineHeight: 21 }]}>
          Keep to this and you reach your goal around {goalLabel}.
        </Text>
      </StatusCard>
    </OnboardingScreen>
  );
}
