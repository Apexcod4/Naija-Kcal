import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { colors, radii, space } from '../theme/tokens';
import { type as t } from '../theme/typography';

const DURATION_MS = 3600;

type Props = {
  message: string | null;
  onHide: () => void;
  /** Distance from the bottom edge. Raised on screens with an input bar. */
  bottom?: number;
};

/**
 * The timer lives here rather than in the store: only the component knows
 * when it unmounts, and a second log must cancel and restart the countdown
 * rather than dismissing early.
 */
export default function Toast({ message, onHide, bottom = 108 }: Props) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onHide, DURATION_MS);
    return () => clearTimeout(id);
  }, [message, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOut.duration(220)}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={{ position: 'absolute', left: space.gutter, right: space.gutter, bottom }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.ugu,
          opacity: 0.9,
          borderRadius: radii.compact,
          paddingVertical: 14,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ color: colors.bonnetInk, fontSize: 15 }}>✓</Text>
        <Text style={[t.rowTitle, { color: colors.bonnetInk, flex: 1 }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}
