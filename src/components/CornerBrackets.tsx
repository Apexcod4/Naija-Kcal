import { View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

const S = 34;
const W = 3;
const R = 12;

type Props = { height?: number; inset?: number };

/** Four L-shaped brackets marking the recognition region. */
export default function CornerBrackets({ height = 236, inset = 52 }: Props) {
  const corner = (edges: ViewStyle, radius: ViewStyle) => (
    <View
      style={[
        { position: 'absolute', width: S, height: S, borderColor: colors.bonnet },
        edges,
        radius,
      ]}
    />
  );

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: inset, right: inset, height, top: '30%' }}
    >
      {corner({ top: 0, left: 0, borderTopWidth: W, borderLeftWidth: W }, { borderTopLeftRadius: R })}
      {corner({ top: 0, right: 0, borderTopWidth: W, borderRightWidth: W }, { borderTopRightRadius: R })}
      {corner({ bottom: 0, left: 0, borderBottomWidth: W, borderLeftWidth: W }, { borderBottomLeftRadius: R })}
      {corner({ bottom: 0, right: 0, borderBottomWidth: W, borderRightWidth: W }, { borderBottomRightRadius: R })}
    </View>
  );
}
