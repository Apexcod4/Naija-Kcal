import PressableScale from '../src/components/PressableScale';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CornerBrackets from '../src/components/CornerBrackets';
import { BackIcon, SearchIcon } from '../src/components/icons';
import { colors, material, radii, space, tint } from '../src/theme/tokens';
import { type as t } from '../src/theme/typography';

const glassCircle: ViewStyle = {
  width: 38,
  height: 38,
  borderRadius: 19,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: material.glass.backgroundColor,
  borderWidth: material.glass.borderWidth,
  borderColor: material.glass.borderColor,
};

const tile: ViewStyle = { ...glassCircle, width: 46, height: 46, borderRadius: radii.tileSm + 4 };

export default function Scan() {
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
            { alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: space.gutter },
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
          top: insets.top + 8,
          left: space.gutter,
          right: space.gutter,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={3}
          onPress={() => router.back()}
          style={glassCircle}
        >
          <BackIcon color={colors.cream} />
        </PressableScale>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={[
              { borderRadius: radii.chip, paddingVertical: 7, paddingHorizontal: 12 },
              tint(colors.ugu, 0.12, 0.35),
            ]}
          >
            <Text style={[t.chip, { color: colors.uguText }]}>Offline · scanning on device</Text>
          </View>
        </View>

        {/* Balances the back button so the offline pill stays optically centred. */}
        <View style={{ width: 38 }} />
      </View>

      <View
        style={{
          position: 'absolute',
          left: space.gutter,
          right: space.gutter,
          bottom: insets.bottom + 150,
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Text style={[t.sectionTitle, { fontSize: 21, letterSpacing: -0.5 }]}>
          Point at the whole plate
        </Text>
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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 34,
        }}
      >
        <View accessibilityLabel="Pick from library" style={tile} />

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Capture"
          onPress={() => router.push('/detect')}
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

        <PressableScale accessibilityRole="button" accessibilityLabel="Search the library" style={tile}>
          <SearchIcon color={colors.cream} />
        </PressableScale>
      </View>
    </View>
  );
}
