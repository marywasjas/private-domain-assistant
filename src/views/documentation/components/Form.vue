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
    <!-- v-if="!isCreate && createOptions.length > 1" -->
    <el-form
      :key="2"
      ref="formSelect"
      :model="formSelect"
      style="width: 70%"
      v-if="!isCreate && createOptions.length > 1"
    >
      <el-form-item>
        <div style="font-size: 18px">上传知识文件：</div>
        <el-upload
          ref="upload"
          drag
          :show-file-list="true"
          :auto-upload="true"
          :limit="1"
          :file-list="fileList"
          :headers="headers"
          action="#"
          :before-upload="handleBeforeUpload"
          :http-request="httpRequest"
          :on-remove="handleRemove"
          :on-exceed="handleExceed"
        >
          <i class="el-icon-upload" style="margin: 0 20px"></i>
          <div style="text-align: left; width: auto">
            <strong>Drag and drop files here</strong><br />
            <div style="font-size: 16px">
              Limit 200MB per file·
              HTML,MD,JSON,CSV,PDF,PNG,JPG,JPEG,BMP,EML,MSG,RST,RTF,
              TXT,XML,DOCX,EPUB,ODT,PPT,PPTX,TSV,HTM
            </div>
          </div>
          <!-- <div style="">
          <el-button style="margin: 0 20px" type="text" @click="confirmUpload">
            Browse flies
          </el-button>
        </div> -->
        </el-upload>
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

      <el-button :disabled="isUpload" @click="confirmUpload">
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
        <el-table-column type="selection" width="40"> </el-table-column>
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
          <!-- <el-button :disabled="isSelected">重新添加至向量库</el-button> -->
          <el-button @click="handleVS('add')" :disabled="isSelected"
            >添加至向量库</el-button
          >
          <el-button @click="handleVS('delete')" :disabled="isSelected"
            >从向量库删除</el-button
          >
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
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { getServerConfig } from "@/api/server";

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
  recreateVectorStore, // 根据content中文档重建向量库，流式输出处理进度
} from "@/api/knowledge";

export default {
  props: ["customStyle"],
  data() {
    return {
      headers: {
        ["Content-Type"]: "multipart/form-data",
      },
      activeNames: "1",
      nameKB: "",
      nameTable: "",
      formKB: {},
      createOptions: [],
      isCreate: false, // 默认是非创建页面
      formCreate: {
        knowledge_base_name: "",
        brief: "",
        vector_store_type: "",
        embed_model: "",
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
        maxlength: "",
        overlength: "",
        checked: false,
      },

      tableData: [],

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

      isUpload: true,

      isSelected: true,

      selectedArray: "",
    };
  },
  created() {
    console.log(
      "知识库表单created-------------------------------------------------------------------------------"
    );

    // 获取知识库列表
    this.getList();

    // 获取服务器原始配置信息
    getServerConfig()
      .then((res) => {
        this.formSelect.maxlength = res["CHUNK_SIZE"];
        this.formSelect.overlength = res["OVERLAP_SIZE"];
        this.formSelect.checked = res["ZH_TITLE_ENHANCE"];
        this.formCreate.vector_store_type = res["DEFAULT_VS_TYPE"];
        this.formCreate.embed_model = res["EMBEDDING_MODEL"];
      })
      .catch(() => {});
  },

  methods: {
    // 获取知识库列表
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
            this.formSelect.textarea = `关于 ${this.nameKB} 的简介`;
            this.handleFileList(this.createOptions[0].value);

            // console.log(this.createOptions);
          } else {
            this.isCreate = true;
          }
        })
        .catch(() => {});
    },

    // 新建知识库
    handleCreate() {
      this.$refs["formCreate"].validate((valid) => {
        if (valid) {
          delete this.formCreate.brief;
          createKb(this.formCreate).then((res) => {
            this.$message.success("创建知识库成功");
            this.getList();
            this.isCreate = false;
            this.formCreate = {
              knowledge_base_name: "",
              brief: "",
              vector_store_type: "faiss",
              embed_model: "m3e-base",
            };
          });
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
      updateKbInfo({
        knowledge_base_name: this.formKB.knowledge,
        kb_info: evt.target.value,
      })
        .then((res) => {
          this.$message.success("更新知识库介绍");
        })
        .catch(() => {});
    },

    // 选择或新建知识库
    handleSelectOrCreate(val) {
      if (val == "新建知识库") {
        this.isCreate = true;
      } else {
        this.handleFileList(val);
        this.formKB.knowledge = val;
        this.nameKB = val;
        this.formSelect.textarea = `关于 ${this.nameKB} 的简介`;
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

    // 删除知识库文件
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
          this.$message.success("删除知识库文件成功");
        })
        .catch(() => {});
    },

    handleDeleteKB() {
      deleteKb(JSON.stringify(this.formKB.knowledge))
        .then((res) => {
          this.getList();
          this.$message.success("删除知识库成功");
        })
        .catch(() => {});
    },

    // 下载选中文档
    handleLoad(fileName, fileContent) {
      if (this.selectedArray.length > 1) {
        this.$message.warning("请选择一个下载文档");
      } else {
        let url = `http://192.168.61.108:7861/knowledge_base/download_doc?knowledge_base_name=${
          this.formKB.knowledge
        }&file_name=${this.selectedArray[0].name}&preview=${false}`;

        window.open(url);
      }
    },

    // 自定义上传方法
    httpRequest(obj) {
      let name = this.fileList[0].name;
      this.fileList = [];
      this.fileList.push({ ...obj, name });
    },

    handleBeforeUpload(file) {
      this.fileList.push(file);
      this.isUpload = false;
      const isLt200M = file.size / 1024 / 1024 < 200;
      if (!isLt200M) {
        this.$message.error("文件大小超过200MB限制");
        return false;
      }
    },

    // 添加文件到知识库
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

      const params = new FormData();

      this.fileList.forEach((item) => {
        params.append("files", item.file);
      });
      console.log(this.fileList);

      params.append("knowledge_base_name", this.formKB.knowledge);
      params.append("override", false);
      params.append("to_vector_store", false);
      params.append("chunk_size", this.formSelect.maxlength);
      params.append("chunk_overlap", this.formSelect.overlength);
      params.append("zh_title_enhance", this.formSelect.checked);
      params.append("docs", doc);
      params.append("not_refresh_vs_cache", false);

      uploadKbFile(params)
        .then((res) => {
          this.$message.success("上传成功");
          this.isUpload = true;
          this.fileList = [];
        })
        .catch(() => {
          this.$message.error("上传失败");
          this.isUpload = true;
        });
    },

    handleExceed() {
      this.$message({ type: "error", message: "最多支持1个附件上传" });
    },

    handleRemove(file, fileList) {
      this.fileList = [];
      this.isUpload = true;
    },

    handleRestart() {
      this.getProgress();
    },

    async getProgress() {
      this.isLoading = true;
      const controller = new AbortController();
      const signal = controller.signal;

      let response = await fetchEventSource(
        "http://192.168.61.108:7861/knowledge_base/recreate_vector_store",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          openWhenHidden: true,
          signal: signal,
          body: JSON.stringify({
            knowledge_base_name: this.formKB.knowledge,
            allow_empty_kb: true,
            vs_type: "faiss",
            embed_model: "m3e-base",
            chunk_size: this.formSelect.maxlength,
            chunk_overlap: this.formSelect.overlength,
            zh_title_enhance: this.formSelect.checked,
            not_refresh_vs_cache: false,
          }),

          onopen: async (response) => {
            const encode = new TextDecoder("utf-8");

            const reader = response.body.getReader();

            while (true) {
              console.log(this);
              const { done, value } = await reader.read();
              console.log("是否已经读完所有内容：", done);
              if (done) {
                this.isLoading = false;
                controller.abort();
                break;
              }
              const text = encode.decode(value);
              console.log("内容：", text);
            }
            this.isLoading = false;
          },

          onmessage(event) {
            console.log(event);
          },

          onerror(event) {
            console.log("服务异常", event);
          },

          onclose() {
            console.log("服务关闭");
          },
        }
      );
    },

    // 向量库删除和添加
    handleVS(type) {
      var flag;
      if (type == "add") {
        flag = false;
      } else {
        flag = true;
      }
      var doc = JSON.stringify({
        "test.txt": [
          {
            page_content: "custom doc",
            metadata: {},
            type: "Document",
          },
        ],
      });
      let files = this.selectedArray.map((item) => {
        return item.name;
      });
      updateKbFile({
        file_names: files,
        knowledge_base_name: this.formKB.knowledge,
        chunk_size: this.formSelect.maxlength,
        chunk_overlap: this.formSelect.overlength,
        zh_title_enhance: this.formSelect.checked,
        override_custom_docs: false,
        docs: doc,
        not_refresh_vs_cache: flag,
      })
        .then((res) => {
          this.$message.success("操作成功");
        })
        .catch(() => {});
    },

    handleTableClick(column) {
      console.log(column);
    },

    handleSortChange(column) {
      this.$forceUpdate();
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
