import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import OnboardingScreen from '../../src/components/onboarding/OnboardingScreen';
import PrimaryButton from '../../src/components/onboarding/PrimaryButton';
import Segmented from '../../src/components/onboarding/Segmented';
import ValuePicker from '../../src/components/onboarding/ValuePicker';
import StatusCard from '../../src/components/StatusCard';
import { bmr, tdee } from '../../src/logic/body';
import { formatHeight, formatWeight } from '../../src/logic/units';
import { useAppStore } from '../../src/state/useAppStore';
import { colors } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';
import { Activity, Sex, System } from '../../src/types';

/**
 * Screen 04 — body and activity.
 *
 * Merges Cal AI's height, weight, age and activity screens into one.
 *
 * The sex control is an addition to the handoff: Mifflin-St Jeor needs it,
 * but the handoff deliberately cut Cal AI's gender screen. Folding it in here
 * keeps the funnel at nine screens. Flagged in docs/design-questions.md.
 */
export default function BodyScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);

  const [system, setSystem] = useState<System>(profile.unitSystem);
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [age, setAge] = useState(profile.age);
  const [activity, setActivity] = useState<Activity>(profile.activity);

  const baseline = tdee(bmr(sex, weightKg, heightCm, age), activity);

  const onContinue = () => {
    setProfile({ unitSystem: system, sex, heightCm, weightKg, age, activity });
    router.push('/(onboarding)/05-units');
  };

  return (
    <OnboardingScreen
      progress={28}
      title={'Your body and\nyour week'}
      footer={<PrimaryButton label="Continue" onPress={onContinue} />}
    >
      <Segmented
        options={[
          { value: 'metric', label: 'Metric' },
          { value: 'imperial', label: 'Imperial' },
        ]}
        value={system}
        onChange={setSystem}
      />

      <Segmented
        options={[
          { value: 'female', label: 'Female' },
          { value: 'male', label: 'Male' },
        ]}
        value={sex}
        onChange={setSex}
      />

      <View style={{ flexDirection: 'row', gap: 9 }}>
        <ValuePicker
          label="Height"
          value={heightCm}
          min={120}
          max={220}
          onChange={setHeightCm}
          format={(n) => formatHeight(n, system)}
        />
        <ValuePicker
          label="Weight"
          value={weightKg}
          min={35}
          max={200}
          onChange={setWeightKg}
          format={(n) => formatWeight(n, system)}
        />
        <ValuePicker
          label="Age"
          value={age}
          min={14}
          max={100}
          onChange={setAge}
          format={(n) => String(n)}
        />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={t.eyebrow}>How active is a normal week?</Text>
        <Segmented
          options={[
            { value: 'low', label: 'Low' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high', label: 'High' },
          ]}
          value={activity}
          onChange={setActivity}
        />
      </View>

      <StatusCard accent={colors.ugu}>
        <Text style={[t.eyebrow, { color: colors.uguText }]}>Baseline burn</Text>
        <Text style={[t.rowTitle, { marginTop: 8, lineHeight: 21 }]}>
          You burn about {baseline.toLocaleString()} kcal a day before you eat anything. Your
          target is built from this.
        </Text>
      </StatusCard>
    </OnboardingScreen>
  );
}
