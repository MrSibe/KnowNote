import { Settings, X, ChevronRight, Globe, Database, Palette, Bell, HelpCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string>('general')

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  const menuItems = [
    {
      id: 'general',
      icon: Globe,
      label: '常规设置',
      description: '基本应用设置'
    },
    {
      id: 'data',
      icon: Database,
      label: '数据管理',
      description: '存储和备份设置'
    },
    {
      id: 'appearance',
      icon: Palette,
      label: '外观设置',
      description: '主题和显示选项'
    },
    {
      id: 'notifications',
      icon: Bell,
      label: '通知设置',
      description: '提醒和通知偏好'
    },
    {
      id: 'about',
      icon: HelpCircle,
      label: '关于',
      description: '应用信息和帮助'
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3">启动设置</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <div className="text-sm font-medium">开机自启动</div>
                    <div className="text-xs text-gray-400">系统启动时自动运行应用</div>
                  </div>
                  <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#333] transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-3">语言设置</h3>
              <select className="w-full p-3 bg-[#1a1a1a] rounded-lg text-sm border border-[#333] focus:border-[#555] outline-none">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
              </select>
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3">存储位置</h3>
              <div className="p-3 bg-[#1a1a1a] rounded-lg">
                <div className="text-sm text-gray-300 mb-2">数据存储路径：</div>
                <div className="text-xs text-gray-400 font-mono bg-[#0a0a0a] p-2 rounded">
                  /Users/yangyuhao/mywork/litebook/data
                </div>
                <button className="mt-2 text-xs text-blue-400 hover:text-blue-300">
                  更改位置
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-3">备份设置</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <div className="text-sm font-medium">自动备份</div>
                    <div className="text-xs text-gray-400">每天自动备份数据</div>
                  </div>
                  <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-5"></span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-3">数据管理</h3>
              <div className="space-y-2">
                <button className="w-full p-3 bg-[#1a1a1a] rounded-lg text-left hover:bg-[#2a2a2a] transition-colors">
                  <div className="text-sm font-medium">导出数据</div>
                  <div className="text-xs text-gray-400">将所有笔记导出为文件</div>
                </button>
                <button className="w-full p-3 bg-[#1a1a1a] rounded-lg text-left hover:bg-[#2a2a2a] transition-colors">
                  <div className="text-sm font-medium">清理缓存</div>
                  <div className="text-xs text-gray-400">删除临时文件和缓存</div>
                </button>
              </div>
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3">主题设置</h3>
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 bg-[#1a1a1a] rounded-lg border-2 border-blue-500">
                  <div className="text-xs font-medium">深色</div>
                  <div className="text-xs text-gray-400">默认</div>
                </button>
                <button className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333] hover:border-[#555]">
                  <div className="text-xs font-medium">浅色</div>
                  <div className="text-xs text-gray-400">明亮</div>
                </button>
                <button className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333] hover:border-[#555]">
                  <div className="text-xs font-medium">自动</div>
                  <div className="text-xs text-gray-400">跟随系统</div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-3">字体设置</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-300 mb-2">字体大小</div>
                  <input type="range" min="12" max="20" defaultValue="14" className="w-full" />
                </div>
                <div>
                  <div className="text-sm text-gray-300 mb-2">字体系列</div>
                  <select className="w-full p-2 bg-[#1a1a1a] rounded-lg text-sm border border-[#333] focus:border-[#555] outline-none">
                    <option value="system">系统默认</option>
                    <option value="sans">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3">通知设置</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <div className="text-sm font-medium">桌面通知</div>
                    <div className="text-xs text-gray-400">显示系统通知</div>
                  </div>
                  <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#333] transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <div className="text-sm font-medium">声音提醒</div>
                    <div className="text-xs text-gray-400">操作时播放提示音</div>
                  </div>
                  <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-5"></span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-3">提醒设置</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <div className="text-sm font-medium">定时保存提醒</div>
                    <div className="text-xs text-gray-400">提醒保存未保存的更改</div>
                  </div>
                  <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-5"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-medium mb-2">LiteBook</h2>
              <p className="text-sm text-gray-400">版本 1.0.0</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-[#1a1a1a] rounded-lg">
                <span className="text-sm text-gray-400">更新日志</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex justify-between p-3 bg-[#1a1a1a] rounded-lg">
                <span className="text-sm text-gray-400">用户手册</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex justify-between p-3 bg-[#1a1a1a] rounded-lg">
                <span className="text-sm text-gray-400">意见反馈</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex justify-between p-3 bg-[#1a1a1a] rounded-lg">
                <span className="text-sm text-gray-400">检查更新</span>
                <span className="text-xs text-gray-500">已是最新版本</span>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 设置面板 - 可移动窗口 */}
      <div
        ref={panelRef}
        className="absolute bg-[#0a0a0a] rounded-lg shadow-2xl overflow-hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '800px',
          height: '600px'
        }}
      >
        {/* 头部 - 可拖拽区域 */}
        <div
          className="flex items-center justify-between p-4 border-b border-[#2a2a2a] cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-medium">设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧菜单 */}
          <div className="w-48 border-r border-[#2a2a2a] p-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-[#2a2a2a] text-white'
                        : 'hover:bg-[#1a1a1a] text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}