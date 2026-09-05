import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';

/** The gradient content scrolls under, behind the floating nav. */
export default function ScrollFade({ height = 124 }: { height?: number }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[`${colors.pot}00`, colors.pot]}
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height }}
    />
  );
}
