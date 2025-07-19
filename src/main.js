import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control
import dialogDrag from '@/directives/dialogDrag'

// 导入axios实例
import request from '@/utils/request'
// 立即导入路由守卫，确保在应用启动时就生效
import '@/permission'

if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
//Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
 Vue.use(ElementUI)

Vue.config.productionTip = false

Vue.directive('dialogDrag', dialogDrag)

// 将axios实例挂载到Vue原型上
Vue.prototype.$http = request

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
