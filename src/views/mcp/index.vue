<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
    </BasicForm>

    <BasicTable :columns="columns" :request="loadDataTable" :row-key="(row: McpInfo) => row.id" ref="actionRef"
      :actionColumn="actionColumn" @update:checked-row-keys="onCheckedRow" :scroll-x="1400">
    </BasicTable>

    <n-modal v-model:show="showEditModal" :show-icon="false" preset="card" :title="editFormParams.label"
      class="max-w-[1000px]">
      <div class="h-[90%] max-h-[700px] overflow-y-auto">
        <n-form :model="editFormParams" :rules="newDataRules" ref="formRef" label-placement="top" :label-width="120"
          class="py-4">
          <n-form-item label="标题" path="title">
            <n-input placeholder="请输入标题" v-model:value="editFormParams.title" />
          </n-form-item>
          <n-form-item label="传输类型" path="transportType">
            <n-radio-group v-model:value="editFormParams.transportType" name="rg1">
              <n-radio v-for="opt in mcpTransportType" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </n-radio>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="安装类型" path="installType">
            <n-radio-group v-model:value="editFormParams.installType" name="rg2">
              <n-radio v-for="opt in mcpInstallType" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </n-radio>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="参数设置" path="presetParams">
            <n-table :single-line="false">
              <thead>
                <tr>
                  <th>参数名
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        <n-icon>
                          <QuestionCircleOutlined />
                        </n-icon>
                      </template>
                      <span>需要跟MCP Server中的参数名一致</span>
                    </n-tooltip>
                  </th>
                  <th>参数标题
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        <n-icon>
                          <QuestionCircleOutlined />
                        </n-icon>
                      </template>
                      <span>标题只是用来展示，更好理解参数意义</span>
                    </n-tooltip>
                  </th>
                  <th>值</th>
                  <th class="flex justify-center">
                    敏感信息
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        <n-icon>
                          <QuestionCircleOutlined />
                        </n-icon>
                      </template>
                      <span>敏感信息会进行加密存储</span>
                    </n-tooltip>
                  </th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(presetParam, idx) in editFormParams.presetParams" :key="'preset_' + idx">
                  <td class="max-w-[200px]">
                    <n-input v-model:value="presetParam.name" placeholder="需要跟MCP Server中的参数名一致" />
                  </td>
                  <td>
                    <n-input v-model:value="presetParam.title" placeholder="标题只是用来展示,如:高德地图的key" />
                  </td>
                  <td>
                    <n-input v-model:value="presetParam.value" class="flex-1" placeholder="MCP Server中的参数值" />
                  </td>
                  <td class="flex justify-center">
                    <n-switch v-model:value="presetParam.require_encrypt" />
                  </td>
                  <td>
                    <n-icon size="18" class="mx-2 cursor-pointer" @click="removePresetParam(idx)">
                      <DeleteOutlined />
                    </n-icon>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="flex">
                    <n-button type="primary" dashed @click="addPresetParam">
                      +新增参数
                    </n-button>
                  </td>
                </tr>
              </tfoot>
            </n-table>
          </n-form-item>
          <n-form-item label="参数定义（后续用户根据本定义填充实际的值）" path="customizedParamDefinitions">
            <n-table :single-line="false">
              <thead>
                <tr>
                  <th>参数名
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        <n-icon>
                          <QuestionCircleOutlined />
                        </n-icon>
                      </template>
                      <span>需要跟MCP Server中的参数名一致</span>
                    </n-tooltip>
                  </th>
                  <th>参数标题
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        <n-icon>
                          <QuestionCircleOutlined />
                        </n-icon>
                      </template>
                      <span>标题只是用来展示，更好理解参数意义</span>
                    </n-tooltip>
                  </th>
                  <th class="flex justify-center">
                    敏感信息
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        <n-icon>
                          <QuestionCircleOutlined />
                        </n-icon>
                      </template>
                      <span>敏感信息会进行加密存储</span>
                    </n-tooltip>
                  </th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(uninitParam, idx) in editFormParams.customizedParamDefinitions" :key="'definition_' + idx">
                  <td class="max-w-[200px]">
                    <n-input v-model:value="uninitParam.name" class="flex-1" placeholder="需要跟MCP Server中的参数名一致" />
                  </td>
                  <td>
                    <n-input v-model:value="uninitParam.title" class="flex-1" placeholder="标题只是用来展示,如:高德地图的key" />
                  </td>
                  <td class="flex justify-center">
                    <n-switch v-model:value="uninitParam.require_encrypt" />
                  </td>
                  <td>
                    <n-icon size="18" class="mx-2 cursor-pointer" @click="removeParamDefinition(idx)">
                      <DeleteOutlined />
                    </n-icon>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="flex">
                    <n-button type="primary" dashed @click="addParamDefinition">
                      +新增参数定义
                    </n-button>
                  </td>
                </tr>
              </tfoot>
            </n-table>
          </n-form-item>
          <n-form-item label="描述" path="remark">
            <n-input type="textarea" :autosize="{ minRows: 3, maxRows: 15 }" placeholder="请输入描述"
              v-model:value="editFormParams.remark" />
          </n-form-item>
          <n-form-item label="是否启用" path="isEnable">
            <n-switch v-model:value="editFormParams.isEnable" />
          </n-form-item>
        </n-form>
      </div>
      <template #action>
        <div class="flex justify-end space-x-2">
          <n-button @click="() => (showEditModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmEditForm">确定</n-button>
        </div>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
import { h, reactive, ref } from 'vue'
import { BasicTable, TableAction } from '@/components/Table'
import { BasicForm, FormSchema, useForm } from '@/components/Form/index'
import { QuestionCircleOutlined, DeleteOutlined } from '@vicons/antd'
import mcpApi from '@/api/mcp'
import { columns } from './columns'
import { McpInfo, McpSearchReq, McpCustomizedParamDefinition, PresetParam } from '/#/mcp'
import { mcpTransportType, mcpInstallType } from '@/utils/constants'
import type { FormRules } from 'naive-ui'
import { useDialog } from 'naive-ui'

const newDataRules: FormRules = {
  title: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入标题',
  },
}

const schemas: FormSchema[] = [
  {
    field: 'title',
    component: 'NInput',
    label: '标题',
    componentProps: {
      placeholder: '请输入标题',
      onInput: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'transportType',
    component: 'NSelect',
    label: '传输类型',
    componentProps: {
      options: mcpTransportType,
      onUpdateValue: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'installType',
    component: 'NSelect',
    label: '安装类型',
    componentProps: {
      options: mcpInstallType,
      onUpdateValue: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'isEnable',
    component: 'NSelect',
    label: '是否启用',
    componentProps: {
      options: [
        {
          label: '是',
          value: true,
        },
        {
          label: '否',
          value: false,
        },
      ],
      onUpdateValue: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'createTime',
    component: 'NDatePicker',
    label: '创建时间',
    componentProps: {
      type: 'datetimerange',
      clearable: true
    },
  },
  {
    field: 'updateTime',
    component: 'NDatePicker',
    label: '更新时间',
    componentProps: {
      type: 'datetimerange',
      clearable: true,
    },
  },
]

const formRef: any = ref(null)
const actionRef = ref()
const dialog = useDialog()
const showEditModal = ref(false)
const formBtnLoading = ref(false)
const editFormParams = reactive({
  label: '编辑',
  uuid: '',
  title: '',
  transportType: 'sse',
  installType: 'remote',
  remark: '',
  isEnable: false,
  sseUrl: '',
  sseTimeout: 30,
  stdioCommand: '',
  stdioArg: '',
  presetParams: [] as PresetParam[],
  customizedParamDefinitions: [] as McpCustomizedParamDefinition[],
  repoUrl: '',
})

const actionColumn = reactive({
  width: 200,
  title: '操作',
  key: 'action',
  fixed: 'right',
  render(record) {
    return h(TableAction as any, {
      style: 'button',
      actions: [
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
        },
        {
          label: '禁用',
          onClick: handleDisable.bind(null, record),
          ifShow: () => {
            return record.isEnable
          },
        },
        {
          label: '启用',
          onClick: handleEnable.bind(null, record),
          ifShow: () => {
            return !record.isEnable
          },
        },
      ],
      dropDownActions: [
        {
          label: '删除',
          key: 'delete',
        },
      ],
      select: (key) => {
        if (key === 'delete') {
          dialog.warning({
            title: '提示',
            content: `删除后数据无法恢复，确定要删除 ${record.title} 吗?`,
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: () => {
              handleDel(record)
            },
            onNegativeClick: () => {
              console.log('已取消')
            },
          })
        }
      },
    })
  },
})

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
  labelWidth: 120,
  schemas,
})

const loadDataTable = async (res) => {
  const resp = await mcpApi.mcpSearch({ ...getFieldsValue() } as McpSearchReq, res)
  return resp.data
}

function onCheckedRow(rowKeys) {
  console.log(rowKeys)
}

function reloadTable() {
  actionRef.value.reload()
}

function confirmEditForm(e) {
  e.preventDefault()
  formBtnLoading.value = true
  formRef.value.validate(async (errors) => {
    if (!errors) {
      await mcpApi.mcpEdit(editFormParams)
      window['$message'].success(`${editFormParams.label}成功`)
      setTimeout(() => {
        showEditModal.value = false
        reloadTable()
      })
    } else {
      window['$message'].error('请填写完整信息')
    }
    formBtnLoading.value = false
  })
}

function handleEdit(record: Recordable) {
  showEditModal.value = true
  Object.assign(editFormParams, record)
  editFormParams.label = '编辑'
}

async function handleEnable(record: Recordable) {
  await mcpApi.mcpSetEnable({ uuid: record.uuid, isEnable: true })
  window['$message'].success('操作成功')
  reloadTable()
}

async function handleDisable(record: Recordable) {
  await mcpApi.mcpSetEnable({ uuid: record.uuid, isEnable: false })
  window['$message'].success('操作成功')
  reloadTable()
}

function handleSubmit(values: Recordable) {
  console.log(values)
  reloadTable()
}

function handleReset(values: Recordable) {
  console.log(values)
}

async function handleDel(record: Recordable) {
  let { success } = await mcpApi.mcpDel(record.uuid)
  if (success) {
    window['$message'].success('操作成功')
    reloadTable()
  }
}

function addParamDefinition() {
  editFormParams.customizedParamDefinitions.push({
    name: '',
    title: '',
    require_encrypt: false,
  }
  )
}

function removeParamDefinition(idx: number) {
  editFormParams.customizedParamDefinitions.splice(idx, 1)
}

function addPresetParam() {
  editFormParams.presetParams.push({
    name: '',
    title: '',
    value: '',
    require_encrypt: false,
    encrypted: false,
  })
}

function removePresetParam(idx: number) {
  editFormParams.presetParams.splice(idx, 1)
}

</script>
<style lang="less" scoped>
::v-deep(.n-form-item-label__text) {
  font-weight: bold;
  border-left: 3px solid gray;
  padding-left: 0.2rem;
}
</style>