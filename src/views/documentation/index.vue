<template>
  <div>
    <div class="content">
      <!-- left -->
      <div
        class="sidebar-box"
        :style="{ width: sidebarWidth + 'px', visibility }"
      >
        <div
          class="sidebar"
          :style="{ width: sidebarWidth + 'px', visibility }"
        >
          <div class="btn-close">
            <i class="el-icon-close" @click="handleToggle"></i>
          </div>

          <div class="title">LangChain-Chatchat</div>

          <div class="version">
            当前版本：<span style="font-size: 10px">{{ "v0.2.6" }}</span>
          </div>

          <div class="btn-two">
            <el-button type="primary" @click="handleChat">
              <i class="el-icon-chat-square btn-icon" />对话
            </el-button>
            <br />
            <el-button type="primary" @click="handleKnowledge">
              <i class="el-icon-postcard btn-icon" />知识库管理
            </el-button>
          </div>

          <div v-show="isDialog">
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

          <div v-show="isDialog">
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

          <div v-show="isDialog">
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

          <div v-show="isDialog">
            <div class="mode">Temperature：</div>
            <el-slider
              style="margin: 0 10px"
              v-model="sliderValue"
              :format-tooltip="formatTooltip"
              :marks="marks"
              :show-tooltip="true"
            ></el-slider>
          </div>

          <div v-show="isDialog">
            <div class="mode">历史对话轮数：</div>
            <el-input-number
              v-model="roundsValue"
              :min="0"
              :max="1000"
              label="描述文字"
            ></el-input-number>
          </div>

          <div
            style="margin-top: 25px"
            v-show="dialogMode == '知识库问答' && isDialog"
          >
            <el-collapse class="left-collapse" v-model="activeNames">
              <el-collapse-item title="知识库配置" name="1">
                <div class="mode-collapse">请选择知识库</div>
                <el-select v-model="knowValue" style="width: 95%">
                  <el-option
                    v-for="item in knowOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
                <br />

                <div class="mode-collapse">匹配知识条数</div>
                <el-input-number
                  style="100%"
                  v-model="roundsKnow"
                  :min="0"
                  :max="1000"
                  label="描述文字"
                ></el-input-number>
                <br />

                <div class="mode-collapse">知识匹配分数阈值</div>
                <el-slider
                  style="margin: 15px 20px"
                  v-model="sliderKnow"
                  :format-tooltip="formatTooltip"
                  :marks="marks"
                  :show-tooltip="true"
                ></el-slider>
              </el-collapse-item>
            </el-collapse>
          </div>

          <div
            style="margin-top: 25px"
            v-show="dialogMode == '搜索引擎问答' && isDialog"
          >
            <el-collapse class="left-collapse" v-model="activeNames">
              <el-collapse-item title="搜索引擎匹配" name="1">
                <div class="mode-collapse">请选择搜索引擎</div>
                <el-select v-model="searchValue" style="width: 95%">
                  <el-option
                    v-for="item in searchOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
                <br />
                <div class="mode-collapse">匹配搜索结果条数</div>
                <el-input-number
                  style="margin-bottom: 20px"
                  v-model="roundsSearch"
                  :min="0"
                  :max="1000"
                  label="描述文字"
                ></el-input-number>
              </el-collapse-item>
            </el-collapse>
          </div>

          <div v-show="isDialog">
            <div class="btn-dialog">
              <el-button style="width: 180px" @click="handleExport">
                导出记录
              </el-button>
              <el-button style="width: 180px" @click="handleClear">
                清空对话
              </el-button>
            </div>
          </div>
        </div>

        <div class="btn-drag" @mousedown="handleDrag(delay)"></div>
      </div>

      <!-- middle -->
      <button
        v-if="visibility == 'hidden'"
        class="btn-collapse"
        @click="handleToggle"
      >
        <i :class="collapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-left'" />
      </button>

      <!-- right -->
      <div class="right">
        <Dialog
          v-if="isDialog"
          :messages="messages"
          :customStyle="customStyle"
          @get-msg="getMsg"
        />
        <Form
          v-else
          :customStyle="customStyle"
          :handleReceive="handleReceive"
        />
      </div>
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
          <el-dropdown-item @click.native="handleSetting">
            Setting
          </el-dropdown-item>
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

    <el-dialog
      title="Setting"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
      style="font-size: 18px"
    >
      <strong>Mode</strong>
      <br /><br />

      <el-checkbox v-model="checked" @change="handleWide">
        Widescreen
      </el-checkbox>
      <br /><br />

      <strong>Color</strong>
      <br /><br />
      <theme-picker style="" @change="handleTheme" />

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import Dialog from "./components/Dialog.vue";
import Form from "./components/Form.vue";
import ThemePicker from "@/components/ThemePicker";

export default {
  components: {
    Dialog,
    Form,
    ThemePicker,
  },

  mounted() {
    this.handleDrag(20);
  },

  data() {
    return {
      customStyle: {
        paddingLeft: 70 + "px",
        paddingRight: 70 + "px",
      },
      dialogVisible: false,
      checked: false,

      article: "", // print打印内容
      fullscreenLoading: true, // print打印内容
      activeNames: "1",
      dialogMode: "LLM 对话", // 对话模式
      dialogModeOption: [
        { label: "LLM 对话", value: "LLM 对话" },
        { label: "知识库问答", value: "知识库问答" },
        { label: "搜索引擎问答", value: "搜索引擎问答" },
        { label: "自定义Agent问答", value: "自定义Agent问答" },
      ],
      LLMMode: "Qwen-14B-Chat-Int4 (Running)",
      LLMModeOption: [
        { label: "zhipu-api (Running)", value: "zhipu-api (Running)" },
        {
          label: "Qwen-14B-Chat-Int4 (Running)",
          value: "Qwen-14B-Chat-Int4 (Running)",
        },
        { label: "Azure-OpenAI (Running)", value: "Azure-OpenAI (Running)" },
        { label: "OpenAI (Running)", value: "OpenAI (Running)" },
        { label: "Anthropic (Running)", value: "Anthropic (Running)" },
      ],
      promptTemp: "default",
      promptTempOption: [
        { label: "default", value: "default" },
        { label: "py", value: "py" },
      ],

      isReqLoading: false,

      isDialog: true, // 右侧内容默认是对话
      // isDialog: false,  // 右侧内容默认是表单

      sidebarWidth: 500,
      collapsed: false,
      visibility: "visible",

      // 滑块组件
      sliderValue: 45,
      marks: { 0: "0.00", 100: "1.00" },
      // 历史对话轮数
      roundsValue: 3,

      // 知识库配置
      knowOptions: [
        {
          value: "samples",
          label: "samples",
        },
      ],
      knowValue: "samples",
      roundsKnow: 3,
      sliderKnow: 45,
      // 搜索引擎匹配
      searchOptions: [
        {
          value: "bing",
          label: "bing",
        },
        {
          value: "duckduckgo",
          label: "duckduckgo",
        },
        {
          value: "metaphor",
          label: "metaphor",
        },
      ],
      searchValue: "duckduckgo",
      roundsSearch: 3,

      delay: 20,

      // 对话
      currentTime: "",
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
    };
  },

  methods: {
    getMsg(msg) {
      this.messages.push(msg);
    },

    handleReceive(options) {
      this.knowOptions = options;
    },
    handleTheme(val) {
      this.$store.dispatch("settings/changeSetting", {
        key: "theme",
        value: val,
      });
    },
    handleDrag(delay) {
      console.log(this.sidebarWidth);

      const dragBtn = document.querySelector(".btn-drag");

      const slideBarBox = document.querySelector(".sidebar-box");

      // console.log(dragBtn,slideBarBox)

      //鼠标按下
      dragBtn.onmousedown = (e) => {
        //记录鼠标开始位置
        let startX = e.clientX;
        //防抖初始时间
        let init_time = 0;
        //给得是document绑定事件
        document.onmousemove = (e) => {
          // 防抖
          let now_time = new Date(); //现在时间
          if (now_time - init_time > delay) {
            console.log(this.sidebarWidth);
            //满足时间则执行
            init_time = now_time;
            //记录鼠标位置
            let endX = e.clientX;
            //计算鼠标移动距离
            let moveX = endX - startX;
            // 更新鼠标初始位置
            startX = endX;

            // 更新盒子宽度
            this.sidebarWidth += moveX;
            // 边界值处理
            if (this.sidebarWidth < 300) {
              this.sidebarWidth = 300;
            }
            if (this.sidebarWidth > 700) {
              this.sidebarWidth = 700;
            }
            slideBarBox.style.width = this.sidebarWidth + "px";
          }
          return false; //阻止默认事件
        };

        //解除事件
        document.onmouseup = () => {
          document.onmousemove = null;
          document.onmouseup = null;
          // 释放鼠标
          dragBtn.releaseCapture && dragBtn.releaseCapture();
        };

        // 捕获鼠标
        dragBtn.setCapture && dragBtn.setCapture();

        return false; //阻止默认事件
      };
    },

    handleWide(val) {
      console.log(val);
      if (val == true) {
        this.customStyle = {
          padding: 0,
        };
      } else {
        this.customStyle = {
          paddingLeft: 100 + "px",
          paddingRight: 100 + "px",
        };
      }
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },

    // 切换知识库管理
    handleKnowledge() {
      // loading 效果
      this.isReqLoading = true;
      setTimeout(() => {
        this.isReqLoading = false;
      }, 5000);

      this.isDialog = false;
    },
    // 切换对话
    handleChat() {
      // loading 效果
      this.isReqLoading = true;
      setTimeout(() => {
        this.isReqLoading = false;
      }, 5000);

      this.isDialog = true;
    },
    // 选择对话模式
    handleDialogMode(val) {
      // loading 效果
      this.isReqLoading = true;
      setTimeout(() => {
        this.isReqLoading = false;
      }, 5000);

      if (val == "LLM 对话") {
        this.promptTempOption = [
          { label: "default", value: "default" },
          { label: "py", value: "py" },
        ];
      } else if (val == "知识库问答") {
        this.promptTempOption = [
          { label: "default", value: "default" },
          { label: "text", value: "text" },
        ];
      } else if (val == "搜索引擎问答") {
        this.promptTempOption = [
          { label: "default", value: "default" },
          { label: "search", value: "search" },
        ];
      } else if (val == "自定义Agent问答") {
        this.promptTempOption = [
          { label: "chatGLM", value: "chatGLM" },
          { label: "Qwen", value: "Qwen" },
        ];
      }

      const h = this.$createElement;

      this.$notify({
        message: h(
          "span",
          { style: "color: black" },
          "已切换成" + val + "模式"
        ),
        position: "bottom-right",
        duration: 1500,
      });
    },
    // 选择LLM模式
    handleLLMMode(val) {
      // loading 效果
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
        duration: 1500,
      });
    },
    // 选择prompt模版
    handlePromptMode(val) {
      // loading 效果
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
        duration: 1500,
      });
    },
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
    // Return
    handleReturn() {},
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
        }, 1000);
      });
    },

    handleSetting() {
      this.dialogVisible = true;
    },

    // 左侧面板切换
    handleToggle() {
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
  },
};
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  height: calc(100vh - 50px);
  width: 100%;
}

.sidebar-box {
  width: 200px;
  height: 100%;
  background-color: #f2f2f2;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;

  .sidebar {
    display: flex;
    flex-direction: column;
    background-color: #f2f2f2;
    transition: width 0s ease;
    padding: 50px 30px;
    padding-left: 15px;
    overflow: auto;
    .btn-close {
      display: flex;
      font-size: 25px;
      justify-content: flex-end;
      margin-top: -40px;
      cursor: pointer;
    }
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
    .btn-two {
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
    .btn-dialog {
      font-size: 14px;
      margin-top: 30px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
    }
  }

  .btn-drag {
    width: 10px;
    height: 100%;
    background-color: transparent;
    cursor: w-resize;
    position: absolute;
    right: 0;
    top: 0;
  }
}

.btn-collapse {
  align-self: start; /* 垂直居中 */
  /* margin-right: 10px; 调整与内容区域的间距 */
  padding: 5px;
  border: none;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

.right {
  height: 100%;
  flex: 1;
  position: relative;
  overflow: auto;
  padding: 0 100px;
  // background-color: antiquewhite;
  // color: red;
  // font-size: 50px;
  // text-align: center;
}

.el-input-number--medium {
  width: 95%;
  line-height: 34px;
}

::v-deep .el-collapse-item__header {
  font-size: 16px;
}
::v-deep .el-collapse-item__header {
  border-bottom: 0px solid #f2f2f2;
}
::v-deep .el-collapse-item__wrap {
  border-bottom: 0px solid #f2f2f2;
}
::v-deep .el-collapse-item__content {
  padding-bottom: 0px;
}
.left-collapse ::v-deep .el-collapse-item__wrap {
  padding: 5px;
  border-radius: 10px;
  border: 1px solid #999;
  background-color: #f2f2f2;
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.2);
}
.left-collapse ::v-deep .el-collapse-item__header {
  background-color: #f2f2f2;
}
.mode-collapse {
  font-size: 14px;
  margin-top: 20px;
  margin-bottom: 2px;
}
.dropdown {
  position: fixed;
  display: flex;
  align-items: center;
  top: 65px;
  right: 30px;
  z-index: 9999;
  .el-dropdown {
    margin-left: 10px;
    font-size: 25px;
    cursor: pointer;
  }
}
</style>
