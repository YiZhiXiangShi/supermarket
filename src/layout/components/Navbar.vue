<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <!-- 用户信息显示 -->
      <div class="user-info">
        <span class="user-name">姓名: {{ userName }}</span>
        <span class="user-id">工号: {{ userEmployeeId }}</span>
      </div>
      
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img v-if="userPhoto" :src="userPhoto" class="user-avatar" alt="员工照片" @error="handleImageError">
          <i v-else class="el-icon-user-solid default-avatar"></i>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ]),
    userName() {
      const name = this.$store.state.user.name || '未知'
      console.log('导航栏 - 计算用户名:', name)
      return name
    },
    userEmployeeId() {
      const employeeId = this.$store.state.user.employeeId || '未知'
      console.log('导航栏 - 计算员工ID:', employeeId)
      return employeeId
    },
    userPhoto() {
      const photo = this.$store.state.user.photo || ''
      console.log('导航栏 - 计算用户照片:', photo)
      return photo
    }
  },
  mounted() {
    console.log('导航栏组件已挂载')
    console.log('导航栏 - Vuex用户状态:', this.$store.state.user)
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    handleImageError(event) {
      // 图片加载失败时，隐藏图片显示默认头像
      event.target.style.display = 'none'
      this.$store.commit('user/SET_PHOTO', '')
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #42a5f5;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

      .right-menu {
      float: right;
      height: 100%;
      line-height: 50px;
      display: flex;
      align-items: center;
      color: #fff;

      &:focus {
        outline: none;
      }

      .user-info {
        margin-right: 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        color: #fff;
        
        .user-name {
          font-size: 14px;
          color: #fff;
          font-weight: 500;
          line-height: 1.2;
        }
        
        .user-id {
          font-size: 12px;
          color: #fff;
          line-height: 1.2;
          margin-top: 2px;
        }
      }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

          .avatar-container {
        margin-right: 30px;

        .avatar-wrapper {
          margin-top: 5px;
          position: relative;
          display: flex;
          align-items: center;
          padding: 5px;

          .user-avatar {
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            object-fit: cover;
            display: block;
            border: 2px solid #e0e0e0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .default-avatar {
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #999;
            border: 2px solid #e0e0e0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .el-icon-caret-bottom {
            cursor: pointer;
            position: absolute;
            right: -20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 12px;
            color: #666;
          }
        }
      }
  }
}
</style>
