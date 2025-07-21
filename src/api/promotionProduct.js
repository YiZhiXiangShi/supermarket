import request from '@/utils/request'

const baseUrl = '/api/promotion-products'

// 查询所有活动，支持可选params参数
export function fetchPromotionProducts(params) {
  return request({
    url: baseUrl,
    method: 'get',
    params // 关键：这样barcode等参数才能拼到URL
  })
}

// 查询单个活动
export function fetchPromotionProduct(detailId) {
  return request({
    url: `${baseUrl}/${detailId}`,
    method: 'get'
  })
}

// 新增活动
export function createPromotionProduct(data) {
  return request({
    url: baseUrl,
    method: 'post',
    data
  })
}

// 修改活动
export function updatePromotionProduct(data) {
  return request({
    url: baseUrl,
    method: 'put',
    data
  })
}

// 删除活动
export function deletePromotionProduct(detailId) {
  return request({
    url: `${baseUrl}/${detailId}`,
    method: 'delete'
  })
} 