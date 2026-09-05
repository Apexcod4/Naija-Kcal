import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../src/components/Bloom';
import FoodTile from '../src/components/FoodTile';
import GlassCard from '../src/components/GlassCard';
import PressableScale from '../src/components/PressableScale';
import ScrollFade from '../src/components/ScrollFade';
import { BackIcon, SearchIcon } from '../src/components/icons';
import { DISHES, dishById } from '../src/data/dishes';
import { CategoryFilter, dishCount, searchDishes } from '../src/logic/dishes';
import { colors, material, radii, space } from '../src/theme/tokens';
import { type as t } from '../src/theme/typography';

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'soup', label: 'Soups' },
  { value: 'swallow', label: 'Swallow' },
  { value: 'rice', label: 'Rice' },
  { value: 'street', label: 'Street' },
  { value: 'caribbean', label: 'Caribbean' },
];

/** Pairs are first-class objects here, not two dishes shown side by side. */
const COMMON_PAIRS = [
  { soupId: 'egusi', swallowId: 'pounded-yam' },
  { soupId: 'ewedu-gbegiri', swallowId: 'amala' },
];

export default function Library() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const results = useMemo(() => searchDishes(DISHES, query, category), [query, category]);
  const searching = query.trim().length > 0 || category !== 'all';

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <Bloom style={{ right: -100, top: -70 }} opacity={0.24} />

      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: space.gutter,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={3}
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: material.glass.backgroundColor,
            borderWidth: material.glass.borderWidth,
            borderColor: material.glass.borderColor,
          }}
        >
          <BackIcon color={colors.cream} />
        </PressableScale>
        <Text style={t.appName}>Dish library</Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 18,
          paddingHorizontal: space.gutter,
          paddingBottom: 120,
          gap: space.sectionGap,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            minHeight: 52,
            borderRadius: radii.compact,
            paddingHorizontal: 14,
            backgroundColor: material.glass.backgroundColor,
            borderWidth: material.glass.borderWidth,
            borderColor: material.glass.borderColor,
          }}
        >
          <SearchIcon color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            /* Count comes from the table, so the app never claims a catalogue
               it does not ship. */
            placeholder={`Search ${dishCount(DISHES)} dishes — works offline`}
            placeholderTextColor={colors.muted}
            style={[t.rowTitle, { flex: 1, paddingVertical: 14 }]}
            accessibilityLabel="Search dishes"
            autoCorrect={false}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((c) => {
            const selected = category === c.value;
            return (
              <PressableScale
                key={c.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setCategory(c.value)}
                scaleTo={0.95}
                style={{
                  minHeight: 44,
                  justifyContent: 'center',
                  borderRadius: radii.chip,
                  paddingHorizontal: 16,
                  backgroundColor: selected ? colors.bonnet : material.glass.backgroundColor,
                  borderWidth: selected ? 1 : material.glass.borderWidth,
                  borderColor: selected ? colors.bonnet : material.glass.borderColor,
                }}
              >
                <Text style={[t.chip, { color: selected ? colors.bonnetInk : colors.cream }]}>
                  {c.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {!searching ? (
          <View style={{ gap: 12 }}>
            <Text style={t.eyebrow}>Pairs you eat often</Text>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              {COMMON_PAIRS.map(({ soupId, swallowId }) => {
                const soup = dishById(soupId);
                const swallow = dishById(swallowId);
                if (!soup || !swallow) return null;
                return (
                  <PressableScale
                    key={`${soupId}-${swallowId}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${soup.name} and ${swallow.name}`}
                    onPress={() => router.push({ pathname: '/dish/[id]', params: { id: soup.id } })}
                    scaleTo={0.97}
                    style={{ flex: 1 }}
                  >
                    <GlassCard radius={radii.hero}>
                      <View style={{ padding: 14, gap: 10 }}>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <FoodTile colour={soup.colour} size={44} plate={false} />
                          <FoodTile colour={swallow.colour} size={44} plate={false} />
                        </View>
                        <Text style={t.rowTitle} numberOfLines={2}>
                          {soup.name} & {swallow.name.toLowerCase()}
                        </Text>
                        <Text style={t.rowMeta}>
                          {soup.kcal + swallow.kcal} kcal · 1 + 1
                        </Text>
                      </View>
                    </GlassCard>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={{ gap: space.rowGap }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={t.eyebrow}>
              {category === 'all' ? 'All dishes' : CATEGORIES.find((c) => c.value === category)?.label}
            </Text>
            <Text style={[t.rowMeta, { fontSize: 11.5 }]}>{results.length} shown</Text>
          </View>

          {results.length === 0 ? (
            // TODO(design): dish-not-found copy is not designed. Structure only.
            <Text style={t.body}>Nothing matches “{query.trim()}”.</Text>
          ) : (
            results.map((d) => (
              <PressableScale
                key={d.id}
                accessibilityRole="button"
                accessibilityLabel={`${d.name}, ${d.kcal} kcal ${d.unitLabel}`}
                onPress={() => router.push({ pathname: '/dish/[id]', params: { id: d.id } })}
                scaleTo={0.985}
              >
                <GlassCard variant="light" radius={radii.compact}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      minHeight: 70,
                    }}
                  >
                    <FoodTile colour={d.colour} photoUri={d.photoUri} size={46} />
                    <View style={{ flex: 1 }}>
                      <Text style={t.rowTitle}>{d.name}</Text>
                      <Text style={[t.rowMeta, { marginTop: 2 }]}>{d.unitLabel}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text maxFontSizeMultiplier={1.6} style={t.metric}>
                        {d.kcal}
                      </Text>
                      {/* An estimate must never read as a sourced figure. */}
                      {!d.verified ? (
                        <Text style={[t.rowMeta, { fontSize: 10, color: colors.palm }]}>
                          estimate
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </GlassCard>
              </PressableScale>
            ))
          )}
        </View>
      </ScrollView>

      <ScrollFade />
    </View>
  );
}
