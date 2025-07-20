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

/**
 * 创建订单并扣减库存
 * @param {Object} data 订单数据
 * @returns {Promise}
 */
export function createOrder(data) {
  return request({
    url: '/cashier/createOrder',
    method: 'post',
    data
  })
} 