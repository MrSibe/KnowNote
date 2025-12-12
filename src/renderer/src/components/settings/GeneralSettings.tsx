import { ReactElement, useEffect, useState } from 'react'
import { Sun, Moon, ChevronDown } from 'lucide-react'

interface AppSettings {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US' | 'ja-JP'
  autoLaunch: boolean
}

interface GeneralSettingsProps {
  settings: AppSettings
  onSettingsChange: (updates: Partial<AppSettings>) => void
}

const languages = [
  { value: 'zh-CN', label: '简体中文', native: '简体中文' },
  { value: 'en-US', label: 'English', native: 'English' },
  { value: 'ja-JP', label: 'Japanese', native: '日本語' }
]

export default function GeneralSettings({
  settings,
  onSettingsChange
}: GeneralSettingsProps): ReactElement {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const currentLanguage = languages.find((lang) => lang.value === settings.language) || languages[0]

  // 当主题变化时，立即更新 DOM 以预览效果
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.language-dropdown')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <div className="max-w-2xl space-y-8">
      {/* 外观设置 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">外观设置</h2>
        <div className="space-y-1">
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-foreground mb-1">主题模式</div>
              <div className="text-sm text-muted-foreground">选择应用的外观主题</div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onSettingsChange({ theme: 'light' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  settings.theme === 'light'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">浅色</span>
              </button>
              <button
                onClick={() => onSettingsChange({ theme: 'dark' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">深色</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 启动设置 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">启动设置</h2>
        <div className="space-y-1">
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-foreground mb-1">开机自启动</div>
              <div className="text-sm text-muted-foreground">系统启动时自动运行应用</div>
            </div>
            <button
              onClick={() => onSettingsChange({ autoLaunch: !settings.autoLaunch })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                settings.autoLaunch ? 'bg-primary' : 'bg-muted-foreground'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                  settings.autoLaunch ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 语言设置 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">语言设置</h2>
        <div className="relative language-dropdown">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium text-foreground">{currentLanguage.native}</div>
                <div className="text-sm text-muted-foreground">{currentLanguage.label}</div>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-lg z-50">
              <div className="py-2">
                {languages.map((language) => (
                  <button
                    key={language.value}
                    onClick={() => {
                      onSettingsChange({ language: language.value as AppSettings['language'] })
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors ${
                      language.value === settings.language ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-foreground">{language.native}</div>
                        <div className="text-sm text-muted-foreground">{language.label}</div>
                      </div>
                    </div>
                    {language.value === settings.language && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
