<template>
  <div>
    <el-card>
      <div slot="header">促销活动管理</div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="活动名称" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="status" label="状态" />
      </el-table>
      <el-button type="primary" @click="dialogVisible = true">新增活动</el-button>
      <el-dialog title="新增活动" :visible.sync="dialogVisible">
        <el-form :model="form">
          <el-form-item label="活动名称"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="类型"><el-input v-model="form.type" /></el-form-item>
          <el-form-item label="状态"><el-input v-model="form.status" /></el-form-item>
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
      form: { name: '', type: '', status: '' }
    }
  }
}
</script> 