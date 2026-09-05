import { StyleProp, Text, TextStyle, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const CROSSFADE_MS = 150;

type Props = {
  value: number;
  suffix?: string;
  style?: StyleProp<TextStyle>;
  /** Reserved width, so a digit change never reflows the surrounding card. */
  minWidth?: number;
};

/**
 * Keying the text node on `value` is what drives the cross-fade: React
 * remounts it on each change and Reanimated animates the swap. The wrapper
 * holds a fixed footprint so nothing shifts underneath.
 */
export default function RollingNumber({ value, suffix, style, minWidth = 96 }: Props) {
  return (
    <View style={{ minWidth, flexDirection: 'row', alignItems: 'baseline' }}>
      <Animated.Text
        key={value}
        entering={FadeIn.duration(CROSSFADE_MS)}
        exiting={FadeOut.duration(CROSSFADE_MS)}
        maxFontSizeMultiplier={1.6}
        style={style}
      >
        {value}
      </Animated.Text>
      {suffix ? (
        <Text maxFontSizeMultiplier={1.6} style={style}>
          {suffix}
        </Text>
      ) : null}
    </View>
  );
}
