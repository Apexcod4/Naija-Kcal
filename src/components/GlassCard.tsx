import { BlurView } from 'expo-blur';
import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { material, radii } from '../theme/tokens';

type Props = {
  variant?: 'glass' | 'light' | 'heavy';
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

const VARIANTS = {
  glass: material.glass,
  light: material.glassLight,
  heavy: material.glassHeavy,
} as const;

/** The default surface on dark: blurred backdrop plus a hairline border. */
export default function GlassCard({
  variant = 'glass',
  radius = radii.card,
  style,
  children,
}: Props) {
  const m = VARIANTS[variant];

  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <BlurView intensity={m.blurIntensity} tint="dark">
        <View
          style={{
            backgroundColor: m.backgroundColor,
            borderColor: m.borderColor,
            borderWidth: m.borderWidth,
            borderRadius: radius,
          }}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
}
