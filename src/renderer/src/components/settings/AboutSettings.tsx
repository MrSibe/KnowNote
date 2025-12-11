import { Settings, ChevronRight } from 'lucide-react'

export default function AboutSettings() {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-medium mb-2 text-gray-100">LiteBook</h2>
        <p className="text-sm text-gray-400">版本 1.0.0</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between p-3 bg-[#171717] rounded-lg">
          <span className="text-sm text-gray-400">更新日志</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex justify-between p-3 bg-[#171717] rounded-lg">
          <span className="text-sm text-gray-400">用户手册</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex justify-between p-3 bg-[#171717] rounded-lg">
          <span className="text-sm text-gray-400">意见反馈</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex justify-between p-3 bg-[#171717] rounded-lg">
          <span className="text-sm text-gray-400">检查更新</span>
          <span className="text-xs text-gray-500">已是最新版本</span>
        </div>
      </div>
    </div>
  )
}
