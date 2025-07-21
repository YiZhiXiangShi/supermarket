<template>
  <div class="dashboard-bg">
    <div class="dashboard-center">
      <!-- 左侧会话区 -->
      <div class="session-panel">
        <el-card class="session-list-card">
          <div class="session-list-header">
            <div class="session-avatar-row">
              <img :src="require('@/assets/1.png')" class="session-avatar" alt="logo" />
              <span class="session-welcome">Hi，欢迎使用AI助手</span>
            </div>
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="createSession">新建会话</el-button>
          </div>
          <el-scrollbar style="height: 350px;">
            <ul class="session-list">
              <li v-for="session in sessions" :key="session.id" :class="{'active': session.id === currentSessionId}" @click="switchSession(session.id)">
                <span class="session-title" @dblclick.stop="editSessionTitle(session)">
                  <template v-if="editingSessionId === session.id">
                    <el-input
                      :ref="'editInput_' + session.id"
                      v-model="session.title"
                      size="mini"
                      @blur="saveSessionTitle(session)"
                      @keyup.enter.native="saveSessionTitle(session)"
                      style="width: 90px;"
                    />
                  </template>
                  <template v-else>
                    {{ session.title }}
                  </template>
                </span>
                <el-dropdown trigger="click" @command="handleSessionMenu($event, session)">
                  <i class="el-icon-more session-menu"></i>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="rename">重命名</el-dropdown-item>
                    <el-dropdown-item command="clear">清空消息</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除会话</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </li>
            </ul>
          </el-scrollbar>
        </el-card>
        <div class="dashboard-footer">© 2024 超市收银后台管理系统 | 技术支持：小安AI助手</div>
      </div>
      <!-- 右侧主区 -->
      <div class="main-panel">
        <el-card class="welcome-card">
          <div class="logo-row">
            <img :src="require('@/assets/1.png')" class="logo-img" alt="logo" />
          </div>
          <div class="welcome-title">欢迎来到超市收银后台管理系统</div>
          <div class="welcome-tip">高效管理，智慧运营，尽在您的掌控！</div>
        </el-card>
        <el-card class="ai-chat-card">
          <div slot="header" class="ai-chat-header">
            <i class="el-icon-message-solid ai-header-icon"></i>
            小安 · 智能AI助手
          </div>
          <div class="ai-chat-messages">
            <div v-for="(msg, idx) in currentSession.messages" :key="idx" :class="msg.role === 'user' ? 'ai-chat-user' : 'ai-chat-bot'">
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
      </div>
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
const SESSION_KEY = 'ai_sessions';
const CURRENT_KEY = 'ai_current_session';
export default {
  name: 'Dashboard',
  data() {
    const sessions = JSON.parse(localStorage.getItem(SESSION_KEY) || '[]')
    let currentSessionId = localStorage.getItem(CURRENT_KEY)
    if (!sessions.length) {
      // 初始化一个会话
      const id = uuidv4()
      sessions.push({ id, title: '新会话', messages: [] })
      currentSessionId = id
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessions))
      localStorage.setItem(CURRENT_KEY, id)
    } else if (!currentSessionId || !sessions.find(s => s.id === currentSessionId)) {
      currentSessionId = sessions[0].id
      localStorage.setItem(CURRENT_KEY, currentSessionId)
    }
    return {
      sessions,
      currentSessionId,
      input: '',
      loading: false,
      streaming: false,
      streamReply: '',
      editingSessionId: '',
      editingSessionTitle: ''
    }
  },
  computed: {
    currentSession() {
      return this.sessions.find(s => s.id === this.currentSessionId) || { messages: [], title: '' }
    }
  },
  methods: {
    saveAll() {
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.sessions))
      localStorage.setItem(CURRENT_KEY, this.currentSessionId)
    },
    createSession() {
      const id = uuidv4()
      const title = '新会话'
      this.sessions.unshift({ id, title, messages: [] })
      this.currentSessionId = id
      this.saveAll()
      // 新建后立即进入重命名状态
      this.editingSessionId = id
      this.$nextTick(() => {
        const refName = 'editInput_' + id;
        const input = this.$refs[refName];
        if (input && input.focus) input.focus();
      })
    },
    switchSession(id) {
      this.currentSessionId = id
      this.saveAll()
    },
    handleSessionMenu(command, session) {
      if (command === 'rename') {
        this.editingSessionId = session.id
        this.$nextTick(() => {
          const refName = 'editInput_' + session.id;
          const input = this.$refs[refName];
          if (input && input.focus) input.focus();
        })
      } else if (command === 'clear') {
        this.$confirm('确定要清空该会话的所有消息吗？', '提示', { type: 'warning' }).then(() => {
          session.messages = []
          this.saveAll()
        })
      } else if (command === 'delete') {
        this.$confirm('确定要删除该会话吗？', '警告', { type: 'warning' }).then(() => {
          const idx = this.sessions.findIndex(s => s.id === session.id)
          if (idx !== -1) {
            this.sessions.splice(idx, 1)
            if (this.currentSessionId === session.id) {
              // 删除当前会话后切换到第一个
              this.currentSessionId = this.sessions.length ? this.sessions[0].id : ''
            }
            this.saveAll()
          }
        })
      }
    },
    editSessionTitle(session) {
      this.editingSessionId = session.id
      this.$nextTick(() => {
        const refName = 'editInput_' + session.id;
        const input = this.$refs[refName];
        if (input && input.focus) input.focus();
      })
    },
    saveSessionTitle(session) {
      session.title = (session.title || '').trim() || '新会话';
      this.saveAll();
      this.editingSessionId = '';
    },
    async sendMessage() {
      const content = this.input && this.input.trim()
      if (!content || this.loading) return
      this.currentSession.messages.push({ role: 'user', content })
      this.saveAll()
      this.input = ''
      this.loading = true
      this.streaming = true
      this.streamReply = ''
      try {
        const url = `/api/chat/v2?msg=${encodeURIComponent(content)}&chatId=${encodeURIComponent(this.currentSessionId)}`
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
        this.currentSession.messages.push({ role: 'bot', content: this.streamReply })
        this.saveAll()
      } catch (e) {
        this.currentSession.messages.push({ role: 'bot', content: 'AI服务异常，请稍后再试。' })
        this.saveAll()
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
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: flex-start;
}
.session-panel {
  width: 240px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.session-list-card {
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e7ef;
  padding: 0 0 8px 0;
  background: #fff;
  margin-right: 0;
}
.session-list-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  padding: 16px 8px 8px 8px;
}
.session-avatar-row {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 10px;
  height: 38px;
  white-space: nowrap;
  overflow: hidden;
}
.session-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  box-shadow: 0 1px 4px #b3c6e0;
  background: #fff;
}
.session-welcome {
  font-size: 15px;
  color: #409EFF;
  font-weight: bold;
  line-height: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}
.session-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.session-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 2px;
  cursor: pointer;
  transition: background 0.2s;
}
.session-list li.active {
  background: linear-gradient(90deg, #e3f2fd 0%, #f0f7ff 100%);
}
.session-title {
  flex: 1;
  font-size: 15px;
  color: #333;
  margin-right: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.session-menu {
  font-size: 16px;
  color: #888;
  cursor: pointer;
}
.dashboard-footer {
  width: 100%;
  text-align: center;
  color: #aaa;
  font-size: 13px;
  margin-top: 12px;
  margin-bottom: 0;
  letter-spacing: 1px;
}
.main-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  max-width: 900px;
  border-radius: 18px;
  box-shadow: 0 2px 16px #b3c6e0;
  margin: 0 auto;
  padding-bottom: 12px;
  background: #fff;
  transition: box-shadow 0.3s, transform 0.3s;
  display: flex;
  flex-direction: column;
}
.ai-chat-card:hover {
  box-shadow: 0 8px 32px #b3c6e0;
  transform: translateY(-2px) scale(1.01);
}
.ai-chat-header {
  font-weight: bold;
  font-size: 18px;
  color: #409EFF;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 2px;
}
.ai-header-icon {
  font-size: 20px;
  color: #67C23A;
}
.ai-chat-messages {
  font-size: 15px;
  min-height: 180px;
  max-height: 340px;
  overflow-y: auto;
  background: #f7f7f7;
  padding: 18px 16px 12px 16px;
  border-radius: 10px;
  margin-bottom: 18px;
  box-shadow: 0 1px 4px #e0e7ef;
}
.ai-chat-user {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.ai-chat-bot {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
}
.ai-bubble {
  display: inline-block;
  padding: 10px 18px;
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
  gap: 10px;
  align-items: center;
  padding: 0 8px 8px 8px;
}
.ai-chat-input {
  flex: 1;
}
.ai-chat-btn {
  min-width: 80px;
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
@media (max-width: 1100px) {
  .dashboard-center {
    flex-direction: column;
    max-width: 100vw;
    gap: 16px;
    align-items: stretch;
  }
  .session-panel {
    width: 100%;
    min-width: 0;
    flex-direction: row;
    gap: 16px;
  }
  .main-panel {
    width: 100%;
    min-width: 0;
  }
}
@media (max-width: 700px) {
  .ai-chat-card, .welcome-card {
    max-width: 100vw;
    padding-left: 0;
    padding-right: 0;
  }
  .ai-chat-messages {
    min-height: 120px;
    max-height: 200px;
    padding: 8px 4px 8px 4px;
  }
}
</style>
