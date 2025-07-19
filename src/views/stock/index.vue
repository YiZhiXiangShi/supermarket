<template>
  <div class="stock-page">
    <el-form :inline="true" class="stock-form" @submit.native.prevent>
      <el-form-item label="条码">
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
          :show-file-list="false"
          :on-change="handleUpload"
          accept=".xls,.xlsx"
          :auto-upload="false"
        >
          <el-link type="primary">导入excel文件</el-link>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="info" icon="el-icon-time" @click="showHistoryDialog">
          历史记录
        </el-button>
      </el-form-item>
    </el-form>
    <div class="stock-content">
      <el-table :data="tableData" border style="width: 800px; min-height: 300px;" :key="tableData.length">
        <el-table-column prop="serialNo" label="流水号" width="120" />
        <el-table-column prop="barcode" label="条码" width="180" />
        <el-table-column prop="productName" label="商品名称" width="180" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="quantity" label="上货数量" width="150">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.quantity" :min="0" size="small" />
          </template>
        </el-table-column>
      </el-table>
      <div class="stock-btn">
        <el-button type="primary" size="large" @click="handleConfirm">确定</el-button>
      </div>
    </div>

    <!-- 历史记录对话框 -->
    <el-dialog 
      title="上货历史记录" 
      :visible.sync="historyDialogVisible" 
      width="1200px"
      :before-close="handleHistoryDialogClose">
      
              <!-- 搜索条件 -->
        <div class="history-search">
          <el-form :inline="true" :model="historySearchForm" class="search-form">
            <el-form-item label="商品条码">
              <el-input 
                v-model="historySearchForm.barcodeNo" 
                placeholder="请输入商品条码"
                clearable
                style="width: 150px;">
              </el-input>
            </el-form-item>
          <el-form-item label="商品名称">
            <el-input 
              v-model="historySearchForm.productName" 
              placeholder="请输入商品名称"
              clearable
              style="width: 150px;">
            </el-input>
          </el-form-item>
          <el-form-item label="操作员">
            <el-input 
              v-model="historySearchForm.operatorName" 
              placeholder="请输入操作员姓名"
              clearable
              style="width: 150px;">
            </el-input>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="historySearchForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 300px;">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleHistorySearch" icon="el-icon-search">
              搜索
            </el-button>
            <el-button @click="handleHistoryReset" icon="el-icon-refresh">
              重置
            </el-button>

          </el-form-item>
        </el-form>
      </div>

      <!-- 历史记录表格 -->
      <el-table 
        :data="historyTableData" 
        style="width: 100%" 
        v-loading="historyLoading"
        class="history-table">
        <el-table-column prop="barcodeNo" label="商品条码" width="140" align="center"></el-table-column>
        <el-table-column prop="productName" label="商品名称" width="180" align="center"></el-table-column>
        <el-table-column prop="unit" label="单位" width="80" align="center"></el-table-column>
        <el-table-column prop="quantity" label="上货数量" width="100" align="center"></el-table-column>
        <el-table-column prop="operatorName" label="操作员" width="100" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
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
import { fetchStockHistoryList, batchInsertStockHistory, fetchStockHistoryListWithPagination } from '@/api/stockHistory'

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
      }
    }
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
        // 根据条码批量查数据库
        const results = await Promise.all(importedData.map(item =>
          request({
            url: `/product/barcode/${item.barcode}`,
            method: 'get'
          }).then(res => {
            console.log('查商品结果:', res)
            return {
              found: !!(res && res.barcodeNo),
              data: res,
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
        // 统计未查到的条码数量（包括接口异常和data为null的情况）
        const notFoundResults = results.filter(r => !r.found || !r.data)
        const notFoundCount = notFoundResults.length
        // 合并到现有表格（相同条码累加数量）
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
        '条码': 'barcode',
        '商品名称': 'productName',
        '单位': 'unit',
        '上货数量': 'quantity'
      }
      
      // 用于合并相同条码的商品
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
        
        // 检查是否已存在相同条码的商品
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
        if (res) {
          const existIndex = this.tableData.findIndex(item => item.barcode === res.barcodeNo)
          if (existIndex === -1) {
            // 商品不存在，添加新行
            this.tableData.push({
              serialNo: res.serialNo,
              barcode: res.barcodeNo,
              productName: res.productName,
              unit: res.unit,
              quantity: 1
            })
            this.$message.success('商品已添加到表格')
          } else {
            // 商品已存在，增加数量
            this.tableData[existIndex].quantity += 1
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
      } catch (e) {
        this.$message.error('库存更新失败')
      }
    },
    
    // 保存上货历史记录
    async saveStockHistory() {
      try {
        // 构建历史记录数据
        const historyList = this.tableData.map(item => ({
          productSerialNo: item.serialNo,
          barcodeNo: item.barcode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          operatorId: 1, // 这里可以从登录用户信息中获取
          operatorName: '系统操作员' // 这里可以从登录用户信息中获取
        }))
        
        // 调用API保存历史记录
        await batchInsertStockHistory(historyList)
        console.log('上货历史记录保存成功')
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
  width: 1000px;
}
.stock-btn {
  margin-left: 40px;
  display: flex;
  align-items: center;
  height: 100%;
}
.el-table {
  background: #fff;
}

/* 历史记录相关样式 */
.history-search {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  margin-bottom: 0;
}

.history-table {
  margin-bottom: 20px;
}

.history-table ::v-deep .el-table__header {
  background-color: #f5fafc;
}

.history-table ::v-deep .el-table__header th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.history-pagination {
  text-align: right;
  margin-top: 15px;
}
</style>
