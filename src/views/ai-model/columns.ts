import { BasicColumn } from '@/components/Table'
import {MODEL_TYPES, DEFAULT_MODEL_PLATFORMS} from '@/utils/constants'
import { AiModelData } from '/#/aiModel'

export const allPlatforms = [...DEFAULT_MODEL_PLATFORMS]
export const columns: BasicColumn<AiModelData>[] = [
  {
    title: 'id',
    key: 'id',
    width: 50,
  },
  {
    title: '名称',
    key: 'name',
    width: 180,
  },
  {
    title: '标题',
    key: 'title',
    width: 180,
  },
  {
    title: '类型',
    key: 'type',
    width: 80,
    render(row) {
      return MODEL_TYPES.find(item => item.value === row.type)?.label
    },
  },
  {
    title: '平台',
    key: 'platform',
    width: 120,
    render(row){
      return allPlatforms.find(item => item.value === row.platform)?.label
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
    title: '是否免费',
    key: 'isFree',
    width: 80,
    render(row) {
      return row.isFree ? '是' : '否'
    },
  },
  {
    title: '上下文长度',
    key: 'contextWindow',
    width: 100,
  },
  {
    title: '最大输入token数',
    key: 'maxInputTokens',
    width: 140,
  },
  {
    title: '最大输出token数',
    key: 'maxOutputTokens',
    width: 140,
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
