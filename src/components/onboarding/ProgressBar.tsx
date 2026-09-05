import { View } from 'react-native';
import { colors } from '../../theme/tokens';

export default function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ now: clamped, min: 0, max: 100 }}
      style={{ height: 4, borderRadius: 2, backgroundColor: colors.ringTrack }}
    >
      <View
        style={{ width: `${clamped}%`, height: 4, borderRadius: 2, backgroundColor: colors.bonnet }}
      />
    </View>
  );
}
