import { BasicColumn } from '@/components/Table'
export interface Data {
  id: string
  uuid: string
  title: string
  remark: string
  isPublic: boolean
  isEnable: boolean
  createTime: string
  updateTime: string
}
export const columns: BasicColumn<Data>[] = [
  {
    title: 'id',
    key: 'id',
    width: 50,
  },
  {
    title: '标题',
    key: 'title',
    width: 100,
  },
  {
    title: '备注',
    key: 'remark',
    width: 150,
  },
  {
    title: '是否公开',
    key: 'isPublic',
    width: 100,
    render(row) {
      return row.isPublic ? '是' : '否'
    },
  },
  {
    title: '是否启用',
    key: 'isEnable',
    width: 100,
    render(row) {
      return row.isEnable ? '是' : '否'
    },
  },
  {
    title: '创建用户',
    key: 'userName',
    width: 120,
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
