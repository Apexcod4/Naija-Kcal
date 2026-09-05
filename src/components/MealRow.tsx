import { Text, View } from 'react-native';
import { radii } from '../theme/tokens';
import { type as t } from '../theme/typography';
import { Meal } from '../types';
import FoodTile from './FoodTile';
import GlassCard from './GlassCard';

export default function MealRow({ meal }: { meal: Meal }) {
  return (
    <GlassCard variant="light" radius={radii.compact}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          // A floor rather than a fixed height, so the row grows with Dynamic Type.
          minHeight: 70,
        }}
      >
        <FoodTile colour={meal.colour} photoUri={meal.photoUri} size={46} />

        <View style={{ flex: 1 }}>
          <Text numberOfLines={2} style={t.rowTitle}>
            {meal.name}
          </Text>
          <Text style={[t.rowMeta, { marginTop: 2 }]}>{meal.unitString}</Text>
        </View>

        <Text maxFontSizeMultiplier={1.6} style={t.metric}>
          {meal.kcal}
        </Text>
      </View>
    </GlassCard>
  );
}
