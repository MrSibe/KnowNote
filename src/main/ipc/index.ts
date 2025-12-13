import { ProviderManager } from '../providers/ProviderManager'
import { SessionAutoSwitchService } from '../services/SessionAutoSwitchService'
import { KnowledgeService } from '../services/KnowledgeService'
import { registerChatHandlers } from './chatHandlers'
import { registerProviderHandlers } from './providerHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerNotebookHandlers } from './notebookHandlers'
import { registerNoteHandlers } from './noteHandlers'
import { registerKnowledgeHandlers } from './knowledgeHandlers'

/**
 * 注册所有 IPC Handlers
 */
export function registerAllHandlers(
  providerManager: ProviderManager,
  sessionAutoSwitchService: SessionAutoSwitchService,
  knowledgeService: KnowledgeService
) {
  registerChatHandlers(providerManager, sessionAutoSwitchService, knowledgeService)
  registerProviderHandlers(providerManager)
  registerSettingsHandlers()
  registerNotebookHandlers()
  registerNoteHandlers(providerManager)
  registerKnowledgeHandlers(knowledgeService)
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
