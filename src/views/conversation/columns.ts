import { BasicColumn } from '@/components/Table'
import { Conversation } from '/#/conversation'
export const columns: BasicColumn<Conversation>[] = [
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
    width: 150,
  },
  {
    title: '角色描述',
    key: 'aiSystemMessage',
    width: 200,
  },
  {
    title: '消耗的总token',
    key: 'tokens',
    width: 150,
  },
  {
    title: '开启上下文',
    key: 'understandContextEnable',
    width: 100,
    render(row) {
      return row.understandContextEnable ? '是' : '否'
    },
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
