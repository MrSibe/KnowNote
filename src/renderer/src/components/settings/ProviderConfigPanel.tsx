import { ReactElement, useState, useMemo } from 'react'
import { Search, Eye, EyeOff, ExternalLink, Download, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type Model, ModelType } from '../../../../shared/types'
import { categorizeModels } from '../../../../shared/utils/modelClassifier'

interface ProviderConfig {
  providerName: string
  config: Record<string, any>
  enabled: boolean
  updatedAt: number
}

interface ProviderConfigPanelProps {
  displayName: string
  description: string
  platformUrl: string
  provider: ProviderConfig
  models: Model[]
  isFetching: boolean
  onConfigChange: (config: Record<string, any>) => void
  onEnabledChange: (enabled: boolean) => void
  onFetchModels: () => void
}

export default function ProviderConfigPanel({
  displayName,
  description,
  platformUrl,
  provider,
  models,
  isFetching,
  onConfigChange,
  onEnabledChange,
  onFetchModels
}: ProviderConfigPanelProps): ReactElement {
  const { t } = useTranslation('settings')
  const [showApiKey, setShowApiKey] = useState(false)
  const [modelSearchQuery, setModelSearchQuery] = useState('')
  const [showCategory, setShowCategory] = useState<'all' | 'chat' | 'embedding' | 'other'>('all')

  const handleApiKeyChange = (apiKey: string) => {
    onConfigChange({ ...provider.config, apiKey })
  }

  const handleModelToggle = (modelId: string, checked: boolean) => {
    const currentModels = provider.config.models || []
    const newModels = checked
      ? [...currentModels, modelId]
      : currentModels.filter((m: string) => m !== modelId)
    onConfigChange({ ...provider.config, models: newModels })
  }

  // 对模型进行分类
  const categorized = useMemo(() => categorizeModels(models || []), [models])

  // 根据选中的分类和搜索条件过滤模型
  const filteredModels = useMemo(() => {
    let modelsToShow: Model[] = []

    if (showCategory === 'all') {
      modelsToShow = models || []
    } else if (showCategory === 'chat') {
      modelsToShow = categorized.chat
    } else if (showCategory === 'embedding') {
      modelsToShow = categorized.embedding
    } else if (showCategory === 'other') {
      modelsToShow = [...categorized.reranker, ...categorized.other]
    }

    // 应用搜索过滤
    return modelsToShow.filter((model) =>
      model.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
    )
  }, [models, categorized, showCategory, modelSearchQuery])

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 顶部标题和开关 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
          {provider.enabled && (
            <span className="px-2.5 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full border border-primary/30">
              {t('active')}
            </span>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={provider.enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* 描述 */}
      <p className="text-muted-foreground text-sm -mt-1">{description}</p>

      {/* API Key */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-foreground">{t('apiKey')}</h3>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={provider.config.apiKey || ''}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none border border-border focus:ring-2 focus:ring-inset focus:ring-ring pr-12"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-accent rounded-md transition-colors"
          >
            {showApiKey ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{t('getApiKeyFrom')}</span>
          <a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
          >
            {displayName} {t('platform')}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Models */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">{t('models')}</h3>
          <button
            onClick={onFetchModels}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 disabled:bg-secondary/50 text-secondary-foreground text-xs rounded-lg transition-colors"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{t('fetching')}</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                <span>{t('fetchModels')}</span>
              </>
            )}
          </button>
        </div>

        {models && models.length > 0 && (
          <>
            {/* 分类标签 */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowCategory('all')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  showCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t('allModels')} ({models.length})
              </button>
              <button
                onClick={() => setShowCategory('chat')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  showCategory === 'chat'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t('chatModels')} ({categorized.chat.length})
              </button>
              <button
                onClick={() => setShowCategory('embedding')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  showCategory === 'embedding'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t('embeddingModels')} ({categorized.embedding.length})
              </button>
              {(categorized.reranker.length > 0 || categorized.other.length > 0) && (
                <button
                  onClick={() => setShowCategory('other')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    showCategory === 'other'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {t('otherModels')} ({categorized.reranker.length + categorized.other.length})
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('searchModels')}
                value={modelSearchQuery}
                onChange={(e) => setModelSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none border border-border focus:ring-2 focus:ring-inset focus:ring-ring"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
              <p className="text-xs text-muted-foreground px-2 py-1">
                {showCategory === 'all'
                  ? t('totalModels', { count: models.length })
                  : t('showingModels', { count: filteredModels.length, total: models.length })}
              </p>
              {filteredModels.map((model) => (
                <label
                  key={model.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={provider.config.models?.includes(model.id) || false}
                    onChange={(e) => handleModelToggle(model.id, e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-foreground truncate">{model.id}</div>
                      {/* 显示模型类型标签 */}
                      {model.type && (
                        <span
                          className={`px-1.5 py-0.5 text-xs rounded ${
                            model.type === ModelType.CHAT
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                              : model.type === ModelType.EMBEDDING
                                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                : model.type === ModelType.RERANKER
                                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                  : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {model.type}
                        </span>
                      )}
                    </div>
                    {model.owned_by && (
                      <div className="text-xs text-muted-foreground">by {model.owned_by}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
