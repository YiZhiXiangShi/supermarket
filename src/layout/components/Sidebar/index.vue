<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      // 根据用户的操作员等级过滤路由
      const allRoutes = this.$router.options.routes
      const operatorLevel = this.$store.state.user.operatorLevel
      
      console.log('当前用户操作员等级:', operatorLevel)
      
      // 如果用户未登录或没有操作员等级，显示所有路由
      if (!operatorLevel) {
        console.log('用户未登录，显示所有路由')
        return allRoutes
      }
      
      // 收银员（等级1）：只显示首页、上货管理、收银管理
      if (operatorLevel === 1) {
        console.log('收银员权限，过滤菜单')
        return allRoutes.filter(route => {
          return route.path === '/' || ['/stock', '/cashier'].includes(route.path)
        })
      }
      
      // 管理员（等级2和3）：显示所有菜单
      if (operatorLevel === 2 || operatorLevel === 3) {
        console.log('管理员权限，显示所有菜单')
        return allRoutes
      }
      
      // 其他等级：显示所有菜单
      console.log('其他等级，显示所有菜单')
      return allRoutes
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>
