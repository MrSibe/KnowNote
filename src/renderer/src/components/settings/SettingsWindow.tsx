import { Globe, Database, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import GeneralSettings from './GeneralSettings'
import ProvidersSettings from './ProvidersSettings'
import AboutSettings from './AboutSettings'

export default function SettingsWindow() {
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

  const renderContent = () => {
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
        className="absolute top-0 left-0 right-0 h-8 z-10 flex items-center justify-center bg-[#212121]"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm text-gray-400 font-medium">设置</span>
      </div>

      {/* 左侧菜单 */}
      <div className="w-48 min-w-[12rem] border-r border-gray-800/50 p-2 pt-10">
        <div className="space-y-1">
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

      {/* 右侧内容 */}
      <div className="flex-1 min-w-[400px] overflow-y-auto p-6 pt-10">
        <div className="max-w-4xl">{renderContent()}</div>
      </div>
    </div>
  )
}
