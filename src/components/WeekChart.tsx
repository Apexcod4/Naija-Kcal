import { Text, View } from 'react-native';
import { barHeightPct } from '../logic/rings';
import { colors } from '../theme/tokens';
import { type as t } from '../theme/typography';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BOX = 132;

type Props = { values: number[]; target: number; todayIndex: number };

/**
 * Unlike the rings, this chart does not clamp at the target — an over-target
 * day is meaningful here, so it caps at full height and recolours instead.
 */
export default function WeekChart({ values, target, todayIndex }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
      {values.map((v, i) => {
        const pct = barHeightPct(v, target);
        const inProgress = i === todayIndex;
        const colour = inProgress
          ? colors.barInProgress
          : v > target
            ? colors.bonnet
            : colors.ugu;

        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={{ height: BOX, width: '100%', justifyContent: 'flex-end' }}>
              <View
                accessibilityLabel={`${DAYS[i]}: ${v} kcal of ${target}`}
                style={{ height: `${pct}%`, borderRadius: 6, backgroundColor: colour }}
              />
            </View>
            <Text style={t.tabLabel}>{DAYS[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}
