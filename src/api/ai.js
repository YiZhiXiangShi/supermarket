// 智能AI相关接口
import request from '@/utils/request'

export function sendMessage(message) {
  // 这里可以对接后端AI接口，当前先模拟回复
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: 'AI回复：' + message
      })
    }, 1000)
  })
}

export function chat2(msg, chatId) {
  return request({
    url: '/chat/v2',
    method: 'get',
    params: { msg, chatId }
  })
} 