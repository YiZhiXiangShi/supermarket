<template>
  <div>
    <el-card>
      <div slot="header">销售管理</div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="product" label="商品" />
        <el-table-column prop="amount" label="金额" />
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