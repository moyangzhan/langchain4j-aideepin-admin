import { BasicColumn } from '@/components/Table'
import { modelPlatform } from '@/utils/constants'
import { h, VNode } from 'vue'

export interface AiPlatformData {
  name: string
  value: string
}
export const columns: BasicColumn<AiPlatformData>[] = [
  {
    title: '名称',
    key: 'name',
    width: 120,
    render(row) {
      return modelPlatform.find(item => item.value + '_setting' === row.name)?.label
    },
  },
  {
    title: '配置',
    key: 'value',
    render(row) {
      const jsonVal = JSON.parse(row.value)
      let buttons: VNode[] = []
      for (let key in jsonVal) {
        const btn = h(
          'div',
          { class: '' },
          `${key}: ${jsonVal[key]}`,
        )
        buttons.push(btn)
      }

      return h('div', { class: 'flex items-left flex-col gap-2' }, {
        default: () => buttons,
      })
    },
  },
]
