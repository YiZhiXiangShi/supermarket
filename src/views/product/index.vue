<template>
  <div>
    <el-card>
      <div slot="header" class="product-header-row">
        <span>商品管理</span>
        <el-button type="primary" @click="openAddDialog" size="small">新增商品</el-button>
      </div>
      
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="条码">
          <el-input v-model="searchForm.barcodeNo" placeholder="请输入条码" clearable />
        </el-form-item>
        <el-form-item label="一级种类">
          <el-select v-model="searchForm.firstLevelCategory" placeholder="请选择一级种类" clearable>
            <el-option label="食品" value="1"></el-option>
            <el-option label="饮料" value="2"></el-option>
            <el-option label="日用品" value="3"></el-option>
            <!-- 根据实际种类添加 -->
          </el-select>
        </el-form-item>
        <el-form-item label="二级种类">
          <el-select v-model="searchForm.secondLevelCategory" placeholder="请选择二级种类" clearable>
            <el-option label="零食" value="4"></el-option>
                  <el-option label="乳制品" value="5"></el-option>
                  <el-option label="碳酸饮料" value="6"></el-option>
                  <el-option label="果汁" value="7"></el-option>
                  <el-option label="清洁用品" value="8"></el-option>
                  <el-option label="纸制品" value="9"></el-option>
            <!-- 根据实际种类添加 -->
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="serialNo" label="流水号" width="80" />
        <el-table-column prop="barcodeNo" label="条码编号" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="sellingPrice" label="售价" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.sellingPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="stockQuantity" label="库存数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '未锁定' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="employeeName" label="操作人" width="100" />
        <el-table-column prop="firstCategoryName" label="一级种类" width="100" />
        <el-table-column prop="secondCategoryName" label="二级种类" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color: #F56C6C" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNo"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        class="pagination"
      />

      <!-- 新增/编辑对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
        <el-form :model="form" :rules="rules" ref="form" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="条码" prop="barcodeNo">
                <el-input v-model="form.barcodeNo" placeholder="请输入条码" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品名称" prop="productName">
                <el-input v-model="form.productName" placeholder="请输入商品名称" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="售价" prop="sellingPrice">
                <el-input 
                  v-model.number="form.sellingPrice" 
                  placeholder="请输入售价" 
                  type="number"
                  min="0"
                  step="0.01"
                  style="width: 100%"
                >
                  <template slot="prepend">¥</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单位" prop="unit">
                <el-input v-model="form.unit" placeholder="请输入单位" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="库存数量" prop="stockQuantity">
                <el-input-number 
                  v-model="form.stockQuantity" 
                  placeholder="请输入库存数量"
                  :min="0"
                  :precision="0"
                  style="width: 100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                  <el-option label="未锁定" value="UNLOCKED" />
                  <el-option label="锁定" value="LOCKED" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="操作人" prop="operatorName">
                <el-select v-model="form.operatorName" placeholder="请选择操作人姓名" style="width: 100%">
                  <el-option label="张三" value="1"></el-option>
                  <el-option label="李四" value="2"></el-option>
                  <el-option label="王五" value="3"></el-option>
                  <el-option label="赵六" value="4"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="一级种类" prop="firstLevelCategory">
                <el-select v-model="form.firstCategoryName" placeholder="请选择一级种类" style="width: 100%">
                  <!--<el-option label="食品" value="1"></el-option>
                  <el-option label="饮料" value="2"></el-option>
                  <el-option label="日用品" value="3"></el-option>-->
                  <el-option v-for="employee in employeeList" :key="employee.employeeId" :label="employee.name" :value="employee.employeeId"></el-option>
                  <!-- 根据实际种类添加 -->
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
                          <el-col :span="12">
                <el-form-item label="二级种类" prop="secondLevelCategory">
                  <el-select v-model="form.secondCategoryName" placeholder="请选择二级种类" style="width: 100%">
                    <el-option label="零食" value="4"></el-option>
                      <el-option label="乳制品" value="5"></el-option>
                      <el-option label="碳酸饮料" value="6"></el-option>
                      <el-option label="果汁" value="7"></el-option>
                      <el-option label="清洁用品" value="8"></el-option>
                      <el-option label="纸制品" value="9"></el-option>
                    <!-- 根据实际种类添加 -->
                  </el-select>
                </el-form-item>
              </el-col>
          </el-row>
        </el-form>
        <div slot="footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { fetchProductList, addProduct, updateProduct, deleteProduct } from '@/api/product'
import employeeApi from '@/api/employee'

export default {
  data() {
    return {
      loading: false,
      saveLoading: false,
      tableData: [],
      dialogVisible: false,
      dialogTitle: '新增商品',
      isEdit: false,
      employeeList:[],
      
      // 搜索表单
      searchForm: {
        productName: '',
        barcodeNo: '',
        firstLevelCategory: '',
        secondLevelCategory: ''
      },
      
      // 分页
      pagination: {
        pageNo: 1,
        pageSize: 5,
        total: 0
      },
      
      // 表单
      form: {
        barcodeNo: '',
        productName: '',
        sellingPrice: null,
        unit: '',
        stockQuantity: null,
        status: 'UNLOCKED',
        operatorName: '',
        firstLevelCategory: '',
        secondLevelCategory: '',
        stockInTime: ''
      },
      
      // 表单验证规则
      rules: {
        barcodeNo: [
          { required: true, message: '请输入条码', trigger: 'blur' }
        ],
        productName: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        sellingPrice: [
          { required: true, message: '请输入售价', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value === '' || value === null || value === undefined) {
                callback(new Error('请输入售价'))
              } else if (isNaN(Number(value)) || Number(value) < 0) {
                callback(new Error('售价必须为大于等于0的数字'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        unit: [
          { required: true, message: '请输入单位', trigger: 'blur' }
        ],
        stockQuantity: [
          { required: true, message: '请输入库存数量', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value === '' || value === null || value === undefined) {
                callback(new Error('请输入库存数量'))
              } else if (isNaN(Number(value)) || Number(value) < 0) {
                callback(new Error('库存数量必须为大于等于0的整数'))
              } else if (!Number.isInteger(Number(value))) {
                callback(new Error('库存数量必须为整数'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        operatorName: [
          { required: true, message: '请输入操作人姓名', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.loadProducts(),
    this.getEmployeeList()
  },
  methods: {
    // 加载商品列表
    async loadProducts() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNo: this.pagination.pageNo,
          pageSize: this.pagination.pageSize
        }
        console.log('发送商品查询参数:', params)
        const res = await fetchProductList(params)
        console.log('商品接口返回：', res)
        
        // 响应拦截器返回包含data和count的对象
        if (res && res.data) {
          this.tableData = res.data
          this.pagination.total = res.count || 0
          console.log('设置表格数据:', this.tableData)
          console.log('设置总数:', this.pagination.total)
        } else {
          this.tableData = []
          this.pagination.total = 0
          console.log('没有数据，清空表格')
        }
      } catch (e) {
        this.$message.error('获取商品列表失败')
        console.error('商品列表加载错误:', e)
      } finally {
        this.loading = false
      }
    },
    // 加载员工所有信息
    getEmployeeList(){
      employeeApi.findAll().then(response=>{
        this.employeeList=response.data
      })
    },
    
    // 搜索
    handleSearch() {
      this.pagination.pageNo = 1
      this.loadProducts()
    },
    
    // 重置搜索
    handleReset() {
      this.searchForm = {
        productName: '',
        barcodeNo: '',
        firstLevelCategory: '',
        secondLevelCategory: ''
      }
      this.pagination.pageNo = 1
      this.loadProducts()
    },
    
    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.pageNo = 1
      this.loadProducts()
    },
    
    // 当前页改变
    handleCurrentChange(page) {
      this.pagination.pageNo = page
      this.loadProducts()
    },
    
    // 打开新增对话框
    openAddDialog() {
      this.dialogTitle = '新增商品'
      this.isEdit = false
      this.form = {
        barcodeNo: '',
        productName: '',
        sellingPrice: null,
        unit: '',
        stockQuantity: null,
        status: 'UNLOCKED',
        operatorName: '',
        firstLevelCategory: '',
        secondLevelCategory: '',
        stockInTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    
    // 打开编辑对话框
    openEditDialog(row) {
      this.dialogTitle = '编辑商品'
      this.isEdit = true
      console.log('编辑商品数据:', row)
      
      // 确保种类字段是数字类型
      // const firstLevelCategory = row.firstLevelCategory ? Number(row.firstLevelCategory) : ''
      // const secondLevelCategory = row.secondLevelCategory ? Number(row.secondLevelCategory) : ''
      
      this.form = {
        serialNo: row.serialNo,
        barcodeNo: row.barcodeNo,
        productName: row.productName,
        sellingPrice: row.sellingPrice,
        unit: row.unit,
        stockQuantity: row.stockQuantity,
        status: row.status === '未锁定' ? 'UNLOCKED' : 'LOCKED',
        operatorName: row.employeeName,
        firstCategoryName: row.firstCategoryName,
        secondCategoryName: row.secondCategoryName,
        stockInTime: row.stockInTime || new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      
      console.log('表单数据:', this.form)
      console.log('操作人:', this.form.operatorName)
      console.log('一级种类:', this.form.firstCategoryName)
      console.log('二级种类:', this.form.secondCategoryName)
      
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    
    // 保存
    async handleSave() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        
        // 额外的数字验证
        if (isNaN(this.form.sellingPrice) || this.form.sellingPrice < 0) {
          this.$message.error('售价必须为大于等于0的数字')
          return
        }
        
        if (isNaN(this.form.stockQuantity) || this.form.stockQuantity < 0 || !Number.isInteger(this.form.stockQuantity)) {
          this.$message.error('库存数量必须为大于等于0的整数')
          return
        }
        
        this.saveLoading = true
        try {
          const saveData = {
            ...this.form,
            sellingPrice: Number(this.form.sellingPrice),
            stockQuantity: Number(this.form.stockQuantity),
            firstLevelCategory: Number(this.form.firstLevelCategory),
            secondLevelCategory: Number(this.form.secondLevelCategory)
          }
          
          if (this.isEdit) {
            // 编辑时添加stock_in_time字段
            saveData.stockInTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
            await updateProduct(saveData)
            this.$message.success('修改成功')
          } else {
            // 新增时也添加stock_in_time字段
            saveData.stockInTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
            await addProduct(saveData)
            this.$message.success('新增成功')
          }
          this.dialogVisible = false
          this.loadProducts()
        } catch (e) {
          this.$message.error('保存失败')
          console.error(e)
        } finally {
          this.saveLoading = false
        }
      })
    },
    
    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          console.log('开始删除商品，serialNo:', row.serialNo)
          await deleteProduct(row.serialNo)
          this.$message.success('删除成功')
          this.loadProducts()
        } catch (e) {
          console.error('删除商品失败:', e)
          // 错误信息已经在request.js中处理，这里不需要重复显示
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

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>