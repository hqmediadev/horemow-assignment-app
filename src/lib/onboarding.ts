const ONBOARDING_ACCOUNT_AGE_LIMIT_MS = 30 * 24 * 60 * 60 * 1000;

export function shouldShowGettingStarted(
  onboardingCompleted: boolean | undefined,
  accountCreatedAt: string | null,
): boolean {
  if (onboardingCompleted !== undefined) return !onboardingCompleted;
  if (!accountCreatedAt) return false;

  const accountAge = Date.now() - Date.parse(accountCreatedAt);
  return accountAge >= 0 && accountAge <= ONBOARDING_ACCOUNT_AGE_LIMIT_MS;
}
