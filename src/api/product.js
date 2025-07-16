// 商品管理相关接口
import request from '@/utils/request'

export function fetchProductList(params) {
  return request({
    url: '/product/list',
    method: 'get',
    params
  })
} 