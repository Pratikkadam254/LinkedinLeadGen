/**
 * Onboarding flow definition.
 *
 * Screens 0-5: ICP questions (pre-signup, stored in localStorage)
 * Screen 6: Aha moment (pre-signup, display only)
 * Screen 7: Signup (Clerk)
 * Screen 8: Lead import (post-signup)
 */

export type OnboardingScreenType = 'question' | 'aha' | 'signup' | 'import'

export interface OnboardingScreen {
    id: string
    type: OnboardingScreenType
    /** ID matching the question in onboardingQuestions.ts (for question screens) */
    questionId?: string
}

export const onboardingScreens: OnboardingScreen[] = [
    { id: 'goal', type: 'question', questionId: 'primaryGoal' },
    { id: 'role', type: 'question', questionId: 'role' },
    { id: 'industry', type: 'question', questionId: 'targetIndustry' },
    { id: 'companySize', type: 'question', questionId: 'companySize' },
    { id: 'titles', type: 'question', questionId: 'targetTitles' },
    { id: 'tone', type: 'question', questionId: 'messageTone' },
    { id: 'aha', type: 'aha' },
    { id: 'signup', type: 'signup' },
    { id: 'import', type: 'import' },
]

export const TOTAL_SCREENS = onboardingScreens.length

/** Index of the signup screen — everything before this is pre-signup */
export const SIGNUP_SCREEN_INDEX = 7

/** Index of the post-signup start (used with ?step=post-signup) */
export const POST_SIGNUP_START_INDEX = 8
