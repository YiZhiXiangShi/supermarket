// 收银管理相关接口
import request from '@/utils/request'

export function findAll() {
  return request({
    url: '/cashier/findAll',
    method: 'get'
  })
}

export function find(barCode) {
  return request({
    url: '/cashier/find',
    method: 'get',
    params: { barCode }
  })
} 