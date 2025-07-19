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
// 响应拦截器// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
<<<<<<< HEAD
  
    if (res.code !== 200) {
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
=======
    
    // 处理业务错误码
    if (res && typeof res.code !== 'undefined') {
      if (res.code !== 0 && res.code !== 200) {
        Message({
          message: res.msg || res.message || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(new Error(res.msg || res.message || 'Error'))
>>>>>>> aba7be8bb249bd5cd134bcaf8f6638b7a4eb4886
      }
    }
    
    // 保留 token 处理逻辑，但增加条件判断
    const { token } = res || {}
    if (token) {
      console.log(`Token 更新: ${token}`)
      setToken(token)           // 存储到 Cookie
      store.commit('user/SET_TOKEN', token)  // 存储到 Vuex
    }
    
    // 根据后端返回结构决定返回 res 还是 res.data
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