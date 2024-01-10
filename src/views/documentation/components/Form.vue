<template>
  <div class="knowledge-base" :style="customStyle">
    <el-form ref="formKB" :model="formKB" style="width: 70%">
      <el-form-item label="">
        <div style="font-size: 18px">请选择或新建知识库：</div>
        <el-select
          style="width: 100%"
          v-model="formKB.knowledge"
          @change="handleSelectOrCreate"
        >
          <el-option
            v-for="item in createOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 新建 -->
    <el-form
      :key="1"
      v-if="isCreate"
      ref="formCreate"
      :model="formCreate"
      :rules="rulesCreate"
      class="form-create"
    >
      <el-form-item prop="name">
        <div>新建知识库名称</div>
        <el-input v-model="formCreate.name" placeholder="新知识库名称" />
      </el-form-item>

      <el-form-item prop="brief">
        <div>知识库简介</div>
        <el-input
          v-model="formCreate.brief"
          placeholder="知识库简介，方便Agent查找"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item>
            <div>向量库类型</div>
            <el-select v-model="formCreate.vector" style="width: 100%">
              <el-option
                v-for="item in vectorOption"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <div>Embedding 模型</div>
            <el-select v-model="formCreate.embed" style="width: 100%">
              <el-option
                v-for="item in embedOption"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button style="width: 100%" @click="handleCreate">
          <div style="font-size: 16px">新建</div>
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 选择 -->
    <el-form
      :key="2"
      v-if="!isCreate && createOptions.length > 1"
      ref="formSelect"
      :model="formSelect"
      style="width: 70%"
    >
      <el-form-item>
        <div style="font-size: 18px">上传知识文件：</div>
        <el-upload
          class="upload-demo"
          drag
          multiple
          show-file-list
          action="https://jsonplaceholder.typicode.com/posts/"
          :file-list="fileList"
          :before-upload="handleUpload"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :on-error="handleError"
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
            <el-button style="margin: 0 20px">Browse flies</el-button>
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <div style="font-size: 18px">请输入知识库介绍：</div>
        <el-input type="textarea" :rows="5" v-model="formSelect.textarea" />
      </el-form-item>

      <el-form-item>
        <el-collapse v-model="activeNames" class="collapse-doc">
          <el-collapse-item title="文件处理配置:" name="1">
            <el-row
              :gutter="20"
              style="display: flex; align-items: center; margin-bottom: 15px"
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
                    :min="0"
                    :max="251"
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

      <el-button :disabled="isUpload" @click="handleAdd">
        添加文件到知识库
      </el-button>

      <el-divider></el-divider>

      <div style="font-size: 18px">
        知识库
        <el-tag type="success" size="small">
          {{ nameKB }}
        </el-tag>
        已有文件：
      </div>
      <div style="margin: 10px 0 20px 0">
        <el-tag class="tag-name">
          {{ nameTable }}
        </el-tag>
      </div>
      <el-table
        border
        ref="singleTable"
        :data="tableData"
        highlight-current-row
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column type="index" width="50" label="序号"></el-table-column>

        <el-table-column
          :sortable="true"
          v-for="column in columns"
          :key="column.prop"
          :property="column.prop"
          :label="column.label"
          :width="column.width"
        >
          <template slot="header">
            <el-popover
              placement="bottom"
              trigger="click"
              :ref="'popover-' + column.prop"
            >
              <el-select
                :popperAppendToBody="false"
                v-model="column.selectedOption"
                placeholder="请选择"
                style="width: 100%"
                @change="handleSortChange(column)"
              >
                <el-option
                  v-for="option in column.tooltipOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.label"
                ></el-option>
              </el-select>

              <el-input
                style="margin-top: 10px"
                v-model="column.input"
                placeholder="请输入内容"
              ></el-input>
              <span @click="handleTableClick(column)" slot="reference">{{
                column.label
              }}</span>
            </el-popover>
          </template>

          <template slot-scope="scope">
            <span v-if="column.prop === 'source'">
              <i
                v-if="scope.row.source == 'success'"
                class="el-icon-success"
                style="color: #67c23a"
              />
              <i v-else class="el-icon-error" style="color: #f56c6c" />
            </span>

            <span v-else-if="column.prop === 'vector'">
              <i
                v-if="scope.row.vector == 'success'"
                class="el-icon-success"
                style="color: #67c23a"
              />
              <i v-else class="el-icon-error" style="color: #f56c6c" />
            </span>

            <span v-else>{{ scope.row[column.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-divider></el-divider>

      <el-form-item>
        <div style="display: flex; justify-content: space-between">
          <el-button
            @click="handleLoad('text', fileContent)"
            :disabled="isSelected"
          >
            下载选中文档
          </el-button>
          <el-button :disabled="isSelected">重新添加至向量库</el-button>
          <el-button :disabled="isSelected">从向量库删除</el-button>
          <el-button
            type="primary"
            @click="handleDelete"
            :disabled="isSelected"
          >
            从知识库删除
          </el-button>
        </div>
      </el-form-item>

      <el-divider></el-divider>

      <el-form-item>
        <div style="display: flex; justify-content: space-between">
          <el-button type="primary" @click="handleRestart">
            依据源文件重建向量库
          </el-button>
          <el-button @click="handleDeleteKB">删除知识库</el-button>
        </div>
      </el-form-item>
      <div style="margin-top: 20px" v-if="isLoading">
        <i class="el-icon-loading"></i>
        向量库重构中，请耐心等待，勿刷新或关闭页面。
      </div>
    </el-form>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";

export default {
  props: ["customStyle", "handleReceive"],
  data() {
    return {
      activeNames: "1",
      nameKB: "",
      nameTable: "知识库中包含源文件和向量库，请从下表中选择文件后操作",
      formKB: {},
      createOptions: [
        {
          label: "samples(faiss @ m3e-base)",
          value: "samples(faiss @ m3e-base)",
        },
        {
          label: "新建知识库",
          value: "新建知识库",
        },
      ],
      isCreate: false, // 默认是非创建页面
      formCreate: {
        name: "",
        brief: "",
        vector: "faiss",
        embed: "ernie-tiny",
      },
      vectorOption: [
        { label: "faiss", value: "1" },
        { label: "milvus", value: "2" },
        { label: "zilliz", value: "3" },
        { label: "pg", value: "4" },
      ],
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

      rulesCreate: {
        name: [
          { required: true, message: "知识库名称不能为空", trigger: "blur" },
        ],
      },

      formSelect: {
        textarea: "",
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
          source: "success",
          vector: "success",
        },
      ],

      columns: [
        {
          prop: "name",
          label: "文档名称",
          selectedOption: "",
          tooltipOptions: [
            { label: "name1", value: "option1" },
            { label: "name2", value: "option2" },
            { label: "name3", value: "option3" },
          ],
          input: "",
        },
        {
          prop: "loader",
          label: "文档加载器",
          selectedOption: "",
          tooltipOptions: [
            { label: "loader1", value: "option1" },
            { label: "loader2", value: "option2" },
            { label: "loader3", value: "option3" },
          ],
          input: "",
        },
        {
          prop: "tokenizer",
          label: "分词器",
          selectedOption: "",
          tooltipOptions: [
            { label: "tokenizer1", value: "option1" },
            { label: "tokenizer2", value: "option2" },
            { label: "tokenizer3", value: "option3" },
          ],
          input: "",
        },
        {
          prop: "num",
          label: "文档数量",
          selectedOption: "",
          tooltipOptions: [
            { label: "num1", value: "option1" },
            { label: "num2", value: "option2" },
            { label: "num3", value: "option3" },
          ],
          input: "",
        },
        {
          prop: "source",
          label: "源文件",
          selectedOption: "",
          tooltipOptions: [
            { label: "选项1", value: "option1" },
            { label: "选项2", value: "option2" },
            { label: "选项3", value: "option3" },
          ],
          input: "",
        },
        {
          prop: "vector",
          label: "向量库",
          selectedOption: "",
          tooltipOptions: [
            { label: "vector1", value: "option1" },
            { label: "vector2", value: "option2" },
            { label: "vector3", value: "option3" },
          ],
          input: "",
        },
      ],

      filterAddress: "",

      fileList: [
        {
          name: "text2.txt",
          loader: "UnstructuredFileLoader",
          tokenizer: "ChineseRecursiveTextSpliter",
          num: "42",
          source: "success",
          vector: "success",
        },
      ],

      fileContent: `ChatGPT 是一个基于 GPT-3 的自然语言处理模型，它是 OpenAI 在 2020 年发布的一款聊天机器人模型。

该模型是由一种叫做“生成式预训练 Transformer”（Generative Pre-trained Transformer，简称 GPT）的架构所构建的。GPT 架构是一种深度学习架构，由多个 Transformer 模块组成，能够通过预训练来学习语言模型，从而实现对各种文本任务的支持。

ChatGPT 的目标是成为一款能够自动回答用户提出的问题，并进行真实对话的人工智能聊天机器人。它可以理解并回答用户的自然语言问题，例如“天气怎么样？”、“你会唱歌吗？”等问题。

与其他聊天机器人不同的是，ChatGPT 不需要预先编写规则或模板，也不需要手动输入大量的对话数据，它能够自动学习用户的语言习惯和用词，并给出合适的回答。这使得 ChatGPT 可以更好地适应各种不同的语言环境和应用场景。

当然，由于 ChatGPT 技术本身的局限性，它可能在某些方面表现不佳或响应不及时。此外，由于其在处理敏感话题方面的限制，会对某些特定类型的问题提供不完整或无法回答的回答。因此，在使用 ChatGPT 时需要谨慎和注意。

总的来说，ChatGPT 是一款很有潜力的聊天机器人模型，可以用于多种场景，例如客服、助手、游戏NPC等。`,

      isReqLoading: false,

      isLoading: false,

      isUpload: true,

      isSelected: true,

      selectedArray: "",
    };
  },

  watch: {},

  created() {
    if (this.createOptions.length > 1) {
      this.isCreate = false;
      var filteredArr = this.createOptions.filter((item) => {
        return item.value !== "新建知识库";
      });
      console.log(filteredArr);
      this.formKB.knowledge = filteredArr[0].value;
      // 查找第一个出现(索引
      var index = this.formKB.knowledge.indexOf("(");
      // 截取字符串
      var result = this.formKB.knowledge.slice(0, index);
      this.nameKB = result;
      this.formSelect.textarea = `关于 ${this.nameKB} 的简介`;
    } else {
      this.isCreate = true;
    }

    if (this.fileList.length == 0) {
      this.isUpload = true;
    } else {
      this.isUpload = false;
    }

    if (this.tableData.length == 0) {
      this.nameTable = "知识库暂时没有文件";
    } else {
      this.nameTable = "知识库中包含源文件和向量库，请从下表中选择文件后操作";
    }
  },

  methods: {
    // 新建知识库
    handleCreate() {
      console.log(this.formCreate);
      this.$refs["formCreate"].validate((valid) => {
        if (valid) {
          // loading 效果
          this.isReqLoading = true;
          setTimeout(() => {
            this.isReqLoading = false;
          }, 5000);
          // 提交的表单内容加入到createOptions中
          let value = `${this.formCreate.name}(${this.formCreate.vector} @ ${this.formCreate.embed})`;
          this.createOptions.unshift({
            value: value,
            label: value,
          });
          // 返回非创建页面
          this.isCreate = false;
          // 更新formKB.knowledge
          var filteredArr = this.createOptions.filter((item) => {
            return item.value !== "新建知识库";
          });

          var knowOptions = filteredArr.map((item) => {
            var index = item.value.indexOf("(");
            var result = item.value.slice(0, index);
            return { value: result, label: result };
          });

          // console.log(knowOptions)

          this.handleSend(knowOptions);

          this.formKB.knowledge = filteredArr[0].value;
          // 查找第一个出现(索引
          var index = this.formKB.knowledge.indexOf("(");
          // 截取字符串
          var result = this.formKB.knowledge.slice(0, index);
          this.nameKB = result;
          this.formSelect.textarea = `关于 ${this.nameKB} 的简介`;

          // 初始化创建表单
          this.formCreate = {
            name: "",
            brief: "",
            vector: "faiss",
            embed: "ernie-tiny",
          };
        } else {
          // console.log("error submit!!");
          return false;
        }
      });
    },

    handleSend(options) {
      this.handleReceive(options);
    },

    // 下载选中文档
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
      if (val == "新建知识库") {
        this.isCreate = true;
      } else {
        // console.log(val);
        // 查找第一个出现(索引
        var index = val.indexOf("(");
        // 截取字符串
        var result = val.slice(0, index);
        this.nameKB = result;
        this.formSelect.textarea = `关于 ${this.nameKB} 的简介`;
        this.isCreate = false;
      }
    },

    handleUpload(file) {
      console.log(file);
      console.log(this.fileList);
    },

    handleRemove(file, fileList) {
      this.fileList = fileList;
      if (this.fileList.length == 0) {
        this.isUpload = true;
      } else {
        this.isUpload = false;
      }
    },

    handleError(err, file, fileList) {
      this.$message.error("上传失败！");
    },

    handleSuccess(response, file, fileList) {
      if (response.data.error == 0) {
        file.response = response.data.data;
        this.fileList.push(file);
        if (this.fileList.length == 0) {
          this.isUpload = true;
        } else {
          this.isUpload = false;
        }
      } else {
        this.$message.error(response.data.message); //文件上传错误提示
      }
    },

    handleAdd() {
      this.tableData = this.tableData.concat(this.fileList);
      if (this.tableData.length == 0) {
        this.nameTable = "知识库暂时没有文件";
      } else {
        this.nameTable = "知识库中包含源文件和向量库，请从下表中选择文件后操作";
      }
      this.fileList = [];
      this.isUpload = true;
    },

    handleSelectionChange(val) {
      // console.log(val);
      this.selectedArray = val;
      if (val.length > 0) {
        this.isSelected = false;
      } else {
        this.isSelected = true;
      }
    },

    handleTableClick(column) {
      console.log(column);
    },

    handleSortChange(column) {
      this.$forceUpdate();
      // console.log(column);
    },

    handleDelete() {
      var res = this.tableData.filter((item) => {
        return !this.selectedArray.includes(item);
      });
      this.tableData = res;
      if (this.tableData.length == 0) {
        this.nameTable = "知识库暂时没有文件";
      } else {
        this.nameTable = "知识库中包含源文件和向量库，请从下表中选择文件后操作";
      }
    },

    handleRestart() {
      this.isLoading = true; // 点击按钮后显示提示信息

      setTimeout(() => {
        this.isLoading = false; // 5秒后隐藏提示信息
      }, 5000);
    },

    handleDeleteKB() {
      // console.log(this.formKB.knowledge);
      let res = this.createOptions.filter((item) => {
        return item.value != this.formKB.knowledge;
      });

      this.createOptions = res;

      if (this.createOptions.length == 1) {
        this.formKB.knowledge = this.createOptions[0].value;
        this.isCreate = true;
      } else {
        this.formKB.knowledge = this.createOptions[0].value;
        // 查找第一个出现(索引
        var index = this.formKB.knowledge.indexOf("(");
        // 截取字符串
        var result = this.formKB.knowledge.slice(0, index);
        this.nameKB = result;
        this.formSelect.textarea = `关于 ${this.nameKB} 的简介`;
      }

      console.log(res);
    },
  },
};
</script>
<style lang="scss" scoped>
.knowledge-base {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
  overflow-x: auto;
  .form-create {
    width: 70%;
    border: 1px solid #ebeef5;
    border-radius: 10px;
    padding: 15px 20px 0px;
  }
  ::v-deep .el-form-item__content {
    font-size: 16px;
  }
}
.collapse-doc {
  border: 1px solid #e6ebf5;
  border-radius: 10px;
  padding: 10px;
  ::v-deep .el-collapse-item__header {
    font-size: 18px;
  }
  ::v-deep .el-collapse-item__content {
    padding-bottom: 0px;
  }
}
// .el-input-number--medium {
//   width: 95%;
//   line-height: 34px;
// }
::v-deep .el-upload-dragger {
  display: flex;
  align-items: center;
  width: 615px;
  height: 100%;
}
.tag-name {
  height: 55px;
  line-height: 55px;
  width: 100%;
  font-size: 16px;
}
</style>
