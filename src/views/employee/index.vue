<template>
  <div class="employee-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <i class="el-icon-s-grid"></i>
      <span>员工管理</span>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-buttons">
      <el-button 
        type="success" 
        :class="{ active: currentView === 'view' }"    @click="switchView('view')"     icon="el-icon-view">
        查看员工
      </el-button>
      <el-button 
        type="primary" 
        :class="{ active: currentView === 'add' }"    @click="switchView('add')"     icon="el-icon-plus">
        添加员工
      </el-button>
      <el-button 
        type="info" 
        :class="{ active: currentView === 'search' }"    @click="switchView('search')"     icon="el-icon-search">
        搜索员工
      </el-button>
    </div>

    <!-- 查看员工状态 -->
    <div v-if="currentView === 'view'" class="view-employees">
      <div class="separator-line"></div>
      
      <!-- 员工列表表格 -->
      <el-table :data="tableData" style="width:100%" v-loading="loading" class="employee-table compact-table">
        <el-table-column prop="employeeId" label="工号" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" width="90" align="center"></el-table-column>
        <el-table-column prop="idCardNo" label="身份证" width="160" align="center"></el-table-column>
        <el-table-column prop="rfidCardNo" label="RFID卡号" width="120" align="center"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="110" align="center"></el-table-column>
        <el-table-column prop="status" label="在职状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '在职' ? 'success' : 'danger'" size="mini">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operatorLevel" label="操作员等级" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.operatorLevel === 1" type="info" size="mini">{{ scope.row.operatorLevel }}</el-tag>
            <el-tag v-else-if="scope.row.operatorLevel === 2" type="warning" size="mini">{{ scope.row.operatorLevel }}</el-tag>
            <el-tag v-else-if="scope.row.operatorLevel === 3" type="success" size="mini">{{ scope.row.operatorLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="handleEdit(scope.row)">修改</el-button>
            <el-button size="mini" type="success" @click="handleView(scope.row)">查看</el-button>
            <el-button size="mini" type="warning" @click="handleLock(scope.row)">锁定</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        class="pagination">
      </el-pagination>
    </div>

    <!-- 添加员工状态 -->
    <div v-if="currentView === 'add'" class="add-employee">
      <el-form :model="form" :rules="rules" ref="form" label-width="120px" class="employee-form">
        <el-row :gutter="30">
          <!-- 左列 -->
          <el-col :span="12">
            <el-form-item label=" RFID卡号" prop="rfidCardNo">
              <el-input v-model="form.rfidCardNo" placeholder="请输入内容"></el-input>
            </el-form-item>
            
            <el-form-item label=" 员工姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入内容"></el-input>
            </el-form-item>
            
            <el-form-item label=" 密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入内容"></el-input>
            </el-form-item>
            
            <el-form-item label=" 在职状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
                <el-option label="在职" value="在职"></el-option>
                <el-option label="离职" value="离职"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label=" 操作等级" prop="operatorLevel">
              <el-select v-model="form.operatorLevel" placeholder="请选择" style="width: 100%">
                <el-option label="1" :value="1"></el-option>
                <el-option label="2" :value="2"></el-option>
                <el-option label="3" :value="3"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label=" 性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label=" 联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号码"></el-input>
            </el-form-item>
          </el-col>
          
          <!-- 右列 -->
          <el-col :span="12">
            <el-form-item label=" 工号" prop="employeeId">
              <el-input v-model="form.employeeId" placeholder="系统自动生成" disabled>
                <el-button slot="append" @click="generateEmployeeId" :disabled="form.employeeId">生成工号</el-button>
              </el-input>
            </el-form-item>
            
            <el-form-item label=" 身份证" prop="idCardNo">
              <el-input v-model="form.idCardNo" placeholder="请输入内容"></el-input>
            </el-form-item>
            
            <el-form-item label=" 出生日期" prop="birthDate">
              <el-date-picker
                v-model="form.birthDate"
                type="date"
                placeholder="请输入内容"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
            
            <el-form-item label=" 入职日期" prop="hireDate">
              <el-date-picker
                v-model="form.hireDate"
                type="date"
                placeholder="请输入内容"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
            
            <el-form-item label=" 上传照片" prop="photo">
              <div class="upload-area" @click="handlePhotoUpload">
                <img v-if="photoPreview" :src="photoPreview" class="photo-preview" alt="员工照片">
                <i v-else class="el-icon-plus upload-icon"></i>
              </div>
              <input 
                type="file" ref="photoInput" style="display: none"
                accept="image/*"
                @change="handlePhotoChange">
              <div v-if="photoPreview" class="photo-actions">
                <el-button size="mini" type="danger" @click="removePhoto">删除照片</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading" size="medium">
            添加员工
          </el-button>
          <el-button @click="resetForm" size="medium">重置表单</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 搜索员工状态 -->
    <div v-if="currentView === 'search'" class="search-employee">
      <div class="search-container">
        <el-select v-model="searchType" placeholder="请选择搜索类型" class="search-type" @change="handleSearchTypeChange">
          <el-option label="员工工号" value="employeeId"></el-option>
          <el-option label="姓名" value="name"></el-option>
          <el-option label="在职状态" value="status"></el-option>
        </el-select>
        
        <!-- 根据搜索类型显示不同的输入控件 -->
        <el-input 
          v-if="searchType !== 'status'"
          v-model="searchValue" 
          :placeholder="getSearchPlaceholder()"
          class="search-input"
          @input="handleSearchInput"
          clearable>
        </el-input>
        
        <el-select 
          v-if="searchType === 'status'"
          v-model="searchValue" 
          placeholder="请选择在职状态"
          class="search-input"
          clearable>
          <el-option label="在职" value="在职"></el-option>
          <el-option label="离职" value="离职"></el-option>
        </el-select>
        
        <el-button type="primary" @click="handleNewSearch" icon="el-icon-search" class="search-btn">
          搜索
        </el-button>
      </div>
      
      <!-- 搜索结果表格 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div class="separator-line"></div>
        
        <!-- 搜索状态显示 -->
        <div class="search-status" style="margin-bottom: 15px; padding: 10px; background: #f0f9ff; border-radius: 4px;">
          <el-tag type="info" size="small">
            搜索条件: {{ getSearchTypeLabel() }} = {{ searchValue }}
          </el-tag>
          <el-tag type="success" size="small" style="margin-left: 10px;">
            共找到 {{ searchPagination.total }} 条记录
          </el-tag>
        </div>
        <el-table :data="searchResults" style="width: 100%" class="employee-table compact-table">
          <el-table-column prop="employeeId" label="工号" width="80" align="center"></el-table-column>
          <el-table-column prop="name" label="姓名" width="90" align="center"></el-table-column>
          <el-table-column prop="idCardNo" label="身份证" width="160" align="center"></el-table-column>
          <el-table-column prop="rfidCardNo" label="RFID卡号" width="120" align="center"></el-table-column>
          <el-table-column prop="phone" label="联系电话" width="110" align="center"></el-table-column>
          <el-table-column prop="status" label="在职状态" width="80" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === '在职' ? 'success' : 'danger'" size="mini">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operatorLevel" label="操作员等级" width="100" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.operatorLevel === 1" type="info" size="mini">{{ scope.row.operatorLevel }}</el-tag>
              <el-tag v-else-if="scope.row.operatorLevel === 2" type="warning" size="mini">{{ scope.row.operatorLevel }}</el-tag>
              <el-tag v-else-if="scope.row.operatorLevel === 3" type="success" size="mini">{{ scope.row.operatorLevel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="handleEdit(scope.row)">修改</el-button>
              <el-button size="mini" type="success" @click="handleView(scope.row)">查看</el-button>
              <el-button size="mini" type="warning" @click="handleLock(scope.row)">锁定</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 搜索结果分页 -->
        <el-pagination
          @size-change="handleSearchSizeChange"
          @current-change="handleSearchCurrentChange"
          :current-page="searchPagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="searchPagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="searchPagination.total"
          class="pagination">
        </el-pagination>
      </div>
    </div>

    <!-- 编辑/查看对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
      <el-form :model="editForm" :rules="rules" ref="editForm" label-width="120">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label=" 工号" prop="employeeId">
              <el-input v-model="editForm.employeeId" :disabled="dialogMode === 'view'"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" 姓名" prop="name">
              <el-input v-model="editForm.name" :disabled="dialogMode === 'view'"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label=" 身份证号" prop="idCardNo">
              <el-input v-model="editForm.idCardNo" :disabled="dialogMode === 'view'"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" RFID卡号" prop="rfidCardNo">
              <el-input v-model="editForm.rfidCardNo" :disabled="dialogMode === 'view'"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="editForm.password" 
                :type="dialogMode === 'view' ? 'text' : 'password'"
                :placeholder="dialogMode === 'view' ? '密码' : '留空则不修改密码'"
                :disabled="dialogMode === 'view'"
                :show-password="dialogMode !== 'view'">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="dialogMode === 'edit'">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="editForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入密码"
                show-password>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label=" 联系电话" prop="phone">
              <el-input v-model="editForm.phone" :disabled="dialogMode === 'view'"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" 在职状态" prop="status">
              <el-select v-model="editForm.status" :disabled="dialogMode === 'view'" style="width: 100%">
                <el-option label="在职" value="在职"></el-option>
                <el-option label="离职" value="离职"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label=" 操作员等级" prop="operatorLevel">
              <el-select v-model="editForm.operatorLevel" :disabled="dialogMode === 'view'" style="width: 100%">
                <el-option label="1" :value="1"></el-option>
                <el-option label="2" :value="2"></el-option>
                <el-option label="3" :value="3"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" 性别" prop="gender">
              <el-select v-model="editForm.gender" :disabled="dialogMode === 'view'" style="width: 100%">
                <el-option label="男" value="男"></el-option>
                <el-option label="女" value="女"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker
                v-model="editForm.birthDate"
                type="date"
                placeholder="请选择出生日期"
                style="width: 100%"
                :disabled="dialogMode === 'view'">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期" prop="hireDate">
              <el-date-picker
                v-model="editForm.hireDate"
                type="date"
                placeholder="请选择入职日期"
                style="width: 100%"
                :disabled="dialogMode === 'view'">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工照片" prop="photo">
              <div class="upload-area-view" @click="dialogMode === 'edit' ? handleEditPhotoUpload() : null">
                <img v-if="editPhotoPreview" :src="editPhotoPreview" class="photo-preview-view" alt="员工照片">
                <div v-else class="no-photo">
                  <i class="el-icon-picture-outline"></i>
                  <p>暂无照片</p>
                </div>
              </div>
              <input 
                type="file" ref="editPhotoInput" style="display: none"
                accept="image/*"
                @change="handleEditPhotoChange">
              <div v-if="editPhotoPreview && dialogMode === 'edit'" class="photo-actions-view">
                <el-button size="mini" type="danger" @click="removeEditPhoto">删除照片</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button v-if="dialogMode === 'edit'" type="primary" @click="handleEditSubmit" :loading="submitLoading">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import employeeApi from '@/api/employee'

export default {
  name: 'Employee',
  data() {
    return {
      currentView: 'view', // 当前视图：view, add, search
      loading: false,
      submitLoading: false,
      tableData: [],
      searchResults: [],
      dialogVisible: false,
      dialogTitle: '',
      dialogMode: 'edit', // edit, view
      
      // 搜索相关
      searchType: 'employeeId',
      searchValue: '',
      searchPagination: {
        current: 1,
        size: 10,
        total: 0
      },
      
      // 表单数据
      form: {
        employeeId: null,
        name: '',
        gender: '男',
        idCardNo: '',
        rfidCardNo: '',
        password: '',
        birthDate: '',
        hireDate: '',
        phone: '',
        status: '在职',
        operatorLevel: 1,
        photo: null
      },
      
      // 照片预览
      photoPreview: null,
      
      // 编辑表单数据
      editForm: {
        employeeId: null,
        name: '',
        gender: '男',
        idCardNo: '',
        rfidCardNo: '',
        password: '',
        confirmPassword: '',
        phone: '',
        status: '在职',
        operatorLevel: 1,
        birthDate: '',
        hireDate: '',
        photo: null,
        deletePhoto: false
      },
      
      // 编辑照片预览
      editPhotoPreview: null,
      
      rules: {
        employeeId: [
          { required: true, message: '请先生成工号', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        idCardNo: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
        ],
        rfidCardNo: [
          { required: true, message: '请输入RFID卡号', trigger: 'blur' }
        ],
        password: [
          { 
            validator: (rule, value, callback) => {
              // 编辑模式下密码可选，新增模式下必填
              if (this.dialogMode === 'edit') {
                callback() // 编辑模式下密码可选
              } else if (!value || value.trim() === '') {
                callback(new Error('请输入密码'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        confirmPassword: [
          { required: false, message: '请确认密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        birthDate: [
          { required: true, message: '请选择出生日期', trigger: 'change' }
        ],
        hireDate: [
          { required: true, message: '请选择入职日期', trigger: 'change' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择在职状态', trigger: 'change' }
        ],
        operatorLevel: [
          { required: true, message: '请选择操作等级', trigger: 'change' }
        ]
      },
      
      pagination: {
        current: 1,
        size: 10,
        total: 0
      }
    }
  },
  created() {
    console.log('组件创建，开始获取数据')
    this.fetchData()
  },
  
  watch: {
    // 监听密码字段变化，清除确认密码的验证错误
    'editForm.password': function(newVal) {
      if (!newVal || newVal.trim() === '') {
        this.$nextTick(() => {
          if (this.$refs.editForm) {
            this.$refs.editForm.clearValidate(['confirmPassword'])
          }
        })
      }
    }
  },
  
  beforeDestroy() {
    // 组件销毁时清理照片预览URL
    if (this.photoPreview) {
      URL.revokeObjectURL(this.photoPreview)
    }
    if (this.editPhotoPreview) {
      URL.revokeObjectURL(this.editPhotoPreview)
    }
  },
  methods: {
    // 密码确认验证
    validateConfirmPassword(rule, value, callback) {
      // 查看模式下不需要验证确认密码
      if (this.dialogMode === 'view') {
        callback()
        return
      }
      
      // 如果密码为空，则确认密码也不需要验证
      if (!this.editForm.password || this.editForm.password.trim() === '') {
        callback()
        return
      }
      
      if (!value) {
        callback(new Error('请输入确认密码'))
      } else if (value !== this.editForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    
    // 切换视图
    switchView(view) {
      this.currentView = view
      if (view === 'view') {
        this.fetchData()
      } else if (view === 'add') {
        this.resetForm()
      } else if (view === 'search') {
        this.resetSearch()
      }
    },
    
    // 获取搜索占位符
    getSearchPlaceholder() {
      const placeholders = {
        employeeId: '请输入数字工号',
        name: '请输入员工姓名',
        status: '请选择在职状态'
      }
      return placeholders[this.searchType] || '请输入搜索内容'
    },
    
    // 获取搜索类型标签
    getSearchTypeLabel() {
      const labels = {
        employeeId: '员工工号',
        name: '姓名',
        status: '在职状态'
      }
      return labels[this.searchType] || '未知类型'
    },
    
    // 重置表单
    resetForm() {
      // 清理照片预览URL
      if (this.photoPreview) {
        URL.revokeObjectURL(this.photoPreview)
      }
      
      this.form = {
        employeeId: null,
        name: '',
        gender: '男',
        idCardNo: '',
        rfidCardNo: '',
        password: '',
        birthDate: '',
        hireDate: '',
        phone: '',
        status: '在职',
        operatorLevel: 1,
        photo: null
      }
      this.photoPreview = null
      
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    
    // 重置搜索
    resetSearch() {
      this.searchType = 'employeeId'
      this.searchValue = ''
      this.searchResults = []
      this.searchPagination.current = 1
      this.searchPagination.total = 0
    },
    
    // 搜索类型变化处理
    handleSearchTypeChange() {
      this.searchValue = ''
      this.searchResults = []
      this.searchPagination.current = 1
      this.searchPagination.total = 0
      
      // 如果切换到员工工号搜索，给出提示
      if (this.searchType === 'employeeId') {
        this.$message.info('员工工号搜索：请输入数字工号')
      }
    },
    
    // 搜索输入验证
    handleSearchInput(value) {
      // 如果是员工工号搜索，只允许输入数字
      if (this.searchType === 'employeeId') {
        // 移除非数字字符
        const numericValue = value.replace(/[^\d]/g, '')
        if (numericValue !== value) {
          this.searchValue = numericValue
          this.$message.warning('员工工号只能输入数字')
        }
      }
    },
    
    // 搜索分页大小改变
    handleSearchSizeChange(val) {
      this.searchPagination.size = val
      this.searchPagination.current = 1
      if (this.searchValue.trim()) {
        this.handleSearch()
      }
    },
    
    // 搜索当前页改变
    handleSearchCurrentChange(val) {
      this.searchPagination.current = val
      if (this.searchValue.trim()) {
        this.handleSearch()
      }
    },
    
    // 获取数据
    async fetchData() {
      this.loading = true
      try {
        const params = {
          current: this.pagination.current,
          size: this.pagination.size
        }
        console.log('请求参数:', params)
        console.log('请求URL:', '/api/employee/page')
        const response = await employeeApi.search(params)
        // 适配request.js返回res.data，直接用response.records
        this.tableData = response.records || []
        this.pagination.total = response.total || 0
        console.log('表格数据:', this.tableData)
      } catch (error) {
        console.error('获取数据失败:', error)
        console.error('错误详情:', error.response)
        console.error('错误状态:', error.response?.status)
        console.error('错误数据:', error.response?.data)
        
        if (error.response?.status === 404) {
          this.$message.error('接口不存在，请检查后端服务')
        } else if (error.response?.status === 500) {
          this.$message.error('服务器内部错误')
        } else {
          this.$message.error('获取数据失败: ' + (error.message || '未知错误'))
        }
      } finally {
        this.loading = false
      }
    },
    
    // 新搜索（重置到第一页）
    async handleNewSearch() {
      this.searchPagination.current = 1
      await this.handleSearch()
    },
    
    // 搜索
    async handleSearch() {
      if (!this.searchValue.trim()) {
        this.$message.warning('请输入搜索内容')
        return
      }
      
      // 如果是员工号搜索，验证输入是否为数字
      if (this.searchType === 'employeeId') {
        const employeeId = parseInt(this.searchValue)
        if (isNaN(employeeId)) {
          this.$message.error('员工工号必须是数字，请输入正确的工号')
          return
        }
        if (employeeId <= 0) {
          this.$message.error('员工工号必须是正整数')
          return
        }
      }
      
      this.loading = true
      try {
        const params = {
          [this.searchType]: this.searchValue,
          current: this.searchPagination.current,
          size: this.searchPagination.size
        }
        // 如果是员工号搜索，转换为数字类型
        if (this.searchType === 'employeeId') {
          params.employeeId = parseInt(this.searchValue)
        }
        console.log('搜索类型:', this.searchType)
        console.log('搜索值:', this.searchValue)
        console.log('搜索参数:', params)
        console.log('请求URL:', '/api/employee/page')
        const response = await employeeApi.search(params)
        // 适配request.js返回res.data，直接用response.records
        this.searchResults = response.records || []
        this.searchPagination.total = response.total || 0
        console.log('搜索结果数据:', this.searchResults)
        console.log('结果数量:', this.searchResults.length)
        console.log('总记录数:', this.searchPagination.total)
        if (this.searchResults.length === 0) {
          this.$message.info('未找到匹配的员工')
        } else {
          this.$message.success(`找到 ${this.searchPagination.total} 条匹配记录，当前显示第 ${this.searchPagination.current} 页`)
        }
      } catch (error) {
        console.error('搜索失败:', error)
        console.error('错误详情:', error.response)
        console.error('错误状态:', error.response?.status)
        console.error('错误数据:', error.response?.data)
        this.$message.error('搜索失败: ' + (error.response?.data?.message || error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    
    // 编辑
    handleEdit(row) {
      this.dialogMode = 'edit'
      this.dialogTitle = '修改员工'
      this.editForm = { 
        ...row, 
        deletePhoto: false,
        password: '', // 清空密码字段
        confirmPassword: '' // 清空确认密码字段
      }
      
      // 清理之前的编辑照片预览
      if (this.editPhotoPreview) {
        URL.revokeObjectURL(this.editPhotoPreview)
        this.editPhotoPreview = null
      }
      
      // 如果有现有照片，创建预览
      if (row.photo) {
        // 如果是base64数据，直接使用
        if (row.photo.startsWith('data:image/')) {
          this.editPhotoPreview = row.photo
        } else if (row.photo.startsWith('http')) {
          // 如果是URL，直接使用
          this.editPhotoPreview = row.photo
        } else {
          // 如果是纯base64字符串，添加前缀
          this.editPhotoPreview = 'data:image/jpeg;base64,' + row.photo
        }
      }
      
      console.log('编辑员工，照片预览:', this.editPhotoPreview)
      this.dialogVisible = true
      
      // 清除密码字段的验证错误
      this.$nextTick(() => {
        if (this.$refs.editForm) {
          this.$refs.editForm.clearValidate(['password', 'confirmPassword'])
        }
      })
    },
    
    // 查看
    handleView(row) {
      this.dialogMode = 'view'
      this.dialogTitle = '查看员工'
      
      console.log('查看员工数据:', row)
      console.log('员工密码字段:', row.password)
      console.log('密码字段类型:', typeof row.password)
      console.log('密码字段长度:', row.password ? row.password.length : 0)
      
      this.editForm = { 
        ...row,
        password: row.password ? '******' : '未设置', // 显示星号或未设置
        confirmPassword: '' // 查看时不需要确认密码
      }
      
      console.log('编辑表单数据:', this.editForm)
      
      // 清理之前的编辑照片预览
      if (this.editPhotoPreview) {
        URL.revokeObjectURL(this.editPhotoPreview)
        this.editPhotoPreview = null
      }
      
      // 如果有现有照片，创建预览
      if (row.photo) {
        // 如果是base64数据，直接使用
        if (row.photo.startsWith('data:image/')) {
          this.editPhotoPreview = row.photo
        } else if (row.photo.startsWith('http')) {
          // 如果是URL，直接使用
          this.editPhotoPreview = row.photo
        } else {
          // 如果是纯base64字符串，添加前缀
          this.editPhotoPreview = 'data:image/jpeg;base64,' + row.photo
        }
      }
      
      this.dialogVisible = true
    },
    
    // 锁定
    async handleLock(row) {
      try {
        await this.$confirm('确认锁定该员工吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 这里可以调用锁定API
        this.$message.success('锁定成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('锁定失败:', error)
          this.$message.error('锁定失败')
        }
      }
    },
    
    // 提交表单
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            console.log('提交员工数据:', this.form)
            
            // 处理提交数据，确保数据类型正确
            const submitData = {
              employeeId: this.form.employeeId,
              name: this.form.name,
              gender: this.form.gender,
              idCardNo: this.form.idCardNo,
              rfidCardNo: this.form.rfidCardNo,
              password: this.form.password,
              birthDate: this.form.birthDate ? this.formatDate(this.form.birthDate) : null,
              hireDate: this.form.hireDate ? this.formatDate(this.form.hireDate) : null,
              phone: this.form.phone,
              status: this.form.status,
              operatorLevel: parseInt(this.form.operatorLevel) || 1
            }
            
            // 如果有照片，转换为base64
            if (this.form.photo && this.form.photo instanceof File) {
              try {
                const base64 = await this.fileToBase64(this.form.photo)
                submitData.photo = base64.split(',')[1] // 移除data:image/xxx;base64,前缀
              } catch (error) {
                console.error('照片转换失败:', error)
                this.$message.error('照片处理失败')
                this.submitLoading = false
                return
              }
            }
            
            console.log('处理后的提交数据:', submitData)
            
            const response = await employeeApi.save(submitData)
            console.log('添加员工响应:', response)
            console.log('响应类型:', typeof response)
            console.log('响应code:', response.code)
            console.log('响应message:', response.message)
            console.log('响应data:', response.data)
            
            // 如果响应是布尔值true，说明添加成功
            if (response === true || (response && response.code === 200)) {
              this.$message.success('添加员工成功')
              this.resetForm()
              this.switchView('view')
              this.fetchData() // 刷新员工列表
            } else {
              this.$message.error((response && response.message) || '添加失败')
            }
          } catch (error) {
            console.error('添加员工失败:', error)
            console.error('错误详情:', error.response?.data)
            this.$message.error('添加失败: ' + (error.response?.data?.message || error.message || '未知错误'))
          } finally {
            this.submitLoading = false
          }
        } else {
          console.log('表单验证失败')
          this.$message.warning('请填写完整的员工信息')
        }
      })
    },
    
    // 编辑提交
    async handleEditSubmit() {
      this.$refs.editForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          console.log('=== 开始编辑提交 ===')
          try {
            const submitData = { ...this.editForm }
            
            // 如果密码为空，则不提交密码字段
            if (!this.editForm.password) {
              delete submitData.password
            }
            // 删除确认密码字段，不需要提交到后端
            delete submitData.confirmPassword
            
            // 如果有新上传的照片，转换为base64
            if (this.editForm.photo && this.editForm.photo instanceof File) {
              try {
                const base64 = await this.fileToBase64(this.editForm.photo)
                submitData.photo = base64.split(',')[1] // 移除data:image/xxx;base64,前缀
                // 有新照片时，清除删除标识
                submitData.deletePhoto = false
              } catch (error) {
                console.error('照片转换失败:', error)
                this.$message.error('照片处理失败')
                this.submitLoading = false
                return
              }
            }
            
            console.log('编辑提交数据:', submitData)
            console.log('deletePhoto标识:', submitData.deletePhoto)
            const response = await employeeApi.update(submitData)
            console.log('更新响应:', response)
            console.log('响应类型:', typeof response)
            
            // 如果响应是布尔值true，说明更新成功
            if (response === true || (response && response.code === 200)) {
              console.log('=== 更新成功 ===')
              this.$message.success('更新成功')
              this.dialogVisible = false
              this.fetchData()
            } else {
              console.log('=== 更新失败 ===')
              this.$message.error((response && response.message) || '更新失败')
            }
          } catch (error) {
            console.error('=== 更新异常 ===', error)
            console.error('错误详情:', error.response?.data)
            this.$message.error('更新失败: ' + (error.response?.data?.message || error.message || '未知错误'))
          } finally {
            this.submitLoading = false
          }
        }
      })
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.size = val
      this.fetchData()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.current = val
      this.fetchData()
    },
    
    // 照片上传处理
    handlePhotoUpload() {
      this.$refs.photoInput.click()
    },
    
    handlePhotoChange(event) {
      const file = event.target.files[0]
      if (file) {
        const isImage = file.type.startsWith('image/')
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isImage) {
          this.$message.error('只能上传图片文件!')
          return
        }
        if (!isLt2M) {
          this.$message.error('图片大小不能超过 2MB!')
          return
        }
        
        // 创建预览URL
        this.photoPreview = URL.createObjectURL(file)
        this.form.photo = file
        this.$message.success('照片上传成功')
      }
    },
    
    // 删除照片
    removePhoto() {
      this.form.photo = null
      if (this.photoPreview) {
        URL.revokeObjectURL(this.photoPreview)
        this.photoPreview = null
      }
      this.$message.info('照片已删除')
    },
    
    // 编辑照片上传处理
    handleEditPhotoUpload() {
      if (this.dialogMode === 'view') return
      this.$refs.editPhotoInput.click()
    },
    
    handleEditPhotoChange(event) {
      const file = event.target.files[0]
      if (file) {
        const isImage = file.type.startsWith('image/')
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isImage) {
          this.$message.error('只能上传图片文件!')
          return
        }
        if (!isLt2M) {
          this.$message.error('图片大小不能超过 2MB!')
          return
        }
        
        // 清理之前的预览URL
        if (this.editPhotoPreview) {
          URL.revokeObjectURL(this.editPhotoPreview)
        }
        
        // 创建预览URL
        this.editPhotoPreview = URL.createObjectURL(file)
        this.editForm.photo = file
        this.$message.success('照片上传成功')
      }
    },
    
    // 删除编辑照片
    removeEditPhoto() {
      this.editForm.photo = null
      // 设置一个特殊标识，告诉后端要删除照片
      this.editForm.deletePhoto = true
      // 清除照片预览
      if (this.editPhotoPreview) {
        URL.revokeObjectURL(this.editPhotoPreview)
        this.editPhotoPreview = null
      }
      // 清除原始照片数据
      this.editForm.photo = null
      console.log('删除照片，deletePhoto标识设置为:', this.editForm.deletePhoto)
      this.$message.info('照片已删除')
    },
    
    // 格式化日期为 YYYY-MM-DD 格式
    formatDate(date) {
      if (!date) return null
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 生成员工工号
    async generateEmployeeId() {
      this.$message.info('正在生成工号...')
      
      let attempts = 0
      const maxAttempts = 10 // 最大尝试次数
      
      while (attempts < maxAttempts) {
        attempts++
        
        // 生成一个随机的4位数工号
        const randomId = Math.floor(1000 + Math.random() * 9000)
        
        try {
          // 检查工号是否已存在
          const response = await employeeApi.checkEmployeeIdExists(randomId)
          const exists = response.data || response
          
          if (!exists) {
            // 工号不存在，可以使用
            this.form.employeeId = randomId
            this.$message.success(`已生成工号: ${randomId}`)
            console.log(`工号生成成功，尝试次数: ${attempts}`)
            return
          } else {
            console.log(`工号 ${randomId} 已存在，重新生成...`)
          }
        } catch (error) {
          console.error('检查工号是否存在时出错:', error)
          // 如果检查失败，直接使用生成的工号
          this.form.employeeId = randomId
          this.$message.warning(`生成工号: ${randomId} (未验证唯一性)`)
          return
        }
      }
      
      // 如果尝试次数过多，使用时间戳生成工号
      const timestampId = Math.floor(1000 + (Date.now() % 9000))
      this.form.employeeId = timestampId
      this.$message.warning(`生成工号: ${timestampId}`)
      console.log(`工号生成失败，使用备用方案，尝试次数: ${attempts}`)
    },
    
    // 文件转base64
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.employee-management {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  
  i {
    margin-right: 8px;
    color: #409EFF;
  }
}

.action-buttons {
  margin-bottom: 20px;
  
  .el-button {
    margin-right: 15px;
    border-radius: 4px;
    font-weight: 500;
    
    &.active {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

.separator-line {
  height: 2px;
  background: linear-gradient(90deg, #496723);
  margin: 20px 0;
  border-radius: 1px;
}

.employee-table {
  margin-top: 20px;
  
  ::v-deep .el-table__header {
    background-color: #f5fafc;
    
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }
  }
}

// 紧凑表格样式
.compact-table {
  ::v-deep .el-table__body-wrapper {
    .el-table__row {
      height: 40px; // 减小行高
      
      td {
        padding: 8px 0; // 减小单元格内边距
        font-size: 13px; // 稍微减小字体
      }
    }
  }
  
  ::v-deep .el-table__header-wrapper {
    .el-table__header {
      th {
        padding: 10px 0; // 减小表头内边距
        font-size: 13px; // 减小表头字体
        height: 45px; // 减小表头高度
      }
    }
  }
  
  // 标签样式调整
  ::v-deep .el-tag--mini {
    height: 20px;
    line-height: 18px;
    font-size: 11px;
    padding: 0 6px;
  }
  
  // 按钮样式调整
  ::v-deep .el-button--mini {
    padding: 5px 8px;
    font-size: 11px;
    height: 24px;
    line-height: 14px;
  }
}

.pagination {
  margin-top: 15px;
  text-align: right;
  
  ::v-deep .el-pagination {
    font-size: 13px;
    
    .el-pagination__sizes {
      .el-select {
        .el-input {
          .el-input__inner {
            height: 28px;
            line-height: 28px;
          }
        }
      }
    }
    
    .btn-prev,
    .btn-next {
      height: 28px;
      line-height: 28px;
    }
    
    .el-pager {
      li {
        height: 28px;
        line-height: 28px;
        min-width: 28px;
      }
    }
  }
}

.add-employee {
  .employee-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
    
    .el-form-item {
      margin-bottom: 20px;
    }
  }
}

.upload-area {
  width: 120px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  overflow: hidden;
  position: relative;
  
  &:hover {
    border-color: #409EFF;
  }
  
  .upload-icon {
    font-size: 28px;
    color: #8c939D;
  }
  
  .photo-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
}

.photo-actions {
  margin-top: 8px;
  text-align: center;
}

// 小尺寸照片上传区域（用于编辑对话框）
.upload-area-small {
  width: 80px;
  height: 80px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  overflow: hidden;
  position: relative;
  
  &:hover {
    border-color: #409EFF;
  }
  
  .upload-icon-small {
    font-size: 20px;
    color: #8c939D;
  }
  
  .photo-preview-small {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
}

.photo-actions-small {
  margin-top: 5px;
  text-align: center;
}

// 查看模式下的照片显示区域
.upload-area-view {
  width: 150px;
  height: 150px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background: #fafafa;
  
  .photo-preview-view {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
  
  .no-photo {
    text-align: center;
    color: #909399;
    
    i {
      font-size: 32px;
      margin-bottom: 8px;
      display: block;
    }
    
    p {
      margin: 0;
      font-size: 12px;
    }
  }
}

.photo-actions-view {
  margin-top: 8px;
  text-align: center;
}

.submit-btn {
  width: 120px;
  height: 40px;
  font-size: 16px;
}

.search-employee {
  .search-container {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    
    .search-type {
      width: 150px;
    }
    
    .search-input {
      flex: 1;
      max-width: 400px;
    }
    
    .search-btn {
      height: 40px;
      padding: 0 10px;
    }
  }
  
  .search-results {
    margin-top: 20px;
    
    .pagination {
      margin-top: 15px;
      text-align: right;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .employee-management {
    padding: 10px;
  }
  
  .action-buttons {
    .el-button {
      margin-bottom: 10px;
      width: 100%;
    }
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
    
    .search-type,
    .search-input {
      width: 100%;
      max-width: none;
    }
  }
}
</style>
