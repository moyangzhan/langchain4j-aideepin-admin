<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
    </BasicForm>

    <BasicTable :columns="columns" :request="loadDataTable" :row-key="(row: UserData) => row.id" ref="actionRef"
      :actionColumn="actionColumn" @update:checked-row-keys="onCheckedRow" :scroll-x="1400">
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
      <n-form :model="editFormParams" :rules="newUserRules" ref="formRef" label-placement="left" :label-width="120"
        class="py-4">
        <n-form-item label="名称" path="name">
          <n-input placeholder="请输入名称" v-model:value="editFormParams.name" />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input placeholder="请输入密码" v-model:value="editFormParams.password" />
        </n-form-item>
        <n-form-item label="每日token配额" path="quotaByTokenDaily">
          <n-input-number v-model:value="editFormParams.quotaByTokenDaily" />
        </n-form-item>
        <n-form-item label="每月token配额" path="quotaByTokenMonthly">
          <n-input-number v-model:value="editFormParams.quotaByTokenMonthly" />
        </n-form-item>
        <n-form-item label="每日请求配额" path="quotaByRequestDaily">
          <n-input-number v-model:value="editFormParams.quotaByRequestDaily" />
        </n-form-item>
        <n-form-item label="每月请求配额" path="quotaByRequestMonthly">
          <n-input-number v-model:value="editFormParams.quotaByRequestMonthly" />
        </n-form-item>
        <n-form-item label="每日图片配额" path="quotaByImageDaily">
          <n-input-number v-model:value="editFormParams.quotaByImageDaily" />
        </n-form-item>
        <n-form-item label="每月图片配额" path="quotaByImageMonthly">
          <n-input-number v-model:value="editFormParams.quotaByImageMonthly" />
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
import userApi from '@/api/user'
import { columns, UserData } from './columns'
import { PlusOutlined } from '@vicons/antd'
import { type FormRules } from 'naive-ui'

const newUserRules: FormRules = {
  name: {
    required: false,
    trigger: ['blur', 'input'],
    message: '请输入名称',
  },
}

const schemas: FormSchema[] = [
  {
    field: 'name',
    component: 'NInput',
    label: '姓名',
    componentProps: {
      placeholder: '请输入姓名',
      onInput: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'userStatus',
    component: 'NSelect',
    label: '状态',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        {
          label: '待激活',
          value: 1,
        },
        {
          label: '正常',
          value: 2,
        },
        {
          label: '禁用',
          value: 3,
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
  {
    field: 'isAdmin',
    component: 'NSelect',
    label: '管理员',
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
]

const formRef: any = ref(null)
const actionRef = ref()

const showEditModal = ref(false)
const formBtnLoading = ref(false)
const editFormParams = reactive({
  label: '新建',
  uuid: '',
  name: '',
  email: '',
  password: '',
  quotaByTokenDaily: 0,
  quotaByTokenMonthly: 0,
  quotaByRequestDaily: 0,
  quotaByRequestMonthly: 0,
  quotaByImageDaily: 0,
  quotaByImageMonthly: 0,
  isAdmin: false,
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
            return record.userStatus === 'NORMAL'
          },
        },
        {
          label: '启用',
          onClick: handleEnable.bind(null, record),
          ifShow: () => {
            return record.userStatus === 'FREEZE'
          },
        },
      ],
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
  editFormParams.email = ''
  editFormParams.quotaByTokenDaily = 0
  editFormParams.quotaByTokenMonthly = 0
  editFormParams.quotaByRequestDaily = 0
  editFormParams.quotaByRequestMonthly = 0
  editFormParams.quotaByImageDaily = 0
  editFormParams.quotaByImageMonthly = 0
  editFormParams.isAdmin = false
}

const loadDataTable = async (res) => {
  return await userApi.search({ ...getFieldsValue() }, res)
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
      if (editFormParams.uuid === '') {
        await userApi.addOne(editFormParams)
      } else {
        await userApi.edit(editFormParams)
      }
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
  await userApi.active(record.uuid)
  window['$message'].success('操作成功')
  reloadTable()
}

async function handleDisable(record: Recordable) {
  await userApi.freeze(record.uuid)
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
</script>

<style lang="less" scoped></style>
