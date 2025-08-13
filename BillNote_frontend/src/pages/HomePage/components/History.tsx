import NoteHistory from '@/pages/HomePage/components/NoteHistory.tsx'
import { useTaskStore } from '@/store/taskStore'
import { Info, Clock, Download, Trash2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
const History = () => {
  const currentTaskId = useTaskStore(state => state.currentTaskId)
  const setCurrentTask = useTaskStore(state => state.setCurrentTask)
  const tasks = useTaskStore(state => state.tasks)
  const clearTasks = useTaskStore(state => state.clearTasks)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // 下载所有成功的Markdown文件
  const handleDownloadAll = () => {
    // 筛选出所有成功的任务
    const successTasks = tasks.filter(task => task.status === 'SUCCESS')
    
    if (successTasks.length === 0) {
      alert('没有可下载的笔记')
      return
    }
    
    // 为了符合谷歌浏览器的要求，我们需要在用户交互后才能触发下载
    // 使用setTimeout来分散下载请求，避免浏览器阻止多个下载
    successTasks.forEach((task, index) => {
      setTimeout(() => {
        // 获取Markdown内容
        let content = ''
        if (Array.isArray(task.markdown)) {
          // 如果是多版本，取最新的一个
          const latestVersion = [...task.markdown].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
          content = latestVersion.content
        } else {
          content = task.markdown
        }
        
        // 创建下载
        const name = task.audioMeta.title || `note_${index}`
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${name}.md`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
      }, index * 500) // 每个下载间隔500毫秒，避免浏览器阻止
    })
  }
  return (
    <>
      <div className={'flex h-full w-full flex-col gap-4 px-2.5 py-1.5'}>
        {/*生成历史    */}
        <div className="my-4 flex h-[40px] items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <h2 className="text-base font-medium text-neutral-900">生成历史</h2>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleDownloadAll} variant="ghost" size="sm" className="h-8 px-2">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>下载全部笔记</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>清空列表</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认清空列表</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将清空所有生成历史记录，无法恢复。确定要继续吗？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    clearTasks();
                    setIsDialogOpen(false);
                  }}>确认清空</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <ScrollArea className="w-full sm:h-[480px] md:h-[720px] lg:h-[92%]">
          {/*<div className="w-full flex-1 overflow-y-auto">*/}
          <NoteHistory onSelect={setCurrentTask} selectedId={currentTaskId} />
          {/*</div>*/}
        </ScrollArea>
      </div>
    </>
  )
}

export default History
