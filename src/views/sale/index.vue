<template>
<div class="sale-container">
  <div class="filter-section">
    <div class="filter-row">
      <div class="filter-item">
        <label>类型：</label>
        <select v-model="type" @change="onTypeChange" class="filter-select">
          <option value="种类">种类</option>
          <option value="商品">商品</option>
        </select>
      </div>

      <div class="filter-item">
        <label>时间：</label>
        <select v-model="time" class="filter-select">
          <option value="日">日</option>
          <option value="月">月</option>
        </select>
      </div>

      <div class="filter-item">
        <label>名称：</label>
        <div class="input-container">
          <input 
            type="text" 
            v-model="name" 
            placeholder="请输入名称" 
            @focus="onNameFocus"
            @input="onNameInput"
            @blur="onNameBlur"
            @keydown="onKeyDown"
            class="name-input"
          />
          <!-- 自定义下拉提示框 -->
          <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
            <div 
              v-for="(item, index) in suggestions" 
              :key="item"
              @click.stop="selectSuggestion(item)"
              @mousedown.prevent="selectSuggestion(item)"
              @mouseenter="hoveredIndex = index"
              :class="['suggestion-item', { 'hovered': hoveredIndex === index }]"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>

      <!-- 条件显示日期输入框 -->
      <div v-if="time === '日'" class="filter-item">
        <label>日期：</label>
        <input type="date" v-model="date" class="filter-input" />
      </div>
            <div v-if="time === '月'" class="filter-item">
        <label>年份：</label>
        <input type="number" v-model="year" class="filter-input" />
      </div>
    </div>
    
    <div class="button-section">
      <button @click="fetchAndRenderChart" class="query-btn">查询</button>
      <button @click="exportToExcel" class="export-btn excel-btn" :disabled="!hasData">
        <i class="el-icon-download"></i> 导出Excel
      </button>
    </div>
  </div>
  
  <div class="chart-section">
    <div id="main" class="chart-container"></div>
  </div>
</div>
</template>

<script>
import * as echarts from 'echarts';
import { fetchSaleList, findSalename } from '@/api/sale';
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      tableData: [],
      type: '种类', // 对应后端 private String type
      time: '月',   // 对应后端 private String time
      name: '',     // 对应后端 private String name
      year: '2025',     // 对应后端 private String year
      date: '',     // 对应后端 private Date date
      suggestions: [], // 存储提示数据
      showSuggestions: false, // 控制提示框的显示
      hoveredIndex: -1, // 当前高亮的提示项索引
      hasData: false, // 是否有数据可以导出
      chartData: null // 存储图表数据
    };
  },
  mounted() {
    this.fetchAndRenderChart();
  },
  methods: {
    // 类型改变时清空提示数据
    onTypeChange() {
      this.suggestions = [];
      this.name = '';
    },
    
    // 名称输入框获得焦点时获取提示数据
    async onNameFocus() {
      if (this.suggestions.length === 0) {
        await this.fetchSuggestions();
      }
      this.showSuggestions = true;
    },
    
    // 名称输入时也可以触发提示（可选）
    async onNameInput() {
      if (this.suggestions.length === 0) {
        await this.fetchSuggestions();
      }
      this.showSuggestions = true;
    },
    
    // 名称输入框失去焦点时隐藏提示
    onNameBlur() {
      // 添加延迟，避免点击提示项时立即隐藏
      setTimeout(() => {
        this.showSuggestions = false;
        this.hoveredIndex = -1;
      }, 200);
    },
    
    // 获取提示数据
    async fetchSuggestions() {
      try {
        console.log('开始获取提示数据，类型:', this.type);
        const response = await findSalename(this.type);
        console.log('API返回数据:', response);
        
        // 根据request.js的处理逻辑，response应该是数组或者包含data的对象
        let suggestions = [];
        
        if (Array.isArray(response)) {
          // request.js返回了res.data（数组）
          suggestions = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          // 如果response是完整对象，取data字段
          suggestions = response.data;
        } else {
          console.warn('提示数据格式不正确:', response);
          // 针对不同type的错误处理
          if (this.type === '种类') {
            this.$message && this.$message.warning('获取种类数据失败，请检查后端接口');
          } else if (this.type === '商品') {
            this.$message && this.$message.warning('获取商品数据失败，请检查后端接口');
          } else {
            this.$message && this.$message.warning('获取提示数据失败，请检查后端接口');
          }
          
          this.suggestions = [];
          return;
        }
        
        // 验证数据内容
        if (suggestions.length === 0) {
          console.warn('提示数据为空数组');
          if (this.type === '种类') {
            this.$message && this.$message.info('暂无种类数据');
          } else if (this.type === '商品') {
            this.$message && this.$message.info('暂无商品数据');
          } else {
            this.$message && this.$message.info('暂无提示数据');
          }
        } else {
          // 验证数据格式是否正确
          const invalidItems = suggestions.filter(item => typeof item !== 'string' || item.trim() === '');
          if (invalidItems.length > 0) {
            // 过滤掉无效数据
            suggestions = suggestions.filter(item => typeof item === 'string' && item.trim() !== '');
          }
          
          if (suggestions.length === 0) {
            this.$message && this.$message.warning('过滤后无有效数据');
          }
        }
        
        this.suggestions = suggestions;
        console.log('设置提示数据成功:', this.suggestions);
        
      } catch (error) {
        console.error('获取提示数据失败:', error);
        // 针对不同type的错误处理
        let errorMessage = '获取提示数据失败';
        if (this.type === '种类') {
          errorMessage = '获取种类数据失败';
        } else if (this.type === '商品') {
          errorMessage = '获取商品数据失败';
        }
        
        // 显示更详细的错误信息
        if (error.response?.status === 500) {
          this.$message && this.$message.error(`${errorMessage} (500): ${error.response.data?.message || error.message}`);
        } else {
          this.$message && this.$message.error(`${errorMessage}: ${error.message}`);
        }
        
        this.suggestions = [];
      }
    },

    async fetchAndRenderChart() {
      const params = {
        type: this.type,
        time: this.time,
        year: this.year,
        name: this.name,
        date: this.date
      };

      try {
        // 使用统一的request封装
        const response = await fetchSaleList(params);
        console.log('接口原始返回：', response);
        let data = response;
        if (data && data.data && (data.data.xAxis || data.data.月份)) {
          data = data.data;
        }
        const xAxis = data.xAxis || data.月份;
        const yAxis = data.yAxis || data.销售量;
        if (!xAxis || !yAxis) {
          this.$message && this.$message.error('后端返回数据格式有误');
          return;
        }

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
              data: xAxis,
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
              data: yAxis
            }
          ]
        };

        myChart.setOption(option);
        
        // 添加响应式处理
        window.addEventListener('resize', () => {
          myChart.resize();
        });
        
        // 保存数据用于报表生成
        this.chartData = {
          xAxis: xAxis,
          yAxis: yAxis,
          params: params
        };
        this.hasData = true;
        
      } catch (error) {
        console.error('请求数据失败:', error);
        this.$message && this.$message.error('请求数据失败');
        this.hasData = false;
      }
    },
    
    // 导出Excel报表
    exportToExcel() {
      if (!this.chartData) {
        this.$message && this.$message.warning('请先查询数据');
        return;
      }
      
      // 检查名称是否为空
      if (!this.name || this.name.trim() === '') {
        this.$message && this.$message.warning('请先输入名称再导出报表');
        return;
      }
      
      try {
        const { xAxis, yAxis, params } = this.chartData;
        
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 准备数据
        const excelData = [
          ['销售数据报表'],
          [''],
          ['查询条件'],
          ['类型', params.type],
          ['名称', params.name || '全部'],
          ['时间', params.time === '月' ? (params.year + '年') : (params.date || '全部')],
          [''],
          ['销售数据'],
          ['月份', '销售量']
        ];
        
        // 添加数据行
        xAxis.forEach((month, index) => {
          excelData.push([month, yAxis[index] || 0]);
        });
        
        // 创建工作表
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // 设置列宽
        ws['!cols'] = [
          { width: 15 },
          { width: 15 }
        ];
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '销售报表');
        
        // 生成文件名
        const fileName = `销售报表_${params.type}_${params.time}_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // 下载文件
        XLSX.writeFile(wb, fileName);
        
        this.$message && this.$message.success('Excel报表导出成功');
        
      } catch (error) {
        console.error('导出Excel失败:', error);
        this.$message && this.$message.error('导出Excel失败');
      }
    },
    
    // 选择提示项
    selectSuggestion(item) {
      this.name = item;
      this.showSuggestions = false;
      this.hoveredIndex = -1;
    },
    
    // 键盘导航
    onKeyDown(event) {
      if (!this.showSuggestions || this.suggestions.length === 0) {
        return;
      }
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.hoveredIndex = Math.min(this.hoveredIndex + 1, this.suggestions.length - 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.hoveredIndex = Math.max(this.hoveredIndex - 1, -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (this.hoveredIndex >= 0 && this.hoveredIndex < this.suggestions.length) {
            this.selectSuggestion(this.suggestions[this.hoveredIndex]);
          }
          break;
        case 'Escape':
          this.showSuggestions = false;
          this.hoveredIndex = -1;
          break;
      }
    }
  }
};
</script>

<style scoped>
.sale-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-between;
  align-items: center;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select, .filter-input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:focus, .filter-input:focus {
  border-color: #409eff;
}

.input-container {
  position: relative;
  display: inline-block;
}

.name-input {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.name-input:focus {
  border-color: #409eff;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dcdfe6;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
  user-select: none; /* 防止文本被选中 */
  position: relative; /* 确保定位正确 */
  z-index: 1001; /* 确保在最上层 */
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.hovered {
  background-color: #f5f7fa;
}

.suggestion-item:active {
  background-color: #e6f7ff;
}

/* 添加点击反馈 */
.suggestion-item:active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(64, 158, 255, 0.1);
  pointer-events: none;
}

/* 自定义滚动条样式 */
.suggestions-dropdown::-webkit-scrollbar {
  width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.button-section {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.query-btn {
  padding: 8px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.query-btn:hover {
  background-color: #66b1ff;
}

.query-btn:active {
  background-color: #337ecc;
}

.export-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.excel-btn {
  background-color: #67c23a;
  color: white;
}

.excel-btn:hover:not(:disabled) {
  background-color: #85ce61;
}

.excel-btn:active:not(:disabled) {
  background-color: #5daf34;
}

.chart-section {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-container {
  width: 100%;
  height: 400px; /* Adjust height as needed */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sale-container {
    padding: 15px;
    gap: 15px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .filter-select, .filter-input, .name-input {
    width: 100%;
    min-width: 200px;
  }
  
  .button-section {
    justify-content: center;
  }
  
  .query-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .chart-container {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .sale-container {
    padding: 10px;
    gap: 10px;
  }
  
  .filter-item label {
    font-size: 14px;
    font-weight: 500;
  }
  
  .filter-select, .filter-input, .name-input {
    font-size: 16px; /* 防止iOS缩放 */
    padding: 10px 12px;
  }
  
  .chart-container {
    height: 250px;
  }
}

@media (min-width: 1200px) {
  .sale-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .chart-container {
    height: 500px;
  }
}

/* 确保图表在小屏幕上也能正常显示 */
@media (max-width: 600px) {
  .suggestions-dropdown {
    max-height: 150px;
  }
  
  .suggestion-item {
    padding: 10px 12px;
    font-size: 16px;
  }
}
</style>