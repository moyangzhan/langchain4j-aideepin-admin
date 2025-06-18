import { BasicColumn } from '@/components/Table'
import { mcpInstallType, mcpTransportType } from '@/utils/constants'
import { McpInfo } from '/#/mcp'

export const columns: BasicColumn<McpInfo>[] = [
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
    title: '传输类型',
    key: 'transportType',
    width: 100,
    render(row) {
      return mcpTransportType.find((item) => item.value === row.transportType)?.label
    },
  },
  {
    title: '安装类型',
    key: 'installType',
    width: 100,
    render(row) {
      return mcpInstallType.find((item) => item.value === row.installType)?.label
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
