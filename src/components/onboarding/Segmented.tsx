import { Text, View } from 'react-native';
import { colors, material, radii } from '../../theme/tokens';
import { type as t } from '../../theme/typography';
import PressableScale from '../PressableScale';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

export default function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 4,
        gap: 4,
        borderRadius: radii.compact,
        backgroundColor: material.glass.backgroundColor,
        borderWidth: material.glass.borderWidth,
        borderColor: material.glass.borderColor,
      }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <PressableScale
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            scaleTo={0.97}
            style={{
              flex: 1,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radii.tileSm + 2,
              backgroundColor: selected ? colors.bonnet : 'transparent',
            }}
          >
            <Text style={[t.rowTitle, { color: selected ? colors.bonnetInk : colors.cream }]}>
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
