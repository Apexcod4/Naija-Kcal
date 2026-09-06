import { Text, View } from 'react-native';
import { ISODate } from '../logic/days';
import { colors, radii } from '../theme/tokens';
import { fonts, type as t } from '../theme/typography';
import PressableScale from './PressableScale';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Props = {
  /** Seven ISO dates, Monday first. */
  dates: ISODate[];
  selected: ISODate;
  today: ISODate;
  onSelect: (date: ISODate) => void;
};

export default function WeekStrip({ dates, selected, today, onSelect }: Props) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {dates.map((date, i) => {
        const isToday = date === today;
        const isSelected = date === selected;
        // A day you have not reached yet cannot be logged against.
        const future = date > today;

        return (
          <PressableScale
            key={date}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: future }}
            accessibilityLabel={date}
            onPress={() => onSelect(date)}
            disabled={future}
            scaleTo={0.9}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: 5,
              paddingVertical: 6,
              borderRadius: radii.tileSm,
              backgroundColor: isSelected ? colors.bonnet : 'transparent',
              opacity: future ? 0.3 : 1,
            }}
          >
            <Text
              style={[
                t.tabLabel,
                {
                  fontSize: 11,
                  color: isSelected
                    ? colors.bonnetInk
                    : isToday
                      ? colors.bonnet
                      : colors.muted,
                },
              ]}
            >
              {DAYS[i]}
            </Text>
            <Text
              maxFontSizeMultiplier={1.6}
              style={{
                fontFamily: isToday || isSelected ? fonts.display : fonts.ui500,
                fontSize: 13,
                color: isSelected
                  ? colors.bonnetInk
                  : isToday
                    ? colors.bonnet
                    : colors.cream,
              }}
            >
              {Number(date.slice(8, 10))}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
