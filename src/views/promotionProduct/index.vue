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
        <el-table-column prop="barcode" label="条形码" />
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="mini" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row.detailId)">删除</el-button>
            <el-button size="mini" type="success" @click="generateBarcode(scope.row)">生成条形码</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110px">
        <el-form-item label="商品编号" prop="productSerialNo">
          <el-select
            v-model="form.productSerialNo"
            placeholder="请选择或输入商品编号"
            filterable
            allow-create
            default-first-option
            @change="handleProductChange"
            style="width: 100%;"
          >
            <el-option
              v-for="item in products"
              :key="item.serialNo"
              :label="`${item.serialNo} - ${item.productName}`"
              :value="item.serialNo"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="活动类型ID" prop="promotionTypeId">
          <el-select
            v-model="form.promotionTypeId"
            placeholder="请选择活动类型"
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="item in promotionTypes"
              :key="item.id"
              :label="`${item.id} - ${item.name}`"
              :value="item.id"
            />
          </el-select>
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
        <el-form-item label="条形码" prop="barcode">
          <el-input v-model="form.barcode" placeholder="请输入条形码编号" />
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
import { fetchProductList } from '@/api/product'
import { fetchPromotionTypeList } from '@/api/promotionType'

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
        remark: '',
        barcode: ''
      },
      products: [],
      promotionTypes: [],
      rules: {
        productSerialNo: [{ required: true, message: '请输入商品编号', trigger: 'blur' }],
        promotionTypeId: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
        discount: [{ required: true, message: '请输入折扣', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' },
          { validator: this.validateEndTime, trigger: 'change' }
        ],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  mounted() {
    this.getList()
    this.getProducts()
    this.getPromotionTypes()
  },
  methods: {
    async getList() {
      const res = await fetchPromotionProducts()
      this.list = res || []
    },
    async getProducts() {
      const res = await fetchProductList()
      this.products = (res && res.data) ? res.data : (res || [])
    },
    async getPromotionTypes() {
      const res = await fetchPromotionTypeList()
      this.promotionTypes = res || []
    },
    handleProductChange(val) {
      const found = this.products.find(p => p.serialNo === val)
      if (!found) {
        this.$message.warning('该商品编号不存在，请检查或先添加商品！')
      }
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
          remark: '',
          barcode: ''
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
    },
    validateEndTime(rule, value, callback) {
      if (!value || !this.form.startTime) {
        callback();
        return;
      }
      if (new Date(value) <= new Date(this.form.startTime)) {
        callback(new Error('结束时间必须大于开始时间'));
      } else {
        callback();
      }
    },
    async generateBarcode(row) {
      if (!row.barcode) {
        this.$message.warning('请先设置条形码编号！');
        return;
      }
      
      try {
        this.$message.info('正在生成条形码...');
        
        // 使用axios而不是fetch，避免跨域问题
        const response = await this.$http({
          url: `/api/promotion-products/${row.detailId}/barcode`,
          method: 'GET',
          params: { barcode: row.barcode },
          responseType: 'blob', // 重要：设置响应类型为blob
          timeout: 10000
        });
        
        // 检查响应内容类型
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('application/json')) {
          // 如果是JSON响应，说明是错误信息
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              this.$message.error(errorData.error || '生成条形码失败');
            } catch (e) {
              this.$message.error('解析错误信息失败');
            }
          };
          reader.readAsText(response.data);
          return;
        }
        
        // 验证blob数据
        if (!response.data || response.data.size === 0) {
          this.$message.error('生成的条形码数据为空');
          return;
        }
        
        // 创建下载链接
        const blob = new Blob([response.data], { type: 'image/png' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `barcode_${row.barcode}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        window.URL.revokeObjectURL(downloadUrl);
        
        this.$message.success('条形码生成成功，正在下载...');
      } catch (error) {
        console.error('生成条形码失败:', error);
        
        // 处理不同类型的错误
        if (error.response) {
          // 服务器返回错误状态码
          const status = error.response.status;
          if (status === 404) {
            this.$message.error('活动商品记录不存在');
          } else if (status === 400) {
            this.$message.error('条形码内容不能为空，请先设置条形码编号');
          } else {
            this.$message.error(`生成条形码失败: ${error.response.data || '服务器错误'}`);
          }
        } else if (error.request) {
          // 网络错误
          this.$message.error('网络连接失败，请检查网络设置');
        } else {
          // 其他错误
          this.$message.error(`生成条形码失败: ${error.message}`);
        }
      }
    }
  }
}
</script>

<style scoped>
.promotion-product-container {
  padding: 24px;
}
</style> 