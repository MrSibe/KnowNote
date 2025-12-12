import { Settings, ChevronRight } from 'lucide-react'
import { ReactElement } from 'react'

export default function AboutSettings(): ReactElement {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-5 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <Settings className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-2 text-foreground">LiteBook</h2>
        <p className="text-sm text-muted-foreground">版本 1.0.0</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between p-3 bg-card rounded-lg">
          <span className="text-sm text-muted-foreground">更新日志</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex justify-between p-3 bg-card rounded-lg">
          <span className="text-sm text-muted-foreground">用户手册</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex justify-between p-3 bg-card rounded-lg">
          <span className="text-sm text-muted-foreground">意见反馈</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex justify-between p-3 bg-card rounded-lg">
          <span className="text-sm text-muted-foreground">检查更新</span>
          <span className="text-xs text-muted-foreground">已是最新版本</span>
        </div>
      </div>
    </div>
  )
}
