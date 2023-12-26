<template>
  <div class="container">
    <div class="content">
      <div class="sidebar" :style="{ width: sidebarWidth + 'px', visibility }">
        <div class="title">LangChain-Chatchat</div>
        <div class="version">
          当前版本：<span style="font-size: 10px">{{ "v0.2.6" }}</span>
        </div>
        <div class="btn">
          <el-button type="primary" @click="handleChat">
            <i class="el-icon-chat-square btn-icon" />对话
          </el-button>
          <br />
          <el-button type="primary" @click="handleKnowledge">
            <i class="el-icon-postcard btn-icon" />知识库管理
          </el-button>
        </div>

        <div>
          <div class="mode">请选择对话模式：</div>
          <el-select
            v-model="dialogMode"
            style="width: 100%"
            @change="handleDialogMode"
          >
            <el-option
              v-for="item in dialogModeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div>
          <div class="mode">选择LLM模式：</div>
          <el-select
            v-model="LLMMode"
            style="width: 100%"
            @change="handleLLMMode"
          >
            <el-option
              v-for="item in LLMModeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div>
          <div class="mode">请选择Prompt模板：</div>
          <el-select
            v-model="promptTemp"
            style="width: 100%"
            @change="handlePromptMode"
          >
            <el-option
              v-for="item in promptTempOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div>
          <div class="mode">Temperature：</div>
          <el-slider
            style="margin: 0 10px"
            v-model="sliderValue"
            :format-tooltip="formatTooltip"
            :marks="marks"
            :show-tooltip="true"
          ></el-slider>
        </div>

        <div>
          <div class="mode">历史对话轮数：</div>
          <el-input-number
            v-model="roundsValue"
            :min="0"
            :max="1000"
            label="描述文字"
          ></el-input-number>
        </div>

        <div style="margin-top: 15px" v-if="dialogMode == '2'">
          <el-collapse class="leftCollapse" v-model="activeNames2">
            <el-collapse-item title="知识库配置" name="1">
              请选择知识库
              <el-select v-model="value" style="width: 100%">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              匹配知识条数
              <el-input-number
                style="100%"
                v-model="roundsValue"
                :min="0"
                :max="1000"
                label="描述文字"
              ></el-input-number>
              知识匹配分数阈值
              <el-slider
                style="margin: 0 10px"
                v-model="sliderValue"
                :format-tooltip="formatTooltip"
                :marks="marks"
                :show-tooltip="true"
              ></el-slider>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div style="margin-top: 15px" v-if="dialogMode == '3'">
          <el-collapse class="leftCollapse" v-model="activeNames2">
            <el-collapse-item title="搜索引擎匹配" name="1">
              请选择搜索引擎
              <el-select v-model="value" style="width: 100%">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              匹配搜索结果条数
              <el-input-number
                style="100%"
                v-model="roundsValue"
                :min="0"
                :max="1000"
                label="描述文字"
              ></el-input-number>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div>
          <div class="twoBtn">
            <el-button style="width: 180px" @click="handleExport">
              导出记录
            </el-button>
            <el-button style="width: 180px" @click="handleClear">
              清空对话
            </el-button>
          </div>
        </div>
      </div>

      <button class="collapse-button" @click="toggleSidebar">
        <i :class="collapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-left'" />
      </button>

      <Dialog v-if="isDialog" :messages="messages" />

      <Form v-else />
    </div>

    <div class="dropdown">
      <span v-if="isReqLoading">
        Running
        <i class="el-icon-loading"></i>
        Stop
      </span>

      <el-dropdown trigger="click">
        <i class="el-icon-more" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handleReturn">
            Return R
          </el-dropdown-item>
          <el-dropdown-item @click.native="handlePrint">
            Print
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleRecord">
            Record a screencast
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleReport">
            Report a bug
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleHelp">
            Get help
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleAbout">
            About
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-dialog v-model="dialogVisible" title="选择器" width="30%">
      <el-select v-model="selectedOption" placeholder="请选择">
        <el-option
          v-for="option in options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        ></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import Dialog from "./components/Dialog.vue";
import Form from "./components/Form.vue";

export default {
  components: { Dialog, Form },
  data() {
    return {
      article: "",
      fullscreenLoading: true,
      activeNames2: "1",
      dialogMode: "1",
      dialogModeOption: [
        { label: "LLM 对话", value: "1" },
        { label: "知识库问答", value: "2" },
        { label: "搜索引擎问答", value: "3" },
        { label: "自定义Agent问答", value: "4" },
      ],
      LLMMode: "2",
      LLMModeOption: [
        { label: "zhipu-api (Running)", value: "1" },
        { label: "Qwen-14B-Chat-Int4 (Running)", value: "2" },
        { label: "Azure-OpenAI (Running)", value: "3" },
        { label: "OpenAI (Running)", value: "4" },
        { label: "Anthropic (Running)", value: "5" },
        { label: "Azure-OpenAI (Running)", value: "6" },
        { label: "OpenAI (Running)", value: "7" },
        { label: "Anthropic (Running)", value: "8" },
      ],
      promptTemp: "default",
      promptTempOption: [
        { label: "default", value: "default" },
        { label: "py", value: "py" },
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

      options: [
        {
          value: "samples",
          label: "samples",
        },
      ],
      value: "samples",

      dialogVisible: false,
      selectedOption: "",
      input: "",

      isReqLoading: false,
    };
  },
  methods: {
    // 切换知识库管理
    handleKnowledge() {
      this.isDialog = false;
    },
    // 切换对话
    handleChat() {
      this.isDialog = true;
    },

    // 选择对话模式
    handleDialogMode(val) {
      this.isReqLoading = true;
      setTimeout(() => {
        this.isReqLoading = false;
      }, 5000);

      if (val == "1") {
        this.promptTempOption = [
          { label: "default", value: "default" },
          { label: "py", value: "py" },
        ];
      } else if (val == "2") {
        this.promptTempOption = [
          { label: "default", value: "default" },
          { label: "text", value: "text" },
        ];
      } else if (val == "3") {
        this.promptTempOption = [
          { label: "default", value: "default" },
          { label: "search", value: "search" },
        ];
      } else if (val == "4") {
        this.promptTempOption = [
          { label: "chatGLM", value: "chatGLM" },
          { label: "Qwen", value: "Qwen" },
        ];
      }
    },

    // 选择LLM模式
    handleLLMMode(val) {
      this.isReqLoading = true;
      setTimeout(() => {
        this.isReqLoading = false;
      }, 5000);
    },
    // 选择prompt模版
    handlePromptMode(val) {
      this.isReqLoading = true;
      setTimeout(() => {
        this.isReqLoading = false;
      }, 5000);

      const h = this.$createElement;
      this.$notify({
        message: h(
          "span",
          { style: "color: black" },
          "已切换成" + val + "模式"
        ),
        position: "bottom-right",
      });
    },

    // Return
    handleReturn() {},

    // Record a screencast
    handleRecord() {
      this.$confirm(
        "Due to liminations with some browsers, this feature is only supported on recent desktop versions of Chrome, Firefox, and Edge.",
        "Record a screencast",
        { type: "warning" }
      )
        .then(() => {
          // this.$message({
          //   type: "success",
          //   message: "删除成功!",
          // });
        })
        .catch(() => {
          // this.$message({
          //   type: "info",
          //   message: "已取消删除",
          // });
        });
    },
    // Report a bug
    handleReport() {},
    // 帮助
    handleHelp() {},
    // About
    handleAbout() {
      this.$confirm(
        "Due to liminations with some browsers, this feature is only supported on recent desktop versions of Chrome, Firefox, and Edge.",
        "About"
        // { type: "warning" }
      )
        .then(() => {
          // this.$message({
          //   type: "success",
          //   message: "删除成功!",
          // });
        })
        .catch(() => {
          // this.$message({
          //   type: "info",
          //   message: "已取消删除",
          // });
        });
    },
    // Print
    handlePrint() {
      import("./content.js").then((data) => {
        const { title } = data.default;
        document.title = title;
        this.article = data.default;
        setTimeout(() => {
          this.fullscreenLoading = false;
          this.$nextTick(() => {
            window.print();
          });
        }, 3000);
      });
    },

    // 左侧面板切换
    toggleSidebar() {
      this.collapsed = !this.collapsed;
      if (this.collapsed) {
        this.sidebarWidth = 0;
        this.visibility = "hidden";
      } else {
        this.sidebarWidth = 500; // 面板宽度
        this.visibility = "visible";
      }
    },
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

    // 滑块格式化
    formatTooltip(val) {
      return val / 100;
    },

    handleDialogConfirm() {
      // 处理弹出框的确定按钮点击事件
      console.log("选择了：", this.selectedOption);

      // 在这里可以根据选择的选项进行相应的操作

      this.dialogVisible = false; // 关闭弹出框
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
