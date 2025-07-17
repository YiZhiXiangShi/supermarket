import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

//路由之前进行拦截
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // 获取token
  const hasToken = getToken()

  next()

  //判断是否有token
  /*
  if (hasToken) {
    
    //有token
    
    if (to.path === '/login') {
       //如果有token,并且访问的是登录的路由，重定向到首页
      next({ path: '/' })
      NProgress.done()
    } else {

      //有token，并且访问的不是登录组件的路由

      //获取用户信息
      const hasGetUserInfo = store.getters.name
      
      //判断是否有用户信息，如果有直接放行
      if (hasGetUserInfo) {
        //放行
        next()
      } else {

        //已经登录，但是没有用户信息

        try {
          //向服务器发起请求获取用户信息
          await store.dispatch('user/getInfo')
          //放行
          next()
        } catch (error) {
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }


    }


  } else {

    //没有token

    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      //跳转到登录组件
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
  */


})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
