import { ReactNode } from 'react';
import { View } from 'react-native';
import { radii, space, tint } from '../theme/tokens';

type Props = { accent: string; children: ReactNode };

/** Tinted semantic card: ugu reassures, palm explains, bonnet is the result. */
export default function StatusCard({ accent, children }: Props) {
  return (
    <View style={[{ borderRadius: radii.card, padding: space.cardPad }, tint(accent)]}>
      {children}
    </View>
  );
}
