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


      <Dialog v-if="isDialog"/>

      <div v-else class="kb">
        <el-form ref="formKB" :model="formKB" style="width: 70%">
          <el-form-item label="">
            <div>请选择或新建知识库：</div>
            <el-select
              style="width: 100%"
              v-model="formKB.knowledge"
              @change="handleSelectOrCreate"
            >
              <el-option label="samples(faiss @ m3e-base)" value="1" />
              <el-option label="新建知识库" value="2" />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 新建 -->
        <el-form
          :key="1"
          v-if="isCreate"
          ref="formCreate"
          :model="formCreate"
          :rules="rules"
          style="
            width: 70%;
            border: 1px solid #ebeef5;
            border-radius: 10px;
            padding: 15px 20px 0px;
          "
        >
          <el-form-item prop="name">
            <div>新建知识库名称</div>
            <el-input
              v-model="formCreate.name"
              placeholder="新知识库名称"
            ></el-input>
          </el-form-item>

          <el-form-item prop="brief">
            <div>知识库简介</div>
            <el-input
              v-model="formCreate.brief"
              placeholder="知识库简介，方便Agent查找"
            ></el-input>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item>
                <div>向量库类型</div>
                <el-select v-model="vector" style="width: 100%">
                  <el-option
                    v-for="item in vectorOption"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <div>Embedding 模型</div>
                <el-select v-model="embed" style="width: 100%">
                  <el-option
                    v-for="item in embedOption"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item>
            <el-button style="width: 100%" @click="handleCreate"
              >新建</el-button
            >
          </el-form-item>
        </el-form>

        <!-- 选择 -->
        <!-- <el-row :gutter="20"> -->
        <el-form
          :key="2"
          v-if="!isCreate"
          ref="formSelect"
          :model="formSelect"
          style="width: 70%"
        >
          <el-form-item>
            <div>上传知识文件：</div>
            <el-upload
              class="upload-demo"
              drag
              action="https://jsonplaceholder.typicode.com/posts/"
              :file-list="fileList"
              :before-upload="handleUpload"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
            >
              <i class="el-icon-upload" style="margin: 0 20px"></i>
              <div style="text-align: left; width: auto">
                <strong>Drag and drop files here</strong><br />
                <div style="font-size: 16px">
                  Limit 200MB per file ·
                  HTML,MD,JSON,CSV,PDF,PNG,JPG,JPEG,BMP,EML,MSG,RST,RTF,
                  TXT,XML,DOCX,EPUB,ODT,PPT,PPTX,TSV,HTM
                </div>
              </div>
              <div style="">
                <el-button class="browseBtn">Browse flies</el-button>
              </div>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <div>请输入知识库介绍：</div>
            <el-input type="textarea" :rows="4" v-model="formSelect.textarea" />
          </el-form-item>

          <el-form-item>
            <el-collapse
              v-model="activeNames"
              style="
                border: 1px solid #e6ebf5;
                border-radius: 10px;
                padding: 10px 10px;
                margin-bottom: 5px;
              "
            >
              <el-collapse-item title="文件处理配置" name="1">
                <el-row
                  :gutter="20"
                  style="display: flex; align-items: center; margin: 0"
                >
                  <el-col :span="9">
                    <el-form-item>
                      <div>单段文本最大长度</div>
                      <el-input-number
                        v-model="formSelect.maxlength"
                        :min="1"
                        :max="1000"
                      />
                    </el-form-item>
                  </el-col>

                  <el-col :span="9">
                    <el-form-item>
                      <div>相邻文本重合长度</div>
                      <el-input-number
                        v-model="formSelect.overlength"
                        :min="1"
                        :max="1000"
                      />
                    </el-form-item>
                  </el-col>

                  <el-col :span="6">
                    <el-form-item style="margin-bottom: 0; font-size: 20px">
                      <el-checkbox v-model="formSelect.checked">
                        开启中文标题加强
                      </el-checkbox>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>
            </el-collapse>
          </el-form-item>

          <el-button :disabled="isUpload" style="">
            添加文件到知识库
          </el-button>

          <el-divider></el-divider>

          <div>
            知识库
            <el-tag type="success" size="small">samples</el-tag> 已有文件：
          </div>
          <div style="margin: 10px 0 20px 0">
            <el-tag class="tag">
              知识库中包含源文件和向量库，请从下表中选择文件后操作
            </el-tag>
          </div>
          <el-table
            border
            ref="singleTable"
            :data="tableData"
            highlight-current-row
            style="width: 100%"
          >
            <el-table-column
              type="index"
              width="50"
              label="序号"
            ></el-table-column>
            <el-table-column
              sortable
              v-for="column in columns"
              :key="column.property"
              :property="column.prop"
              :label="column.label"
              :width="column.width"
            >
              <template slot="header">
                <el-tooltip
                  content="表头提示信息"
                  placement="bottom"
                  effect="light"
                >
                  <!-- :open-delay="300" 
                  :manual="true" 
                  v-model="tooltipVisible" -->
                  <template slot="content">
                    <!-- <div style="width: 50%"> -->
                    <el-select
                      v-model="selectedOption"
                      placeholder="请选择"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in tooltipOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      ></el-option>
                    </el-select>

                    <el-input
                      style="margin-top: 10px"
                      v-model="input"
                      placeholder="请输入内容"
                    ></el-input>
                    <!-- </div> -->
                  </template>
                  <span @click.capture="headerClick">{{ column.label }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <!-- </el-form-item> -->

          <el-divider></el-divider>

          <el-form-item>
            <div style="display: flex; justify-content: space-between">
              <el-button @click="handleLoad('text', fileContent)"
                >下载选中文档</el-button
              >
              <el-button>重新添加至向量库</el-button>
              <el-button>从向量库删除</el-button>
              <el-button type="primary">从知识库删除</el-button>
            </div>
          </el-form-item>

          <el-divider></el-divider>

          <el-form-item>
            <div style="display: flex; justify-content: space-between">
              <el-button type="primary" @click="handleRestart"
                >依据源文件重建向量库</el-button
              >
              <el-button>删除知识库</el-button>
            </div>
          </el-form-item>
          <div style="margin-top: 20px" v-if="isLoading">
            <i class="el-icon-loading"></i
            >向量库重构中，请耐心等待，勿刷新或关闭页面。
          </div>
        </el-form>
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
          <el-dropdown-item @click.native="handleRetrun">
            Return R
          </el-dropdown-item>
          <el-dropdown-item>Settings</el-dropdown-item>
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

export default {
  components: { Dialog },

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
      vector: "1",
      vectorOption: [
        { label: "faiss", value: "1" },
        { label: "milvus", value: "2" },
        { label: "zilliz", value: "3" },
        { label: "pg", value: "4" },
      ],
      embed: "1",
      embedOption: [
        { label: "ernie-tiny", value: "1" },
        { label: "ernie-base", value: "2" },
        { label: "text2vec-base", value: "3" },
        { label: "text2vec", value: "4" },
        { label: "text2vec-para1phrase", value: "5" },
        { label: "text2vec-sentence", value: "6" },
        { label: "text2vec-multilingual", value: "7" },
        { label: "text2vec-bge-large-chinese", value: "8" },
        { label: "m3e-small", value: "9" },
        { label: "m3e-base", value: "10" },
        { label: "m3e-large", value: "11" },
        { label: "bge-small-zh", value: "12" },
        { label: "bge-base-zh", value: "13" },
        { label: "bge-large-zh", value: "14" },
        { label: "bge-large-zh-noinstruct", value: "15" },
        { label: "bge-base-zh-v1.5", value: "16" },
        { label: "bge-large-zh-v1.5", value: "17" },
        { label: "piccolo-base-zh", value: "18" },
        { label: "piccolo-large-zh", value: "19" },
        { label: "text-embedding-ada-002", value: "20" },
      ],

      rules: {
        name: [
          { required: true, message: "知识库名称不能为空", trigger: "blur" },
        ],
        brief: [
          { required: true, message: "知识库简介不能为空", trigger: "blur" },
        ],
      },

      // 选择知识库
      formSelect: {
        textarea: "关于本项目issue的解答",
        maxlength: 250,
        overlength: 250,
        checked: false,
      },

      tableData: [
        {
          name: "text.txt",
          loader: "UnstructuredFileLoader",
          tokenizer: "ChineseRecursiveTextSpliter",
          num: "42",
          source: "源文件",
          vector: "向量库",
        },
      ],

      // tableData: [
      //   /* 表格数据 */
      // ],
      columns: [
        { prop: "name", label: "文档名称" },
        { prop: "loader", label: "文档加载器" },
        { prop: "tokenizer", label: "分词器" },
        { prop: "num", label: "文档数量" },
        { prop: "source", label: "源文件" },
        { prop: "vector", label: "向量库" },
      ],
      filterAddress: "",

      fileList: [],
      isUpload: true,
      fileContent: `ChatGPT 是一个基于 GPT-3 的自然语言处理模型，它是 OpenAI 在 2020 年发布的一款聊天机器人模型。

该模型是由一种叫做“生成式预训练 Transformer”（Generative Pre-trained Transformer，简称 GPT）的架构所构建的。GPT 架构是一种深度学习架构，由多个 Transformer 模块组成，能够通过预训练来学习语言模型，从而实现对各种文本任务的支持。

ChatGPT 的目标是成为一款能够自动回答用户提出的问题，并进行真实对话的人工智能聊天机器人。它可以理解并回答用户的自然语言问题，例如“天气怎么样？”、“你会唱歌吗？”等问题。

与其他聊天机器人不同的是，ChatGPT 不需要预先编写规则或模板，也不需要手动输入大量的对话数据，它能够自动学习用户的语言习惯和用词，并给出合适的回答。这使得 ChatGPT 可以更好地适应各种不同的语言环境和应用场景。

当然，由于 ChatGPT 技术本身的局限性，它可能在某些方面表现不佳或响应不及时。此外，由于其在处理敏感话题方面的限制，会对某些特定类型的问题提供不完整或无法回答的回答。因此，在使用 ChatGPT 时需要谨慎和注意。

总的来说，ChatGPT 是一款很有潜力的聊天机器人模型，可以用于多种场景，例如客服、助手、游戏NPC等。`,

      isLoading: false,

      options: [
        {
          value: "samples",
          label: "samples",
        },
      ],
      value: "samples",

      dialogVisible: false,
      selectedOption: "",
      tooltipOptions: [
        { label: "选项1", value: "option1" },
        { label: "选项2", value: "option2" },
        { label: "选项3", value: "option3" },
      ],
      dialogPosition: { x: 0, y: 0 },

      tooltipVisible: false,
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
    //  Report a bug
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

    // 新建知识库
    handleCreate() {
      this.$refs["formCreate"].validate((valid) => {
        if (valid) {
          this.isReqLoading = true;
          setTimeout(() => {
            this.isReqLoading = false;
          }, 5000);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
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

    handleLoad(fileName, fileContent) {
      const element = document.createElement("a");
      const file = new Blob([fileContent], {
        type: "text/plain;charset=utf-8",
      });
      element.href = URL.createObjectURL(file);
      element.download = fileName;
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
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

    // 选择或新建知识库
    handleSelectOrCreate(val) {
      if (val != "1") {
        this.isCreate = true;
      } else {
        this.isCreate = false;
      }
    },

    handleUpload(val) {
      console.log(val);
      console.log(this.fileList);
    },

    handleRemove(val) {
      this.fileList.length == 0;
      this.isUpload = true;
    },

    handleSuccess(val) {
      this.fileList = val.fileList;
      this.isUpload = false;
    },

    headerClick(event, column) {
      // alert("知识库管理");
      this.tooltipVisible = !this.tooltipVisible;
      this.selectedOption = ""; // 清空选择的选项

      // 设置对话框位置为鼠标点击位置
      this.dialogPosition = { x: event.clientX, y: event.clientY };
    },

    handleDialogConfirm() {
      // 处理弹出框的确定按钮点击事件
      console.log("选择了：", this.selectedOption);

      // 在这里可以根据选择的选项进行相应的操作

      this.dialogVisible = false; // 关闭弹出框
    },

    handleRestart() {
      this.isLoading = true; // 点击按钮后显示提示信息

      setTimeout(() => {
        this.isLoading = false; // 5秒后隐藏提示信息
      }, 5000);
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
