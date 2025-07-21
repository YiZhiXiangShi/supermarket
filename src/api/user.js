import request from '@/utils/request'

export function sendSms(phone) {
  return request({
    url: '/api/user/sendSms',
    method: 'get',
    params: { phone }
  })
}

export function login(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/user/info',
    method: 'get',
    params: { token }
  })
}


