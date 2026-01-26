import { create } from 'zustand'

interface OnboardingStore {
  hasCompletedOnboarding: boolean
  isLoading: boolean
  initOnboarding: () => Promise<void>
  completeOnboarding: () => Promise<void>
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  hasCompletedOnboarding: false,
  isLoading: true,

  initOnboarding: async () => {
    try {
      const hasCompleted = await window.api.settings.get('hasCompletedOnboarding')
      set({ hasCompletedOnboarding: hasCompleted ?? false, isLoading: false })
    } catch (error) {
      console.error('Failed to load onboarding status:', error)
      set({ isLoading: false })
    }
  },

  completeOnboarding: async () => {
    try {
      await window.api.settings.set('hasCompletedOnboarding', true)
      set({ hasCompletedOnboarding: true })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }
}))
