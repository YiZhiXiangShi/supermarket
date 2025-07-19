<template>
  <div class="promotion-type-container">
    <el-card>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 18px; font-weight: bold;">活动类型管理</span>
        <el-button type="primary" @click="openDialog()">新增活动类型</el-button>
      </div>
      <el-table :data="list" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="mini" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="400px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" />
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
  fetchPromotionTypes,
  createPromotionType,
  updatePromotionType,
  deletePromotionType
} from '@/api/promotionType'

export default {
  name: 'PromotionType',
  data() {
    return {
      list: [],
      dialogVisible: false,
      dialogTitle: '新增活动类型',
      form: {
        id: null,
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      const res = await fetchPromotionTypes()
      this.list = res || []
    },
    openDialog(row) {
      if (row) {
        this.dialogTitle = '编辑活动类型'
        this.form = { ...row }
      } else {
        this.dialogTitle = '新增活动类型'
        this.form = { id: null, name: '', description: '' }
      }
      this.dialogVisible = true
    },
    async handleSubmit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        if (this.form.id) {
          await updatePromotionType(this.form)
          this.$message.success('修改成功')
        } else {
          await createPromotionType(this.form)
          this.$message.success('新增成功')
        }
        this.dialogVisible = false
        this.getList()
      })
    },
    async handleDelete(id) {
      this.$confirm('确定删除该活动类型吗？', '提示', { type: 'warning' })
        .then(async () => {
          const res = await deletePromotionType(id)
          if (res === true) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(res || '删除失败')
          }
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.promotion-type-container {
  padding: 24px;
}
</style> 