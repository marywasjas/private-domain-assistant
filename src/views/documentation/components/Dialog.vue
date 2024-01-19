<template>
  <div class="dialog" :style="customStyle">
    <!-- <v-md-editor v-model="text" height="400px"></v-md-editor> -->
      <!-- <highlightjs language="javascript" :code="code"></highlightjs> -->
    <!-- <code>
      let a =10;
    </code> -->
    <!-- 对话区 -->
    <div class="main">
      <div v-for="message in messages" :key="message.id" class="message">
        <img v-if="!message.isFromUser" src="../../../../public/chat.png" />
        <img v-else src="../../../../public/personal.png" />

        <span
          id="content"
          :class="{
            'user-message content': message.isFromUser,
            'error-message content': message.isError && !message.isFromUser, // 当 error 为 true 时添加红色框样式
            'bot-message content': !message.isFromUser,
          }"
        >
          <div style="color: grey">{{ message.currentTime }}</div>
          <br />

          {{ message.text }}
        </span>
      </div>
    </div>

    <div class="input-container">
      <el-input
        v-model="userInput"
        size="medium"
        type="text"
        :disabled="isInput"
        placeholder="请输入对话内容，换行请使用Shift+Enter"
        @keyup.enter.native="sendMessage"
      >
        <i slot="suffix" class="el-icon-s-promotion el-input__icon" />
      </el-input>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
// import marked from 'marked';

export default {
  props: ["messages", "customStyle"],

  mounted() {
    // const htmlText = marked(markdownText);  // 使用marked解析Markdown文本

    // console.log(htmlText);

    // 获取当前时间
    this.currentTime = this.formatDateTime(new Date());

    // 在组件被挂载后，初始化 WebSocket 连接
    this.socket = new WebSocket("ws://localhost:3000");
    // console.log("before open", this.socket.readyState); // 0

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.status = "connected";
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
      this.status = "disconnected";
    };

    this.socket.onmessage = (event) => {
      // 处理文本
      const message = event.data.toString();
      if (message.includes("输入错误")) {
        this.isError = true; // 输入信息包含特定词语，设置 error 为 true
      } else {
        this.isError = false; // 输入信息正确，设置 error 为 false
      }
      this.currentTime = this.formatDateTime(new Date());

      this.showThinkingMessage();

      // 推送框
      this.newMessage = {
        isFromUser: false,
        text: "",
        id: uuidv4(),
        currentTime: this.currentTime,
        isError: this.isError,
      };

      setTimeout(() => {
        this.hideThinkingMessage();

        // this.messages.push(this.newMessage);

        this.handleSend(this.newMessage);

        // 定义每个字符的打印间隔（毫秒）
        var delay = 300;
        // 定义当前已经打印的字符数
        var index = 0;

        // 每隔 delay 毫秒输出一个字符
        var timer = setInterval(() => {
          // console.log(this);
          // 获取前 index 个字符
          var output = message.substring(0, index);
          // console.log(output)

          // 获取 message 类名下面的所有 div 元素
          var divs = document.querySelectorAll(".message span");

          // 获取最后一个 div 元素
          var lastDiv = divs[divs.length - 1];

          // 在页面上显示输出结果
          var timeText = `
          <div style="color: grey">${this.currentTime}</div>
          <br />
        `;
          lastDiv.innerHTML = timeText + output;

          // 如果已经输出完所有字符，则清除定时器
          if (index >= message.length) {
            this.isInput = false;
            this.messages[this.messages.length - 1] = {
              ...this.newMessage,
              text: message,
            };
            clearInterval(timer);
            // console.log(this.messages[this.messages.length - 1]);
          }
          // 增加已经输出的字符数
          index++;
        }, delay);
      }, 3000);
    };
  },

  beforeDestroy() {
    // 在组件销毁之前，关闭 WebSocket 连接
    this.socket.close();
  },

  data() {
    return {
      userInput: "",
      socket: null,
      status: "disconnected",
      newMessage: "",
      currentTime: "",
      isInput: false,
      isThinking: false,
      text: `# Hello, Markdown!

这是一段 **粗体** 和 *斜体* 的文字。

- 列表项1
- 列表项2
- 列表项3`,


  code: `
      let x = 5;
      let y=10;
      let obj={
        age:12,
        name:'lihao'
      }`,
    };
  },

  methods: {
    handleSend(msg) {
      this.$emit("get-msg", msg);
    },

    showThinkingMessage() {
      let newMessage = {
        isFromUser: false,
        text: "正在思考中。。。",
        id: uuidv4(),
        currentTime: "   ",
        isError: false,
      };
      // this.messages.push(newMessage);
      this.handleSend(newMessage);
    },

    hideThinkingMessage() {
      const index = this.messages.findIndex(
        (item) => item.text === "正在思考中。。。"
      );
      if (index > -1) this.messages.splice(index, 1);
    },

    // 发送信息
    async sendMessage() {
      if (this.userInput.trim()) {
        this.currentTime = this.formatDateTime(new Date());
        this.isInput = true;

        let newMessage = {
          text: this.userInput,
          isFromUser: true,
          currentTime: this.formatDateTime(new Date()),
          id: uuidv4(),
        };

        // this.messages.push(newMessage);
        this.handleSend(newMessage);

        // 让滚动条在底部
        setTimeout(function () {
          var showContent = document.querySelector(".main");
          console.log(showContent.scrollTop);
          console.log(showContent.scrollHeight);
          showContent.scrollTop = showContent.scrollHeight + 5000;
        }, 100);

        this.socket.send(this.userInput);

        this.userInput = "";
      } else {
        this.$message({
          dangerouslyUseHTMLString: true,
          message: "请输入查询内容",
          showClose: true,
        });
      }
    },

    // 时间格式化
    formatDateTime(date) {
      var year = date.getFullYear();
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var day = ("0" + date.getDate()).slice(-2);
      var hours = ("0" + date.getHours()).slice(-2);
      var minutes = ("0" + date.getMinutes()).slice(-2);
      var seconds = ("0" + date.getSeconds()).slice(-2);

      return (
        year +
        "/" +
        month +
        "/" +
        day +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.content {
  display: flex;
  flex: 1;
}

.dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: -webkit-fill-available;
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-left: 10px;
    margin-top: 50px;
    height: 100%;
    overflow-y: auto;
    .message {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      max-width: 100%;
      img {
        width: 2.5rem;
        height: 2.5rem;
        margin-right: 0.5rem;
      }
      .user-message {
        background-color: #f2f2f2;
        border-radius: 10px;
        padding: 15px;
        display: block;
        text-align: left;
        margin-right: 30px;
        max-width: 100%;
        margin-left: auto;
      }
      .bot-message {
        // background-color: #f2f2f2;
        border-radius: 10px;
        padding: 15px;
        display: block;
        text-align: left;
        margin-right: 30px;
        max-width: 100%;
      }
      .bot-message::after {
        content: "  ▎";
        animation: blink 1s step-start infinite;
      }
      @keyframes blink {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
      .error-message {
        background-color: #fdb7b7 !important;
        border-radius: 10px;
        padding: 15px;
        display: block;
        text-align: left;
        margin-right: 30px;
        max-width: 100%;
      }
    }
  }
  .input-container {
    margin-left: 30px;
    margin-right: 30px;
    margin-bottom: 40px;
  }
}
</style>
