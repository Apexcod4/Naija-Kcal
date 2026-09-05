import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CornerBrackets from '../src/components/CornerBrackets';
import PressableScale from '../src/components/PressableScale';
import StatusCard from '../src/components/StatusCard';
import { BackIcon } from '../src/components/icons';
import { DISHES } from '../src/data/dishes';
import { routeForMatch } from '../src/logic/logRoute';
import { matchPair } from '../src/logic/matchPair';
import { useAppStore } from '../src/state/useAppStore';
import { colors, material, radii, space, tint } from '../src/theme/tokens';
import { type as t } from '../src/theme/typography';

/**
 * Barcode logging.
 *
 * The scan itself is local — expo-camera reads the code on device. Resolving a
 * code to a product is the part that does not exist yet: there is no barcode
 * table on the phone, and the free online ones are network calls, which would
 * quietly break the "0 MB of data per scan" promise screen 02 makes. So an
 * unrecognised code says so plainly instead of reaching for the network.
 */
export default function BarcodeScan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const buildLibraryPair = useAppStore((s) => s.buildLibraryPair);

  const [missed, setMissed] = useState<string | null>(null);

  const onScanned = ({ data }: { data: string }) => {
    if (missed) return; // already showing a result

    // TODO(phase-4): no barcode-to-product table exists. Until it does, the
    // code is matched against dish names only, which almost never hits.
    const match = matchPair(data, DISHES);
    const route = routeForMatch(match);

    if (route.action === 'portion') {
      buildLibraryPair(route.soup, route.swallow);
      router.replace('/portion');
      return;
    }
    if (route.action === 'dish') {
      router.replace({ pathname: '/dish/[id]', params: { id: route.id } });
      return;
    }
    setMissed(data);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.potDeep }}>
      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
          onBarcodeScanned={onScanned}
        />
      ) : (
        // TODO(design): camera-permission-denied copy is not designed. Structure only.
        <View
          style={[
            StyleSheet.absoluteFill,
            { alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: space.gutter },
          ]}
        >
          <Text style={[t.body, { textAlign: 'center' }]}>
            Camera access is needed to read a barcode.
          </Text>
          <PressableScale accessibilityRole="button" onPress={requestPermission} hitSlop={8}>
            <Text style={[t.rowTitle, { color: colors.bonnet }]}>Allow camera</Text>
          </PressableScale>
        </View>
      )}

      <CornerBrackets height={150} inset={44} />

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
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: material.glass.backgroundColor,
            borderWidth: material.glass.borderWidth,
            borderColor: material.glass.borderColor,
          }}
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
            <Text style={[t.chip, { color: colors.uguText }]}>Reading on device</Text>
          </View>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <View
        style={{
          position: 'absolute',
          left: space.gutter,
          right: space.gutter,
          bottom: insets.bottom + 40,
          gap: 12,
        }}
      >
        {missed ? (
          <StatusCard accent={colors.palm}>
            <Text style={t.rowTitle}>Not on this phone yet</Text>
            <Text style={[t.body, { marginTop: 6 }]}>
              Code {missed} isn&apos;t in the on-device table. Packaged foods need a barcode
              database the app doesn&apos;t ship yet — search the library instead.
            </Text>
            <PressableScale
              accessibilityRole="button"
              onPress={() => router.replace('/library')}
              hitSlop={8}
              style={{ marginTop: 12 }}
            >
              <Text style={[t.rowTitle, { color: colors.bonnet }]}>Search the library</Text>
            </PressableScale>
          </StatusCard>
        ) : (
          <Text style={[t.body, { textAlign: 'center' }]}>
            Point at the barcode on the pack.
          </Text>
        )}
      </View>
    </View>
  );
}
