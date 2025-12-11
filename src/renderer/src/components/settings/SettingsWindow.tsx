import { Globe, Database, HelpCircle } from 'lucide-react'
import { useState, ReactElement } from 'react'
import GeneralSettings from './GeneralSettings'
import ProvidersSettings from './ProvidersSettings'
import AboutSettings from './AboutSettings'

export default function SettingsWindow(): ReactElement {
  const [activeSection, setActiveSection] = useState<string>('general')

  const menuItems = [
    {
      id: 'general',
      icon: Globe,
      label: '通用'
    },
    {
      id: 'provider',
      icon: Database,
      label: '提供商'
    },
    {
      id: 'about',
      icon: HelpCircle,
      label: '关于'
    }
  ]

  const renderContent = (): ReactElement | null => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />
      case 'provider':
        return <ProvidersSettings />
      case 'about':
        return <AboutSettings />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-[#212121]">
      {/* 顶部可拖拽标题栏 */}
      <div
        className="absolute top-0 left-0 right-0 h-10 z-10 flex items-center justify-center bg-[#212121]"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm text-gray-400 font-medium">设置</span>
      </div>

      {/* Island风格布局容器 */}
      <div className="flex w-full h-full pt-10 px-3 pb-3 gap-3">
        {/* 左侧菜单 - Island */}
        <div className="w-48 min-w-[12rem] bg-[#171717] rounded-xl p-4 flex flex-col">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-[#2a2a2a] text-gray-100'
                      : 'hover:bg-[#2a2a2a] text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 右侧内容 - Island */}
        <div className="flex-1 min-w-[600px] bg-[#171717] rounded-xl overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
