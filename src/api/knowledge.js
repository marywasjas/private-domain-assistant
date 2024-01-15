import request from '@/utils/request'
// import axios from "axios"

// 获取知识库列表
export function getKbList(params) {
  return request({
    url: '/knowledge_base/list_knowledge_bases',
    method: 'get'
  })
}

// 创建知识库
export function createKb(data) {
  return request({
    url: '/knowledge_base/create_knowledge_base',
    method: 'post',
    data
  })
}

// 删除知识库
export function deleteKb(data) {
  return request({
    url: '/knowledge_base/delete_knowledge_base',
    method: 'post',
    data
  })
}

// 获取知识库的文件列表
export function getKbFileList(params) {
  return request({
    url: '/knowledge_base/list_files',
    method: 'get',
    params: {
      knowledge_base_name: params['knowledge_base_name']
    }
  })
}

// 搜索知识库
/* {
  "query": "chat",
  "knowledge_base_name": "eat",
  "top_k": 3,
  "score_threshold": 1
} */
export function searchKb(data) {
  return request({
    url: '/knowledge_base/search_docs',
    method: 'post',
    data
  })
}

// 删除知识库指定文件
export function deleteKbFile(data) {
  return request({
    url: '/knowledge_base/delete_docs',
    method: 'post',
    data
  })
}

// 更新知识库介绍
export function updateKbInfo(data) {
  return request({
    url: '/knowledge_base/update_info',
    method: 'post',
    data
  })
}

// 更新现有文件到数据库
/*
{
  "knowledge_base_name": "samples",
  "file_names": [
    "file_name1",
    "text.txt"
  ],
  "chunk_size": 250,   单段文本最大长度
  "chunk_overlap": 50,  相邻文本重合长度
  "zh_title_enhance": false, 中文标题增强
  "override_custom_docs": false, 是否覆盖之前自定义的docs
  "docs": {  自定义的docs，需要转为json字符串
    "test.txt": [
      {
        "page_content": "custom doc",
        "metadata": {},
        "type": "Document"
      }
    ]
  },
  "not_refresh_vs_cache": false 是否加入向量库
}
*/
export function updateKbFile(data) {
  return request({
    url: '/knowledge_base/update_docs',
    method: 'post',
    data
  })
}

// 上传文件到知识库，并/或 进行向量化
/*
{
    files *array类型。上传文件，支持多文件
    knowledge_base_name *string类型。知识库名称
    override   boolean类型。是否覆盖已有文件
    to_vector_store    boolean类型。上传文件后是否进行向量化
    chunk_size   integer类型。知识库中单段文本最大长度
    chunk_overlap    integer类型。知识库中相邻文本重合长度
    zh_title_enhance   boolean类型。是否开启中文标题加强
    docs   string($json-string)。自定义的docs，需要转为json字符串
    not_refresh_vs_cache   boolean类型。暂不保存向量库（用于FAISS）
}
*/
export function uploadKbFile(data) {
  return request({
    url: '/knowledge_base/upload_docs',
    method: 'post',
    data
  })
}

// 下载对应的知识文件
export function downloadFile(params) {
  return request({
    url: '/knowledge_base/download_doc',
    method: 'get',
    params
  })
}

