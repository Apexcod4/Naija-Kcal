import { Text, View } from 'react-native';
import { colors, material, radii } from '../theme/tokens';
import { type as t } from '../theme/typography';
import { FlameIcon } from './icons';

export default function StreakPill({ days }: { days: number }) {
  return (
    <View
      accessibilityLabel={`${days} day streak`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: radii.chip,
        paddingVertical: 7,
        paddingHorizontal: 12,
        backgroundColor: material.glass.backgroundColor,
        borderWidth: material.glass.borderWidth,
        borderColor: material.glass.borderColor,
      }}
    >
      <FlameIcon color={colors.bonnet} />
      <Text maxFontSizeMultiplier={1.6} style={[t.metric, { fontSize: 14, color: colors.bonnet }]}>
        {days}
      </Text>
    </View>
  );
}
