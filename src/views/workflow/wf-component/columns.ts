import { BasicColumn } from '@/components/Table'
export interface ComponentData {
  id: string
  uuid: string
  name: string
  title: string
  remark: string
  createTime: string
  updateTime: string
  isEnable: boolean
}
export const columns: BasicColumn<ComponentData>[] = [
  {
    title: 'id',
    key: 'id',
    width: 50,
  },
  {
    title: '名称',
    key: 'name',
    width: 130,
  },
  {
    title: '标题',
    key: 'title',
    width: 100,
  },
  {
    title: '描述',
    key: 'remark',
    width: 260,
  },
  {
    title: '排列顺序',
    key: 'displayOrder',
    width: 80,
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
  {
    title: '是否启用',
    key: 'isEnable',
    width: 100,
    render(row) {
      return row.isEnable ? '是' : '否'
    },
  },
]
