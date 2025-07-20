// 商品管理相关接口
import request from '@/utils/request'

// 查询商品列表
export function fetchProductList(params) {
  return request({
    url: '/product/list',
    method: 'post',
    data: params || {}
  })
}

// 根据ID查询商品
export function fetchProductById(serialNo) {
  return request({
    url: '/product/find',
    method: 'get',
    params: { serialNo }
  })
}

// 新增商品
export function addProduct(data) {
  return request({
    url: '/product/add',
    method: 'post',
    data
  })
}

// 修改商品
export function updateProduct(data) {
  return request({
    url: '/product/update',
    method: 'post',
    data
  })
}

// 删除商品
export function deleteProduct(serialNo) {
  return request({
    url: `/product/delete/${serialNo}`,
    method: 'delete'
  })
} 