<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
    </BasicForm>

    <BasicTable :columns="columns" :request="loadDataTable" :row-key="(row: AiModelData) => row.id" ref="actionRef"
      :actionColumn="actionColumn" @update:checked-row-keys="onCheckedRow" :scroll-x="1500">
      <template #tableTitle>
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新建
        </n-button>
      </template>

    </BasicTable>

    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" :title="editFormParams.label">
      <n-form :model="editFormParams" :rules="newRecordRules" ref="formRef" label-placement="left" :label-width="130"
        class="py-4">
        <n-form-item label="名称" path="name">
          <n-input placeholder="请输入模型名称" v-model:value="editFormParams.name" />
        </n-form-item>
        <n-form-item label="类型" path="type">
          <n-select placeholder="请输入模型的类型" :options="modelType" v-model:value="editFormParams.type" />
        </n-form-item>
        <n-form-item label="平台" path="platform">
          <n-select placeholder="请输入模型所属的平台" :options="modelPlatform" v-model:value="editFormParams.platform" />
        </n-form-item>
        <n-form-item label="上下文长度" path="contextWindow">
          <n-input-number placeholder="请输入上下文长度" v-model:value="editFormParams.contextWindow" />
        </n-form-item>
        <n-form-item label="最大输入token数" path="maxInputTokens">
          <n-input-number placeholder="请输入上下文长度" v-model:value="editFormParams.maxInputTokens" />
        </n-form-item>
        <n-form-item label="最大输出token数" path="maxOutputTokens">
          <n-input-number placeholder="请输出上下文长度" v-model:value="editFormParams.maxOutputTokens" />
        </n-form-item>
        <n-form-item label="个性化配置" path="setting">
          <n-input type="textarea" placeholder="个性化配置" v-model:value="editFormParams.setting" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="() => (showEditModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
import { h, reactive, ref } from 'vue'
import { BasicTable, TableAction } from '@/components/Table'
import { BasicForm, FormSchema, useForm } from '@/components/Form/index'
import api from '@/api/aiModel'
import { modelType, modelPlatform } from '@/utils/constants'
import { columns, AiModelData } from './columns'
import { PlusOutlined } from '@vicons/antd'
import { type FormRules } from 'naive-ui'
import { useDialog } from 'naive-ui'

const newRecordRules: FormRules = {
  name: {
    required: false,
    trigger: ['blur', 'input'],
    message: '请输入名称',
  },
  type: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入邮箱',
  },
  platform: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入平台',
  },
}

const schemas: FormSchema[] = [
{
    field: 'type',
    component: 'NSelect',
    label: '类型',
    componentProps: {
      placeholder: '请选择类型',
      options: modelType,
      onUpdateValue: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'platform',
    component: 'NSelect',
    label: '平台',
    componentProps: {
      placeholder: '请选择平台',
      options: modelPlatform,
      onUpdateValue: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'isEnable',
    component: 'NSelect',
    label: '状态',
    componentProps: {
      placeholder: '请选择状态',
      options: [
      {
        label: '可用',
        value: true,
      },
      {
        label: '停用',
        value: false,
      },
      ],
      onUpdateValue: (e: any) => {
        console.log(e)
      },
    },
  },
]

const dialog = useDialog()
const formRef: any = ref(null)
const actionRef = ref()

const showEditModal = ref(false)
const formBtnLoading = ref(false)
const editFormParams = reactive({
  label: '新建',
  id: '0',
  name: '',
  type: '',
  platform: '',
  contextWindow: 0,
  maxInputTokens: 0,
  maxOutputTokens: 0,
  setting: ''
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
          label: '启用',
          onClick: handleEnable.bind(null, record),
          ifShow: () => {
            return !record.isEnable
          },
        },
        {
          label: '禁用',
          onClick: handleDisable.bind(null, record),
          ifShow: () => {
            return record.isEnable
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
            content: `删除后数据无法恢复，确定要删除模型 ${record.name} 吗?`,
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: () => {
              handleDelete(record)
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

function addTable() {
  showEditModal.value = true
  editFormParams.label = '新建'
  editFormParams.id = ''
}

const loadDataTable = async (res) => {
  return await api.search({ ...getFieldsValue() }, res)
}

function onCheckedRow(rowKeys) {
  console.log(rowKeys)
}

function reloadTable() {
  actionRef.value.reload()
}

function confirmForm(e) {
  e.preventDefault()
  formBtnLoading.value = true
  formRef.value.validate(async (errors) => {
    if (!errors) {
      if(editFormParams.id === ''){
        await api.addOne(editFormParams)
      }else{
        await api.edit(editFormParams)
      }
      window['$message'].success('新建成功')
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

async function handleEnable(record: Recordable) {
  await api.enable(record.id)
  window['$message'].success('操作成功')
  reloadTable()
}

async function handleDisable(record: Recordable) {
  await api.disable(record.id)
  window['$message'].success('操作成功')
  reloadTable()
}

function handleEdit(record: Recordable) {
  showEditModal.value = true
  Object.assign(editFormParams, record)
  if(!editFormParams.setting){
    editFormParams.setting = ''
  }
  editFormParams.label = '编辑'
}

async function handleDelete(record: Recordable) {
  await api.deleteOne(record.uuid)
  window['$message'].info('删除成功')
}

function handleSubmit(values: Recordable) {
  console.log(values)
  reloadTable()
}

function handleReset(values: Recordable) {
  console.log(values)
}
</script>

<style lang="less" scoped></style>
