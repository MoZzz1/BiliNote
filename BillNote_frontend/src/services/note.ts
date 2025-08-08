import request from '@/utils/request'
import toast from 'react-hot-toast'

export const generateNote = async (data: {
  video_url: string
  platform: string
  quality: string
  model_name: string
  provider_id: string
  task_id?: string
  format: Array<string>
  style: string
  extras?: string
  video_understand?: boolean
  video_interval?: number
  grid_size: Array<number>
  batch_download?: boolean
  max_p_number?: number
  start_p_number?: number
}) => {
  try {
    console.log('generateNote full data:', data)
    console.log('start_p_number:', data.start_p_number)
    const response = await request.post('/generate_note', data)

    if (!response) {
      if (response.data.msg) {
        toast.error(response.data.msg)
      }
      return null
    }
    
    if (data.batch_download && data.platform === 'bilibili') {
      // 确保start_p_number和max_p_number是数字类型
      const startP = typeof data.start_p_number === 'number' ? data.start_p_number : (data.start_p_number ? Number(data.start_p_number) : 1);
      const endP = typeof data.max_p_number === 'number' ? data.max_p_number : (data.max_p_number ? Number(data.max_p_number) : 1);
      console.log('批量下载任务提示 - startP:', startP, 'endP:', endP);
      toast.success(`批量下载任务已提交！将下载从P${startP}到P${endP}的视频`)
    } else {
      toast.success('笔记生成任务已提交！')
    }

    console.log('res', response)

    return response
  } catch (e: any) {
    console.error('❌ 请求出错', e)
    throw e // 抛出错误以便调用方处理
  }
}

export const delete_task = async ({ video_id, platform }) => {
  try {
    const data = {
      video_id,
      platform,
    }
    const res = await request.post('/delete_task', data)


      toast.success('任务已成功删除')
      return res
  } catch (e) {
    toast.error('请求异常，删除任务失败')
    console.error('❌ 删除任务失败:', e)
    throw e
  }
}

export const get_task_status = async (task_id: string) => {
  try {
    // 成功提示

    return await request.get('/task_status/' + task_id)
  } catch (e) {
    console.error('❌ 请求出错', e)

    // 错误提示
    toast.error('笔记生成失败，请稍后重试')

    throw e // 抛出错误以便调用方处理
  }
}
