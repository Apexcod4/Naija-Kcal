import PressableScale from './PressableScale';
import { Text } from 'react-native';
import { colors, material } from '../theme/tokens';
import { type as t } from '../theme/typography';

type Props = {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
};

export default function Chip({ label, sublabel, selected, onPress }: Props) {
  const ink = selected ? colors.bonnetInk : colors.cream;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={sublabel ? `${sublabel}` : label}
      style={{
        flex: 1,
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 4,
        alignItems: 'center',
        backgroundColor: selected ? colors.bonnet : material.glass.backgroundColor,
        borderWidth: selected ? 1 : material.glass.borderWidth,
        borderColor: selected ? colors.bonnet : material.glass.borderColor,
      }}
    >
      <Text style={[t.metric, { color: ink }]}>{label}</Text>
      {sublabel ? (
        <Text style={[t.rowMeta, { color: selected ? colors.bonnetInk : colors.muted, marginTop: 2 }]}>
          {sublabel}
        </Text>
      ) : null}
    </PressableScale>
  );
}
