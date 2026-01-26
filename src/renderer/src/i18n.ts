import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// 导入所有语言资源
import zhCNCommon from './locales/zh-CN/common.json'
import zhCNChat from './locales/zh-CN/chat.json'
import zhCNSettings from './locales/zh-CN/settings.json'
import zhCNNotebook from './locales/zh-CN/notebook.json'
import zhCNUI from './locales/zh-CN/ui.json'
import zhCNQuiz from './locales/zh-CN/quiz.json'
import zhCNShortcuts from './locales/zh-CN/shortcuts.json'

import enUSCommon from './locales/en-US/common.json'
import enUSChat from './locales/en-US/chat.json'
import enUSSettings from './locales/en-US/settings.json'
import enUSNotebook from './locales/en-US/notebook.json'
import enUSUI from './locales/en-US/ui.json'
import enUSQuiz from './locales/en-US/quiz.json'
import enUSShortcuts from './locales/en-US/shortcuts.json'

const resources = {
  'zh-CN': {
    common: zhCNCommon,
    chat: zhCNChat,
    settings: zhCNSettings,
    notebook: zhCNNotebook,
    ui: zhCNUI,
    quiz: zhCNQuiz,
    shortcuts: zhCNShortcuts
  },
  'en-US': {
    common: enUSCommon,
    chat: enUSChat,
    settings: enUSSettings,
    notebook: enUSNotebook,
    ui: enUSUI,
    quiz: enUSQuiz,
    shortcuts: enUSShortcuts
  }
}

i18n
  .use(initReactI18next) // 将 i18n 实例传递给 react-i18next
  .init({
    resources,
    lng: 'zh-CN', // 默认语言
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false // React 已经默认转义了
    },
    react: {
      useSuspense: false
    }
  })

export default i18n
