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
    // 暂时注释掉token验证，避免影响API请求
    /*
    if (store.getters.token) {
      config.headers['token'] = getToken()
    }
    */
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
    const res = response.data
    console.log('API响应:', res) // 添加调试日志
  
    if (res.code !== 200 && res.code !== 0) {
      Message({
        message: res.message || res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      
      return Promise.reject(new Error(res.message || res.msg || 'Error'))
    } else {

      //请求成功  存储后端生成的新的token
      const { token } = res

       if (token != null) {
        console.log(token + '---------------------------------')
        // 设置token到cookie中
        setToken(token)
        // 设置token到 state状态管理对象中
        store.commit('user/SET_TOKEN', token)
      }
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
