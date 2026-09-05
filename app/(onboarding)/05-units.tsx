import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import GlassCard from '../../src/components/GlassCard';
import OnboardingScreen from '../../src/components/onboarding/OnboardingScreen';
import PrimaryButton from '../../src/components/onboarding/PrimaryButton';
import PressableScale from '../../src/components/PressableScale';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, food, material, radii, space } from '../../src/theme/tokens';
import { fonts, type as t } from '../../src/theme/typography';

/**
 * Screen 05 — calibrate your units. The product's differentiator, made
 * explicit. Everything logged afterwards is measured against these numbers.
 *
 * The wrap swatches are sized to the portions they represent (38/54/66px):
 * the handoff is explicit that you size the swatch rather than only printing
 * the grams, because a physical quantity is easier to recognise than a number.
 */
const WRAPS = [
  { grams: 140, diameter: 38 },
  { grams: 210, diameter: 54 },
  { grams: 300, diameter: 66 },
];

const AVERAGE_WRAP = 210;
const AVERAGE_DERICAS = 1.5;

export default function UnitsScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);

  const [wrapGrams, setWrapGrams] = useState(profile.wrapGrams);
  const [dericas, setDericas] = useState(profile.dericasPerPlate);

  const save = (g: number, d: number) => {
    setProfile({ wrapGrams: g, dericasPerPlate: d });
    router.push('/(onboarding)/06-household');
  };

  return (
    <OnboardingScreen
      progress={42}
      title="Calibrate your units"
      subtitle="Do this once. Every meal you log afterwards is measured against it."
      footer={
        <>
          <PrimaryButton label="Save my units" onPress={() => save(wrapGrams, dericas)} />
          <PressableScale
            accessibilityRole="button"
            onPress={() => save(AVERAGE_WRAP, AVERAGE_DERICAS)}
            hitSlop={10}
            style={{ alignItems: 'center', paddingVertical: 6 }}
          >
            <Text style={[t.body, { color: colors.muted }]}>Not sure? Use the average</Text>
          </PressableScale>
        </>
      }
    >
      <View
        style={{
          alignSelf: 'flex-start',
          borderRadius: radii.chip,
          paddingVertical: 6,
          paddingHorizontal: 12,
          backgroundColor: colors.bonnet,
        }}
      >
        <Text style={[t.chip, { color: colors.bonnetInk }]}>ONLY IN NAIJA KCAL</Text>
      </View>

      <GlassCard radius={radii.hero}>
        <View style={{ padding: space.cardPad, gap: 16 }}>
          <Text style={t.eyebrow}>How big is one wrap of swallow?</Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              minHeight: 92,
            }}
          >
            {WRAPS.map((w) => {
              const selected = wrapGrams === w.grams;
              return (
                <PressableScale
                  key={w.grams}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${w.grams} gram wrap`}
                  onPress={() => setWrapGrams(w.grams)}
                  hitSlop={12}
                  style={{ alignItems: 'center', gap: 10 }}
                >
                  <View
                    style={{
                      width: w.diameter,
                      height: w.diameter,
                      borderRadius: w.diameter / 2,
                      backgroundColor: food.poundedYam,
                      borderWidth: selected ? 3 : 0,
                      borderColor: colors.bonnet,
                    }}
                  />
                  <Text
                    style={[
                      t.rowMeta,
                      { color: selected ? colors.bonnet : colors.muted },
                    ]}
                  >
                    {w.grams} g
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>
      </GlassCard>

      <GlassCard radius={radii.hero}>
        <View style={{ padding: space.cardPad, gap: 12 }}>
          <Text style={t.eyebrow}>How much rice fills your plate?</Text>

          <Text
            maxFontSizeMultiplier={1.5}
            style={{
              fontFamily: fonts.display,
              fontSize: 40,
              letterSpacing: -1.4,
              color: colors.bonnet,
            }}
          >
            {dericas} derica
          </Text>

          <Slider
            minimumValue={0.5}
            maximumValue={3}
            step={0.5}
            value={dericas}
            onValueChange={setDericas}
            minimumTrackTintColor={colors.bonnet}
            maximumTrackTintColor={material.glass.borderColor}
            thumbTintColor={colors.bonnet}
            accessibilityLabel="Dericas per plate"
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={t.rowMeta}>0.5</Text>
            <Text style={t.rowMeta}>3</Text>
          </View>
        </View>
      </GlassCard>
    </OnboardingScreen>
  );
}
