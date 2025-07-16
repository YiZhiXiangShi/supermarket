<template>
  <div>
    <el-card>
      <div slot="header">收银管理</div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="amount" label="金额" />
        <el-table-column prop="cashier" label="收银员" />
        <el-table-column prop="date" label="收银时间" />
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tableData: []
    }
  }
}
</script> 