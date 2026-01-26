import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import language resources
import zhCNCommon from '../locales/zh-CN/common.json'
import zhCNChat from '../locales/zh-CN/chat.json'
import zhCNUi from '../locales/zh-CN/ui.json'
import zhCNNotebook from '../locales/zh-CN/notebook.json'
import zhCNSettings from '../locales/zh-CN/settings.json'
import zhCNShortcuts from '../locales/zh-CN/shortcuts.json'

import enUSCommon from '../locales/en-US/common.json'
import enUSChat from '../locales/en-US/chat.json'
import enUSUi from '../locales/en-US/ui.json'
import enUSNotebook from '../locales/en-US/notebook.json'
import enUSSettings from '../locales/en-US/settings.json'
import enUSShortcuts from '../locales/en-US/shortcuts.json'

// Configure i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    lng: 'en-US', // 默认语言
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false // React already escapes
    },

    resources: {
      'zh-CN': {
        common: zhCNCommon,
        chat: zhCNChat,
        ui: zhCNUi,
        notebook: zhCNNotebook,
        settings: zhCNSettings,
        shortcuts: zhCNShortcuts
      },
      'en-US': {
        common: enUSCommon,
        chat: enUSChat,
        ui: enUSUi,
        notebook: enUSNotebook,
        settings: enUSSettings,
        shortcuts: enUSShortcuts
      }
    },

    detection: {
      order: ['localStorage'], // 只使用 localStorage，不使用浏览器检测
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },

    // Default namespace
    defaultNS: 'common'
  })

export default i18n
