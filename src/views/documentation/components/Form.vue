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
      <el-form-item prop="knowledge_base_name">
        <div>新建知识库名称</div>
        <el-input
          v-model="formCreate['knowledge_base_name']"
          placeholder="新知识库名称"
        />
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
            <el-select
              v-model="formCreate['vector_store_type']"
              style="width: 100%"
            >
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
            <el-select v-model="formCreate['embed_model']" style="width: 100%">
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
          ref="upload"
          drag
          show-file-list
          action="#"
          :file-list="fileList"
          :auto-upload="true"
          :before-upload="handleBeforeUpload"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :on-error="handleError"
          :on-exceed="handleExceed"
          :headers="headers"
          :http-request="httpRequest"
          :limit="1"
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
        </el-upload>
        <div style="">
          <el-button style="margin: 0 20px" type="text" @click="confirmUpload">
            Browse flies
          </el-button>
        </div>
      </el-form-item>

      <el-form-item>
        <div style="font-size: 18px">请输入知识库介绍：</div>
        <el-input
          type="textarea"
          :rows="5"
          v-model="formSelect.textarea"
          @blur="handleUpdateInfo"
        />
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
import {
  getKbList, // 获取知识库列表
  createKb, // 创建知识库
  updateKbInfo, // 更新知识库介绍
  deleteKb, // 删除知识库
  getKbFileList, // 获取知识库的文件列表
  deleteKbFile, // 删除知识库指定文件
  uploadKbFile, // 上传文件到知识库，并/或 进行向量化
  updateKbFile, // 更新现有文件到数据库
  downloadFile, // 下载对应的知识文件
  searchKb, // 搜索知识库
} from "@/api/knowledge";

export default {
  props: ["customStyle", "handleReceive"],
  data() {
    return {
      headers: {
        ["Content-Type"]: "multipart/form-data",
      },
      activeNames: "1",
      nameKB: "",
      nameTable: "",
      formKB: {},
      createOptions: [
        {
          label: "samples",
          value: "samples",
        },
        {
          label: "新建知识库",
          value: "新建知识库",
        },
      ],
      isCreate: false, // 默认是非创建页面
      formCreate: {
        knowledge_base_name: "",
        brief: "",
        vector_store_type: "faiss",
        embed_model: "ernie-tiny",
      },
      rulesCreate: {
        knowledge_base_name: [
          { required: true, message: "知识库名称不能为空", trigger: "blur" },
        ],
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

      formSelect: {
        textarea: "",
        maxlength: 250,
        overlength: 250,
        checked: false,
      },

      tableData: [
        // {
        //   name: "text.txt",
        //   loader: "UnstructuredFileLoader",
        //   tokenizer: "ChineseRecursiveTextSpliter",
        //   num: "42",
        //   source: "success",
        //   vector: "success",
        // },
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

      fileList: [],

      fileContent: `ChatGPT`,

      isLoading: false,

      isUpload: false,

      isSelected: true,

      selectedArray: "",
    };
  },

  watch: {},

  created() {
    console.log("CREATE");
    // 获取知识库列表
    this.getList();

    if (this.fileList.length == 0) {
      this.isUpload = true;
    } else {
      this.isUpload = false;
    }
  },

  methods: {
    handleSend(options) {
      this.handleReceive(options);
    },

    getList() {
      getKbList()
        .then((res) => {
          res.push("新建知识库");
          this.createOptions = res.map((item) => {
            return { label: item, value: item };
          });

          if (this.createOptions.length > 1) {
            this.isCreate = false;
            this.formKB.knowledge = this.createOptions[0].value;
            this.nameKB = this.createOptions[0].value;
            this.handleFileList(this.createOptions[0].value);
            this.formSelect.textarea = `关于 ${this.nameKB} 的简介`;
            // 查找第一个出现(索引
            // var index = this.formKB.knowledge.indexOf("(");
            // 截取字符串
            // var result = this.formKB.knowledge.slice(0, index);
          } else {
            this.isCreate = true;
          }
        })
        .catch(() => {});
    },

    // 新建知识库
    handleCreate() {
      console.log(this.formCreate);
      this.$refs["formCreate"].validate((valid) => {
        if (valid) {
          createKb(this.formCreate)
            .then((res) => {
              this.getList();
              this.isCreate = false;
              // this.handleSend(knowOptions);

              // 初始化创建表单
              this.formCreate = {
                knowledge_base_name: "",
                brief: "",
                vector_store_type: "faiss",
                embed_model: "ernie-tiny",
              };
            })
            .catch(() => {});
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    // 获取知识库文件
    handleFileList(name) {
      getKbFileList({ knowledge_base_name: name })
        .then((res) => {
          this.tableData = res.map((item) => {
            return { name: item };
          });

          if (this.tableData.length == 0) {
            this.nameTable = "知识库暂时没有文件";
          } else {
            this.nameTable =
              "知识库中包含源文件和向量库，请从下表中选择文件后操作";
          }
        })
        .catch(() => {});
    },

    // 更新知识库介绍
    handleUpdateInfo(evt) {
      // console.log(evt.target.value);
      updateKbInfo({
        knowledge_base_name: this.formKB.knowledge,
        kb_info: evt.target.value,
      })
        .then((res) => {})
        .catch(() => {});
    },

    // 选择或新建知识库
    handleSelectOrCreate(val) {
      if (val == "新建知识库") {
        this.isCreate = true;
      } else {
        this.getList();
        this.isCreate = false;
      }
    },

    handleSelectionChange(val) {
      this.selectedArray = val;
      if (val.length > 0) {
        this.isSelected = false;
      } else {
        this.isSelected = true;
      }
    },

    handleDelete() {
      let files = this.selectedArray.map((item) => {
        return item.name;
      });

      deleteKbFile({
        knowledge_base_name: this.formKB.knowledge,
        file_names: files,
        delete_content: false, // 是否从知识库删除
        not_refresh_vs_cache: false, // 是否从向量库删除
      })
        .then((res) => {
          this.handleFileList(this.formKB.knowledge);
        })
        .catch(() => {});

      if (this.tableData.length == 0) {
        this.nameTable = "知识库暂时没有文件";
      } else {
        this.nameTable = "知识库中包含源文件和向量库，请从下表中选择文件后操作";
      }
    },

    handleDeleteKB() {
      deleteKb({ knowledge_base_name: this.formKB.knowledge })
        .then((res) => {
          this.getList();
        })
        .catch(() => {});
    },

    // 添加文件到知识库
    // handleAdd() {
    handleBeforeUpload() {
      
      let files = this.fileList.map((item) => {
        return item.name;
      });

      updateKbFile({
        file_names: files,
        knowledge_base_name: this.formKB.knowledge,
        chunk_size: this.formSelect.maxlength,
        chunk_overlap: this.formSelect.overlength,
        zh_title_enhance: this.formSelect.checked,
        override_custom_docs: false,
        docs: "{}",
        not_refresh_vs_cache: false,
      })
        .then(() => {})
        .catch(() => {});

      if (this.tableData.length == 0) {
        this.nameTable = "知识库暂时没有文件";
      } else {
        this.nameTable = "知识库中包含源文件和向量库，请从下表中选择文件后操作";
      }

      this.fileList = [];
      this.isUpload = true;
    },

    // 下载选中文档
    handleLoad(fileName, fileContent) {
      let url = `http://192.168.6.108:7861/knowledge_base/download_doc?knowledge_base_name=${
        this.formKB.knowledge
      }&file_name=${"record.txt"}&preview=${false}`;

      window.open(url);
      // downloadFile({
      //   knowledge_base_name: this.formKB.knowledge,
      //   file_name: "test.txt",
      //   preview: false,
      // })
      //   .then((res) => {
      //     console.log(res)
      //   })
      //   .catch((err) => {});

      // const element = document.createElement("a");
      // const file = new Blob([this.fileContent], {
      //   type: "text/plain;charset=utf-8",
      // });
      // element.href = URL.createObjectURL(file);
      // element.download = fileName;
      // element.style.display = "none";
      // document.body.appendChild(element);
      // element.click();
      // document.body.removeChild(element);
    },

    httpRequest(obj) {
      this.fileList.push(obj);
    },

    // 上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。
    handleBeforeUpload(file) {
      console.log("上传的文件", file);

      // var uploadFormData = new FormData();
      // uploadFormData.append("file", file);
      // uploadFormData.append("fileName", "file");
      // this.fileList.push(uploadFormData);
    },

    confirmUpload() {
      var doc = JSON.stringify({
        "test.txt": [
          {
            page_content: "custom doc",
            metadata: {},
            type: "Document",
          },
        ],
      });
      // 使用form表单的数据格式
      const params = new FormData();
      // 将上传文件数组依次添加到参数paramsData中
      this.fileList.forEach((item) => {
        params.append("files", item.file);
      });

      // 将输入表单数据添加到params表单中
      params.append("knowledge_base_name", this.formKB.knowledge);
      params.append("override", false);
      params.append("to_vector_store", false);
      params.append("chunk_size", this.formSelect.maxlength);
      params.append("chunk_overlap", this.formSelect.overlength);
      params.append("zh_title_enhance", this.formSelect.checked);
      params.append("docs", doc);
      params.append("not_refresh_vs_cache", false);

      console.log(params.file);

      uploadKbFile(params).then((res) => {});
    },

    handleExceed() {
      this.$message({ type: "error", message: "最多支持1个附件上传" });
    },

    //	文件列表移除文件时的钩子
    handleRemove(file, fileList) {
      // console.log(file);
      // console.log(fileList);
    },

    // 文件上传失败时的钩子
    handleError(err, file, fileList) {
      // this.$message.error("上传失败！");
    },

    // 文件上传成功时的钩子
    handleSuccess(response, file, fileList) {
      // console.log(response);
    },

    handleTableClick(column) {
      console.log(column);
    },

    handleSortChange(column) {
      this.$forceUpdate();
      // console.log(column);
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
  width: 700px;
  height: 100%;
}
.tag-name {
  height: 55px;
  line-height: 55px;
  width: 100%;
  font-size: 16px;
}
</style>
