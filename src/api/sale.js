// 销售管理相关接口
import request from '@/utils/request'

export function fetchSaleList(params) {
  return request({
    url: '/sale/list',
    method: 'get',
    params
  })
} 