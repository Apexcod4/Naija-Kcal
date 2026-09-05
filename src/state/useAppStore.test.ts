import { dishById } from '../data/dishes';
import { useAppStore } from './useAppStore';

beforeEach(() => useAppStore.getState().resetAll());

test('starts with the two seeded meals', () => {
  expect(useAppStore.getState().meals).toHaveLength(2);
});

test('logging APPENDS a meal rather than replacing it', () => {
  useAppStore.getState().logPair();
  useAppStore.getState().logPair();
  // The mock kept a single `extra` slot, so a second log overwrote the first.
  expect(useAppStore.getState().meals).toHaveLength(4);
});

test('the logged meal carries the computed totals', () => {
  useAppStore.getState().logPair();
  const last = useAppStore.getState().meals.at(-1)!;
  expect(last.kcal).toBe(610);
  expect(last.carbs).toBe(81);
});

test('the unit string names BOTH halves of the pair', () => {
  useAppStore.getState().setWraps(1.5);
  useAppStore.getState().setLadles(0.5);
  useAppStore.getState().logPair();
  const last = useAppStore.getState().meals.at(-1)!;
  // The mock interpolated only wraps, dropping the soup from a pair logger.
  expect(last.unitString).toContain('1½ wrap');
  expect(last.unitString).toContain('½ ladle');
});

test('steppers clamp through the store', () => {
  const { setWraps } = useAppStore.getState();
  setWraps(4);
  setWraps(4.5);
  expect(useAppStore.getState().draft.wraps).toBe(4);
});

test('logging raises a toast naming the amount', () => {
  useAppStore.getState().logPair();
  expect(useAppStore.getState().toast?.message).toBe(
    'Logged 610 kcal — you have room for fruit tonight.'
  );
});

test('logging resets the draft for the next meal', () => {
  useAppStore.getState().setWraps(3);
  useAppStore.getState().logPair();
  expect(useAppStore.getState().draft.wraps).toBe(1);
});

test('the share prompt is hidden for a household of one', () => {
  useAppStore.getState().setHouseholdSize(1);
  expect(useAppStore.getState().sharePromptVisible()).toBe(false);
  useAppStore.getState().setHouseholdSize(4);
  expect(useAppStore.getState().sharePromptVisible()).toBe(true);
});

test('a fresh install has not completed onboarding', () => {
  expect(useAppStore.getState().onboardingComplete).toBe(false);
});

test('setProfile merges rather than replacing', () => {
  useAppStore.getState().setProfile({ wrapGrams: 300 });
  const p = useAppStore.getState().profile;
  expect(p.wrapGrams).toBe(300);
  expect(p.ladleMl).toBe(180);
});

test('completing onboarding flips the gate', () => {
  useAppStore.getState().completeOnboarding();
  expect(useAppStore.getState().onboardingComplete).toBe(true);
});

test('calibrated units feed the portion maths', () => {
  useAppStore.getState().setProfile({ wrapGrams: 300, ladleMl: 250 });
  const p = useAppStore.getState().profile;
  expect(p.wrapGrams).toBe(300);
  expect(p.ladleMl).toBe(250);
});

describe('pair source', () => {
  test('defaults to the scanned pair', () => {
    expect(useAppStore.getState().currentPair.source).toBe('scan');
    expect(useAppStore.getState().currentPair.soup.id).toBe('egusi');
  });

  test('a library-built pair prices its own dishes, not the generic rates', () => {
    const egusi = dishById('egusi')!;   // 290 per ladle
    const eba = dishById('eba')!;       // 340 per wrap — not the generic 320
    useAppStore.getState().buildLibraryPair(egusi, eba);
    useAppStore.getState().logPair();

    const last = useAppStore.getState().meals.at(-1)!;
    expect(last.kcal).toBe(630); // 340 + 290, not 610
    expect(last.name).toBe('Egusi & eba');
  });

  test('building a pair resets the portion draft', () => {
    useAppStore.getState().setWraps(3);
    useAppStore.getState().buildLibraryPair(dishById('banga')!, dishById('fufu')!);
    expect(useAppStore.getState().draft.wraps).toBe(1);
  });

  test('a library pair carries no confidence scores', () => {
    useAppStore.getState().buildLibraryPair(dishById('okra')!, dishById('semo')!);
    expect(useAppStore.getState().currentPair.confidence).toBeUndefined();
    expect(useAppStore.getState().currentPair.source).toBe('library');
  });
});
