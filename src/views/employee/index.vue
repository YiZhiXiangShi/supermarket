<template>
  <div>
    <el-card>
      <div slot="header">员工管理</div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="position" label="职位" />
        <el-table-column prop="phone" label="电话" />
      </el-table>
      <el-button type="primary" @click="dialogVisible = true">新增员工</el-button>
      <el-dialog title="新增员工" :visible.sync="dialogVisible">
        <el-form :model="form">
          <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="职位"><el-input v-model="form.position" /></el-form-item>
          <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        </el-form>
        <div slot="footer"><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary">保存</el-button></div>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      form: { name: '', position: '', phone: '' }
    }
  }
}
</script>