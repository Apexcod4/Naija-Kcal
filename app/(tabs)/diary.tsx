import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../../src/components/Bloom';
import GlassCard from '../../src/components/GlassCard';
import ScrollFade from '../../src/components/ScrollFade';
import StatusCard from '../../src/components/StatusCard';
import WeekChart from '../../src/components/WeekChart';
import { sumMeals } from '../../src/logic/totals';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, radii, space } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

const MOST_EATEN = [
  { label: 'Swallow', pct: 78, colour: colors.palm },
  { label: 'Soups', pct: 64, colour: colors.ugu },
  { label: 'Rice dishes', pct: 41, colour: colors.bonnet },
];

/** Placeholder history until a real per-day store exists. */
const WEEK_HISTORY = [2410, 2180, 2620, 2350, 2480, 2900, 0];

export default function Diary() {
  const insets = useSafeAreaInsets();
  const meals = useAppStore((s) => s.meals);
  const target = useAppStore((s) => s.profile.dailyTarget);

  const todayIndex = (new Date().getDay() + 6) % 7;

  // Today's column reflects the live log; the rest is seeded history.
  const week = useMemo(() => {
    const w = [...WEEK_HISTORY];
    w[todayIndex] = sumMeals(meals).kcal;
    return w;
  }, [meals, todayIndex]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <Bloom style={{ left: -110, top: 40 }} opacity={0.24} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: space.gutter,
          paddingBottom: 140,
          gap: space.sectionGap,
        }}
      >
        <View>
          <Text style={t.screenTitle}>Diary</Text>
          <Text style={[t.body, { marginTop: 8 }]}>
            You are averaging 2,410 kcal a day this week.
          </Text>
        </View>

        <GlassCard radius={radii.hero}>
          <View style={{ padding: space.cardPad }}>
            <Text style={[t.eyebrow, { marginBottom: 14 }]}>This week vs target</Text>
            <WeekChart values={week} target={target} todayIndex={todayIndex} />
          </View>
        </GlassCard>

        <GlassCard radius={radii.hero}>
          <View style={{ padding: space.cardPad, gap: 14 }}>
            <Text style={t.eyebrow}>What you eat most</Text>
            {MOST_EATEN.map((m) => (
              <View key={m.label} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={t.rowTitle}>{m.label}</Text>
                  <Text style={t.rowMeta}>{m.pct}%</Text>
                </View>
                <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.ringTrack }}>
                  <View
                    style={{
                      width: `${m.pct}%`,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: m.colour,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* The insight is the point of this screen: a behaviour change tied to
            a result, not another statistic. */}
        <StatusCard accent={colors.ugu}>
          <Text style={[t.eyebrow, { color: colors.uguText }]}>Insight</Text>
          <Text style={[t.rowTitle, { marginTop: 8, lineHeight: 21 }]}>
            You switched to half portions of swallow on weekdays. That alone is the reason you are
            under target four days running.
          </Text>
        </StatusCard>
      </ScrollView>

      <ScrollFade />
    </View>
  );
}
