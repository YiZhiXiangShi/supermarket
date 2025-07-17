<template>
  <div class="stock-page">
    <el-form :inline="true" class="stock-form">
      <el-form-item label="条码">
        <el-input
          v-model="barcode"
          placeholder="请扫描商品条码"
          style="width: 300px;"
          @keyup.enter.native="handleBarcodeEnter"
        />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="manualInput">手动输入条码</el-checkbox>
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
      <el-table :data="tableData" border style="width: 800px; min-height: 300px;">
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
import XLSX from 'xlsx'
import request from '@/utils/request'

export default {
  data() {
    return {
      barcode: '',
      manualInput: false,
      tableData: []
    }
  },
  methods: {
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
      const data = await this.getXlsxData(file)
      this.tableData = this.translateField(data)
    },
    async getXlsxData(file) {
      const dataBinary = await this.readFile(file)
      const workBook = XLSX.read(dataBinary)
      const workSheet = workBook.Sheets[workBook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(workSheet)
      const newData = data.slice(0, data.length - 1)
      return newData
    },
    translateField(data) {
      const arr = []
      const cnToEn = {
        '流水号': 'serialNo',
        '条码': 'barcode',
        '商品名称': 'productName',
        '单位': 'unit',
        '上货数量': 'quantity'
      }
      data.forEach((item) => {
        const arrItem = {}
        Object.keys(item).forEach((key) => {
          arrItem[cnToEn[key]] = item[key]
        })
        arr.push(arrItem)
      })
      return arr
    },
    async handleBarcodeEnter() {
      if (!this.barcode) return
      try {
        const res = await request({
          url: `/product/barcode/${this.barcode}`,
          method: 'get'
        })
        if (res && res.data) {
          const exist = this.tableData.find(item => item.barcode === res.data.barcode)
          if (!exist) {
            this.tableData.push({
              serialNo: res.data.serialNo,
              barcode: res.data.barcodeNo,
              productName: res.data.productName,
              unit: res.data.unit,
              quantity: 1
            })
          } else {
            this.$message.warning('该商品已在表格中')
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