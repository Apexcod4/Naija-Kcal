import { Text, View } from 'react-native';
import { colors, material, radii } from '../../theme/tokens';
import { type as t } from '../../theme/typography';
import PressableScale from '../PressableScale';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  /** How the value and its neighbours are rendered, e.g. "180 cm". */
  format: (n: number) => string;
};

/**
 * A value card showing the neighbouring options above and below at 40%
 * opacity, per the handoff. Stepping is by button rather than a scroll wheel
 * so the hit targets stay at 44px and the value is announced properly.
 */
export default function ValuePicker({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: Props) {
  const prev = value - step;
  const next = value + step;

  const ghost = (n: number) =>
    n < min || n > max ? null : (
      <Text style={[t.rowMeta, { opacity: 0.4 }]}>{format(n)}</Text>
    );

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 6,
        paddingVertical: 14,
        borderRadius: radii.card,
        backgroundColor: material.glass.backgroundColor,
        borderWidth: material.glass.borderWidth,
        borderColor: material.glass.borderColor,
      }}
    >
      <Text style={t.eyebrow}>{label}</Text>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        onPress={() => onChange(Math.min(max, next))}
        hitSlop={10}
        scaleTo={0.94}
      >
        {ghost(next) ?? <Text style={[t.rowMeta, { opacity: 0 }]}>—</Text>}
      </PressableScale>

      <Text
        accessible
        accessibilityLabel={`${label}: ${format(value)}`}
        maxFontSizeMultiplier={1.5}
        style={[t.ringValue, { color: colors.bonnet }]}
      >
        {format(value)}
      </Text>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        onPress={() => onChange(Math.max(min, prev))}
        hitSlop={10}
        scaleTo={0.94}
      >
        {ghost(prev) ?? <Text style={[t.rowMeta, { opacity: 0 }]}>—</Text>}
      </PressableScale>
    </View>
  );
}
