<template>
  <div class="test-api">
    <h2>API测试页面</h2>
    
    <el-button @click="testApi" type="primary">测试API</el-button>
    
    <div v-if="result" style="margin-top: 20px;">
      <h3>测试结果：</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <div v-if="error" style="margin-top: 20px; color: red;">
      <h3>错误信息：</h3>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script>
import employeeApi from '@/api/employee'

export default {
  name: 'TestApi',
  data() {
    return {
      result: null,
      error: null
    }
  },
  methods: {
    async testApi() {
      this.result = null
      this.error = null
      
      try {
        console.log('开始测试API...')
        
        const params = {
          current: 1,
          size: 10
        }
        
        console.log('请求参数:', params)
        console.log('请求URL:', '/api/employee/page')
        
        const response = await employeeApi.search(params)
        console.log('API响应:', response)
        
        this.result = response
      } catch (error) {
        console.error('API测试失败:', error)
        this.error = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText
        }
      }
    }
  }
}
</script>

<style scoped>
.test-api {
  padding: 20px;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style> 