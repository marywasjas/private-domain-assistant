<template>
  <div>
    <div class="container">
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
              v-model="temperature"
              :format-tooltip="formatTooltip"
              :marks="marks"
              :show-tooltip="true"
            ></el-slider>
          </div>

          <div v-show="isDialog">
            <div class="mode">历史对话轮数：</div>
            <el-input-number
              v-model="historyLength"
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
        <Form :customStyle="customStyle" v-if="!isDialog" />

        <div v-show="isDialog" class="dialog" :style="customStyle">
          <!-- 对话区 -->
          <div class="main">
            <div v-for="item in messages" :key="item.id" class="message">
              <img v-if="!item.isFromUser" src="../../../public/chat.png" />
              <img v-else src="../../../public/personal.png" />

              <span v-if="item.isFromUser" class="user-message content">
                <div style="color: grey">{{ item.currentTime }}</div>
                <br />
                {{ item.text }}
              </span>

              <div v-else class="bot-message content">
                <div
                  style="
                    font-size: 14px;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                  "
                >
                  <span style="margin-right: 5px">知识库</span>
                  <el-tag type="success" size="small">
                    {{ item.knowValue }}
                  </el-tag>
                </div>

                <el-collapse class="dialog-collapse">
                  <el-collapse-item>
                    <template slot="title">
                      <div>
                        <strong class="el-icon-check"></strong>
                        知识库匹配结果
                      </div>
                    </template>
                    <div class="response"></div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>
          <!-- 输入区 -->
          <div class="input-container">
            <el-input
              v-model="userInput"
              :disabled="isInput"
              @keyup.enter.native="sendMessage"
              size="medium"
              type="text"
              placeholder="请输入对话内容，换行请使用Shift+Enter"
            >
              <i slot="suffix" class="el-icon-s-promotion el-input__icon" />
            </el-input>
          </div>
        </div>
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

      <el-checkbox v-model="checkedwide" @change="handleWide">
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
import Form from "./components/Form.vue";
import ThemePicker from "@/components/ThemePicker";
import { fetchEventSource } from "@microsoft/fetch-event-source";

import { getServerConfig, getServerSeo } from "@/api/server";
import { getKbList } from "@/api/knowledge";
import {
  listRunningModels, // 列出当前已加载模型
  listConfigModels, // 列出configs已配置的模型
  changeMode, // 切换指定的LLM模型
} from "@/api/llm-mode";

export default {
  components: {
    Form,
    ThemePicker,
  },

  mounted() {
    this.handleDrag(20);
    this.getConfig();
  },

  data() {
    return {
      customStyle: {
        paddingLeft: 70 + "px",
        paddingRight: 70 + "px",
      },
      delay: 20,
      sidebarWidth: 500,
      collapsed: false,
      visibility: "visible",
      dialogVisible: false,
      checkedwide: false,
      article: "", // print打印内容
      fullscreenLoading: true, // print打印内容

      isDialog: true, // 右侧内容默认是对话

      isReqLoading: false,

      old_model_name: "",
      controller_address: "",

      activeNames: "1",

      dialogMode: "LLM 对话", // 对话模式
      dialogModeOption: [
        { label: "LLM 对话", value: "LLM 对话" },
        { label: "知识库问答", value: "知识库问答" },
        { label: "搜索引擎问答", value: "搜索引擎问答" },
        { label: "自定义Agent问答", value: "自定义Agent问答" },
      ],

      LLMMode: "",
      LLMModeOption: [],

      promptTemp: "",
      promptTempOption: [],

      llm_chat: "",
      knowledge_base_chat: "",
      search_engine_chat: "",
      agent_chat: "",

      // 滑块组件
      temperature: "",
      marks: { 0: "0.00", 100: "1.00" },

      // 历史对话轮数
      historyLength: "",

      // 知识库配置
      knowOptions: [],
      knowValue: "",
      roundsKnow: "",
      sliderKnow: "",

      // 搜索引擎匹配
      searchOptions: [],
      searchValue: "",
      roundsSearch: "",

      // 对话
      userInput: "",
      currentTime: "",
      messages: [
        // {
        //   text: "今天星期几",
        //   index: "001",
        //   isFromUser: true,
        //   currentTime: this.formatDateTime(new Date()),
        //   isError: false,
        // },
        // {
        //   text: "^_^ @_@",
        //   index: "004",
        //   isFromUser: false,
        //   currentTime: this.formatDateTime(new Date()),
        //   isError: false,
        // },
      ],
      isInput: false,
      isThinking: false,
      text: "",
    };
  },

  methods: {
    getConfig() {
      // 获取服务器原始配置信息
      getServerConfig()
        .then((res) => {
          console.log("配置信息", res);
          this.old_model_name = res["LLM_MODEL"];
          this.LLMMode = res["LLM_MODEL"];

          this.knowValue = res["DEFAULT_KNOWLEDGE_BASE"];
          this.roundsKnow = res["VECTOR_SEARCH_TOP_K"];
          this.sliderKnow = res["SCORE_THRESHOLD"] * 100;

          this.searchValue = res["DEFAULT_SEARCH_ENGINE"];
          this.roundsSearch = res["SEARCH_ENGINE_TOP_K"];

          this.controller_address = res["controller_address"];
          this.historyLength = res["HISTORY_LEN"];
          this.temperature = res["TEMPERATURE"] * 100;

          this.llm_chat = Object.keys(res["PROMPT_TEMPLATES"].llm_chat);

          this.knowledge_base_chat = Object.keys(
            res["PROMPT_TEMPLATES"].knowledge_base_chat
          );

          this.search_engine_chat = Object.keys(
            res["PROMPT_TEMPLATES"].search_engine_chat
          );

          this.agent_chat = Object.keys(res["PROMPT_TEMPLATES"].agent_chat);

          this.promptTempOption = this.llm_chat.map((item) => {
            return { value: item, label: item };
          });
          this.promptTemp = this.promptTempOption[0].value;

          //! 列出当前已加载模型
          listRunningModels({
            controller_address: this.controller_address,
            placeholder: "string",
          })
            .then((res) => {
              var model_running = Object.keys(res).map((item) => {
                return {
                  value: item + " (Running)",
                  label: item + " (Running)",
                };
              });

              //! 列出configs已配置的模型
              listConfigModels()
                .then((res) => {
                  let langchain = Object.keys(res.langchain);
                  let online = Object.keys(res.online);
                  let model = langchain.concat(online).map((item) => {
                    return { value: item, label: item };
                  });

                  this.LLMModeOption = model_running.concat(model);
                })
                .catch(() => {});
            })
            .catch(() => {});
        })
        .catch(() => {});
    },

    handleDrag(delay) {
      // console.log(this.sidebarWidth);
      const dragBtn = document.querySelector(".btn-drag");
      const slideBarBox = document.querySelector(".sidebar-box");
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
    // 切换到知识库管理
    handleKnowledge() {
      this.isDialog = false;
      this.getConfig();
    },
    // 切换到对话
    handleChat() {
      this.isDialog = true;
      this.getConfig();
    },
    // 选择对话模式
    handleDialogMode(val) {
      if (val == "LLM 对话") {
        this.promptTempOption = this.llm_chat.map((item) => {
          return { value: item, label: item };
        });
      } else if (val == "知识库问答") {
        this.promptTempOption = this.knowledge_base_chat.map((item) => {
          return { value: item, label: item };
        });
        // 获取知识库列表
        getKbList()
          .then((res) => {
            this.knowOptions = res.map((item) => {
              return { label: item, value: item };
            });
          })
          .catch(() => {});
      } else if (val == "搜索引擎问答") {
        this.promptTempOption = this.search_engine_chat.map((item) => {
          return { value: item, label: item };
        });
        // 获取服务器支持的搜索引擎
        getServerSeo()
          .then((res) => {
            this.searchOptions = res.map((item) => {
              return { value: item, label: item };
            });
          })
          .catch(() => {});
      } else if (val == "自定义Agent问答") {
        this.promptTempOption = this.agent_chat.map((item) => {
          return { value: item, label: item };
        });
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

    // 选择LLM模式 / 切换指定的LLM模型
    handleLLMMode(val) {
      this.isReqLoading = true;
      if (!val.includes("R") && !this.old_model_name.includes("R")) {
        changeMode({
          model_name: this.old_model_name,
          new_model_name: val,
          controller_address: this.controller_address,
        })
          .then((res) => {
            this.isReqLoading = false;
            this.old_model_name = val;
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
          })
          .catch((err) => {
            console.log(err);
            this.isReqLoading = false;
          });
      } else {
        this.isReqLoading = false;
        this.old_model_name = val;
      }
    },

    // 选择prompt模版
    handlePromptMode(val) {
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

    // 发送信息
    sendMessage() {
      if (this.userInput.trim()) {
        this.isInput = true;

        let newMessage = {
          text: this.userInput,
          isFromUser: true,
          currentTime: this.formatDateTime(new Date()),
          id: uuidv4(),
        };
        this.messages.push(newMessage);

        let newMessage2 = {
          text: "",
          isFromUser: false,
          knowValue: this.knowValue,
          id: uuidv4(),
        };
        this.messages.push(newMessage2);

        // 请求
        this.send(this.userInput);
        // 清空
        this.userInput = "";
        // 让滚动条在底部
        setTimeout(function () {
          var showContent = document.querySelector(".main");
          showContent.scrollTop = showContent.scrollHeight + 5000;
        }, 100);
      } else {
        this.$message({
          dangerouslyUseHTMLString: true,
          message: "请输入查询内容",
          showClose: true,
        });
      }
    },

    async send(query) {
      const controller = new AbortController();

      const signal = controller.signal;

      await fetchEventSource(
        "http://192.168.61.108:7861/chat/knowledge_base_chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          openWhenHidden: true,

          signal: signal,

          body: JSON.stringify({
            query: query,
            knowledge_base_name: this.knowValue,
            top_k: this.roundsKnow,
            score_threshold: this.sliderKnow / 100,
            history: [
              {
                role: "user",
                content: "我们来玩成语接龙，我先来，生龙活虎",
              },
              {
                role: "assistant",
                content: "虎头虎脑",
              },
            ],
            stream: false,
            model_name: this.LLMMode,
            temperature: this.temperature / 100,
            prompt_name: this.promptTemp,
            // max_tokens: "none",
          }),

          onopen: async (response) => {
            var divs = document.getElementsByClassName("response");
            var output = divs[divs.length - 1];
            output.innerText = "。。。。。。";
            //获取UTF8的解码
            const encode = new TextDecoder("utf-8");

            const reader = response.body.getReader();

            var res = "";

            while (true) {
              const { done, value } = await reader.read();
              console.log("是否已经读完所有内容", done);
              if (done) {
                controller.abort();
                this.isInput = false;
                break;
              }

              const text = encode.decode(value);
              console.log("*****", text);
              res += text;
            }
            let obj = JSON.parse(JSON.stringify(res));
            let docs = JSON.parse(obj).docs;
            console.log(JSON.parse(obj));
            output.innerText = JOSN.stringify(docs);
            setTimeout(function () {
              var showContent = document.querySelector(".main");
              showContent.scrollTop = showContent.scrollHeight + 5000;
            }, 100);
          },
          onmessage: (event) => {
            console.log(event);
            controller.abort();
          },
          onerror: (event) => {
            console.log("服务异常", event);
            controller.abort();
          },
          onclose: () => {
            console.log("服务关闭");
            controller.abort();
          },
        }
      );
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
    // Get help
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
    // Setting
    handleSetting() {
      this.dialogVisible = true;
    },
    handleTheme(val) {
      this.$store.dispatch("settings/changeSetting", {
        key: "theme",
        value: val,
      });
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

    async getProgress() {
      this.isLoading = true;
      // 创建 AbortController 对象和 AbortSignal 信号量
      const controller = new AbortController();
      const signal = controller.signal;

      let response = await fetchEventSource(
        "http://192.168.61.108:7861/chat/agent_chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          openWhenHidden: true,
          signal: signal, // 将 signal 作为选项参数传递
          body: JSON.stringify({
            query: "恼羞成怒",
            history: [
              {
                role: "user",
                content: "请使用知识库工具查询今天北京天气",
              },
              {
                role: "assistant",
                content:
                  "使用天气查询工具查询到今天北京多云，10-14摄氏度，东北风2级，易感冒",
              },
            ],
            stream: false,
            model_name: "Qwen-14B-Chat-Int4",
            temperature: 0.7,
            // max_tokens: 0,
            prompt_name: "default",
          }),

          onopen: async (response) => {
            console.log(response);
            //获取UTF8的解码
            const encode = new TextDecoder("utf-8");
            //获取body的reader
            const reader = response.body.getReader();
            // 循环读取reponse中的内容
            while (true) {
              const { done, value } = await reader.read();
              console.log("是否已经读完所有内容", done);
              if (done) {
                controller.abort(); //读完内容，关闭请求
                break;
              }
              // 解码内容
              const text = encode.decode(value);
              console.log("@@", text);
              // 对解码后的信息进行判断
              if (text === "<ERR>") {
                // 当获取错误token时，输出错误信息
                lastDiv.innerText = "Error";
                break;
              } else {
                // this.hideThinkingMessage();
                // 获取正常信息时，逐字追加输出
                lastDiv.innerText += text;
                console.log("**", lastDiv.innerText);
              }
            }
          },
          //服务返回的数据
          onmessage: (event) => {
            console.log(event);
          },
          // 服务异常
          onerror: (event) => {
            console.log("服务异常", event);
          },
          // 服务关闭
          onclose: () => {
            console.log("服务关闭");
          },
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  height: calc(100vh - 50px);
  width: 100%;
}
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
      // align-items: center;
      margin-bottom: 15px;
      max-width: 100%;
      img {
        width: 2.5rem;
        height: 2.5rem;
        margin-right: 0.5rem;
        margin-top: 0.6rem;
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
      // .bot-message::after {
      //   content: "  ▎";
      //   animation: blink 1s step-start infinite;
      // }
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
      margin-right: -10px;
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
.dialog-collapse {
  [data-v-6e47ac07] .el-collapse-item__header {
    font-size: 16px;
    border-bottom: 1 solid #f2f2f2;
  }
}
</style>
