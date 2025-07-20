<template>
  <div>
    <el-card>
      <div slot="header" class="order-header-row">
        <span>订单管理</span>
        <div class="header-controls">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            @change="handleDateChange"
            style="margin-right: 10px;"
          />
          <el-button type="primary" @click="loadOrders" size="small">查询</el-button>
          <el-button @click="resetFilters" size="small">重置</el-button>
        </div>
      </div>

      <!-- 订单统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ orderStats.totalOrders }}</div>
              <div class="stat-label">总订单数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-number">¥{{ orderStats.totalAmount }}</div>
              <div class="stat-label">总金额</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ orderStats.todayOrders }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-number">¥{{ orderStats.todayAmount }}</div>
              <div class="stat-label">今日金额</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table 
        :data="tableData" 
        style="width: 100%"
        v-loading="loading"
        stripe
      >
        <el-table-column prop="orderId" label="订单编号" width="120" />
        <el-table-column prop="orderTime" label="下单时间" width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.orderTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="cashier" label="收银员" width="100" />
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template slot-scope="scope">
            ¥{{ scope.row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentStatus" label="支付状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getPaymentStatusType(scope.row.paymentStatus)">
              {{ scope.row.paymentStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="商品数量" width="100">
          <template slot-scope="scope">
            {{ scope.row.items ? scope.row.items.length : 0 }} 种
          </template>
        </el-table-column>
        <el-table-column label="商品详情" min-width="200">
          <template slot-scope="scope">
            <div v-if="scope.row.items && scope.row.items.length > 0">
              <div v-for="(item, index) in scope.row.items.slice(0, 2)" :key="index" class="product-item">
                {{ item.productName }} × {{ item.quantity }}
              </div>
              <div v-if="scope.row.items.length > 2" class="more-products">
                还有 {{ scope.row.items.length - 2 }} 种商品...
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewOrderDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <!--
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
      -->

      <!-- 订单详情对话框 -->
      <el-dialog title="订单详情" :visible.sync="detailDialogVisible" width="60%">
        <div v-if="selectedOrder">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单编号">{{ selectedOrder.orderId }}</el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatDate(selectedOrder.orderTime) }}</el-descriptions-item>
            <el-descriptions-item label="收银员">{{ selectedOrder.cashier }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">¥{{ selectedOrder.totalAmount }}</el-descriptions-item>
            <el-descriptions-item label="支付状态">
              <el-tag :type="getPaymentStatusType(selectedOrder.paymentStatus)">
                {{ selectedOrder.paymentStatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="商品种类">{{ selectedOrder.items ? selectedOrder.items.length : 0 }} 种</el-descriptions-item>
          </el-descriptions>

          <!-- 订单商品列表 -->
          <div style="margin-top: 20px;">
            <h4>订单商品</h4>
            <el-table :data="selectedOrder.items || []" border>
              <el-table-column prop="productName" label="商品名称" />
              <el-table-column prop="quantity" label="数量" width="80" />
              <el-table-column prop="unitPrice" label="单价" width="100">
                <template slot-scope="scope">
                  ¥{{ scope.row.unitPrice }}
                </template>
              </el-table-column>
              <el-table-column prop="actualPrice" label="实际价格" width="100">
                <template slot-scope="scope">
                  ¥{{ scope.row.actualPrice }}
                </template>
              </el-table-column>
              <el-table-column prop="subtotal" label="小计" width="100">
                <template slot-scope="scope">
                  ¥{{ scope.row.subtotal }}
                </template>
              </el-table-column>
            </el-table>
            <div style="text-align: right; margin-top: 10px;">
              <span style="font-weight: bold;">总价：</span>
              <span style="color: #409EFF; font-size: 18px;">¥{{ selectedOrder.totalAmount }}</span>
            </div>
          </div>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { findallorder, findorder } from '@/api/sale'

export default {
  name: 'OrderManagement',
  data() {
    return {
      tableData: [],
      loading: false,
      dateRange: [],
      selectedOrder: null,
      detailDialogVisible: false,
      orderStats: {
        totalOrders: 0,
        totalAmount: '0.00',
        todayOrders: 0,
        todayAmount: '0.00'
      },
    }
  },
  mounted() {
    this.initDateRange()
    this.loadOrders()
  },
  methods: {
    // 初始化日期范围（默认显示最近30天）
    initDateRange() {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      // 格式化为 YYYY-MM-DD 格式，因为后端返回的数据格式是 "2025-07-01"
      this.dateRange = [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ]
    },

    // 处理日期变化
    handleDateChange() {
      this.loadOrders()
    },

    // 重置筛选条件
    resetFilters() {
      this.initDateRange()
      this.loadOrders()
    },

    // 加载订单数据
    async loadOrders() {
      if (!this.dateRange || this.dateRange.length !== 2) {
        this.$message.warning('请选择日期范围')
        return
      }

      this.loading = true
      try {
        const params = {
          startDate: this.dateRange[0],
          endDate: this.dateRange[1]
        }

        console.log('查询订单参数:', params)
        
        // 获取详细订单数据
        const detailRes = await findorder(params)
        console.log('订单详细结果:', detailRes)

        if (detailRes && detailRes.code === 0 && Array.isArray(detailRes.data)) {
          console.log('原始订单数据:', detailRes.data)
          // 处理订单数据，按订单ID分组
          const orderMap = new Map()
          detailRes.data.forEach(item => {
            if (!orderMap.has(item.orderId)) {
              orderMap.set(item.orderId, {
                orderId: item.orderId,
                orderTime: item.orderTime,
                cashier: item.cashier,
                paymentStatus: item.paymentStatus,
                items: []
              })
            }
            orderMap.get(item.orderId).items.push({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              actualPrice: item.actualPrice,
              subtotal: item.subtotal
            })
          })
          // 计算每个订单的总价
          orderMap.forEach(order => {
            order.totalAmount = order.items.reduce((sum, i) => sum + i.subtotal, 0)
          })
          this.tableData = Array.from(orderMap.values())
          console.log('处理后的订单数据:', this.tableData)
          // 计算统计信息
          this.calculateStats()
        } else {
          console.log('API返回数据格式不正确:', detailRes)
          this.tableData = []
        }
      } catch (error) {
        console.error('加载订单失败:', error)
        this.$message.error('加载订单失败')
        this.tableData = []
      } finally {
        this.loading = false
      }
    },

    // 计算统计信息
    calculateStats() {
      const today = new Date().toISOString().split('T')[0]
      let totalAmount = 0
      let todayAmount = 0
      let todayOrders = 0
      
      this.tableData.forEach(order => {
        totalAmount += order.totalAmount
        if (order.orderTime === today) {
          todayAmount += order.totalAmount
          todayOrders++
        }
      })
      
      this.orderStats = {
        totalOrders: this.tableData.length,
        totalAmount: totalAmount.toFixed(2),
        todayOrders: todayOrders,
        todayAmount: todayAmount.toFixed(2)
      }
    },

    // 查看订单详情
    viewOrderDetail(order) {
      this.selectedOrder = order
      this.detailDialogVisible = true
    },



    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return ''
      return dateStr
    },

    // 获取支付状态类型
    getPaymentStatusType(status) {
      const statusMap = {
        '已支付': 'success',
        '未支付': 'warning',
        '已退款': 'info',
        '支付失败': 'danger'
      }
      return statusMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.order-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  align-items: center;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-table {
  margin-top: 20px;
}

.product-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.more-products {
  font-size: 12px;
  color: #999;
  font-style: italic;
}
</style>
