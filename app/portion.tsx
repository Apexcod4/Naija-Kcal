import PressableScale from '../src/components/PressableScale';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Chip from '../src/components/Chip';
import FoodTile from '../src/components/FoodTile';
import GlassCard from '../src/components/GlassCard';
import RollingNumber from '../src/components/RollingNumber';
import Stepper from '../src/components/Stepper';
import { DETECTED_PAIR } from '../src/data/detectedPair';
import { barWidths, computePair, formatUnit, shareNote } from '../src/logic/portion';
import { useAppStore } from '../src/state/useAppStore';
import { colors, radii, space, tint } from '../src/theme/tokens';
import { type as t } from '../src/theme/typography';
import { Share } from '../src/types';

const SHARES: { value: Share; label: string; sub: string }[] = [
  { value: 33, label: '⅓', sub: 'A third' },
  { value: 50, label: '½', sub: 'Half' },
  { value: 100, label: '1', sub: 'All of it' },
];

export default function Portion() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const draft = useAppStore((s) => s.draft);
  const profile = useAppStore((s) => s.profile);
  const stepWraps = useAppStore((s) => s.stepWraps);
  const stepLadles = useAppStore((s) => s.stepLadles);
  const setShare = useAppStore((s) => s.setShare);
  const logPair = useAppStore((s) => s.logPair);

  // Splitting a bowl is meaningless when nobody shares it.
  const shareVisible = profile.householdSize > 1;

  // Recomputed on every render — the number moving in response to the tap is
  // the interaction, so this is deliberately not debounced or memoised.
  const totals = computePair(draft.wraps, draft.ladles, draft.share);
  const bars = barWidths(totals);

  const [soup, swallow] = DETECTED_PAIR;

  const onLog = () => {
    logPair();
    router.dismissAll();
  };

  const macroBars = [
    { label: 'Carbs', grams: totals.carbs, w: bars.carbW, colour: colors.palm },
    { label: 'Protein', grams: totals.protein, w: bars.protW, colour: colors.ugu },
    { label: 'Fat', grams: totals.fat, w: bars.fatW, colour: colors.sky },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingHorizontal: space.gutter,
          paddingBottom: insets.bottom + 110,
          gap: 20,
        }}
      >
        <Text style={[t.screenTitle, { fontSize: 28 }]}>
          How much did{'\n'}you actually eat?
        </Text>

        <GlassCard radius={radii.card}>
          <View style={{ paddingHorizontal: space.cardPad }}>
            <View
              testID="ladles-stepper"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 }}
            >
              <FoodTile colour={soup.colour} size={38} plate={false} />
              <View style={{ flex: 1 }}>
                <Text style={[t.rowTitle, { fontSize: 15 }]}>{soup.name}</Text>
                <Text style={[t.rowMeta, { marginTop: 2 }]}>Your ladle = {profile.ladleMl} ml</Text>
              </View>
              <Stepper value={draft.ladles} label={formatUnit(draft.ladles)} onStep={stepLadles} />
            </View>

            <View style={{ height: 1, backgroundColor: colors.line }} />

            <View
              testID="wraps-stepper"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 }}
            >
              <FoodTile colour={swallow.colour} size={38} plate={false} />
              <View style={{ flex: 1 }}>
                <Text style={[t.rowTitle, { fontSize: 15 }]}>{swallow.name}</Text>
                <Text style={[t.rowMeta, { marginTop: 2 }]}>Your wrap = {profile.wrapGrams} g</Text>
              </View>
              <Stepper value={draft.wraps} label={formatUnit(draft.wraps)} onStep={stepWraps} />
            </View>
          </View>
        </GlassCard>

        {shareVisible ? (
          <View style={{ gap: 10 }}>
            <Text style={t.eyebrow}>Shared bowl — your share</Text>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              {SHARES.map((s) => (
                <Chip
                  key={s.value}
                  label={s.label}
                  sublabel={s.sub}
                  selected={draft.share === s.value}
                  onPress={() => setShare(s.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={[{ borderRadius: radii.card, padding: space.cardPad, gap: 14 }, tint(colors.bonnet)]}>
          <View>
            <Text style={t.eyebrow}>This meal</Text>
            <RollingNumber
              value={totals.kcal}
              suffix=" kcal"
              style={{
                fontFamily: t.hero.fontFamily,
                fontSize: 32,
                letterSpacing: -1,
                color: colors.bonnet,
                marginTop: 4,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {macroBars.map((m) => (
              <View key={m.label} style={{ flex: 1, gap: 5 }}>
                <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.ringTrack }}>
                  <View
                    style={{
                      width: `${m.w}%`,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: m.colour,
                    }}
                  />
                </View>
                <Text maxFontSizeMultiplier={1.6} style={[t.metric, { fontSize: 14 }]}>
                  {m.grams}g
                </Text>
                <Text style={t.tabLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          <Text style={t.body}>{shareNote(draft.share)}</Text>
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: space.gutter,
          right: space.gutter,
          bottom: insets.bottom + 20,
        }}
      >
        <PressableScale
          accessibilityRole="button"
          onPress={onLog}
          haptic="success"
          style={{
            height: 56,
            borderRadius: radii.cta,
            backgroundColor: colors.bonnet,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={t.ctaLabel}>Log {totals.kcal} kcal</Text>
        </PressableScale>
      </View>
    </View>
  );
}
