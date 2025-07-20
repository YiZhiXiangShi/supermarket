import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  const savedUserInfo = getUserInfo()
  const token = getToken()
  console.log('getDefaultState - 从本地存储获取的用户信息:', savedUserInfo)
  console.log('getDefaultState - 从本地存储获取的token:', token)
  
  // 确保employeeId是字符串类型
  const employeeId = savedUserInfo && savedUserInfo.employeeId ? savedUserInfo.employeeId.toString() : ''
  
  const state = {
    token: token || '',
    name: savedUserInfo ? savedUserInfo.name : '',
    avatar: savedUserInfo ? savedUserInfo.avatar : '',
    employeeId: employeeId,
    photo: savedUserInfo ? savedUserInfo.photo : '',
    operatorLevel: savedUserInfo ? savedUserInfo.operatorLevel : null
  }
  console.log('getDefaultState - 返回的状态:', state)
  return state
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  RESET_STATE_WITHOUT_RESTORE: (state) => {
    // 直接重置状态，不从本地存储恢复
    state.token = ''
    state.name = ''
    state.avatar = ''
    state.employeeId = ''
    state.photo = ''
    state.operatorLevel = null
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_EMPLOYEE_ID: (state, employeeId) => {
    state.employeeId = employeeId
  },
  SET_PHOTO: (state, photo) => {
    state.photo = photo
  },
  SET_OPERATOR_LEVEL: (state, operatorLevel) => {
    state.operatorLevel = operatorLevel
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    console.log('=== 用户状态管理 - 开始登录 ===')
    console.log('登录参数:', { username: username.trim(), password: password })
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        //获取token和用户信息
        // 响应拦截器已经返回了 res.data，所以这里直接使用 response
        const { token, employeeId, name, photo, operatorLevel } = response
        console.log('登录响应原始数据:', response)
        console.log('登录响应employeeId类型:', typeof employeeId, employeeId)
        console.log('登录响应operatorLevel:', operatorLevel)

        //存储token
        commit('SET_TOKEN', token)
        setToken(token)
        
        // 确保employeeId是字符串类型
        const employeeIdStr = employeeId ? employeeId.toString() : ''
        
        //存储用户信息到本地存储
        const userInfoToSave = { 
          employeeId: employeeIdStr, 
          name: name || '', 
          photo: photo || '', 
          avatar: '',
          operatorLevel: operatorLevel || null
        }
        console.log('登录时保存的用户信息:', userInfoToSave)
        console.log('登录时保存的用户信息类型:', typeof userInfoToSave.employeeId)
        setUserInfo(userInfoToSave)
        console.log('登录后从本地存储读取的用户信息:', getUserInfo())
        console.log('登录后从本地存储读取的用户信息类型:', typeof getUserInfo()?.employeeId)
        
        //存储用户信息到状态
        commit('SET_EMPLOYEE_ID', employeeIdStr)
        commit('SET_NAME', name)
        commit('SET_PHOTO', photo)
        commit('SET_OPERATOR_LEVEL', operatorLevel)
        
        console.log('登录后Vuex状态:', { employeeId: employeeIdStr, name, photo })
        console.log('=== 用户状态管理 - 登录成功，准备resolve ===')
        resolve(response)
      
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar, employeeId, photo } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_EMPLOYEE_ID', employeeId)
        commit('SET_PHOTO', photo)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
        removeToken() // must remove  token  first
        removeUserInfo() // must remove user info
        resetRouter()
        commit('RESET_STATE_WITHOUT_RESTORE')
        resolve()
      
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      removeUserInfo() // must remove user info
      // 直接重置状态，不从本地存储恢复
      commit('RESET_STATE_WITHOUT_RESTORE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

