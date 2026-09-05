import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { colors, material, radii } from '../theme/tokens';
import { type as t } from '../theme/typography';
import PressableScale from './PressableScale';
import { BarcodeIcon, MenuScanIcon, MicIcon, SendIcon } from './icons';

type Props = {
  onSubmitText: (text: string) => void;
  onBarcode: () => void;
};

const BTN = 40;

/**
 * The four ways into a log. Voice and menu scan are visible but disabled:
 * both need native modules that Expo Go does not bundle, so enabling them
 * would end on-device testing. The slots exist so adding them later is
 * wiring rather than a redesign.
 */
export default function LogInputBar({ onSubmitText, onBarcode }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    onSubmitText(value);
  };

  const button = (
    label: string,
    icon: React.ReactNode,
    onPress: () => void,
    opts: { disabled?: boolean; filled?: boolean } = {}
  ) => {
    const { disabled = false, filled = false } = opts;
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        onPress={onPress}
        disabled={disabled}
        hitSlop={4}
        scaleTo={0.9}
        style={{
          width: BTN,
          height: BTN,
          borderRadius: BTN / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: filled ? colors.bonnet : 'transparent',
          opacity: disabled ? 0.35 : 1,
        }}
      >
        {icon}
      </PressableScale>
    );
  };

  const notYet = (what: string) => () =>
    Alert.alert(
      `${what} needs a native build`,
      `${what} uses a module Expo Go does not include. It will work once the app is built with EAS.`
    );

  return (
    <View
      style={{
        borderRadius: radii.tabBar,
        overflow: 'hidden',
        borderWidth: material.glassHeavy.borderWidth,
        borderColor: material.glassHeavy.borderColor,
      }}
    >
      <BlurView intensity={material.glassHeavy.blurIntensity} tint="dark">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingLeft: 16,
            paddingRight: 6,
            paddingVertical: 6,
            backgroundColor: material.glassHeavy.backgroundColor,
            minHeight: 56,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={submit}
            returnKeyType="go"
            placeholder="Log a meal — “egusi and eba”"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Type a meal to log"
            style={[t.rowTitle, { flex: 1, paddingVertical: 10 }]}
          />

          {text.trim() ? (
            button('Log this meal', <SendIcon color={colors.bonnetInk} />, submit, { filled: true })
          ) : (
            <>
              {button('Record a meal by voice', <MicIcon color={colors.cream} />, notYet('Voice logging'), {
                disabled: true,
              })}
              {button('Scan a menu', <MenuScanIcon color={colors.cream} />, notYet('Menu scanning'), {
                disabled: true,
              })}
              {button('Scan a barcode', <BarcodeIcon color={colors.cream} />, onBarcode)}
            </>
          )}
        </View>
      </BlurView>
    </View>
  );
}
