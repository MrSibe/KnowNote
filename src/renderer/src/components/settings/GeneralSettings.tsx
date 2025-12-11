export default function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-3 text-gray-100">启动设置</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#171717] rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-100">开机自启动</div>
              <div className="text-xs text-gray-400">系统启动时自动运行应用</div>
            </div>
            <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#333] transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-3 text-gray-100">语言设置</h3>
        <select className="w-full p-3 bg-[#171717] rounded-lg text-sm border border-gray-700 focus:border-gray-600 outline-none text-gray-100">
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>
    </div>
  )
}
