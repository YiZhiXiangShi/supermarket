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
  </div>
</template>

<script>
// 动态导入XLSX库
import request from '@/utils/request'

export default {
  data() {
    return {
      barcode: '',
      tableData: []
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
        this.$message.success('库存更新成功')
        this.tableData = []
        this.barcode = ''
      } catch (e) {
        this.$message.error('库存更新失败')
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
</style>
