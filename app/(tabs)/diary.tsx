import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../../src/components/Bloom';
import GlassCard from '../../src/components/GlassCard';
import ScrollFade from '../../src/components/ScrollFade';
import StatusCard from '../../src/components/StatusCard';
import WeekChart from '../../src/components/WeekChart';
import { mealsForDate, todayISO, weekOf } from '../../src/logic/days';
import { sumMeals } from '../../src/logic/totals';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, radii, space } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

const MOST_EATEN = [
  { label: 'Swallow', pct: 78, colour: colors.palm },
  { label: 'Soups', pct: 64, colour: colors.ugu },
  { label: 'Rice dishes', pct: 41, colour: colors.bonnet },
];

export default function Diary() {
  const insets = useSafeAreaInsets();
  const meals = useAppStore((s) => s.meals);
  const target = useAppStore((s) => s.profile.dailyTarget);

  const today = todayISO();
  const dates = useMemo(() => weekOf(today), [today]);
  const todayIndex = dates.indexOf(today);

  // Every column is now the real log for that day. There is no seeded history.
  const week = useMemo(
    () => dates.map((d) => sumMeals(mealsForDate(meals, d)).kcal),
    [meals, dates]
  );

  const loggedDays = week.filter((k) => k > 0);
  const average = loggedDays.length
    ? Math.round(loggedDays.reduce((a, b) => a + b, 0) / loggedDays.length)
    : 0;

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
            {average > 0
              ? `You are averaging ${average.toLocaleString()} kcal a day this week.`
              : 'Log a meal and this week starts filling in.'}
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
