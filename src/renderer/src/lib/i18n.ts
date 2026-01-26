import { useCallback } from 'react'
import { useI18nStore } from '../store/i18nStore'

// 语言类型定义
export type Language = 'zh-CN' | 'en-US'
export type Namespace = 'common' | 'chat' | 'settings' | 'notebook' | 'ui' | 'quiz'

// 动态导入语言包
const loadLocale = async (lang: Language, namespace: Namespace) => {
  const module = await import(`../locales/${lang}/${namespace}.json`)
  return module.default
}

// 缓存已加载的语言包
const localeCache = new Map<string, Record<string, any>>()

// 获取翻译文本的核心函数
export const getTranslation = async (
  lang: Language,
  namespace: Namespace,
  key: string
): Promise<string> => {
  const cacheKey = `${lang}-${namespace}`

  // 如果缓存中有，直接使用
  if (localeCache.has(cacheKey)) {
    const locale = localeCache.get(cacheKey)!
    return getNestedValue(locale, key) || key
  }

  // 否则加载并缓存
  try {
    const locale = await loadLocale(lang, namespace)
    localeCache.set(cacheKey, locale)
    return getNestedValue(locale, key) || key
  } catch (error) {
    console.error(`Failed to load locale ${lang}/${namespace}:`, error)
    return key
  }
}

// 获取嵌套对象的值
const getNestedValue = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((prev, curr) => {
    return prev && prev[curr] !== undefined ? prev[curr] : undefined
  }, obj)
}

// 同步版本的翻译函数（用于已预加载的语言包）
export const t = (namespace: Namespace, key: string, fallback?: string) => {
  const language = useI18nStore.getState().language
  const cacheKey = `${language}-${namespace}`

  if (localeCache.has(cacheKey)) {
    const locale = localeCache.get(cacheKey)!
    const value = getNestedValue(locale, key)
    return value || fallback || key
  }

  return fallback || key
}

// 预加载所有语言包
export const preloadLocales = async (lang: Language) => {
  const namespaces: Namespace[] = ['common', 'chat', 'settings', 'notebook', 'ui', 'quiz']
  const promises = namespaces.map(async (namespace) => {
    const cacheKey = `${lang}-${namespace}`
    if (!localeCache.has(cacheKey)) {
      try {
        const locale = await loadLocale(lang, namespace)
        localeCache.set(cacheKey, locale)
      } catch (error) {
        console.error(`Failed to preload locale ${lang}/${namespace}:`, error)
      }
    }
  })

  await Promise.all(promises)
}

// React Hook for translations
export const useTranslation = (namespace: Namespace) => {
  const language = useI18nStore((state) => state.language)

  const translate = useCallback(
    (key: string, fallback?: string): string => {
      const cacheKey = `${language}-${namespace}`

      if (localeCache.has(cacheKey)) {
        const locale = localeCache.get(cacheKey)!
        const value = getNestedValue(locale, key)
        return value || fallback || key
      }

      return fallback || key
    },
    [language, namespace]
  )

  return { t: translate, language }
}

// 格式化函数
export const formatMessage = (
  template: string,
  values: Record<string, string | number> = {}
): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}

// 复数形式处理（简单实现）
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular
  return plural || singular + 's'
}
