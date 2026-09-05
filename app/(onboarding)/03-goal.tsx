import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import OnboardingScreen from '../../src/components/onboarding/OnboardingScreen';
import OptionRow from '../../src/components/onboarding/OptionRow';
import PrimaryButton from '../../src/components/onboarding/PrimaryButton';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, radii, tint } from '../../src/theme/tokens';
import { Goal } from '../../src/types';

/**
 * Screen 03 — goal.
 *
 * Merges four Cal AI screens (gender, goal, workouts, attribution) into one.
 * "Manage sugar or BP" is a first-class entry rather than an afterthought:
 * the clinical audience is a named target market.
 */
const OPTIONS: { value: Goal; title: string; subtitle?: string; clinical?: boolean }[] = [
  { value: 'lose', title: 'Lose weight' },
  { value: 'gain', title: 'Gain weight' },
  { value: 'maintain', title: 'Maintain' },
  {
    value: 'clinical',
    title: 'Manage sugar or BP',
    subtitle: 'Targets tuned for blood sugar and blood pressure.',
    clinical: true,
  },
];

function ClinicalIcon() {
  return (
    <View
      style={[
        { width: 38, height: 38, borderRadius: radii.tileSm, alignItems: 'center', justifyContent: 'center' },
        tint(colors.sky, 0.16, 0.34),
      ]}
    />
  );
}

export default function GoalScreen() {
  const router = useRouter();
  const setProfile = useAppStore((s) => s.setProfile);
  const current = useAppStore((s) => s.profile.goal);
  const [goal, setGoal] = useState<Goal | null>(current ?? null);

  const onContinue = () => {
    if (!goal) return;
    setProfile({ goal });
    router.push('/(onboarding)/04-body');
  };

  return (
    <OnboardingScreen
      progress={14}
      title={'What are you\nworking towards?'}
      footer={<PrimaryButton label="Continue" onPress={onContinue} disabled={!goal} />}
    >
      <View style={{ gap: 10 }}>
        {OPTIONS.map((o) => (
          <OptionRow
            key={o.value}
            title={o.title}
            subtitle={o.subtitle}
            icon={o.clinical ? <ClinicalIcon /> : undefined}
            selected={goal === o.value}
            onPress={() => setGoal(o.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
