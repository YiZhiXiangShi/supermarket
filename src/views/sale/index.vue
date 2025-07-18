<template>
<div style="margin-bottom: 20px; display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
  <label>类型：
    <select v-model="type">
      <option value="种类">种类</option>
      <option value="固定商品">商品</option>
    </select>
  </label>

  <label>时间：
    <select v-model="time">
      <option value="日">日</option>
      <option value="月">月</option>
    </select>
  </label>

  <label>名称：
    <input type="text" v-model="name" placeholder="请输入名称" />
  </label>

  <!-- 条件显示日期输入框 -->
  <div v-if="time === '日'">
    <label>日期：
      <input type="date" v-model="date" />
    </label>
  </div>
  
  <button @click="fetchAndRenderChart">查询</button>
  <div id="main" style="width: 600px; height: 400px;"></div>
</div>
</template>

<script>
import * as echarts from 'echarts';
import axios from 'axios';

export default {
  data() {
    return {
      tableData: [],
      type: '种类', // 对应后端 private String type
      time: '月',   // 对应后端 private String time
      name: '',     // 对应后端 private String name
      date: ''      // 对应后端 private Date date
    };
  },
  mounted() {
    this.fetchAndRenderChart();
  },
  methods: {
    async fetchAndRenderChart() {
      const params = {
        type: this.type,
        time: this.time,
        name: this.name,
        date: this.date
      };

      try {
        const response = await axios.post('http://localhost:8080/sale', params);
        const data = response.data.data;

        const chartDom = document.getElementById('main');
        const myChart = echarts.init(chartDom);

        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: data.xAxis,
              axisTick: {
                alignWithLabel: true
              }
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '销售数据',
              type: 'bar',
              barWidth: '60%',
              data: data.yAxis
            }
          ]
        };

        myChart.setOption(option);
      } catch (error) {
        console.error('请求数据失败:', error);
      }
    }
  }
};
</script>