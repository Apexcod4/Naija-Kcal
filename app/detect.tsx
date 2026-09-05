import PressableScale from '../src/components/PressableScale';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FoodTile from '../src/components/FoodTile';
import GlassCard from '../src/components/GlassCard';
import StatusCard from '../src/components/StatusCard';
import { BackIcon } from '../src/components/icons';
import { DETECTED_PAIR, LOW_CONFIDENCE_THRESHOLD } from '../src/data/detectedPair';
import { colors, food, material, radii, space } from '../src/theme/tokens';
import { type as t } from '../src/theme/typography';

const PHOTO_H = 326;
/** The stagger that sells "it found two things". */
const ROW_STAGGER_MS = 70;

export default function Detect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const lowConfidence = DETECTED_PAIR.some((d) => d.confidence < LOW_CONFIDENCE_THRESHOLD);

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      {/* Captured frame placeholder — replaced by the user's own capture. */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: PHOTO_H,
          backgroundColor: food.egusi,
        }}
      />
      <LinearGradient
        colors={['transparent', colors.pot]}
        locations={[0.54, 0.96]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: PHOTO_H }}
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
          paddingTop: PHOTO_H - 60,
          paddingHorizontal: space.gutter,
          paddingBottom: insets.bottom + 110,
          gap: 16,
        }}
      >
        <View>
          <Text style={[t.eyebrow, { color: colors.bonnet }]}>Recognised as a pair</Text>
          <Text style={[t.detectTitle, { marginTop: 8 }]}>Egusi soup{'\n'}and pounded yam</Text>
        </View>

        <GlassCard radius={radii.card}>
          <View style={{ paddingHorizontal: 16 }}>
            {DETECTED_PAIR.map((item, i) => (
              <Animated.View
                key={item.name}
                entering={FadeInUp.delay(i * ROW_STAGGER_MS).duration(280)}
              >
                {i > 0 ? <View style={{ height: 1, backgroundColor: colors.line }} /> : null}
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}
                >
                  <FoodTile colour={item.colour} size={34} plate={false} />
                  <View style={{ flex: 1 }}>
                    <Text style={t.rowTitle}>{item.name}</Text>
                    <Text style={[t.rowMeta, { marginTop: 2 }]}>{item.ingredients}</Text>
                  </View>
                  <Text style={[t.rowMeta, { color: colors.uguText }]}>{item.confidence}%</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </GlassCard>

        {lowConfidence ? (
          // TODO(design): low-confidence (<70%) copy is not designed. Structure only.
          <StatusCard accent={colors.palm}>
            <Text style={t.rowTitle}>We are not sure about this one.</Text>
          </StatusCard>
        ) : null}

        {/* This card teaches the whole product model. The handoff says keep it. */}
        <StatusCard accent={colors.palm}>
          <Text style={[t.body, { color: colors.cream }]}>
            Soup from a shared bowl. Next step asks how much of it was yours — not how many
            &quot;servings&quot;.
          </Text>
        </StatusCard>

        <Text style={t.body}>
          Not right?{' '}
          <Text style={{ color: colors.bonnet }}>Search the library</Text>
        </Text>
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
          onPress={() => router.push('/portion')}
          style={{
            height: 56,
            borderRadius: radii.cta,
            backgroundColor: colors.bonnet,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={t.ctaLabel}>Set your portion</Text>
        </PressableScale>
      </View>
    </View>
  );
}
