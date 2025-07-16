<template>
  <div class="dashboard-container">
    <el-card>
      <div style="font-size: 28px; font-weight: bold;">欢迎使用商品收银后台管理系统</div>
      <div style="margin-top: 20px;">请选择左侧模块进行操作。</div>
    </el-card>
  </div>
</template>
<script>
export default { name: 'Dashboard' }
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}

.bg {
  width: 100vw;
  height: 85vh;
  background-image: url("../../assets/index.jpg");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .login {
    width: 50rem;
    height: 50rem;
    background: rgba(255, 255, 255, 0.9);
    position: relative;
    left: 20rem;
    top: 3rem;
    box-shadow: 2px 6px 20px #333333;
  }
}
</style>
