import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CornerBrackets from '../../src/components/CornerBrackets';
import PressableScale from '../../src/components/PressableScale';
import { colors, radii, space, tint } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

/**
 * Screen 01 — scan first, ask later.
 *
 * Deliberately carries NO progress bar: the user has not entered a funnel
 * yet. Proving the scanner before asking anything is what replaces Cal AI's
 * entire persuasion block.
 */
export default function OnboardingScan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  return (
    <View style={{ flex: 1, backgroundColor: colors.potDeep }}>
      {permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        // TODO(design): camera-permission-denied copy is not designed. Structure only.
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              paddingHorizontal: space.gutterOnboarding,
            },
          ]}
        >
          <Text style={[t.body, { textAlign: 'center' }]}>
            Camera access is needed to scan a plate.
          </Text>
          <PressableScale accessibilityRole="button" onPress={requestPermission} hitSlop={8}>
            <Text style={[t.rowTitle, { color: colors.bonnet }]}>Allow camera</Text>
          </PressableScale>
        </View>
      )}

      <CornerBrackets />

      <View
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <View
          style={[
            { borderRadius: radii.chip, paddingVertical: 7, paddingHorizontal: 12 },
            tint(colors.ugu, 0.12, 0.35),
          ]}
        >
          <Text style={[t.chip, { color: colors.uguText }]}>No account needed</Text>
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          left: space.gutterOnboarding,
          right: space.gutterOnboarding,
          bottom: insets.bottom + 170,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text style={[t.screenTitle, { textAlign: 'center' }]}>Scan your dinner right now</Text>
        <Text style={[t.body, { textAlign: 'center' }]}>
          Soup and swallow in one shot. We log them as a pair.
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: insets.bottom + 34,
          alignItems: 'center',
          gap: 18,
        }}
      >
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Capture"
          onPress={() => router.push('/(onboarding)/02-proof')}
          haptic="medium"
          scaleTo={0.92}
          style={{
            width: 82,
            height: 82,
            borderRadius: 41,
            backgroundColor: colors.bonnet,
            borderWidth: 5,
            borderColor: colors.shutterRing,
          }}
        />

        <PressableScale
          accessibilityRole="button"
          onPress={() => router.push('/(onboarding)/03-goal')}
          hitSlop={10}
        >
          <Text style={[t.body, { color: colors.muted }]}>Or skip the demo</Text>
        </PressableScale>
      </View>
    </View>
  );
}
