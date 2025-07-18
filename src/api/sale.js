// 销售管理相关接口
import request from '@/utils/request'

export function fetchSaleList(data) {
  return request({
    url: '/sale',
    method: 'post',
    data
  })
} 