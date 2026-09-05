import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { colors, material, radii, space } from '../../theme/tokens';
import { type as t } from '../../theme/typography';
import PressableScale from '../PressableScale';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  selected: boolean;
  onPress: () => void;
};

export default function OptionRow({ title, subtitle, icon, selected, onPress }: Props) {
  const ink = selected ? colors.bonnetInk : colors.cream;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      onPress={onPress}
      scaleTo={0.985}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 64,
        borderRadius: radii.card,
        paddingHorizontal: space.cardPad,
        paddingVertical: 14,
        backgroundColor: selected ? colors.bonnet : material.glass.backgroundColor,
        borderWidth: selected ? 1 : material.glass.borderWidth,
        borderColor: selected ? colors.bonnet : material.glass.borderColor,
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={[t.rowTitle, { fontSize: 16, color: ink }]}>{title}</Text>
        {subtitle ? (
          <Text
            style={[
              t.rowMeta,
              { color: selected ? colors.bonnetInk : colors.muted, marginTop: 2 },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}
