import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SCANNED_PAIR } from '../data/detectedPair';
import { DEFAULT_PROFILE, SEED_MEALS } from '../data/seed';
import { computePair, formatUnit, shareLabel, stepUnit } from '../logic/portion';
import { Dish, DishPair, Meal, PortionDraft, Profile, Share } from '../types';
import { appStorage } from './storage';

const INITIAL_DRAFT: PortionDraft = { wraps: 1, ladles: 1, share: 100 };

type Toast = { message: string } | null;

type AppState = {
  profile: Profile;
  meals: Meal[];
  draft: PortionDraft;
  toast: Toast;
  currentPair: DishPair;
  onboardingComplete: boolean;

  setWraps: (n: number) => void;
  setLadles: (n: number) => void;
  stepWraps: (delta: number) => void;
  stepLadles: (delta: number) => void;
  setShare: (s: Share) => void;
  setPair: (pair: DishPair) => void;
  buildLibraryPair: (soup: Dish, swallow: Dish) => void;
  setHouseholdSize: (n: number) => void;
  setProfile: (patch: Partial<Profile>) => void;
  resetDraft: () => void;
  logPair: () => void;
  hideToast: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  resetAll: () => void;
  sharePromptVisible: () => boolean;
};

/** Clamp a directly-set value into the same 0..4 range the steppers use. */
const clamp = (n: number) => stepUnit(n, 0);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      meals: SEED_MEALS,
      draft: INITIAL_DRAFT,
      toast: null,
      currentPair: SCANNED_PAIR,
      onboardingComplete: false,

      setWraps: (n) => set((s) => ({ draft: { ...s.draft, wraps: clamp(n) } })),
      setLadles: (n) => set((s) => ({ draft: { ...s.draft, ladles: clamp(n) } })),
      stepWraps: (d) => set((s) => ({ draft: { ...s.draft, wraps: stepUnit(s.draft.wraps, d) } })),
      stepLadles: (d) => set((s) => ({ draft: { ...s.draft, ladles: stepUnit(s.draft.ladles, d) } })),
      setShare: (share) => set((s) => ({ draft: { ...s.draft, share } })),

      setPair: (currentPair) => set({ currentPair, draft: INITIAL_DRAFT }),

      /** A pair assembled by hand in the library rather than recognised. */
      buildLibraryPair: (soup, swallow) =>
        set({ currentPair: { soup, swallow, source: 'library' }, draft: INITIAL_DRAFT }),

      setHouseholdSize: (n) => set((s) => ({ profile: { ...s.profile, householdSize: n } })),
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      resetDraft: () => set({ draft: INITIAL_DRAFT }),

      /** The share step is meaningless when nobody shares the bowl. */
      sharePromptVisible: () => get().profile.householdSize > 1,

      logPair: () => {
        const { draft, meals, currentPair } = get();
        const { soup, swallow } = currentPair;

        // Rates come from the pair itself, so logging egusi with eba prices
        // eba's 340 rather than a generic swallow constant.
        const totals = computePair(draft.wraps, draft.ladles, draft.share, {
          swallow: {
            kcal: swallow.kcal,
            carbs: swallow.carbs,
            protein: swallow.protein,
            fat: swallow.fat,
          },
          ladle: { kcal: soup.kcal, carbs: soup.carbs, protein: soup.protein, fat: soup.fat },
        });
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Both halves of the pair are named. The mock dropped the ladle count.
        const unitString =
          `${formatUnit(draft.wraps)} wrap · ${formatUnit(draft.ladles)} ladle · ` +
          `${shareLabel(draft.share)} · ${time}`;

        const meal: Meal = {
          id: `meal-${now.getTime()}`,
          name: `${soup.name} & ${swallow.name.toLowerCase()}`,
          unitString,
          ...totals,
          colour: soup.colour,
          time,
        };

        set({
          meals: [...meals, meal],
          draft: INITIAL_DRAFT,
          toast: { message: `Logged ${totals.kcal} kcal — you have room for fruit tonight.` },
        });
      },

      hideToast: () => set({ toast: null }),

      completeOnboarding: () => set({ onboardingComplete: true }),
      resetOnboarding: () => set({ onboardingComplete: false, profile: DEFAULT_PROFILE }),

      resetAll: () =>
        set({
          profile: DEFAULT_PROFILE,
          meals: SEED_MEALS,
          draft: INITIAL_DRAFT,
          toast: null,
          onboardingComplete: false,
          currentPair: SCANNED_PAIR,
        }),
    }),
    {
      name: 'naija-kcal',
      storage: appStorage,
      // Meals are day-scoped and the toast is ephemeral; only durable data
      // survives a restart.
      partialize: (s) => ({ profile: s.profile, onboardingComplete: s.onboardingComplete }),
    }
  )
);
