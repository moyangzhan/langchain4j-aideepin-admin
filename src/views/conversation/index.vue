<template>
  <n-card :bordered="false" class="proCard">
    <n-alert type="info" :show-icon="false" closable>
      本系统中会话即AI角色
    </n-alert>

    <BasicForm class="mt-3" @register="register" @submit="handleSubmit" @reset="handleReset">
    </BasicForm>

    <BasicTable :columns="columns" :request="loadDataTable" :row-key="(row: Conversation) => row.id" ref="actionRef"
      :actionColumn="actionColumn" @update:checked-row-keys="onCheckedRow" :scroll-x="1300">
    </BasicTable>

    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" :title="editFormParams.label">
      <n-form :model="editFormParams" :rules="newUserRules" ref="formRef" label-placement="left" :label-width="80"
        class="py-4">
        <n-form-item label="标题" path="title">
          <n-input placeholder="请输入标题" v-model:value="editFormParams.title" maxlength="45" show-count />
        </n-form-item>
        <n-form-item label="描述" path="password">
          <n-input type="textarea" :autosize="{ minRows: 3, maxRows: 10 }" placeholder="请输入描述"
            v-model:value="editFormParams.aiSystemMessage" />
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
import convApi from '@/api/conversation'
import { columns } from './columns'
import { type FormRules } from 'naive-ui'
import { useDialog } from 'naive-ui'
import { Conversation } from '/#/conversation'

const newUserRules: FormRules = {
  name: {
    required: false,
    trigger: ['blur', 'input'],
    message: '请输入名称',
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

const dialog = useDialog()
const formRef: any = ref(null)
const actionRef = ref()

const showEditModal = ref(false)
const formBtnLoading = ref(false)
const editFormParams = reactive({
  label: '新建',
  uuid: '',
  title: '',
  aiSystemMessage: '',
  understandContextEnable: false,
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
      ],
      dropDownActions: [
        {
          label: '删除',
          key: 'deleteConv',
        },
      ],
      select: (key) => {
        if (key === 'deleteConv') {
          dialog.warning({
            title: '提示',
            content: `删除后数据无法恢复，确定要删除 ${record.title} 吗?`,
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

const loadDataTable = async (res) => {
  return await convApi.searchConvs({ ...getFieldsValue() }, res)
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
      await convApi.editConv(editFormParams.uuid, editFormParams)
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

async function handleDelete(record: Recordable) {
  await convApi.deleteConv(record.uuid)
  reloadTable()
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
