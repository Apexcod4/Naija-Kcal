import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../../src/components/Bloom';
import LogInputBar from '../../src/components/LogInputBar';
import MealRow from '../../src/components/MealRow';
import PressableScale from '../../src/components/PressableScale';
import ScrollFade from '../../src/components/ScrollFade';
import StreakPill from '../../src/components/StreakPill';
import SummaryCard from '../../src/components/SummaryCard';
import Toast from '../../src/components/Toast';
import WeekStrip from '../../src/components/WeekStrip';
import { DISHES } from '../../src/data/dishes';
import { currentStreak, dayLabel, mealsForDate, todayISO, weekOf } from '../../src/logic/days';
import { routeForMatch } from '../../src/logic/logRoute';
import { matchPair } from '../../src/logic/matchPair';
import { sumMeals } from '../../src/logic/totals';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, space } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const allMeals = useAppStore((s) => s.meals);
  const profile = useAppStore((s) => s.profile);
  const toast = useAppStore((s) => s.toast);
  const hideToast = useAppStore((s) => s.hideToast);
  const buildLibraryPair = useAppStore((s) => s.buildLibraryPair);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const deleteMeal = useAppStore((s) => s.deleteMeal);

  const today = todayISO();

  const meals = useMemo(() => mealsForDate(allMeals, selectedDate), [allMeals, selectedDate]);
  const consumed = useMemo(() => sumMeals(meals), [meals]);
  const week = useMemo(() => weekOf(selectedDate), [selectedDate]);
  const streak = useMemo(() => currentStreak(allMeals, today), [allMeals, today]);

  const label = dayLabel(selectedDate, today);

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

  const confirmDelete = (id: string, name: string) =>
    Alert.alert('Remove this meal?', `${name} will be taken off ${label.toLowerCase()}.`, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteMeal(id) },
    ]);

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
          <StreakPill days={streak} />
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Text style={t.sectionTitle}>{label}</Text>
            {selectedDate !== today ? (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Back to today"
                onPress={() => setSelectedDate(today)}
                hitSlop={8}
              >
                <Text style={[t.rowMeta, { color: colors.bonnet }]}>Back to today</Text>
              </PressableScale>
            ) : null}
          </View>

          <WeekStrip
            dates={week}
            selected={selectedDate}
            today={today}
            onSelect={setSelectedDate}
          />
        </View>

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
            <Text style={t.sectionTitle}>Eaten</Text>
            <Text style={[t.rowMeta, { fontSize: 11.5 }]}>
              {meals.length} {meals.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>

          {meals.length === 0 ? (
            // TODO(design): empty-day copy is not designed. Structure only.
            <Text style={t.body}>
              {selectedDate === today
                ? 'Nothing logged yet.'
                : `Nothing was logged on ${label.toLowerCase()}.`}
            </Text>
          ) : (
            meals.map((m) => (
              <PressableScale
                key={m.id}
                accessibilityRole="button"
                accessibilityLabel={`${m.name}, ${m.kcal} kcal. Double tap and hold to remove.`}
                onLongPress={() => confirmDelete(m.id, m.name)}
                scaleTo={0.99}
                haptic="none"
              >
                <MealRow meal={m} />
              </PressableScale>
            ))
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
        <LogInputBar onSubmitText={onSubmitText} onBarcode={() => router.push('/barcode')} />
      </View>

      <Toast message={toast?.message ?? null} onHide={hideToast} bottom={172} />
    </View>
  );
}
