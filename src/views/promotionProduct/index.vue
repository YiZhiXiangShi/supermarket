<template>
  <div class="promotion-product-container">
    <el-card>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 18px; font-weight: bold;">活动管理</span>
        <el-button type="primary" @click="openDialog()">新增活动</el-button>
      </div>
      <el-table :data="list" border stripe style="width: 100%">
        <el-table-column prop="detailId" label="ID" width="80" />
        <el-table-column prop="productSerialNo" label="商品编号" />
        <el-table-column prop="promotionTypeId" label="活动类型ID" />
        <el-table-column prop="discount" label="折扣" />
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="mini" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row.detailId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110px">
        <el-form-item label="商品编号" prop="productSerialNo">
          <el-input v-model="form.productSerialNo" />
        </el-form-item>
        <el-form-item label="活动类型ID" prop="promotionTypeId">
          <el-input v-model="form.promotionTypeId" />
        </el-form-item>
        <el-form-item label="折扣" prop="discount">
          <el-input v-model="form.discount" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchPromotionProducts,
  createPromotionProduct,
  updatePromotionProduct,
  deletePromotionProduct
} from '@/api/promotionProduct'

export default {
  name: 'PromotionProduct',
  data() {
    return {
      list: [],
      dialogVisible: false,
      dialogTitle: '新增活动',
      form: {
        detailId: null,
        productSerialNo: '',
        promotionTypeId: '',
        discount: '',
        startTime: '',
        endTime: '',
        status: 1,
        remark: ''
      },
      rules: {
        productSerialNo: [{ required: true, message: '请输入商品编号', trigger: 'blur' }],
        promotionTypeId: [{ required: true, message: '请输入活动类型ID', trigger: 'blur' }],
        discount: [{ required: true, message: '请输入折扣', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      const res = await fetchPromotionProducts()
      this.list = res || []
    },
    openDialog(row) {
      if (row) {
        this.dialogTitle = '编辑活动'
        this.form = { ...row }
      } else {
        this.dialogTitle = '新增活动'
        this.form = {
          detailId: null,
          productSerialNo: '',
          promotionTypeId: '',
          discount: '',
          startTime: '',
          endTime: '',
          status: 1,
          remark: ''
        }
      }
      this.dialogVisible = true
    },
    async handleSubmit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        let res
        if (this.form.detailId) {
          res = await updatePromotionProduct(this.form)
          if (res && res.success) {
            this.$message.success(res.msg || '修改成功')
            this.dialogVisible = false
            this.getList()
          } else {
            this.$message.error(res && res.msg ? res.msg : '修改失败')
          }
        } else {
          res = await createPromotionProduct(this.form)
          if (res && res.success) {
            this.$message.success(res.msg || '新增成功')
            this.dialogVisible = false
            this.getList()
          } else {
            this.$message.error(res && res.msg ? res.msg : '新增失败')
          }
        }
      })
    },
    async handleDelete(detailId) {
      this.$confirm('确定删除该活动吗？', '提示', { type: 'warning' })
        .then(async () => {
          const res = await deletePromotionProduct(detailId)
          if (res === true || (res && res.success)) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(res && res.msg ? res.msg : '删除失败')
          }
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.promotion-product-container {
  padding: 24px;
}
</style> 