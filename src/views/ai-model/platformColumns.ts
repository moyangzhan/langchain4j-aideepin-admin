import { BasicColumn } from '@/components/Table'

export interface AiPlatformData {
  id: string
  name: string
  title: string
  baseUrl: string
  apiKey: string
  secretKey: string
  isProxyEnable: boolean
  isOpenaiApiCompatible: boolean
  createTime: string
  updateTime: string
}
export const columns: BasicColumn<AiPlatformData>[] = [
  {
    title: '名称',
    key: 'name',
    width: 120,
  },
  {
    title: '标题',
    key: 'title',
  },
  {
    title: '接口地址(base_url)',
    key: 'baseUrl',
  },
  {
    title: 'Api key',
    key: 'apiKey',
  },
  {
    title: 'Secret key',
    key: 'secretKey',
  },
  {
    title: '启用代理',
    key: 'isProxyEnable',
    render(row) {
      return row.isProxyEnable ? '启用' : '禁用'
    },
  },
  {
    title: '兼容OpenAI Api格式',
    key: 'isOpenaiApiCompatible',
    render(row) {
      return row.isOpenaiApiCompatible ? '是' : '否'
    },
  },
]
