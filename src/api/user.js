import request from '@/utils/request'

export function sendSms(phone) {
  return request({
    url: '/user/sendSms',
    method: 'get',
    params: { phone }
  })
}

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}


