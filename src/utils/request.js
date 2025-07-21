import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken, setToken, removeToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: '/api', 
  timeout: 5000 // request timeout
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params
    })

    // 从store或cookie获取token
    const token = store.getters.token || getToken()
    console.log('请求拦截器 - 获取到的token:', token)
    
    if (token) {
      config.headers['token'] = token
      console.log('请求拦截器 - 设置token到请求头:', token)
    } else {
      console.log('请求拦截器 - 未找到token')
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)
// 响应拦截器
service.interceptors.response.use(
  response => {
    // 如果是blob类型（文件下载），直接返回完整响应
    if (response.config.responseType === 'blob') {
      return response;
    }
    
    const res = response.data
    console.log('响应拦截器 - 原始响应:', res)
    
    // 处理业务错误码 - 只有当响应包含code字段时才进行错误检查
    if (res && typeof res.code !== 'undefined') {
      if (res.code !== 0 && res.code !== 200) {
        const errorMessage = res.msg || res.message || 'Error'
        Message({
          message: errorMessage,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(new Error(errorMessage))
      }
    }
    
    // 处理token - 从data字段中提取token
    if (res && res.data && res.data.token) {
      const token = res.data.token
      console.log(`Token 更新: ${token}`)
      setToken(token)           // 存储到 Cookie
      store.commit('user/SET_TOKEN', token)  // 存储到 Vuex
    }
    
    // 对于分页数据，返回包含data和count的对象
    if (res && typeof res.count !== 'undefined') {
      return {
        data: res.data,
        count: res.count
      }
    }
    // 对于普通数据，返回data字段
    return res.data || res
  },
  error => {
    console.log('err' + error)
    
    // 处理HTTP错误状态码
    if (error.response) {
      const { status, data } = error.response
      console.error('HTTP错误:', status, data)
      
      let errorMessage = '请求失败'
      
      // 根据状态码显示不同的错误信息
      switch (status) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 502:
          errorMessage = '网关错误'
          break
        case 503:
          errorMessage = '服务不可用'
          break
        case 504:
          errorMessage = '网关超时'
          break
        default:
          errorMessage = `连接错误${status}`
      }
      
      // 如果后端返回了具体的错误信息，使用后端的错误信息
      if (data && data.message) {
        errorMessage = data.message
      } else if (data && data.error) {
        errorMessage = data.error
      }
      
      Message({
        message: errorMessage,
        type: 'error',
        duration: 5 * 1000
      })
    } else if (error.request) {
      // 请求已发出但没有收到响应
      Message({
        message: '网络错误，请检查网络连接',
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      // 其他错误
      Message({
        message: error.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
    }
    
    return Promise.reject(error)
  }
)
export default service