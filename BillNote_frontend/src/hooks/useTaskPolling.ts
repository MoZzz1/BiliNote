// 添加对批量任务的支持
// 这里需要根据实际的hooks文件结构进行修改
// 主要是处理返回的task_ids数组，并为每个任务创建轮询

// 示例修改思路：
// 1. 在任务存储中添加批量任务的概念
// 2. 当收到批量任务响应时，将所有task_id存储并开始轮询
// 3. 在UI中显示批量任务的整体进度
import { useEffect, useRef } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { get_task_status } from '@/services/note.ts'
import toast from 'react-hot-toast'

export const useTaskPolling = (interval = 3000) => {
  const tasks = useTaskStore(state => state.tasks)
  const updateTaskContent = useTaskStore(state => state.updateTaskContent)
  const updateTaskStatus = useTaskStore(state => state.updateTaskStatus)
  const removeTask = useTaskStore(state => state.removeTask)

  const tasksRef = useRef(tasks)

  // 每次 tasks 更新，把最新的 tasks 同步进去
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    const timer = setInterval(async () => {
      const pendingTasks = tasksRef.current.filter(
        task => task.status != 'SUCCESS' && task.status != 'FAILED'
      )

      for (const task of pendingTasks) {
        try {
          console.log('🔄 正在轮询任务：', task.id)
          const res = await get_task_status(task.id)
          const { status } = res

          if (status && status !== task.status) {
            if (status === 'SUCCESS') {
              const { markdown, transcript, audio_meta } = res.result
              toast.success('笔记生成成功')
              updateTaskContent(task.id, {
                status,
                markdown,
                transcript,
                audioMeta: audio_meta,
              })
            } else if (status === 'FAILED') {
              updateTaskContent(task.id, { status })
              console.warn(`⚠️ 任务 ${task.id} 失败`)
            } else {
              updateTaskContent(task.id, { status })
            }
          }
        } catch (e) {
          console.error('❌ 任务轮询失败：', e)
          // toast.error(`生成失败 ${e.message || e}`)
          updateTaskContent(task.id, { status: 'FAILED' })
          // removeTask(task.id)
        }
      }
    }, interval)

    return () => clearInterval(timer)
  }, [interval])
}
