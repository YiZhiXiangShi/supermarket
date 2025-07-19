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

    if (store.getters.token) {
      config.headers['token'] = getToken()
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
  
    if (res.code !== 200) {
      Message({
        message: res.message || res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      
      return Promise.reject(new Error(res.message || res.msg || 'Error'))
    } else {
      // 请求成功，处理token
      if (res.data && res.data.token) {
        console.log(`Token 更新: ${res.data.token}`)
        setToken(res.data.token)           // 存储到 Cookie
        store.commit('user/SET_TOKEN', res.data.token)  // 存储到 Vuex
      }
    }
    
    // 返回响应数据，让调用方自己处理
    return res.data || res
  },
  error => {
    console.log('err' + error)
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
export default service