import { StyleProp, View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { size?: number; opacity?: number; style?: StyleProp<ViewStyle> };

const RINGS = [1, 0.78, 0.56, 0.34];

/**
 * Static ambient brand bloom — a signature of the identity, not decoration.
 *
 * Deliberately built from stacked translucent circles rather than a runtime
 * blur: the handoff requires this to be a static layer, because blurring live
 * scrolling content underneath is expensive on device.
 */
export default function Bloom({ size = 400, opacity = 0.32, style }: Props) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {RINGS.map((scale, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: size * scale,
            height: size * scale,
            borderRadius: (size * scale) / 2,
            backgroundColor: colors.bonnet,
            opacity: opacity / RINGS.length,
          }}
        />
      ))}
    </View>
  );
}
