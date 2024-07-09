import { BasicColumn } from '@/components/Table'
import {modelType, modelPlatform} from '@/utils/constants'
export interface AiModelData {
  id: string
  type: string
  name: string
  platform: string
  remark: string
  createTime: string
  updateTime: string
  isEnable: boolean
  setting: string
}
export const columns: BasicColumn<AiModelData>[] = [
  {
    title: 'id',
    key: 'id',
    width: 50,
  },
  {
    title: '名称',
    key: 'name',
    width: 150,
  },
  {
    title: '类型',
    key: 'type',
    width: 80,
    render(row) {
      return modelType.find(item => item.value === row.type)?.label
    },
  },
  {
    title: '平台',
    key: 'platform',
    width: 80,
    render(row){
      return modelPlatform.find(item => item.value === row.platform)?.label
    }
  },
  {
    title: '是否启用',
    key: 'isEnable',
    width: 80,
    render(row) {
      return row.isEnable ? '启用' : '禁用'
    },
  },
  {
    title: '上下文长度',
    key: 'contextWindow',
    width: 100,
  },
  {
    title: '配置',
    key: 'setting',
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 150,
  },
  {
    title: '更新时间',
    key: 'updateTime',
    width: 150,
  },
]
