import { ProviderManager } from '../providers/ProviderManager'
import { SessionAutoSwitchService } from '../services/SessionAutoSwitchService'
import { KnowledgeService } from '../services/KnowledgeService'
import { UpdateService } from '../services/UpdateService'
import { MindMapService } from '../services/MindMapService'
import { ShortcutManager } from '../services/ShortcutManager'
import type Store from 'electron-store'
import type { StoreSchema } from '../config/types'
import { registerChatHandlers } from './chatHandlers'
import { registerProviderHandlers } from './providerHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerNotebookHandlers } from './notebookHandlers'
import { registerNoteHandlers } from './noteHandlers'
import { registerKnowledgeHandlers } from './knowledgeHandlers'
import { registerMindMapHandlers } from './mindmapHandlers'
import { registerUpdateHandlers } from './updateHandlers'
import { registerItemHandlers } from './itemHandlers'
import { registerShortcutHandlers } from './shortcutHandlers'

/**
 * 注册所有 IPC Handlers
 */
export function registerAllHandlers(
  providerManager: ProviderManager,
  sessionAutoSwitchService: SessionAutoSwitchService,
  knowledgeService: KnowledgeService,
  updateService: UpdateService,
  shortcutManager: ShortcutManager,
  store: Store<StoreSchema>
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
  registerShortcutHandlers(shortcutManager, store)
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
