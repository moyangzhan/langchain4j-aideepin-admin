import { h } from 'vue'
import { NAvatar } from 'naive-ui'
import { BasicColumn } from '@/components/Table'
export interface UserData {
  id: string
  uuid: string
  name: string
  email: string
  avatar: string
  userStatus: string
  activeTime: string
  createTime: string
  updateTime: string
  isAdmin: boolean
}
export const columns: BasicColumn<UserData>[] = [
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
    key: 'name',
    width: 100,
  },
  {
    title: '邮箱',
    key: 'email',
    width: 150,
  },
  {
    title: '头像',
    key: 'avatar',
    width: 70,
    render(row) {
      return h(NAvatar, {
        size: 48,
        src: `/api/user/avatar/${row.uuid}`,
      })
    },
  },
  {
    title: '状态',
    key: 'userStatus',
    width: 100,
    render(row) {
      if(row.userStatus === 'NORMAL'){
        return '正常'
      }else if(row.userStatus === 'WAIT_CONFIRM'){
        return '待激活'
      }
      return '已禁用'
    },
  },
  {
    title: '激活时间',
    key: 'activeTime',
    width: 180,
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
    title: '管理员',
    key: 'isAmdin',
    width: 100,
    render(row) {
      return row.isAdmin ? '是' : '否'
    },
  },
]
