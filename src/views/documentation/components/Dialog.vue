<template>
      <!-- <div v-if="isDialog" class="dialog"> -->
      <div class="dialog">
        <!-- 对话区 -->
        <div class="main">
          <!-- 信息 -->
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

        <!-- 输入框 -->
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

export default {
  components: { },
  
  mounted() {
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

      // 推送框
      this.newMessage = {
        isFromUser: false,
        text: "",
        id: uuidv4(),
        currentTime: this.currentTime,
        isError: this.isError,
      };
      this.messages.push(this.newMessage);

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
    };
  },
  beforeDestroy() {
    // 在组件销毁之前，关闭 WebSocket 连接
    this.socket.close();
  },

  data() {
    return {
      article: "",
      fullscreenLoading: true,
      activeNames: ["1"],
      activeNames2: "1",
      dialogMode: "1",
      // 对话数组
      messages: [
        {
          text: "今天星期几",
          index: "001",
          isFromUser: true,
          currentTime: this.formatDateTime(new Date()),
          isError: false,
        },
        {
          text: "明天会下雨吗",
          index: "002",
          isFromUser: true,
          currentTime: this.formatDateTime(new Date()),
          isError: false,
        },
        {
          text: "第一个登上月球的人叫什么",
          index: "003",
          isFromUser: true,
          currentTime: this.formatDateTime(new Date()),
          isError: false,
        },
        {
          text: "^_^ @_@",
          index: "004",
          isFromUser: false,
          currentTime: this.formatDateTime(new Date()),
          isError: false,
        },
      ],

      // isDialog: true,
      isDialog: false,
      sidebarWidth: 500,
      collapsed: false,
      visibility: "visible",
      userInput: "",
      socket: null,
      status: "disconnected",
      newMessage: "",
      isInput: false,
      currentTime: "",
      sliderValue: 45,
      marks: { 0: "0.00", 100: "1.00" },
      roundsValue: 3,

      // 选择或新建知识库
      formKB: {
        knowledge: "1",
      },
      isCreate: false,
      // 新建知识库
      formCreate: {
        name: "",
        brief: "",
        maxlength: 250,
        overlength: 50,
      },
      rules: {
        name: [
          { required: true, message: "知识库名称不能为空", trigger: "blur" },
        ],
        brief: [
          { required: true, message: "知识库简介不能为空", trigger: "blur" },
        ],
      },

      input: "",
    };
  },

  methods: {

    // 清空对话
    handleClear() {
      this.messages = [];
    },
    // 导出对话
    handleExport() {
      let mdContent = "";

      this.messages.forEach((item) => {
        const speaker = item.isFromUser ? "User" : "AI";
        const timestamp = item.currentTime;
        const content = item.text;
        mdContent += `### ${speaker} - ${timestamp}\n${content}\n\n`;
      });

      const blob = new Blob([mdContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = this.formatDateTime(new Date()).replace(/_/g, "-"); // 获取当前时间戳
      const filename = `record-${timestamp}.md`; // 文件名加上时间戳
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

        this.messages.push(newMessage);
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
.container {
  display: flex;
  height: calc(100vh - 50px);
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
  padding: 50px 10px;
  overflow: auto;
  .title {
    color: #007bff;
    font-size: 40px;
    font-style: oblique;
    text-align: center;
  }
  .version {
    color: gray;
    font-size: 12px;
    margin: 10px;
    text-align: right;
  }
  .btn {
    display: flex;
    border-radius: 10px;
    background-color: white;
    padding: 20px;
    flex-direction: column;
    .btn-icon {
      float: left;
    }
  }
  .mode {
    font-size: 14px;
    margin-top: 30px;
    margin-bottom: 10px;
  }
  .twoBtn {
    font-size: 14px;
    margin-top: 30px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
  }
}
.collapse-button {
  align-self: center; /* 垂直居中 */
  /* margin-right: 10px; 调整与内容区域的间距 */
  padding: 5px;
  border: none;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}
.dialog {
  display: flex;
  flex-direction: column;
  width: 90%;
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
        background-color: #f2f2f2;
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
    margin-right: 30px;
    margin-bottom: 40px;
  }
}
.kb {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
  overflow-x: auto;
  // div {
  //   font-size: larger;
  // }
}

::v-deep .el-collapse-item__header {
  font-size: 16px;
}
::v-deep .el-collapse-item__header {
  border-bottom: 0px solid #e6ebf5;
}
::v-deep .el-collapse-item__wrap {
  border-bottom: 0px solid #e6ebf5;
}

::v-deep .el-collapse-item__content {
  padding-bottom: 0px;
}

.tag {
  height: 55px;
  line-height: 55px;
  width: 100%;
  font-size: 16px;
}

.el-input-number--medium {
  width: 95%;
  line-height: 34px;
}

::v-deep .el-upload-dragger {
  display: flex;
  align-items: center;
  width: 615px;
  height: 100%;
}
.browseBtn {
  margin: 0 20px;
}

// :v-deep.el-select-dropdown {
//   max-width: 700px;
// }
.leftCollapse ::v-deep .el-collapse-item__wrap {
  background-color: #f2f2f2;
}

.leftCollapse ::v-deep .el-collapse-item__header {
  background-color: #f2f2f2;
}

.dropdown {
  position: fixed;
  top: 65px;
  right: 50px;
  z-index: 9999;
  .el-dropdown {
    margin-left: 10px;
    font-size: 25px;
    cursor: pointer;
  }
}
</style>
