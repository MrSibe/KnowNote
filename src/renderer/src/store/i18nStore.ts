import { create } from 'zustand'

export type Language = 'zh-CN' | 'en-US'

interface I18nStore {
  language: Language
  isLoading: boolean
  changeLanguage: (language: Language) => Promise<void>
  initLanguage: () => Promise<void>
}

export const useI18nStore = create<I18nStore>((set) => {
  // 设置监听器（只设置一次）
  if (typeof window !== 'undefined' && window.api) {
    window.api.settings.onSettingsChange((newSettings) => {
      const newLanguage = newSettings.language
      set({ language: newLanguage })
      console.log('[I18nStore] Language changed to:', newLanguage)
    })
  }

  return {
    language: 'zh-CN',
    isLoading: true,

    initLanguage: async () => {
      try {
        const language = await window.api.settings.get('language')
        set({ language: language || 'zh-CN', isLoading: false })
      } catch (error) {
        console.error('Failed to load language:', error)
        set({ isLoading: false })
      }
    },

    changeLanguage: async (language) => {
      try {
        // 先更新 UI
        set({ language })
        // 然后保存到 electron-store
        await window.api.settings.set('language', language)
      } catch (error) {
        console.error('Failed to save language:', error)
      }
    }
  }
})
