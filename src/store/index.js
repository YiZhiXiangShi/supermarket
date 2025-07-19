import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user
  },
  getters
})

// 添加调试信息
console.log('Vuex store 初始化完成')
console.log('初始用户状态:', store.state.user)
console.log('初始用户名称:', store.getters.name)
console.log('初始token:', store.state.user.token)
console.log('初始name:', store.state.user.name)

export default store
