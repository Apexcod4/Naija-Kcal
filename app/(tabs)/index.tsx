import { useRouter } from 'expo-router';
import LogInputBar from '../../src/components/LogInputBar';
import { DISHES } from '../../src/data/dishes';
import { routeForMatch } from '../../src/logic/logRoute';
import { matchPair } from '../../src/logic/matchPair';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../../src/components/Bloom';
import MealRow from '../../src/components/MealRow';
import ScrollFade from '../../src/components/ScrollFade';
import StreakPill from '../../src/components/StreakPill';
import SummaryCard from '../../src/components/SummaryCard';
import Toast from '../../src/components/Toast';
import WeekStrip from '../../src/components/WeekStrip';
import { sumMeals } from '../../src/logic/totals';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, space } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

/** Monday-first index for the week strip. */
function mondayFirstIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const meals = useAppStore((s) => s.meals);
  const profile = useAppStore((s) => s.profile);
  const toast = useAppStore((s) => s.toast);
  const hideToast = useAppStore((s) => s.hideToast);
  const buildLibraryPair = useAppStore((s) => s.buildLibraryPair);

  /** Typed meals resolve into the same pair-and-units flow as a scan. */
  const onSubmitText = (text: string) => {
    const route = routeForMatch(matchPair(text, DISHES));

    if (route.action === 'portion') {
      buildLibraryPair(route.soup, route.swallow);
      router.push('/portion');
    } else if (route.action === 'dish') {
      router.push({ pathname: '/dish/[id]', params: { id: route.id } });
    } else {
      router.push({ pathname: '/library', params: { q: route.query } });
    }
  };

  const consumed = useMemo(() => sumMeals(meals), [meals]);

  const { todayIndex, dates } = useMemo(() => {
    const now = new Date();
    const index = mondayFirstIndex(now);
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - index + i);
      return d.getDate();
    });
    return { todayIndex: index, dates: week };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <Bloom style={{ right: -90, top: -60 }} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: space.gutter,
          paddingBottom: 200,
          gap: space.sectionGap,
        }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text style={t.appName}>Naija Kcal</Text>
          <StreakPill days={profile.streak} />
        </View>

        <WeekStrip todayIndex={todayIndex} dates={dates} />

        <SummaryCard
          consumed={consumed}
          target={profile.dailyTarget}
          macroTargets={profile.macroTargets}
        />

        <View style={{ gap: space.rowGap }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <Text style={t.sectionTitle}>Today</Text>
            <Text style={[t.rowMeta, { fontSize: 11.5 }]}>
              {meals.length} {meals.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>

          {meals.length === 0 ? (
            // TODO(design): empty-today copy is not designed. Structure only.
            <Text style={t.body}>Nothing logged yet.</Text>
          ) : (
            meals.map((m) => <MealRow key={m.id} meal={m} />)
          )}
        </View>
      </ScrollView>

      <ScrollFade height={200} />

      <View
        style={{
          position: 'absolute',
          left: space.gutter,
          right: space.gutter,
          bottom: 100,
        }}
      >
        <LogInputBar
          onSubmitText={onSubmitText}
          onBarcode={() => router.push('/barcode')}
        />
      </View>

      <Toast message={toast?.message ?? null} onHide={hideToast} bottom={172} />
    </View>
  );
}
