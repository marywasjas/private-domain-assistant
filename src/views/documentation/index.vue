<template>
  <div class="container">
    <div class="content">
      <div class="sidebar" :style="{ width: sidebarWidth + 'px' ,visibility: hidden}">
        <div style="color:#007bff;font-size:40px;font-style:oblique;text-align: center">LangChain-Chatchat</div>
        <div style="color:gray;font-size:12px;margin:10px;text-align: right;">
          当前版本：<span style="font-size:10px">{{ "v0.2.6" }}</span>
        </div>
        <div style="display:flex; border-radius: 10px; background-color: white; padding: 20px;flex-direction: column">
          <el-button type="primary">
            <i class="el-icon-chat-square" />对话
          </el-button>
          <br>
          <el-button>
            <i class="el-icon-postcard" />知识库管理
          </el-button>
        </div>

        <div>
          <div style="font-size:14px;margin-top:30px;margin-bottom:10px">请选择对话模式：</div>
          <!-- <br> -->
          <el-select v-model="dialogMode" style="width:100%">
            <el-option
              v-for="item in dialogModeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div>
          <div style="font-size:14px;margin-top:30px;margin-bottom:10px">选择LLM模式：</div>
          <el-select v-model="LLMMode" style="width:100%">
            <el-option
              v-for="item in LLMModeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div>
          <div style="font-size:14px;margin-top:30px;margin-bottom:10px">请选择Prompt模板：</div>
          <el-select v-model="promptTemp" style="width:100%">
            <el-option
              v-for="item in promptTempOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div>
          <div style="font-size:14px;margin-top:30px;margin-bottom:10px">Temperature：</div>
          <el-select v-model="promptTemp" style="width:100%">
            <el-option
              v-for="item in promptTempOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div>
          <div style="font-size:14px;margin-top:30px;margin-bottom:10px">历史对话轮数：</div>
          <el-select v-model="promptTemp" style="width:100%">
            <el-option
              v-for="item in promptTempOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div>
          <div style="font-size:14px;margin-top:30px;margin-bottom:10px;display:flex;justify-content: space-between;">
            <el-button style="width:180px">导出记录</el-button>
            <el-button style="width:180px" @click="handleClear">清空对话</el-button>
          </div>
        </div>
      </div>

      <button class="collapse-button" @click="toggleSidebar">
        <i :class=" sidebarCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-left' " />
      </button>

      <div class="main">
        <!-- 右侧部分内容 -->
        <div v-for="message in messages" :key="message.id" class="message">
          <span :class="{ 'user-message': message.isFromUser, 'bot-message': !message.isFromUser }">{{ message.text }}</span>
        </div>
        <div class="input-container">
          <el-input
            v-model="userInput"
            type="text"
            placeholder="请输入对话内容，换行请使用Shift+Enter"
            @keyup.enter.native="sendMessage"
          >
            <i
              slot="suffix"
              class="el-icon-position el-input__icon"
            />
          </el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      sidebarWidth: 400,
      sidebarCollapsed: false,
      hidden: 'visible',
      userInput: '',
      messages: [
        { text: '今天星期几', index: '001', isFromUser: true },
        { text: '明天会下雨吗', index: '002', isFromUser: true },
        { text: '第一个登上月球的人叫什么', index: '003', isFromUser: true }
      ],
      dialogMode: 'LLM 对话',
      dialogModeOption: [
        { label: 'LLM 对话', value: '1' },
        { label: '知识库问答', value: '2' },
        { label: '搜索引擎问答', value: '3' },
        { label: '自定义Agent问答', value: '4' }
      ],
      LLMMode: 'Qwen-14B-Chat-Int4 (Running)',
      LLMModeOption: [
        { label: 'zhipu-api (Running)', value: '1' },
        { label: 'Qwen-14B-Chat-Int4 (Running)', value: '2' },
        { label: 'Azure-OpenAI (Running)', value: '3' },
        { label: 'OpenAI (Running)', value: '4' },
        { label: 'Anthropic (Running)', value: '5' },
        { label: 'Azure-OpenAI (Running)', value: '6' },
        { label: 'OpenAI (Running)', value: '7' },
        { label: 'Anthropic (Running)', value: '8' }
      ],
      promptTemp: 'default',
      promptTempOption: [
        { label: 'default', value: '1' },
        { label: 'py', value: '2' }
      ]
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      if (this.sidebarCollapsed) {
        this.sidebarWidth = 0
        this.hidden = 'hidden'
      } else {
        this.sidebarWidth = 400
        this.hidden = 'visible'
      }
    },
    handleClear() {
      this.messages = []
    },
    async sendMessage() {
      if (this.userInput) {
        this.messages.push({ text: this.userInput, isFromUser: true })
        // const response = await axios.post('Your_GPT_API_URL', { message: this.userInput })
        // this.messages.push({ text: response.data.message, isFromUser: false })
        this.userInput = ''
      }
    }
  }
}
</script>

<style>
.container {
  display: flex;
  height: 100vh;
}

.content {
  display: flex;
  flex: 1;
}

.sidebar {
  display: flex;
  flex-direction: column;
  background-color: #f2f2f2;
  transition: width 0s ease;
  padding:50px 10px;
  overflow: auto;
}

.main {
  flex:1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 92vh;
}

.collapse-button {
  align-self: center; /* 垂直居中 */
  /* margin-right: 10px; 调整与内容区域的间距 */
  padding: 8px;
  border: none;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

.message {
  margin-bottom: 15px;
}

.user-message {
  background-color: #f2f2f2;
  border-radius: 10px;
  padding: 15px;
  display: block;
  text-align: left;
  margin-right:30px
}

.bot-message {
  background-color: #f2f2f2;
  padding: 5px;
  display: inline-block;
}

.input-container {
  margin-right:30px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
}

input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
}

button {
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
