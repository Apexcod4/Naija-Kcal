import PressableScale from './PressableScale';
import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { colors, material, radii, space } from '../theme/tokens';
import { type as t } from '../theme/typography';
import { DiaryIcon, HomeIcon, ScanIcon, YouIcon } from './icons';

const ICONS = { index: HomeIcon, diary: DiaryIcon, you: YouIcon } as const;
const LABELS = { index: 'Home', diary: 'Diary', you: 'You' } as const;

type RouteName = keyof typeof ICONS;

/**
 * expo-router vendors react-navigation's bottom-tabs internally, so the props
 * type is derived from the public Tabs component rather than reached for at a
 * deep internal path.
 */
export type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/**
 * The nav pill and the scan button are deliberately two separate floating
 * objects: logging is an action, not a fourth tab.
 */
export default function TabBar({ state, navigation }: TabBarProps) {
  const router = useRouter();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 28,
        height: 62,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: space.gutterOnboarding,
      }}
    >
      <View style={{ width: 238, height: 62, borderRadius: radii.tabBar, overflow: 'hidden' }}>
        <BlurView intensity={material.glassHeavy.blurIntensity} tint="dark" style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: material.glassHeavy.backgroundColor,
              borderWidth: material.glassHeavy.borderWidth,
              borderColor: material.glassHeavy.borderColor,
              borderRadius: radii.tabBar,
            }}
          >
            {state.routes.map((route, i) => {
              const name = route.name as RouteName;
              const Icon = ICONS[name];
              if (!Icon) return null;

              const focused = state.index === i;
              const colour = focused ? colors.bonnet : colors.tabInactive;

              return (
                <PressableScale
                  key={route.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={LABELS[name]}
                  onPress={() => navigation.navigate(route.name)}
                  style={{
                    flex: 1,
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                  }}
                >
                  <Icon color={colour} />
                  <Text style={[t.tabLabel, { color: colour }]}>{LABELS[name]}</Text>
                </PressableScale>
              );
            })}
          </View>
        </BlurView>
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Scan a meal"
        onPress={() => router.push('/scan')}
        style={{
          width: 62,
          height: 62,
          borderRadius: 31,
          backgroundColor: colors.bonnet,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.bonnet,
          shadowOpacity: 0.42,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 10 },
        }}
      >
        <ScanIcon color={colors.bonnetInk} />
      </PressableScale>
    </View>
  );
}
