import request from '@/utils/request'

const baseUrl = '/api/promotion-types'

// 查询所有活动类型
export function fetchPromotionTypes() {
  return request({
    url: baseUrl,
    method: 'get'
  })
}

// 查询单个活动类型
export function fetchPromotionType(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

// 新增活动类型
export function createPromotionType(data) {
  return request({
    url: baseUrl,
    method: 'post',
    data
  })
}

// 修改活动类型
export function updatePromotionType(data) {
  return request({
    url: baseUrl,
    method: 'put',
    data
  })
}

// 删除活动类型
export function deletePromotionType(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
} 
export function fetchPromotionTypeList() {
  return request({
    url:'/api/promotion-types',
    method: 'get'
  })
}