<template>
  <div class="dashboard-bg">
    <div class="dashboard-center">
      <!-- 顶部LOGO和欢迎区 -->
      <el-card class="welcome-card">
        <div class="logo-row">
          <img :src="require('@/assets/1.png')" class="logo-img" alt="logo" />
        </div>
        <div class="welcome-title">欢迎来到超市收银后台管理系统</div>
        <div class="welcome-tip">高效管理，智慧运营，尽在您的掌控！</div>
      </el-card>
      <!-- AI助手区 -->
      <el-card class="ai-chat-card">
        <div slot="header" class="ai-chat-header">小安 · 智能AI助手</div>
        <div class="ai-chat-welcome">小安为您服务，有问题随时问我哦~</div>
        <div class="ai-chat-messages">
          <div v-for="(msg, idx) in messages" :key="idx" :class="msg.role === 'user' ? 'ai-chat-user' : 'ai-chat-bot'">
            <div class="ai-bubble" :class="msg.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-bot'">
              <span v-if="msg.role === 'user'">我：</span>
              <span v-else>小安：</span>
              <span>{{ msg.content }}</span>
            </div>
          </div>
          <div v-if="streaming" class="ai-chat-bot">
            <div class="ai-bubble ai-bubble-bot">小安：<span>{{ streamReply }}</span><span class="blink-cursor">|</span></div>
          </div>
        </div>
        <div class="ai-chat-input-row">
          <el-input
            v-model="input"
            placeholder="请输入你的问题..."
            @keyup.enter.native="sendMessage"
            clearable
            size="medium"
            class="ai-chat-input"
          />
          <el-button type="primary" @click="sendMessage" :loading="loading" class="ai-chat-btn">发送</el-button>
        </div>
      </el-card>
      <!-- 底部版权信息 -->
      <div class="dashboard-footer">© 2024 超市收银后台管理系统 | 技术支持：小安AI助手</div>
    </div>
  </div>
</template>
<script>
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
export default {
  name: 'Dashboard',
  data() {
    return {
      messages: [],
      input: '',
      loading: false,
      streaming: false,
      streamReply: '',
      chatId: uuidv4()
    }
  },
  methods: {
    async sendMessage() {
      const content = this.input && this.input.trim()
      if (!content || this.loading) return
      this.messages.push({ role: 'user', content })
      this.input = ''
      this.loading = true
      this.streaming = true
      this.streamReply = ''
      try {
        const url = `/api/chat/v2?msg=${encodeURIComponent(content)}&chatId=${encodeURIComponent(this.chatId)}`
        const response = await fetch(url, { method: 'GET' })
        if (!response.body || !response.ok) throw new Error('AI服务异常')
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let done = false
        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          if (value) {
            this.streamReply += decoder.decode(value, { stream: !done })
            this.$nextTick(() => {
              const box = this.$el.querySelector('.ai-chat-messages')
              if (box) box.scrollTop = box.scrollHeight
            })
          }
        }
        this.messages.push({ role: 'bot', content: this.streamReply })
      } catch (e) {
        this.messages.push({ role: 'bot', content: 'AI服务异常，请稍后再试。' })
      }
      this.loading = false
      this.streaming = false
      this.streamReply = ''
      this.$nextTick(() => {
        const box = this.$el.querySelector('.ai-chat-messages')
        if (box) box.scrollTop = box.scrollHeight
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.dashboard-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e8f0fe 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 16px;
}
.dashboard-center {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
}
.logo-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}
.logo-img {
  width: 110px;
  height: 60px;
  border-radius: 16px;
  box-shadow: 0 2px 8px #b3c6e0;
}
.welcome-card {
  width: 100%;
  box-shadow: 0 2px 12px #e0e7ef;
  border-radius: 16px;
  text-align: center;
  padding: 32px 0 24px 0;
  background: #fff;
  transition: box-shadow 0.3s, transform 0.3s;
}
.welcome-card:hover {
  box-shadow: 0 6px 24px #b3c6e0;
  transform: translateY(-2px) scale(1.02);
}
.welcome-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
}
.welcome-tip {
  font-size: 16px;
  color: #888;
}
.ai-chat-card {
  width: 100%;
  max-width: 2500px;
  border-radius: 16px;
  box-shadow: 0 2px 16px #b3c6e0;
  margin: 0 auto;
  padding-bottom: 12px;
  background: #fff;
  transition: box-shadow 0.3s, transform 0.3s;
}
.ai-chat-card:hover {
  box-shadow: 0 8px 32px #b3c6e0;
  transform: translateY(-2px) scale(1.01);
}
.ai-chat-header {
  font-weight: bold;
  font-size: 18px;
  color: #409EFF;
}
.ai-chat-welcome {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
  text-align: center;
}
.ai-chat-messages {
  font-size: 15px;
  min-height: 120px;
  max-height: 260px;
  overflow-y: auto;
  background: #f7f7f7;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px #e0e7ef;
}
.ai-chat-user {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
}
.ai-chat-bot {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 6px;
}
.ai-bubble {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 18px;
  max-width: 80%;
  word-break: break-all;
  font-size: 15px;
  box-shadow: 0 1px 4px #e0e7ef;
}
.ai-bubble-user {
  background: linear-gradient(90deg, #e0f3ff 0%, #b3e5fc 100%);
  color: #409EFF;
  border-bottom-right-radius: 4px;
}
.ai-bubble-bot {
  background: linear-gradient(90deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #67C23A;
  border-bottom-left-radius: 4px;
}
.ai-chat-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.ai-chat-input {
  flex: 1;
}
.ai-chat-btn {
  min-width: 70px;
}
.blink-cursor {
  display: inline-block;
  width: 8px;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
.dashboard-footer {
  width: 100%;
  text-align: center;
  color: #aaa;
  font-size: 13px;
  margin-top: 8px;
  margin-bottom: 0;
  letter-spacing: 1px;
}
@media (max-width: 700px) {
  .dashboard-center {
    max-width: 100vw;
    padding: 0 8px;
  }
  .welcome-card, .ai-chat-card {
    max-width: 100vw;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
