// 上货历史记录相关接口
import request from '@/utils/request'

// 分页查询上货历史记录
export function fetchStockHistoryList(params) {
  return request({
    url: '/stock/history/page',
    method: 'get',
    params
  })
}

// 直接使用axios获取完整响应（包含分页信息）
import axios from 'axios'

export function fetchStockHistoryListWithPagination(params) {
  return axios({
    url: process.env.VUE_APP_BASE_API + '/stock/history/page',
    method: 'get',
    params
  }).then(response => response.data)
}

// 根据商品条码查询上货历史记录
export function fetchStockHistoryByBarcode(barcodeNo) {
  return request({
    url: `/stock/history/barcode/${barcodeNo}`,
    method: 'get'
  })
}

// 根据操作员ID查询上货历史记录
export function fetchStockHistoryByOperator(operatorId) {
  return request({
    url: `/stock/history/operator/${operatorId}`,
    method: 'get'
  })
}

// 根据时间范围查询上货历史记录
export function fetchStockHistoryByTimeRange(startTime, endTime) {
  return request({
    url: '/stock/history/timerange',
    method: 'get',
    params: {
      startTime,
      endTime
    }
  })
}

// 插入上货历史记录
export function insertStockHistory(data) {
  return request({
    url: '/stock/history/insert',
    method: 'post',
    data
  })
}

// 批量插入上货历史记录
export function batchInsertStockHistory(data) {
  return request({
    url: '/stock/history/batchInsert',
    method: 'post',
    data
  })
}

// 删除上货历史记录
export function deleteStockHistory(id) {
  return request({
    url: `/stock/history/delete/${id}`,
    method: 'delete'
  })
}

// 批量删除上货历史记录
export function batchDeleteStockHistory(ids) {
  return request({
    url: '/stock/history/batchDelete',
    method: 'delete',
    data: { ids }
  })
} 