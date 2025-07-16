// 收银管理相关接口
import request from '@/utils/request'

export function fetchCashierList(params) {
  return request({
    url: '/cashier/list',
    method: 'get',
    params
  })
} 