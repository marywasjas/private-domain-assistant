import request from '@/utils/request'

// 列出当前已加载模型
/*
{
  "controller_address": "http://127.0.0.1:20001", // Fastchat controller服务器地址
  "placeholder": "string"
}
*/
export function listRunningModels(data) {
  return request({
    url: '/llm_model/list_running_models',
    method: 'post',
    data
  })
}

// 列出configs已配置的模型
export function listConfigModels(data) {
  return request({
    url: '/llm_model/list_config_models',
    method: 'post',
    data
  })
}

//  获取模型配置（合并后）
/*
{
  "model_name": "gpt2-xl",  模型名称
  "placeholder": "string"
}
*/
export function getModeConfig(data) {
  return request({
    url: '/llm_model/get_model_config',
    method: 'post',
    data
  })
}

// 停止指定的LLM模型（Model Worker)
export function stopMode(data) {
  return request({
    url: '/llm_model/stop',
    method: 'post',
    data
  })
}

// 切换指定的LLM模型
export function changeMode(data) {
  return request({
    url: '/llm_model/change',
    method: 'post',
    data
  })
}

// 与llm模型对话(直接与fastchat api对话)
export function llmModeFast(data) {
  return request({
    url: '/chat/fastchat',
    method: 'post',
    data
  })
}

// 与llm模型对话(通过LLMChain)
export function llmModeChain(data) {
  return request({
    url: '/chat/chat',
    method: 'post',
    data
  })
}
