<template>
  <div class="stock-page">
    <el-form :inline="true" class="stock-form" @submit.native.prevent>
      <el-form-item label="商品条码">
        <el-input
          v-model="barcode"
          placeholder="请扫描商品条码"
          style="width: 300px;"
          @input="onBarcodeInput"
          maxlength="13"
          @keyup.enter.native="handleBarcodeEnter"
        />
      </el-form-item>
      <el-form-item class="import-link">
        <el-upload
          action="#"
          :show-file-list="false"
          :on-change="handleUpload"
          accept=".xls,.xlsx"
          :auto-upload="false"
        >
          <el-button type="primary" icon="el-icon-upload2">导入Excel文件</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-time" @click="showHistoryDialog">
          历史记录
        </el-button>
      </el-form-item>
    </el-form>
    <div class="stock-content">
      <el-table :data="tableData" border style="flex: 1 1 auto; min-width: 700px; max-width: 740px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; background: #fafbfc;" :key="tableData.length" class="stock-table">
        <el-table-column prop="serialNo" label="流水号" width="124" align="center" />
        <el-table-column prop="barcode" label="商品条码" width="185" align="center" />
        <el-table-column prop="productName" label="商品名称" width="185" align="center" />
        <el-table-column prop="unit" label="单位" width="82" align="center" />
        <el-table-column prop="quantity" label="上货数量" width="154" align="center">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.quantity" :min="0" size="small" />
          </template>
        </el-table-column>
      </el-table>
      <div class="stock-btn">
        <el-button type="primary" size="large" @click="handleConfirm" class="stock-confirm-btn">确定</el-button>
      </div>
    </div>

    <!-- 历史记录对话框 -->
    <el-dialog 
      title="上货历史记录" 
      :visible.sync="historyDialogVisible" 
      width="1000px"
      custom-class="history-dialog"
      :before-close="handleHistoryDialogClose">
      
      <!-- 操作按钮 -->
      <div class="export-section" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; width: 850px;">
        <div class="search-section" style="flex: 0 0 700px;">
          <!-- 搜索条件 -->
          <div class="history-search">
            <el-form :inline="true" :model="historySearchForm" class="search-form">
              <!-- 第一行 -->
              <div class="search-row" style="display: flex; align-items: center; margin-bottom: 8px;">
                <el-form-item label="商品条码" style="margin-bottom: 0; margin-right: 15px;">
                  <el-input 
                    v-model="historySearchForm.barcodeNo" 
                    placeholder="请输入商品条码"
                    clearable
                    style="width: 120px;">
                  </el-input>
                </el-form-item>
                <el-form-item label="商品名称" style="margin-bottom: 0; margin-right: 15px;">
                  <el-input 
                    v-model="historySearchForm.productName" 
                    placeholder="请输入商品名称"
                    clearable
                    style="width: 120px;">
                  </el-input>
                </el-form-item>
                <el-form-item label="操作员" style="margin-bottom: 0; margin-right: 15px;">
                  <el-input 
                    v-model="historySearchForm.operatorName" 
                    placeholder="请输入操作员姓名"
                    clearable
                    style="width: 120px;">
                  </el-input>
                </el-form-item>
              </div>
              <!-- 第二行 -->
              <div class="search-row" style="display: flex; align-items: center;">
                <el-form-item label="时间范围" style="margin-bottom: 0; margin-right: 15px;">
                  <el-date-picker
                    v-model="historySearchForm.timeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="yyyy-MM-dd HH:mm:ss"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    style="width: 280px;">
                  </el-date-picker>
                </el-form-item>
                <el-form-item style="margin-bottom: 0; margin-right: 15px;">
                  <el-button type="primary" @click="handleHistorySearch" icon="el-icon-search">
                    搜索
                  </el-button>
                </el-form-item>
                <el-form-item style="margin-bottom: 0;">
                  <el-button @click="handleHistoryReset" icon="el-icon-refresh">
                    重置
                  </el-button>
                </el-form-item>
              </div>
            </el-form>
          </div>
        </div>
        
        <!-- 操作按钮区域 -->
        <div class="action-buttons" style="display: flex; flex-direction: column; gap: 8px; margin-left: 20px; align-self: flex-start;">
          <el-button 
            type="danger" 
            icon="el-icon-delete" 
            @click="handleBatchDelete"
            :loading="batchDeleteLoading"
            :disabled="!selectedHistoryRows.length"
            size="small">
            批量删除
          </el-button>
          <el-button 
            type="success" 
            icon="el-icon-download" 
            @click="exportToExcel"
            :loading="exportLoading"
            :disabled="!historyTableData.length"
            size="small">
            导出Excel
          </el-button>
        </div>
      </div>

      <!-- 历史记录表格 -->
      <el-table 
        :data="historyTableData" 
        style="width: 100%; max-height: 400px;" 
        v-loading="historyLoading"
        class="history-table"
        @selection-change="handleHistorySelectionChange">
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column prop="barcodeNo" label="商品条码" width="130" align="center"></el-table-column>
        <el-table-column prop="productName" label="商品名称" width="180" align="center"></el-table-column>
        <el-table-column prop="unit" label="单位" width="70" align="center"></el-table-column>
        <el-table-column prop="quantity" label="上货数量" width="90" align="center"></el-table-column>
        <el-table-column prop="operatorId" label="操作员ID" width="90" align="center"></el-table-column>
        <el-table-column prop="operatorName" label="操作员姓名" width="100" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template slot-scope="scope">
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDeleteHistory(scope.row)"
              :loading="scope.row.deleteLoading">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 历史记录分页 -->
      <div class="history-pagination">
        <el-pagination
          @size-change="handleHistorySizeChange"
          @current-change="handleHistoryCurrentChange"
          :current-page="historyPagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="historyPagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="historyPagination.total">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 动态导入XLSX库
import request from '@/utils/request'
import { fetchStockHistoryList, batchInsertStockHistory, fetchStockHistoryListWithPagination, deleteStockHistory, batchDeleteStockHistory } from '@/api/stockHistory'
import { getUserInfo } from '@/utils/auth'

export default {
  data() {
    return {
      barcode: '',
      tableData: [],
      
      // 历史记录相关数据
      historyDialogVisible: false,
      historyLoading: false,
      historyTableData: [],
      historySearchForm: {
        barcodeNo: '',
        productName: '',
        operatorName: '',
        timeRange: []
      },
      historyPagination: {
        current: 1,
        size: 10,
        total: 0
      },
      
      // 导出相关数据
      exportLoading: false,
      // 新增：存储当前登录用户信息
      userInfo: null,
      // 删除相关数据
      selectedHistoryRows: [],
      batchDeleteLoading: false
    }
  },
  created() {
    // 获取当前登录用户信息
    this.userInfo = getUserInfo() || {}
  },
  methods: {
    onBarcodeInput(val) {
      // 只允许输入数字，且最大13位
      this.barcode = val.replace(/\D/g, '').slice(0, 13)
    },
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file.raw)
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.onerror = (e) => {
          reject(e)
        }
      })
    },
    async handleUpload(file) {
      try {
        if (!file.raw) {
          throw new Error('文件对象无效')
        }
        const data = await this.getXlsxData(file)
        if (!data || data.length === 0) {
          throw new Error('Excel文件中没有有效数据')
        }
        const importedData = this.translateField(data)
        if (!importedData || importedData.length === 0) {
          throw new Error('数据转换后为空')
        }
        // 根据商品条码批量查数据库
        const results = await Promise.all(importedData.map(item =>
          request({
            url: `/product/barcode/${item.barcode}`,
            method: 'get'
          }).then(res => {
            console.log('查商品结果:', res)
            return {
              found: !!(res && res.data && res.data.barcodeNo),
              data: res.data,
              quantity: item.quantity,
              barcode: item.barcode
            }
          }).catch(() => ({ found: false, barcode: item.barcode }))
        ))
        // 只保留查到的商品
        const validRows = results.filter(r => r.found).map(r => ({
          serialNo: r.data.serialNo,
          barcode: r.data.barcodeNo,
          productName: r.data.productName,
          unit: r.data.unit,
          quantity: r.quantity || 1
        }))
        // 统计未查到的商品条码数量（包括接口异常和data为null的情况）
        const notFoundResults = results.filter(r => !r.found || !r.data)
        const notFoundCount = notFoundResults.length
        // 合并到现有表格（相同商品条码累加数量）
        const barcodeMap = new Map()
        this.tableData.forEach(item => {
          barcodeMap.set(item.barcode, { ...item })
        })
        validRows.forEach(item => {
          if (barcodeMap.has(item.barcode)) {
            barcodeMap.get(item.barcode).quantity += item.quantity
          } else {
            barcodeMap.set(item.barcode, { ...item })
          }
        })
        this.tableData = Array.from(barcodeMap.values())
        console.log('tableData:', this.tableData)
        // 统一提示
        let msg = `成功导入 ${validRows.length} 条商品`
        if (notFoundCount > 0) {
          msg += `，有 ${notFoundCount} 条商品未查到，已忽略`
        }
        this.$message.success(msg)
      } catch (error) {
        console.error('导入Excel文件时出错:', error)
        this.$message.error('导入Excel文件失败: ' + error.message)
      }
    },
    async getXlsxData(file) {
      try {
        // 动态导入XLSX库
        const XLSX = await import('xlsx')
        
        const dataBinary = await this.readFile(file)
        
        if (!XLSX || !XLSX.read) {
          throw new Error('XLSX库未正确加载')
        }
        
        const workBook = XLSX.read(dataBinary, { type: 'array' })
        
        if (!workBook.SheetNames || workBook.SheetNames.length === 0) {
          throw new Error('Excel文件中没有找到工作表')
        }
        
        const workSheet = workBook.Sheets[workBook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(workSheet)
        
        if (!data || data.length === 0) {
          throw new Error('Excel文件中没有找到数据')
        }
        
        return data
      } catch (error) {
        console.error('读取Excel文件时出错:', error)
        throw error
      }
    },
    translateField(data) {
      const cnToEn = {
        '流水号': 'serialNo',
        '商品条码': 'barcode',
        '条码': 'barcode',
        '商品名称': 'productName',
        '单位': 'unit',
        '上货数量': 'quantity'
      }
      
      // 用于合并相同商品条码的商品
      const barcodeMap = new Map()
      
      data.forEach((item, index) => {
        const arrItem = {}
        Object.keys(item).forEach((key) => {
          if (cnToEn[key]) {
            arrItem[cnToEn[key]] = item[key]
          }
        })
        
        // 确保必要字段存在
        if (!arrItem.barcode) {
          return
        }
        
        // 检查是否已存在相同商品条码的商品
        if (barcodeMap.has(arrItem.barcode)) {
          // 如果存在，增加数量
          const existingItem = barcodeMap.get(arrItem.barcode)
          existingItem.quantity += (parseInt(arrItem.quantity) || 1)
        } else {
          // 如果不存在，添加到Map中
          barcodeMap.set(arrItem.barcode, {
            ...arrItem,
            quantity: parseInt(arrItem.quantity) || 1
          })
        }
      })
      
      return Array.from(barcodeMap.values())
    },
    async handleBarcodeEnter() {
      if (!this.barcode) return
      try {
        const res = await request({
          url: `/product/barcode/${this.barcode}`,
          method: 'get'
        })
        console.log('接口响应:', res)
        if (res && res.data) {
          const existIndex = this.tableData.findIndex(item => item.barcode === res.data.barcodeNo)
          if (existIndex === -1) {
            // 商品不存在，添加新行
            this.tableData.push({
              serialNo: res.data.serialNo,
              barcode: res.data.barcodeNo,
              productName: res.data.productName,
              unit: res.data.unit,
              quantity: 1
            })
            console.log('tableData:', this.tableData)
            this.$message.success('商品已添加到表格')
          } else {
            // 商品已存在，增加数量
            this.tableData[existIndex].quantity += 1
            console.log('tableData:', this.tableData)
            this.$message.success(`商品数量已增加，当前数量：${this.tableData[existIndex].quantity}`)
          }
        } else {
          this.$message.error('未找到该商品')
        }
        this.barcode = ''
      } catch (e) {
        this.$message.error('查询失败')
      }
    },
    async handleConfirm() {
      if (!this.tableData.length) {
        this.$message.warning('没有需要更新的商品')
        return
      }
      try {
        const updateList = this.tableData.map(item => ({
          barcode: item.barcode,
          quantity: item.quantity
        }))
        await request({
          url: '/product/stock/update',
          method: 'post',
          data: updateList
        })
        
        // 保存上货历史记录
        await this.saveStockHistory()
        
        this.$message.success('库存更新成功')
        this.tableData = []
        this.barcode = ''
        console.log('tableData:', this.tableData)
      } catch (e) {
        this.$message.error('库存更新失败')
      }
    },
    
    // 保存上货历史记录
    async saveStockHistory() {
      try {
        // 构建历史记录数据（只包含必要字段）
        const operatorId = this.userInfo && this.userInfo.employeeId ? this.userInfo.employeeId : 1
        
        // 验证商品是否存在，只保存存在的商品记录
        const validHistoryList = []
        
        for (const item of this.tableData) {
          try {
            // 验证商品是否存在
            const productRes = await request({
              url: `/product/barcode/${item.barcode}`,
              method: 'get'
            })
            
            if (productRes && productRes.data && productRes.data.barcodeNo) {
              // 商品存在，添加到历史记录列表
              validHistoryList.push({
                barcodeNo: item.barcode,
                quantity: item.quantity,
                operatorId: operatorId
              })
            } else {
              console.warn(`商品条码 ${item.barcode} 在数据库中不存在，跳过历史记录保存`)
            }
          } catch (error) {
            console.warn(`验证商品条码 ${item.barcode} 时出错，跳过历史记录保存:`, error)
          }
        }
        
        // 只有当有有效记录时才调用API保存历史记录
        if (validHistoryList.length > 0) {
          await batchInsertStockHistory(validHistoryList)
          console.log(`成功保存 ${validHistoryList.length} 条上货历史记录`)
        } else {
          console.warn('没有有效的商品记录需要保存历史')
        }
      } catch (error) {
        console.error('保存上货历史记录失败:', error)
        // 这里不抛出异常，避免影响主要的上货功能
      }
    },
    
    // 显示历史记录对话框
    showHistoryDialog() {
      this.historyDialogVisible = true
      this.fetchHistoryData()
    },
    
    // 关闭历史记录对话框
    handleHistoryDialogClose() {
      this.historyDialogVisible = false
      this.resetHistorySearch()
    },
    
    // 获取历史记录数据
    async fetchHistoryData() {
      this.historyLoading = true
      try {
        const params = {
          current: this.historyPagination.current,
          size: this.historyPagination.size,
          ...this.historySearchForm
        }
        
        // 处理时间范围
        if (this.historySearchForm.timeRange && this.historySearchForm.timeRange.length === 2) {
          params.startTime = this.historySearchForm.timeRange[0]
          params.endTime = this.historySearchForm.timeRange[1]
        }
        
        console.log('发送搜索参数:', params)
        const response = await fetchStockHistoryListWithPagination(params)
        console.log('搜索响应:', response)
        
        if (response && response.code === 0 && response.data) {
          this.historyTableData = response.data
          this.historyPagination.total = response.count || 0
          console.log('设置表格数据:', this.historyTableData)
          console.log('设置总数:', this.historyPagination.total)
        } else {
          this.historyTableData = []
          this.historyPagination.total = 0
          console.log('没有数据，清空表格')
        }
      } catch (error) {
        console.error('获取历史记录失败:', error)
        this.$message.error('获取历史记录失败: ' + (error.message || '未知错误'))
        this.historyTableData = []
        this.historyPagination.total = 0
      } finally {
        this.historyLoading = false
      }
    },
    
    // 历史记录搜索
    handleHistorySearch() {
      this.historyPagination.current = 1
      this.fetchHistoryData()
    },
    
    // 重置历史记录搜索
    handleHistoryReset() {
      this.resetHistorySearch()
      this.fetchHistoryData()
    },
    
    // 重置历史记录搜索表单
    resetHistorySearch() {
      this.historySearchForm = {
        barcodeNo: '',
        productName: '',
        operatorName: '',
        timeRange: []
      }
      this.historyPagination.current = 1
    },
    
    // 历史记录分页大小改变
    handleHistorySizeChange(val) {
      this.historyPagination.size = val
      this.historyPagination.current = 1
      this.fetchHistoryData()
    },
    
    // 历史记录当前页改变
    handleHistoryCurrentChange(val) {
      this.historyPagination.current = val
      this.fetchHistoryData()
    },
    
    // 删除历史记录
    async handleDeleteHistory(row) {
      try {
        await this.$confirm(
          `确定要删除这条上货记录吗？\n商品：${row.productName}\n商品条码：${row.barcodeNo}\n数量：${row.quantity}`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 设置删除加载状态
        this.$set(row, 'deleteLoading', true)
        
        // 调用删除API（使用id）
        await deleteStockHistory(row.id)
        
        this.$message.success('删除成功')
        
        // 重新加载数据
        this.fetchHistoryData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除历史记录失败:', error)
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      } finally {
        // 清除删除加载状态
        this.$set(row, 'deleteLoading', false)
      }
    },
    
    // 历史记录选择变化
    handleHistorySelectionChange(selection) {
      this.selectedHistoryRows = selection
    },
    
    // 批量删除历史记录
    async handleBatchDelete() {
      if (!this.selectedHistoryRows.length) {
        this.$message.warning('请选择要删除的记录')
        return
      }
      
      try {
        const selectedCount = this.selectedHistoryRows.length
        await this.$confirm(
          `确定要删除选中的 ${selectedCount} 条上货记录吗？此操作不可恢复！`,
          '确认批量删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        this.batchDeleteLoading = true
        
        // 获取选中记录的id列表
        const ids = this.selectedHistoryRows.map(row => row.id)
        
        // 调用批量删除API
        await batchDeleteStockHistory(ids)
        
        this.$message.success(`成功删除 ${selectedCount} 条记录`)
        
        // 清空选择
        this.selectedHistoryRows = []
        
        // 重新加载数据
        this.fetchHistoryData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除历史记录失败:', error)
          this.$message.error('批量删除失败: ' + (error.message || '未知错误'))
        }
      } finally {
        this.batchDeleteLoading = false
      }
    },
    

    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    
    // 导出Excel文件
    async exportToExcel() {
      if (!this.historyTableData.length) {
        this.$message.warning('没有数据可导出')
        return
      }
      
      this.exportLoading = true
      try {
        // 动态导入XLSX库
        const XLSX = await import('xlsx')
        
        // 准备导出数据
        const exportData = this.historyTableData.map(item => ({
          '商品条码': item.barcodeNo,
          '商品名称': item.productName,
          '单位': item.unit,
          '上货数量': item.quantity,
          '操作员ID': item.operatorId,
          '操作员姓名': item.operatorName,
          '创建时间': this.formatDateTime(item.createTime)
        }))
        
        // 创建工作簿
        const workBook = XLSX.utils.book_new()
        const workSheet = XLSX.utils.json_to_sheet(exportData)
        
        // 设置列宽
        const colWidths = [
          { wch: 15 }, // 商品条码
          { wch: 20 }, // 商品名称
          { wch: 8 },  // 单位
          { wch: 10 }, // 上货数量
          { wch: 12 }, // 操作员ID
          { wch: 12 }, // 操作员姓名
          { wch: 20 }  // 创建时间
        ]
        workSheet['!cols'] = colWidths
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(workBook, workSheet, '上货历史记录')
        
        // 生成文件名
        const now = new Date()
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
        const fileName = `上货历史记录_${timestamp}.xlsx`
        
        // 导出文件
        XLSX.writeFile(workBook, fileName)
        
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出Excel文件时出错:', error)
        this.$message.error('导出失败: ' + error.message)
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style scoped>
.stock-page {
  padding: 40px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: #fff;
}
.stock-form {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 900px;
}
.import-link {
  margin-left: auto;
}
.stock-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  width: 900px;
  min-width: 900px;
  max-width: 900px;
  margin: 0 auto;
}
.stock-btn {
  margin-left: 2px;
  width: 160px;
  flex: 0 0 160px;
  display: flex;
  align-items: flex-start;
  height: 100%;
  justify-content: flex-end;
}
.el-table {
  background: #fff;
}

/* 历史记录相关样式 */
.export-section {
  width: 850px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.history-search {
  margin-bottom: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  margin-bottom: 0;
}

.search-form .el-form-item {
  margin-bottom: 6px;
  margin-right: 12px;
}

.search-section {
  flex: 0 0 700px;
  max-width: 700px;
}

.search-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.search-row .el-form-item {
  margin-bottom: 0;
  margin-right: 15px;
}

.search-row .el-form-item:last-child {
  margin-right: 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 20px;
  align-self: flex-start;
}

.action-buttons .el-button {
  width: 100px;
}

.history-table {
  margin-bottom: 10px;
}

.history-table ::v-deep .el-table__header {
  background-color: #f5fafc;
}

.history-table ::v-deep .el-table__header th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  padding: 8px 0;
}

.history-table ::v-deep .el-table__row {
  height: 40px;
}

.history-table ::v-deep .el-table__cell {
  padding: 6px 0;
}

.history-pagination {
  text-align: right;
  margin-top: 8px;
}

.stock-table {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  background: #fafbfc;
  font-size: 15px;
  /* 去除 el-table 默认外边距 */
  margin: 0 !important;
}
.stock-table ::v-deep .el-table__header th {
  background: linear-gradient(90deg, #e3f0ff 0%, #f5faff 100%);
  color: #2d3a4b;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 2px solid #e6e9f0;
  text-align: center;
}
.stock-table ::v-deep .el-table__row {
  transition: background 0.2s;
  height: 48px;
}
.stock-table ::v-deep .el-table__row:hover {
  background: #eaf6ff !important;
}
.stock-table ::v-deep .el-table__cell {
  font-size: 15px;
  color: #34495e;
  text-align: center;
}
.stock-confirm-btn {
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  border: none;
  color: #fff;
  font-size: 18px;
  border-radius: 24px;
  padding: 10px 36px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.12);
  transition: background 0.2s, box-shadow 0.2s;
}
.stock-confirm-btn:hover {
  background: linear-gradient(90deg, #66b1ff 0%, #409eff 100%);
  box-shadow: 0 4px 16px rgba(64,158,255,0.18);
}

/* 历史记录对话框自定义样式 */
:global(.history-dialog) {
  margin-top: 0.5vh !important;
  max-width: 95vw;
  max-height: 94vh;
}

:global(.history-dialog .el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
  padding: 12px;
}

:global(.history-dialog .el-dialog__header) {
  padding: 12px 12px 6px 12px;
  border-bottom: 1px solid #e4e7ed;
}

:global(.history-dialog .el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:global(.history-dialog .el-dialog__footer) {
  padding: 6px 12px 12px 12px;
  border-top: 1px solid #e4e7ed;
}

/* 确保对话框不会超出屏幕 */
:global(.history-dialog .el-dialog) {
  display: flex;
  flex-direction: column;
  max-height: 94vh;
}

:global(.history-dialog .el-dialog__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:global(.history-dialog .history-table) {
  flex: 1;
  overflow: auto;
}

/* 表格滚动条样式 */
:global(.history-dialog .el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
}

:global(.history-dialog .el-table__body-wrapper::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:global(.history-dialog .el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

:global(.history-dialog .el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  :global(.history-dialog) {
    width: 95vw !important;
    margin: 0.5vh auto !important;
  }
  
  :global(.history-dialog .el-dialog__body) {
    max-height: 65vh;
    padding: 10px;
  }
  
  .export-section {
    width: 100%;
  }
  
  .search-section {
    flex: 0 0 600px;
    max-width: 600px;
  }
  
  .search-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-row .el-form-item {
    margin-bottom: 8px;
    margin-right: 0;
  }
  
  .action-buttons {
    margin-left: 0;
    margin-top: 10px;
    flex-direction: row;
    gap: 10px;
  }
  
  .action-buttons .el-button {
    width: auto;
  }
}

@media (max-width: 1200px) {
  :global(.history-dialog) {
    width: 98vw !important;
    margin: 0.2vh auto !important;
  }
  
  :global(.history-dialog .el-dialog__body) {
    max-height: 70vh;
    padding: 8px;
  }
  
  .export-section {
    flex-direction: column;
    width: 100%;
  }
  
  .search-section {
    flex: none;
    max-width: 100%;
    margin-bottom: 10px;
  }
  
  .action-buttons {
    align-self: flex-end;
  }
}
</style>
