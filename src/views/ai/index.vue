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
export default {
  name: 'AiIndex',
  data() {
    return {
      inputMsg: '',
      messages: [
        { role: 'ai', content: '你好，我是智能AI助手，有什么可以帮您？' }
      ]
    }
  },
  methods: {
    sendMsg() {
      const content = this.inputMsg && this.inputMsg.trim()
      if (!content) return
      this.messages.push({ role: 'user', content })
      this.inputMsg = ''
      // 模拟AI回复
      setTimeout(() => {
        this.messages.push({ role: 'ai', content: 'AI正在思考中...' })
        this.scrollToBottom()
        setTimeout(() => {
          this.messages.pop()
          this.messages.push({ role: 'ai', content: '这是AI的回复：' + content })
          this.scrollToBottom()
        }, 1000)
      }, 500)
      this.scrollToBottom()
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