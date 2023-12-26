<template>
  <!-- <div v-else class="kb"> -->
  <div class="kb">
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
        <el-button style="width: 100%" @click="handleCreate">新建</el-button>
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

      <el-button :disabled="isUpload" style=""> 添加文件到知识库 </el-button>

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
        <el-table-column type="index" width="50" label="序号"></el-table-column>
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
          <el-button type="primary" @click="handleDelete"
            >从知识库删除</el-button
          >
        </div>
      </el-form-item>

      <el-divider></el-divider>

      <el-form-item>
        <div style="display: flex; justify-content: space-between">
          <el-button type="primary" @click="handleRestart"
            >依据源文件重建向量库</el-button
          >
          <el-button @click="handleDelete2">删除知识库</el-button>
        </div>
      </el-form-item>
      <div style="margin-top: 20px" v-if="isLoading">
        <i class="el-icon-loading"></i
        >向量库重构中，请耐心等待，勿刷新或关闭页面。
      </div>
    </el-form>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";

export default {
  data() {
    return {
      activeNames: ["1"],
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

    handleRestart() {
      this.isLoading = true; // 点击按钮后显示提示信息

      setTimeout(() => {
        this.isLoading = false; // 5秒后隐藏提示信息
      }, 5000);
    },

    handleDelete() {
      this.tableData = [];
    },

    handleDelete2() {
      this.tableData = [];
      this.isCreate = true;
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
