import { ipcMain } from 'electron'
import { createNote, getNotesByNotebook, getNoteById, updateNote, deleteNote } from '../db/queries'
import { ProviderManager } from '../providers/ProviderManager'
import Logger from '../../shared/utils/logger'

/**
 * Generate note title using AI
 */
async function generateNoteTitle(
  providerManager: ProviderManager,
  content: string
): Promise<string> {
  try {
    const provider = await providerManager.getActiveProvider()
    if (!provider) {
      return 'Untitled Note'
    }

    let generatedTitle = ''

    await provider.sendMessageStream(
      [
        {
          role: 'system',
          content:
            "You are a title generation assistant. Please generate a concise title based on the user's content, no more than 20 characters, without using quotes or other symbols to wrap it."
        },
        {
          role: 'user',
          content: `Please generate a title for the following content:\n\n${content.slice(0, 500)}`
        }
      ],
      (chunk) => {
        generatedTitle += chunk.content
      },
      (error) => {
        Logger.error('NoteHandlers', 'Failed to generate title:', error)
      },
      () => {
        // Complete
      }
    )

    return generatedTitle.trim() || 'Untitled Note'
  } catch (error) {
    Logger.error('NoteHandlers', 'Error in generateNoteTitle:', error)
    return 'Untitled Note'
  }
}

/**
 * Register note-related IPC handlers
 */
export function registerNoteHandlers(providerManager: ProviderManager) {
  // Create note
  ipcMain.handle(
    'create-note',
    async (_event, notebookId: string, content: string, customTitle?: string) => {
      Logger.debug('NoteHandlers', 'create-note:', { notebookId, hasCustomTitle: !!customTitle })

      try {
        // If no title provided, use AI to generate
        const title = customTitle || (await generateNoteTitle(providerManager, content))
        const note = createNote(notebookId, title, content)
        Logger.debug('NoteHandlers', 'Note created successfully:', note.id)
        return note
      } catch (error) {
        Logger.error('NoteHandlers', 'Error creating note:', error)
        throw error
      }
    }
  )

  // Get all notes in notebook
  ipcMain.handle('get-notes', async (_event, notebookId: string) => {
    Logger.debug('NoteHandlers', 'get-notes:', notebookId)
    try {
      const notes = getNotesByNotebook(notebookId)
      Logger.debug('NoteHandlers', `Retrieved ${notes.length} notes`)
      return notes
    } catch (error) {
      Logger.error('NoteHandlers', 'Error getting notes:', error)
      throw error
    }
  })

  // Get single note
  ipcMain.handle('get-note', async (_event, id: string) => {
    Logger.debug('NoteHandlers', 'get-note:', id)
    try {
      const note = getNoteById(id)
      return note
    } catch (error) {
      Logger.error('NoteHandlers', 'Error getting note:', error)
      throw error
    }
  })

  // Update note
  ipcMain.handle('update-note', async (_event, id: string, updates: any) => {
    Logger.debug('NoteHandlers', 'update-note:', { id, updates })
    try {
      updateNote(id, updates)
      Logger.debug('NoteHandlers', 'Note updated successfully:', id)
      return { success: true }
    } catch (error) {
      Logger.error('NoteHandlers', 'Error updating note:', error)
      throw error
    }
  })

  // Delete note
  ipcMain.handle('delete-note', async (_event, id: string) => {
    Logger.debug('NoteHandlers', 'delete-note:', id)
    try {
      deleteNote(id)
      Logger.debug('NoteHandlers', 'Note deleted successfully:', id)
      return { success: true }
    } catch (error) {
      Logger.error('NoteHandlers', 'Error deleting note:', error)
      throw error
    }
  })
}
