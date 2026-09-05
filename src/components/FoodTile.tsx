import { Image, View } from 'react-native';
import { colors, radii } from '../theme/tokens';

type Props = {
  /** Placeholder swatch, used only when photoUri is absent. */
  colour: string;
  photoUri?: string;
  size?: number;
  /** Wrap the swatch in the enamel plate square used by meal rows. */
  plate?: boolean;
};

/**
 * The photo slot. Every dish image in the design is a placeholder gradient
 * that must not ship, so this component prefers real imagery whenever it
 * exists and swapping photography in stays a data change.
 */
export default function FoodTile({ colour, photoUri, size = 46, plate = true }: Props) {
  const inner = size * 0.7;
  const dimension = plate ? inner : size;
  const radius = plate ? dimension / 2 : radii.tileSm;

  const content = photoUri ? (
    <Image
      testID="food-photo"
      accessibilityIgnoresInvertColors
      source={{ uri: photoUri }}
      style={{ width: dimension, height: dimension, borderRadius: radius }}
    />
  ) : (
    <View
      testID="food-swatch"
      style={{ width: dimension, height: dimension, borderRadius: radius, backgroundColor: colour }}
    />
  );

  if (!plate) return content;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radii.tileSm + 3,
        backgroundColor: colors.plate,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {content}
    </View>
  );
}
