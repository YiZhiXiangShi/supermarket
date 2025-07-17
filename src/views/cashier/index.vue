<template>
  <div>
    <el-card>
      <div slot="header" style="display: flex; align-items: center; gap: 16px;">
        <el-input
          v-model="barcode"
          :disabled="!manualInput"
          placeholder="请输入商品条码或扫码"
          style="width: 250px;"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-checkbox v-model="manualInput">手动输入条码</el-checkbox>
        <el-button type="success" @click="showCheckoutDialog" style="margin-left: auto;">结账</el-button>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="productId" label="序号" />
        <el-table-column prop="barCode" label="条码" />
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="unitPrice" label="单价" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="totalPrice" label="金额" />
      </el-table>
    </el-card>

    <!-- 结账弹窗 -->
    <el-dialog
      title="收银结账"
      :visible.sync="checkoutDialogVisible"
      width="60%"
      :close-on-click-modal="false">
      <div class="checkout-content">
        <!-- 收银信息 -->
        <div class="checkout-header">
          <div class="checkout-info">
            <span class="info-item">收银员工号：{{ cashierInfo.employeeId }}</span>
            <span class="info-item">日期：{{ cashierInfo.date }}</span>
            <span class="info-item">流水号：{{ cashierInfo.serialNumber }}</span>
          </div>
        </div>

        <!-- 商品表格 -->
        <el-table :data="checkoutItems" style="width: 100%; margin: 20px 0;">
          <el-table-column prop="productId" label="序号" width="60" />
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="unitPrice" label="单价" width="80" />
          <el-table-column prop="quantity" label="数量" width="60" />
          <el-table-column prop="totalPrice" label="金额" width="80" />
        </el-table>

        <!-- 结账信息 -->
        <div class="checkout-summary">
          <div class="summary-row">
            <span>总计：</span>
            <span class="total-amount">¥{{ totalAmount }}</span>
          </div>
          <div class="summary-row">
            <span>优惠：</span>
            <span class="discount-amount">¥{{ discountAmount }}</span>
          </div>
          <div class="summary-row">
            <span>实收：</span>
            <el-input
              v-model="receivedAmount"
              placeholder="请输入实收金额"
              style="width: 130px;"
              @input="calculateChange"
            />
          </div>
          <div class="summary-row">
            <span>找零：</span>
            <span class="change-amount">¥{{ changeAmount }}</span>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="checkoutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCheckout">确定收银</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import cashierApi from '@/api/cashier'

export default {
  data() {
    return {
      barcode: '', // 输入框内容
      manualInput: false, // 是否手动输入
      tableData: [], // 商品数据
      // 结账相关
      checkoutDialogVisible: false,
      checkoutItems: [],
      cashierInfo: {
        employeeId: '001',
        date: '',
        serialNumber: ''
      },
      receivedAmount: '',
      discountAmount: 0,
      changeAmount: 0
    }
  },
  computed: {
    totalAmount() {
      return this.checkoutItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2)
    }
  },
  created() {
    console.log('cashierApi', cashierApi)
    this.loadAll()
    this.initCashierInfo()
  },
  methods: {
    initCashierInfo() {
      // 初始化收银信息
      const now = new Date()
      this.cashierInfo.date = now.toLocaleDateString()
      this.cashierInfo.serialNumber = 'SN' + Date.now()
    },
    async loadAll() {
      try {
        const res = await cashierApi.findAll()
        this.tableData = res.data || []
      } catch (e) {
        console.error('findAll异常', e)
        this.$message.error('加载全部商品失败')
      }
    },
    async handleSearch() {
      if (!this.barcode) {
        // 当输入框为空时，显示全部数据
        this.loadAll()
        return
      }
      try {
        const res = await cashierApi.find(this.barcode)
        // 假设返回数据结构为 { data: {...} } 或 { data: null }
        this.tableData = res.data ? [res.data] : []
        if (!res.data) {
          this.$message.info('未查询到相关商品')
        }
      } catch (e) {
        this.$message.error('查询失败，请重试')
      }
    },
    showCheckoutDialog() {
      // 显示结账弹窗
      this.checkoutItems = [...this.tableData]
      this.receivedAmount = ''
      this.changeAmount = 0
      this.checkoutDialogVisible = true
    },
    calculateChange() {
      // 计算找零
      const received = parseFloat(this.receivedAmount) || 0
      const total = parseFloat(this.totalAmount) || 0
      this.changeAmount = (received - total).toFixed(2)
    },
    confirmCheckout() {
      if (!this.receivedAmount || parseFloat(this.receivedAmount) < parseFloat(this.totalAmount)) {
        this.$message.warning('实收金额不能小于总计金额')
        return
      }
      
      // 这里可以调用结账接口
      this.$message.success('收银成功！')
      this.checkoutDialogVisible = false
      // 清空表格数据
      this.tableData = []
    }
  }
}
</script>

<style scoped>
.checkout-content {
  padding: 20px;
}

.checkout-header {
  margin-bottom: 20px;
}

.checkout-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.info-item {
  margin-right: 20px;
}

.checkout-summary {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #e6a23c;
}

.discount-amount {
  color: #67c23a;
}

.change-amount {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}

.dialog-footer {
  text-align: right;
}
</style>
