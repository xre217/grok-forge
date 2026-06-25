export type OnboardingProgress = {
  chatted: boolean;
  memorySaved: boolean;
  memoryActive: boolean;
};

const PROGRESS_KEY = "grok-forge:onboarding-progress";
const DISMISSED_KEY = "grok-forge:onboarding-dismissed";

const DEFAULT: OnboardingProgress = {
  chatted: false,
  memorySaved: false,
  memoryActive: false,
};

export function loadOnboardingProgress(): OnboardingProgress {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<OnboardingProgress>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return DEFAULT;
  }
}

export function saveOnboardingProgress(
  patch: Partial<OnboardingProgress>,
): OnboardingProgress {
  const next = { ...loadOnboardingProgress(), ...patch };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  if (isOnboardingComplete(next)) {
    localStorage.setItem(DISMISSED_KEY, "1");
  }
  return next;
}

export function isOnboardingComplete(progress: OnboardingProgress): boolean {
  return progress.chatted && progress.memorySaved && progress.memoryActive;
}

export function isOnboardingDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(DISMISSED_KEY));
}

export function dismissOnboarding(): void {
  localStorage.setItem(DISMISSED_KEY, "1");
}