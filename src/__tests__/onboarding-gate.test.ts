import { shouldShowOnboarding } from '../logic/gate';
import { useAppStore } from '../state/useAppStore';

beforeEach(() => useAppStore.getState().resetAll());

test('a fresh install goes to the funnel', () => {
  expect(shouldShowOnboarding(useAppStore.getState())).toBe(true);
});

test('a completed profile goes straight to the app', () => {
  useAppStore.getState().completeOnboarding();
  expect(shouldShowOnboarding(useAppStore.getState())).toBe(false);
});

test('resetting onboarding sends the user back through the funnel', () => {
  useAppStore.getState().completeOnboarding();
  useAppStore.getState().resetOnboarding();
  expect(shouldShowOnboarding(useAppStore.getState())).toBe(true);
});

test('the funnel writes calibration the portion maths then reads', () => {
  useAppStore.getState().setProfile({ wrapGrams: 300, ladleMl: 250, householdSize: 1 });
  useAppStore.getState().completeOnboarding();

  const p = useAppStore.getState().profile;
  expect(p.wrapGrams).toBe(300);
  expect(p.ladleMl).toBe(250);
  // A household of one hides the share step entirely.
  expect(useAppStore.getState().sharePromptVisible()).toBe(false);
});
