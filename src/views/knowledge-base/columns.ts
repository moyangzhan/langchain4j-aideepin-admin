import { BasicColumn } from '@/components/Table'

export interface KbInfoData {
  id: string
  uuid: string
  title: string
  remark: string
  ownerUuid: string
  ownerName: string
  isPublic: boolean
  starCount: number
  itemCount: number
  embeddingCount: number
  createTime: string
  updateTime: string
}
export const columns: BasicColumn<KbInfoData>[] = [
  {
    title: 'id',
    key: 'id',
    width: 50,
  },
  {
    title: 'uuid',
    key: 'uuid',
    width: 120,
  },
  {
    title: '名称',
    key: 'title',
    width: 150,
  },
  {
    title: '所属用户',
    key: 'ownerName',
    width: 150,
  },
  {
    title: '知识点',
    key: 'itemCount',
    width: 80,
  },
  {
    title: '向量数',
    key: 'embeddingCount',
    width: 80,
  },
  {
    title: '点赞数',
    key: 'starCount',
    width: 80,
  },
  {
    title: '是否公开',
    key: 'isPublic',
    width: 80,
    render(row) {
      return row.isPublic ? '是' : '否'
    },
  },
  {
    title: '重叠数量(文档切块时)',
    key: 'ingestMaxOverlap',
    width: 100,
  },
  {
    title: '模型(抽取图谱时使用)',
    key: 'ingestModelName',
    width: 160,
  },
  {
    title: '文档召回最大数量',
    key: 'retrieveMaxResults',
    width: 100,
  },
  {
    title: '文档召回最小分数',
    key: 'retrieveMinScore',
    width: 100,
  },
  {
    title: '响应时的创造性',
    key: 'queryLlmTemperature',
    width: 100,
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
  },
  {
    title: '更新时间',
    key: 'updateTime',
    width: 180,
  },

]
