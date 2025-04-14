<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
    </BasicForm>

    <BasicTable :columns="columns" :request="loadDataTable" :row-key="(row: ComponentData) => row.id" ref="actionRef"
      :actionColumn="actionColumn" @update:checked-row-keys="onCheckedRow" :scroll-x="1200">
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

    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" :title="editFormParams.label"
      class="min-w-[500px]">
      <n-form :model="editFormParams" :rules="newUserRules" ref="formRef" label-placement="left" :label-width="100"
        class="py-4">
        <n-form-item label="名称" path="name">
          <div class="flex flex-col flex-grow">
            <n-input placeholder="请输入名称" v-model:value="editFormParams.name"
              :disabled="editFormParams.label == '编辑' ? true : false" />
            <div class="text-sm italic text-gray-400">1. 名称是组件的唯一标识，保存后不可修改</div>
            <div class="text-sm italic text-gray-400">2. 英文字母，不能有空格</div>
          </div>
        </n-form-item>
        <n-form-item label="标题" path="title">
          <n-input placeholder="请输入密码" v-model:value="editFormParams.title" />
        </n-form-item>
        <n-form-item label="排列顺序" path="displayOrder">
          <div class="flex flex-col flex-grow">
            <n-input-number v-model:value="editFormParams.displayOrder" />
            <div class="text-sm italic text-gray-400">组件在工作流设计器中的显示顺序，由小到大排列</div>
          </div>
        </n-form-item>
        <n-form-item label="是否启用" path="isEnable">
          <n-switch v-model:value="editFormParams.isEnable" />
        </n-form-item>
        <n-form-item label="描述" path="remark">
          <n-input type="textarea" :autosize="{ minRows: 3, maxRows: 10 }" placeholder="请输入描述"
            v-model:value="editFormParams.remark" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="() => (showEditModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmEditForm">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
import { h, reactive, ref } from 'vue'
import { BasicTable, TableAction } from '@/components/Table'
import { BasicForm, FormSchema, useForm } from '@/components/Form/index'
import workflowApi from '@/api/workflow'
import { columns, ComponentData } from './columns'
import { PlusOutlined } from '@vicons/antd'
import { type FormRules } from 'naive-ui'
import { useDialog } from 'naive-ui'

//'Start', 'End', 'Answer', 'KnowledgeRetrieval', 'Switcher', 'Classifier', 'Template', 'DocumentExtractor', 'KeywordExtractor'
const nonDeletableNodes = ['Start', 'End']

const newUserRules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入名称',
  },
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
  }]

const formRef: any = ref(null)
const actionRef = ref()
const dialog = useDialog()
const showEditModal = ref(false)
const formBtnLoading = ref(false)
const editFormParams = reactive({
  label: '新建',
  uuid: '',
  name: '',
  title: '',
  remark: '',
  displayOrder: 0,
  isEnable: false,
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
            return record.isEnable && !nonDeletableNodes.includes(record.name)
          },
        },
        {
          label: '启用',
          onClick: handleEnable.bind(null, record),
          ifShow: () => {
            return !record.isEnable && !nonDeletableNodes.includes(record.name)
          },
        },
      ],
      dropDownActions: [
        {
          label: '删除',
          key: 'delete',
          ifShow: () => {
            return !nonDeletableNodes.includes(record.name)
          },
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

function addTable() {
  showEditModal.value = true
  editFormParams.label = '新建'
  editFormParams.uuid = ''
  editFormParams.name = ''
  editFormParams.title = ''
  editFormParams.remark = ''
  editFormParams.isEnable = false
}

const loadDataTable = async (res) => {
  const resp = await workflowApi.componentSearch({ ...getFieldsValue() }, res)
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
    try {
      if (!errors) {
        const { success } = await workflowApi.componentAddOrUpdate(editFormParams)
        if (success) {
          window['$message'].success(`${editFormParams.label}成功`)
          setTimeout(() => {
            showEditModal.value = false
            reloadTable()
          })
        } else {
          window['$message'].error('操作失败')
        }
      } else {
        window['$message'].error('请填写完整信息')
      }
    } catch (e) {
      console.error(e)
      formBtnLoading.value = false
    }
  })
}

function handleEdit(record: Recordable) {
  showEditModal.value = true
  Object.assign(editFormParams, record)
  editFormParams.label = '编辑'
}

async function handleEnable(record: Recordable) {
  await workflowApi.componentEnable({ uuid: record.uuid, isEnable: true })
  window['$message'].success('操作成功')
  reloadTable()
}

async function handleDisable(record: Recordable) {
  await workflowApi.componentEnable({ uuid: record.uuid, isEnable: false })
  window['$message'].success('操作成功')
  reloadTable()
}

async function handleDel(record: Recordable) {
  let { success } = await workflowApi.componentDel({ uuid: record.uuid })
  if (success) {
    window['$message'].success('操作成功')
    reloadTable()
  }
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
