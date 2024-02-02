import request from '@/utils/request'

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
export function updateKbFile(data) {
  return request({
    url: '/knowledge_base/update_docs',
    method: 'post',
    data
  })
}

// 上传文件到知识库，并/或 进行向量化
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

// 根据content中文档重建向量库，流式输出处理进度。
export function recreateVectorStore(data) {
  return request({
    url: '/knowledge_base/recreate_vector_store',
    method: 'post',
    data
  })
}
