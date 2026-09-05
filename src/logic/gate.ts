/**
 * Kept as a pure predicate rather than inlined in the root layout so the
 * routing rule is testable without rendering a navigator.
 */
export function shouldShowOnboarding(state: { onboardingComplete: boolean }): boolean {
  return !state.onboardingComplete;
}
