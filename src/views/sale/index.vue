<template>
<div style="margin-bottom: 20px; display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
  <label>类型：
    <select v-model="type" @change="onTypeChange">
      <option value="种类">种类</option>
      <option value="商品">商品</option>
    </select>
  </label>

  <label>时间：
    <select v-model="time">
      <option value="日">日</option>
      <option value="月">月</option>
    </select>
  </label>

  <label>名称：
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
import { fetchSaleList, findSalename } from '@/api/sale';

export default {
  data() {
    return {
      tableData: [],
      type: '种类', // 对应后端 private String type
      time: '月',   // 对应后端 private String time
      name: '',     // 对应后端 private String name
      date: '',     // 对应后端 private Date date
      suggestions: [], // 存储提示数据
      showSuggestions: false, // 控制提示框的显示
      hoveredIndex: -1 // 当前高亮的提示项索引
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
      } catch (error) {
        console.error('请求数据失败:', error);
        this.$message && this.$message.error('请求数据失败');
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
</style>