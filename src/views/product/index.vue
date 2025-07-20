<template>
  <div>
    <el-card>
      <div slot="header" class="product-header-row">
        <span>商品管理</span>
        <el-button type="primary" @click="openAddDialog" size="small">新增商品</el-button>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="serialNo" label="商品编号" />
        <el-table-column prop="barcodeNo" label="条码" />
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="sellingPrice" label="售价" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color: #F56C6C" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
        <el-form :model="form" label-width="80px">
          <el-form-item label="商品编号"><el-input v-model="form.serialNo" :disabled="isEdit" /></el-form-item>
          <el-form-item label="条码"><el-input v-model="form.barcodeNo" /></el-form-item>
          <el-form-item label="商品名称"><el-input v-model="form.productName" /></el-form-item>
          <el-form-item label="售价"><el-input v-model="form.sellingPrice" /></el-form-item>
          <el-form-item label="单位"><el-input v-model="form.unit" /></el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import { fetchProductList, addProduct, updateProduct, deleteProduct } from '@/api/product'

export default {
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      dialogTitle: '新增商品',
      isEdit: false,
      form: { serialNo: '', barcodeNo: '', productName: '', sellingPrice: '', unit: '' }
    }
  },
  mounted() {
    this.loadProducts()
  },
  methods: {
    async loadProducts() {
      try {
        const res = await fetchProductList()
        console.log('商品接口返回：', res)
        this.tableData = Array.isArray(res) ? res : []
      } catch (e) {
        this.$message && this.$message.error('获取商品列表失败')
      }
    },
    openAddDialog() {
      this.dialogTitle = '新增商品'
      this.isEdit = false
      this.form = { serialNo: '', barcodeNo: '', productName: '', sellingPrice: '', unit: '' }
      this.dialogVisible = true
    },
    openEditDialog(row) {
      this.dialogTitle = '编辑商品'
      this.isEdit = true
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleSave() {
      try {
        if (this.isEdit) {
          await updateProduct(this.form)
          this.$message.success('修改成功')
        } else {
          await addProduct(this.form)
          this.$message.success('新增成功')
        }
        this.dialogVisible = false
        this.loadProducts()
      } catch (e) {
        this.$message.error('保存失败')
      }
    },
    handleDelete(row) {
      this.$confirm('确定要删除该商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteProduct(row.serialNo)
          this.$message.success('删除成功')
          this.loadProducts()
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    }
  }
}
</script>
<style scoped>
.product-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 