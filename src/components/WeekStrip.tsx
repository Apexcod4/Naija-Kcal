import { Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import { fonts, type as t } from '../theme/typography';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Props = { todayIndex: number; dates: number[] };

export default function WeekStrip({ todayIndex, dates }: Props) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {DAYS.map((d, i) => {
        const today = i === todayIndex;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
            <Text style={[t.tabLabel, { fontSize: 11, color: today ? colors.bonnet : colors.muted }]}>
              {d}
            </Text>
            <Text
              maxFontSizeMultiplier={1.6}
              style={
                today
                  ? { fontFamily: fonts.display, fontSize: 13, color: colors.bonnet }
                  : { fontFamily: fonts.ui500, fontSize: 13, color: colors.cream }
              }
            >
              {dates[i]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
