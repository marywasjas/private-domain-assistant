import request from '@/utils/request'

// 获取服务器原始配置信息
export function getServerConfig(data) {
  return request({
    url: '/server/configs',
    method: 'post',
    data
  })
}

// 获取服务器支持的搜索引擎
export function getServerSeo(data) {
  return request({
    url: '/server/list_search_engines',
    method: 'post',
    data
  })
}
