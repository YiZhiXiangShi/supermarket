// 上货管理相关接口
import request from '@/utils/request'

export function fetchStockList(params) {
  return request({
    url: '/stock/list',
    method: 'get',
    params
  })
} 