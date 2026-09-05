import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FoodTile from '../../src/components/FoodTile';
import GlassCard from '../../src/components/GlassCard';
import PressableScale from '../../src/components/PressableScale';
import StatusCard from '../../src/components/StatusCard';
import { BackIcon } from '../../src/components/icons';
import { DISHES, dishById } from '../../src/data/dishes';
import { pairOptions, unitLadder } from '../../src/logic/dishes';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, material, radii, space, tint } from '../../src/theme/tokens';
import { fonts, type as t } from '../../src/theme/typography';

const PHOTO_H = 260;

export default function DishDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const buildLibraryPair = useAppStore((s) => s.buildLibraryPair);

  const dish = dishById(id);
  const [stepIndex, setStepIndex] = useState(0);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  if (!dish) {
    // TODO(design): dish-not-found copy is not designed. Structure only.
    return (
      <View style={{ flex: 1, backgroundColor: colors.pot, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={t.body}>That dish is not on this phone.</Text>
      </View>
    );
  }

  const ladder = unitLadder(dish);
  const partners = pairOptions(dish, DISHES);
  const partner = partnerId ? dishById(partnerId) : partners[0];
  const step = ladder[stepIndex];

  const macros = [
    { label: 'Carbs', grams: Math.round(dish.carbs * step.multiplier), colour: colors.palm, max: 90 },
    { label: 'Protein', grams: Math.round(dish.protein * step.multiplier), colour: colors.ugu, max: 60 },
    { label: 'Fat', grams: Math.round(dish.fat * step.multiplier), colour: colors.sky, max: 60 },
  ];

  const logAsPair = () => {
    if (!partner) return;
    // Soup and swallow keep their roles regardless of which one was opened.
    const soup = dish.category === 'soup' ? dish : partner;
    const swallow = dish.category === 'soup' ? partner : dish;
    buildLibraryPair(soup, swallow);
    router.push('/portion');
  };

  const chip = (label: string, accent: string) => (
    <View
      key={label}
      style={[
        { borderRadius: radii.chip, paddingVertical: 6, paddingHorizontal: 11 },
        tint(accent, 0.14, 0.34),
      ]}
    >
      <Text style={[t.chip, { color: accent }]}>{label}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: PHOTO_H,
          backgroundColor: dish.colour,
        }}
      />

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={3}
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: space.gutter,
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: material.glass.backgroundColor,
          borderWidth: material.glass.borderWidth,
          borderColor: material.glass.borderColor,
          zIndex: 2,
        }}
      >
        <BackIcon color={colors.cream} />
      </PressableScale>

      <ScrollView
        contentContainerStyle={{
          paddingTop: PHOTO_H - 40,
          paddingHorizontal: space.gutter,
          paddingBottom: insets.bottom + 110,
          gap: 18,
        }}
      >
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {chip('ON DEVICE', colors.uguText)}
            {chip(dish.category.toUpperCase(), colors.muted)}
          </View>
          <Text style={t.screenTitle}>{dish.name}</Text>
          {dish.ingredients ? <Text style={t.body}>{dish.ingredients}</Text> : null}
        </View>

        {!dish.verified ? (
          <StatusCard accent={colors.palm}>
            <Text style={[t.rowTitle, { lineHeight: 20 }]}>
              These figures are an estimate, not a measured value. Treat them as a guide until
              this dish is verified.
            </Text>
          </StatusCard>
        ) : null}

        {/* Per-unit truth: the whole point of this screen. */}
        <GlassCard radius={radii.hero}>
          <View style={{ padding: space.cardPad, gap: 14 }}>
            <Text style={t.eyebrow}>Per unit</Text>

            {ladder.map((s, i) => {
              const selected = i === stepIndex;
              return (
                <PressableScale
                  key={s.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${s.label}, ${s.kcal} kcal`}
                  onPress={() => setStepIndex(i)}
                  scaleTo={0.985}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    minHeight: 52,
                    borderRadius: radii.compact,
                    paddingHorizontal: 14,
                    backgroundColor: selected ? colors.bonnet : 'transparent',
                    borderWidth: selected ? 1 : material.glass.borderWidth,
                    borderColor: selected ? colors.bonnet : material.glass.borderColor,
                  }}
                >
                  <Text
                    style={[
                      t.rowTitle,
                      { flex: 1, color: selected ? colors.bonnetInk : colors.cream },
                    ]}
                  >
                    {s.label}
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.6}
                    style={[t.metric, { color: selected ? colors.bonnetInk : colors.cream }]}
                  >
                    {s.kcal}
                  </Text>
                </PressableScale>
              );
            })}

            <View style={{ height: 1, backgroundColor: colors.line }} />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {macros.map((m) => (
                <View key={m.label} style={{ flex: 1, gap: 5 }}>
                  <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.ringTrack }}>
                    <View
                      style={{
                        width: `${Math.min(100, (m.grams / m.max) * 100)}%`,
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
          </View>
        </GlassCard>

        {/* How a pair gets constructed by hand rather than by the camera. */}
        {partners.length > 0 ? (
          <View style={{ gap: 10 }}>
            <Text style={t.eyebrow}>Usually eaten with</Text>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              {partners.map((p) => {
                const selected = (partner?.id ?? '') === p.id;
                return (
                  <PressableScale
                    key={p.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={p.name}
                    onPress={() => setPartnerId(p.id)}
                    scaleTo={0.97}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      gap: 8,
                      paddingVertical: 14,
                      borderRadius: radii.card,
                      backgroundColor: selected
                        ? colors.bonnet
                        : material.glass.backgroundColor,
                      borderWidth: selected ? 1 : material.glass.borderWidth,
                      borderColor: selected ? colors.bonnet : material.glass.borderColor,
                    }}
                  >
                    <FoodTile colour={p.colour} size={38} plate={false} />
                    <Text
                      numberOfLines={1}
                      style={[
                        t.rowMeta,
                        { color: selected ? colors.bonnetInk : colors.cream },
                      ]}
                    >
                      {p.name}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        ) : null}

        <View>
          <Text style={t.eyebrow}>This pair</Text>
          <Text
            maxFontSizeMultiplier={1.5}
            style={{
              fontFamily: fonts.display,
              fontSize: 32,
              letterSpacing: -1,
              color: colors.bonnet,
              marginTop: 4,
            }}
          >
            {partner ? dish.kcal + partner.kcal : dish.kcal} kcal
          </Text>
          <Text style={[t.rowMeta, { marginTop: 2 }]}>
            One of each, before you set your portion.
          </Text>
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
          onPress={logAsPair}
          disabled={!partner}
          style={{
            height: 56,
            borderRadius: radii.cta,
            backgroundColor: colors.bonnet,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: partner ? 1 : 0.4,
          }}
        >
          <Text style={t.ctaLabel}>Log this as a pair</Text>
        </PressableScale>
      </View>
    </View>
  );
}
