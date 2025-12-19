import { ProviderManager } from '../providers/ProviderManager'
import { SessionAutoSwitchService } from '../services/SessionAutoSwitchService'
import { KnowledgeService } from '../services/KnowledgeService'
import { UpdateService } from '../services/UpdateService'
import { MindMapService } from '../services/MindMapService'
import { registerChatHandlers } from './chatHandlers'
import { registerProviderHandlers } from './providerHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerNotebookHandlers } from './notebookHandlers'
import { registerNoteHandlers } from './noteHandlers'
import { registerKnowledgeHandlers } from './knowledgeHandlers'
import { registerMindMapHandlers } from './mindmapHandlers'
import { registerUpdateHandlers } from './updateHandlers'
import { registerItemHandlers } from './itemHandlers'

/**
 * 注册所有 IPC Handlers
 */
export function registerAllHandlers(
  providerManager: ProviderManager,
  sessionAutoSwitchService: SessionAutoSwitchService,
  knowledgeService: KnowledgeService,
  updateService: UpdateService
) {
  // 实例化 MindMapService
  const mindMapService = new MindMapService(providerManager)

  registerChatHandlers(providerManager, sessionAutoSwitchService, knowledgeService)
  registerProviderHandlers(providerManager)
  registerSettingsHandlers()
  registerNotebookHandlers()
  registerNoteHandlers(providerManager)
  registerKnowledgeHandlers(knowledgeService)
  registerMindMapHandlers(mindMapService)
  registerUpdateHandlers(updateService)
  registerItemHandlers()
  console.log('[IPC] All handlers registered')
}

export {
  registerChatHandlers,
  registerProviderHandlers,
  registerSettingsHandlers,
  registerNotebookHandlers,
  registerNoteHandlers,
  registerKnowledgeHandlers
}
