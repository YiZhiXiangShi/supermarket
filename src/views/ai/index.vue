<template>
  <div class="ai-chat-container">
    <el-card class="ai-chat-card">
      <h2>智能AI 聊天助手</h2>
      <div class="chat-window" ref="chatWindow">
        <div v-for="(msg, idx) in messages" :key="idx" :class="['chat-msg', msg.role]">
          <span class="chat-role">{{ msg.role === 'user' ? '我' : 'AI' }}：</span>
          <span class="chat-content">{{ msg.content }}</span>
        </div>
      </div>
      <div class="chat-input-row">
        <el-input
          v-model="inputMsg"
          placeholder="请输入你的问题..."
          @keyup.enter.native="sendMsg"
          class="chat-input"
        />
        <el-button type="primary" @click="sendMsg">发送</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { chat2 } from '@/api/ai'

export default {
  name: 'AiIndex',
  data() {
    return {
      inputMsg: '',
      chatId: 'chat_' + Date.now(), // 生成聊天会话ID
      messages: [
        { role: 'ai', content: '你好，我是智能AI助手，有什么可以帮您？' }
      ]
    }
  },
  methods: {
    async sendMsg() {
      const content = this.inputMsg && this.inputMsg.trim()
      if (!content) return
      
      // 添加用户消息
      this.messages.push({ role: 'user', content })
      this.inputMsg = ''
      this.scrollToBottom()
      
      // 添加AI思考中状态
      this.messages.push({ role: 'ai', content: 'AI正在思考中...' })
      this.scrollToBottom()
      
      try {
        // 调用流式AI接口
        const aiResponse = await this.chat2Stream(content, this.chatId)
        // 移除思考中状态
        this.messages.pop()
        // 添加AI回复
        this.messages.push({ role: 'ai', content: aiResponse || '抱歉，AI暂时无法回复' })
        this.scrollToBottom()
      } catch (error) {
        // 移除思考中状态
        this.messages.pop()
        // 添加错误提示
        this.messages.push({ role: 'ai', content: '抱歉，网络连接失败，请稍后重试' })
        this.scrollToBottom()
        console.error('AI接口调用失败:', error)
      }
    },
    
    async chat2Stream(msg, chatId) {
      try {
        const response = await fetch(`/api/chat/v2?msg=${encodeURIComponent(msg)}&chatId=${encodeURIComponent(chatId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let result = ''
        
        // 实时更新AI回复内容
        const aiMessageIndex = this.messages.length - 1
        this.messages[aiMessageIndex] = { role: 'ai', content: '' }
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          result += chunk
          
          // 实时更新显示
          this.messages[aiMessageIndex].content = result
          this.scrollToBottom()
        }
        
        return result
      } catch (error) {
        console.error('流式请求失败:', error)
        throw error
      }
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatWindow
        if (el) el.scrollTop = el.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 80vh;
  background: #f5f7fa;
}
.ai-chat-card {
  width: 500px;
  margin-top: 40px;
}
.chat-window {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  margin-bottom: 16px;
}
.chat-msg {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}
.chat-msg.user .chat-role {
  color: #409eff;
  font-weight: bold;
}
.chat-msg.ai .chat-role {
  color: #67c23a;
  font-weight: bold;
}
.chat-content {
  margin-left: 6px;
  word-break: break-all;
}
.chat-input-row {
  display: flex;
  gap: 8px;
}
.chat-input {
  flex: 1;
}
</style> 