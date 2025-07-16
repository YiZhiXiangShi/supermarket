<template>
  <div>
    <el-card>
      <div slot="header">商品管理</div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="分类" />
        <el-table-column prop="price" label="价格" />
      </el-table>
      <el-button type="primary" @click="dialogVisible = true">新增商品</el-button>
      <el-dialog title="新增商品" :visible.sync="dialogVisible">
        <el-form :model="form">
          <el-form-item label="商品名称"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="分类"><el-input v-model="form.category" /></el-form-item>
          <el-form-item label="价格"><el-input v-model="form.price" /></el-form-item>
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
      form: { name: '', category: '', price: '' }
    }
  }
}
</script> 