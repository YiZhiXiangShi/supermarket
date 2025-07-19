// 销售管理相关接口
import request from '@/utils/request'

export function fetchSaleList(data) {
  return request({
    url: '/sale',
    method: 'post',
    data
  })
} 

export function findSalename(type) {
  console.log('API调用参数:', type);
  
  // 使用URLSearchParams发送表单数据
  const formData = new URLSearchParams();
  formData.append('type', type);
  
  console.log('发送的表单数据:', formData.toString());
  
  return request({
    url: '/salefind',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(response => {
    console.log('API响应:', response);
    return response;
  }).catch(error => {
    console.error('API错误:', error);
    throw error;
  });
}