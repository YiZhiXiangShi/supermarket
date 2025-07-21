import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


import Layout from '@/layout'


export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard', // 保证根路径直接跳转到后台首页
    children: [{
      path: 'dashboard',
      name: '首页',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },
  {
    path: '/employee',
    component: Layout,
    redirect: '/employee/list',
    name: 'employee',
    meta: { title: '员工管理', icon: 'el-icon-user' },
    children: [
      {
        path: 'list',
        name: 'employee-list',
        component: () => import('@/views/employee/index'),
        meta: { title: '员工管理', icon: 'el-icon-user' }
      }
    ]
  },
  {
    path: '/product',
    component: Layout,
    redirect: '/product/list',
    name: 'product',
    meta: { title: '商品管理', icon: 'el-icon-goods' },
    children: [
      {
        path: 'list',
        name: 'product-list',
        component: () => import('@/views/product/index'),
        meta: { title: '商品管理', icon: 'el-icon-goods' }
      }
    ]
  },
  {
    path: '/sale',
    component: Layout,
    redirect: '/sale/list',
    name: 'sale',
    meta: { title: '销售管理', icon: 'el-icon-sold-out' },
    children: [
      {
        path: 'type',
        name: 'promotion-type-list',
        component: () => import('@/views/sale/index'),
        meta: { title: '销售报表管理' }
      },
      {
        path: 'product',
        name: 'promotion-product-list',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '销售订单管理' }
      }
    ]
  },
  {
    path: '/promotion',
    component: Layout,
    redirect: '/promotion/list',
    name: 'promotion',
    meta: { title: '促销活动管理', icon: 'el-icon-present' },
    children: [
      {
        path: 'type',
        name: 'promotion-type-list',
        component: () => import('@/views/promotionType/index.vue'),
        meta: { title: '活动类型管理' }
      },
      {
        path: 'product',
        name: 'promotion-product-list',
        component: () => import('@/views/promotionProduct/index.vue'),
        meta: { title: '活动商品管理' }
      }
    ]
  },
  {
    path: '/stock',
    component: Layout,
    redirect: '/stock/list',
    name: 'stock',
    meta: { title: '上货管理', icon: 'el-icon-box' },
    children: [
      {
        path: 'list',
        name: 'stock-list',
        component: () => import('@/views/stock/index'),
        meta: { title: '上货管理', icon: 'el-icon-box' }
      }
    ]
  },
  {
    path: '/cashier',
    component: Layout,
    redirect: '/cashier/list',
    name: 'cashier',
    meta: { title: '收银管理', icon: 'el-icon-wallet' },
    children: [
      {
        path: 'list',
        name: 'cashier-list',
        component: () => import('@/views/cashier/index'),
        meta: { title: '收银管理', icon: 'el-icon-wallet' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
