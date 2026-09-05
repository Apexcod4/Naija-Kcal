import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '../../theme/tokens';
import { type as t } from '../../theme/typography';
import Bloom from '../Bloom';
import ProgressBar from './ProgressBar';

type Props = {
  /** Omit entirely on screens that carry no bar (01, 02, 07, 08, 09). */
  progress?: number;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
};

/**
 * Shared funnel shell. Note the 24px gutter rather than the in-app 22px —
 * the wider gutter is how the handoff signals "this is a different mode".
 */
export default function OnboardingScreen({
  progress,
  title,
  subtitle,
  children,
  footer,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <Bloom style={{ right: -100, top: -70 }} />

      <View
        style={{ paddingTop: insets.top + 12, paddingHorizontal: space.gutterOnboarding }}
      >
        {progress !== undefined ? <ProgressBar percent={progress} /> : null}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 24,
          paddingHorizontal: space.gutterOnboarding,
          paddingBottom: 160,
          gap: 20,
        }}
      >
        {title ? <Text style={t.screenTitle}>{title}</Text> : null}
        {subtitle ? <Text style={t.body}>{subtitle}</Text> : null}
        {children}
      </ScrollView>

      {footer ? (
        <View
          style={{
            position: 'absolute',
            left: space.gutterOnboarding,
            right: space.gutterOnboarding,
            bottom: insets.bottom + 20,
            gap: 12,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
