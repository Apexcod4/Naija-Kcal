import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 15, stiffness: 400, mass: 0.5 };

export type HapticKind = 'light' | 'medium' | 'success' | 'none';

type Props = Omit<PressableProps, 'style'> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far to compress on press. Larger controls need less. */
  scaleTo?: number;
  haptic?: HapticKind;
};

function fireHaptic(kind: HapticKind) {
  // Haptics are a nicety, never a dependency — a device without a Taptic
  // Engine (or a simulator) must not break the press.
  try {
    if (kind === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (kind === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // ignored
  }
}

/**
 * A Pressable that compresses slightly under the finger. Every interactive
 * surface in the app uses this so press feedback is one consistent gesture
 * rather than per-screen guesswork.
 */
export default function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  haptic = 'light',
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) {
          scale.value = withSpring(scaleTo, SPRING);
          if (haptic !== 'none') fireHaptic(haptic);
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, SPRING);
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
