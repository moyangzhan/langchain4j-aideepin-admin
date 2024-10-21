import { BasicColumn } from '@/components/Table'
import { ConversationPreset } from '/#/conversation'
export const columns: BasicColumn<ConversationPreset>[] = [
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
    title: '标题',
    key: 'title',
    width: 100,
  },
  {
    title: '描述',
    key: 'remark',
    width: 150,
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
