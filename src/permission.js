import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken, getUserInfo } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

//路由之前进行拦截 - 已禁用
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  console.log('=== 路由守卫已禁用，直接放行 ===')
  console.log('目标路径:', to.path)
  console.log('来源路径:', from.path)

  // 直接放行所有路由，不再进行登录检查
  next()
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
