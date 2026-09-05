import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../../src/components/Bloom';
import GlassCard from '../../src/components/GlassCard';
import ScrollFade from '../../src/components/ScrollFade';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, radii, space, tint } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

function UnitRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
      }}
    >
      <Text style={t.rowTitle}>{label}</Text>
      <Text maxFontSizeMultiplier={1.6} style={t.metric}>
        {value}
      </Text>
    </View>
  );
}

export default function You() {
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);

  const members = ['A', 'B', 'C', 'D'].slice(0, profile.householdSize);

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <Bloom style={{ right: -100, top: -40 }} opacity={0.24} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: space.gutter,
          paddingBottom: 140,
          gap: space.sectionGap,
        }}
      >
        <Text style={t.screenTitle}>You</Text>

        <GlassCard radius={radii.hero}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: space.cardPad }}
          >
            <View
              style={[
                {
                  width: 56,
                  height: 56,
                  borderRadius: radii.tileMd,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                tint(colors.bonnet, 0.16, 0.32),
              ]}
            >
              <Text style={[t.metric, { fontSize: 20, color: colors.bonnet }]}>AF</Text>
            </View>
            <View>
              <Text style={t.rowTitle}>Your profile</Text>
              <Text style={[t.rowMeta, { marginTop: 2 }]}>
                {profile.dailyTarget.toLocaleString()} kcal daily target
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Calibration is revisited here — these are the numbers the portion
            maths multiplies by. */}
        <GlassCard radius={radii.hero}>
          <View style={{ padding: space.cardPad }}>
            <Text style={[t.eyebrow, { marginBottom: 4 }]}>My units</Text>
            <UnitRow label="One wrap of swallow" value={`${profile.wrapGrams} g`} />
            <View style={{ height: 1, backgroundColor: colors.line }} />
            <UnitRow label="One ladle of soup" value={`${profile.ladleMl} ml`} />
            <View style={{ height: 1, backgroundColor: colors.line }} />
            <UnitRow label="Rice plate" value={`${profile.dericasPerPlate} derica`} />
          </View>
        </GlassCard>

        <GlassCard radius={radii.hero}>
          <View style={{ padding: space.cardPad, gap: 10 }}>
            <Text style={t.eyebrow}>Household</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {members.map((initial) => (
                <View
                  key={initial}
                  style={[
                    {
                      width: 38,
                      height: 38,
                      borderRadius: radii.tileSm,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    tint(colors.cream, 0.08, 0.16),
                  ]}
                >
                  <Text style={[t.rowTitle, { fontSize: 13 }]}>{initial}</Text>
                </View>
              ))}
            </View>
            <Text style={t.body}>
              When you log from a shared bowl, only your share counts against your target. The rest
              goes to the household.
            </Text>
          </View>
        </GlassCard>

        <View
          style={[
            {
              borderRadius: radii.hero,
              padding: space.cardPad,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            },
            tint(colors.ugu),
          ]}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.tileSm,
              backgroundColor: colors.ugu,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.bonnetInk, fontSize: 18 }}>✓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={t.rowTitle}>340 dishes on this phone</Text>
            <Text style={[t.rowMeta, { marginTop: 2 }]}>Scanning uses no data.</Text>
          </View>
        </View>
      </ScrollView>

      <ScrollFade />
    </View>
  );
}
