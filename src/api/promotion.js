// 促销活动管理相关接口
import request from '@/utils/request'

export function fetchPromotionList(params) {
  return request({
    url: '/promotion/list',
    method: 'get',
    params
  })
} 