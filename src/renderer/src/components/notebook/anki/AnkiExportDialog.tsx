import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnkiStore } from '../../../store/ankiStore'
import type { AnkiCardItem } from '../../../../../shared/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { Download, FileDown } from 'lucide-react'

export default function AnkiExportDialog() {
  const { t } = useTranslation('anki')
  const { currentAnkiCards, isExportDialogOpen, setExportDialogOpen } = useAnkiStore()

  const [isExporting, setIsExporting] = useState(false)

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen && isExporting) return
    setExportDialogOpen(newOpen)
  }

  const handleExport = async () => {
    if (!currentAnkiCards) return

    setIsExporting(true)
    try {
      // 打开系统保存文件对话框
      const filePath = await window.api.dialog.saveFile({
        title: t('exportCards'),
        defaultPath: `${currentAnkiCards.title || 'anki-cards'}.apkg`,
        filters: [
          {
            name: 'Anki Package',
            extensions: ['apkg']
          }
        ]
      })

      if (!filePath) {
        // 用户取消了保存
        setIsExporting(false)
        return
      }

      // 调用导出API
      const result = await window.api.anki.exportToPath(currentAnkiCards.id, filePath)

      if (result.success) {
        // 导出成功，关闭对话框
        setExportDialogOpen(false)
      } else {
        console.error('Export failed:', result.error)
        alert(t('exportFailed', { error: result.error }))
      }
    } catch (error) {
      console.error('Failed to export cards:', error)
      alert(t('exportFailed', { error: (error as Error).message }))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isExportDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t('exportCards')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 导出格式 */}
          <div className="space-y-2">
            <Label>{t('exportFormat')}</Label>
            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
              <FileDown className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">Anki Package (.apkg)</div>
                <div className="text-sm text-muted-foreground">{t('apkgFormatDesc')}</div>
              </div>
            </div>
          </div>

          {/* 卡片数量 */}
          <div className="text-sm text-muted-foreground">
            {t('totalCards')}: {(currentAnkiCards?.cardsData as AnkiCardItem[])?.length || 0}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !currentAnkiCards}>
            {isExporting ? t('exporting') : t('selectLocation')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
