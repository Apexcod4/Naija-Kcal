import { Text, View } from 'react-native';
import { RING } from '../logic/rings';
import { colors, radii, space } from '../theme/tokens';
import { type as t } from '../theme/typography';
import { PortionTotals } from '../types';
import GlassCard from './GlassCard';
import ProgressRing from './ProgressRing';

type Props = {
  consumed: PortionTotals;
  target: number;
  macroTargets: { carbs: number; protein: number; fat: number };
};

const MACROS = [
  { key: 'carbs', label: 'Carbs', colour: colors.palm },
  { key: 'protein', label: 'Protein', colour: colors.ugu },
  { key: 'fat', label: 'Fat', colour: colors.sky },
] as const;

export default function SummaryCard({ consumed, target, macroTargets }: Props) {
  const left = Math.max(0, target - consumed.kcal);

  return (
    <GlassCard radius={radii.hero}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.cardPad }}>
        <ProgressRing
          {...RING.calories}
          diameter={118}
          value={consumed.kcal}
          target={target}
          colour={colors.bonnet}
        >
          <View
            accessibilityLabel={`${left} calories left of ${target}`}
            style={{ alignItems: 'center', justifyContent: 'center', minHeight: 44 }}
          >
            <Text maxFontSizeMultiplier={1.6} style={t.ringValue}>
              {left.toLocaleString()}
            </Text>
            <Text style={[t.rowMeta, { fontSize: 11 }]}>left</Text>
          </View>
        </ProgressRing>

        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
          {MACROS.map((m) => (
            <View key={m.key} style={{ alignItems: 'center' }}>
              <ProgressRing
                {...RING.macro}
                diameter={50}
                value={consumed[m.key]}
                target={macroTargets[m.key]}
                colour={m.colour}
              />
              <Text
                maxFontSizeMultiplier={1.6}
                style={[t.metric, { fontSize: 14, marginTop: 4 }]}
              >
                {consumed[m.key]}g
              </Text>
              <Text style={t.tabLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
}
