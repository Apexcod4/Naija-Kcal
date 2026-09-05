import { Text } from 'react-native';
import { colors, radii } from '../../theme/tokens';
import { type as t } from '../../theme/typography';
import PressableScale, { HapticKind } from '../PressableScale';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Solid cream instead of bonnet — used for Apple sign-in on screen 08. */
  variant?: 'accent' | 'cream';
  haptic?: HapticKind;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'accent',
  haptic = 'light',
}: Props) {
  const bg = variant === 'accent' ? colors.bonnet : colors.cream;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      haptic={haptic}
      scaleTo={0.98}
      style={{
        height: 56,
        borderRadius: radii.cta,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={t.ctaLabel}>{label}</Text>
    </PressableScale>
  );
}
