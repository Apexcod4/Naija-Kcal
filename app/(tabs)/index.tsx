import { Text, View } from 'react-native';
import { colors } from '../../src/theme/tokens';

export default function Screen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.pot, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.cream }}>Home</Text>
    </View>
  );
}
