import PressableScale from './PressableScale';
import { Text, View } from 'react-native';
import { MAX_UNITS, MIN_UNITS, STEP } from '../logic/portion';
import { colors, material } from '../theme/tokens';
import { type as t } from '../theme/typography';

const SIZE = 34;
/** 34 visual + 5 each side = a 44px target, without changing the visual size. */
const SLOP = { top: 5, bottom: 5, left: 5, right: 5 };

type Props = {
  value: number;
  /** Pre-formatted display string, e.g. "1½". */
  label: string;
  onStep: (delta: number) => void;
};

export default function Stepper({ value, label, onStep }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <PressableScale
        testID="stepper-minus"
        hitSlop={SLOP}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        onPress={() => onStep(-STEP)}
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: material.glass.backgroundColor,
          borderWidth: material.glass.borderWidth,
          borderColor: material.glass.borderColor,
        }}
      >
        <Text style={{ color: colors.cream, fontSize: 20, lineHeight: 22 }}>−</Text>
      </PressableScale>

      <Text
        accessibilityLiveRegion="polite"
        accessibilityValue={{ now: value, min: MIN_UNITS, max: MAX_UNITS, text: label }}
        maxFontSizeMultiplier={1.6}
        style={[t.metric, { fontSize: 19, minWidth: 56, textAlign: 'center' }]}
      >
        {label}
      </Text>

      <PressableScale
        testID="stepper-plus"
        hitSlop={SLOP}
        accessibilityRole="button"
        accessibilityLabel="Increase"
        onPress={() => onStep(STEP)}
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bonnetFill,
          borderWidth: 1,
          borderColor: colors.bonnetFillBorder,
        }}
      >
        <Text style={{ color: colors.bonnet, fontSize: 20, lineHeight: 22 }}>+</Text>
      </PressableScale>
    </View>
  );
}
