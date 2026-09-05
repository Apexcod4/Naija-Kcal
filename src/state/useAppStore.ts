import { create } from 'zustand';
import { computePair, formatUnit, shareLabel, stepUnit } from '../logic/portion';
import { DEFAULT_PROFILE, SEED_MEALS } from '../data/seed';
import { food } from '../theme/tokens';
import { Meal, PortionDraft, Profile, Share } from '../types';

const INITIAL_DRAFT: PortionDraft = { wraps: 1, ladles: 1, share: 100 };

type Toast = { message: string } | null;

type AppState = {
  profile: Profile;
  meals: Meal[];
  draft: PortionDraft;
  toast: Toast;

  setWraps: (n: number) => void;
  setLadles: (n: number) => void;
  stepWraps: (delta: number) => void;
  stepLadles: (delta: number) => void;
  setShare: (s: Share) => void;
  setHouseholdSize: (n: number) => void;
  resetDraft: () => void;
  logPair: () => void;
  hideToast: () => void;
  resetAll: () => void;
  sharePromptVisible: () => boolean;
};

/** Clamp a directly-set value into the same 0..4 range the steppers use. */
const clamp = (n: number) => stepUnit(n, 0);

export const useAppStore = create<AppState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  meals: SEED_MEALS,
  draft: INITIAL_DRAFT,
  toast: null,

  setWraps: (n) => set((s) => ({ draft: { ...s.draft, wraps: clamp(n) } })),
  setLadles: (n) => set((s) => ({ draft: { ...s.draft, ladles: clamp(n) } })),
  stepWraps: (d) => set((s) => ({ draft: { ...s.draft, wraps: stepUnit(s.draft.wraps, d) } })),
  stepLadles: (d) => set((s) => ({ draft: { ...s.draft, ladles: stepUnit(s.draft.ladles, d) } })),
  setShare: (share) => set((s) => ({ draft: { ...s.draft, share } })),

  setHouseholdSize: (n) => set((s) => ({ profile: { ...s.profile, householdSize: n } })),

  resetDraft: () => set({ draft: INITIAL_DRAFT }),

  /** The share step is meaningless when nobody shares the bowl. */
  sharePromptVisible: () => get().profile.householdSize > 1,

  logPair: () => {
    const { draft, meals } = get();
    const totals = computePair(draft.wraps, draft.ladles, draft.share);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Both halves of the pair are named. The mock dropped the ladle count.
    const unitString =
      `${formatUnit(draft.wraps)} wrap · ${formatUnit(draft.ladles)} ladle · ` +
      `${shareLabel(draft.share)} · ${time}`;

    const meal: Meal = {
      id: `meal-${now.getTime()}`,
      name: 'Egusi & pounded yam',
      unitString,
      ...totals,
      colour: food.egusi,
      time,
    };

    set({
      meals: [...meals, meal],
      draft: INITIAL_DRAFT,
      toast: { message: `Logged ${totals.kcal} kcal — you have room for fruit tonight.` },
    });
  },

  hideToast: () => set({ toast: null }),

  resetAll: () =>
    set({ profile: DEFAULT_PROFILE, meals: SEED_MEALS, draft: INITIAL_DRAFT, toast: null }),
}));
