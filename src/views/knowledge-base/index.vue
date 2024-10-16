<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
    </BasicForm>

    <BasicTable :columns="columns" :request="loadDataTable" :row-key="(row: KbInfoData) => row.id" ref="actionRef"
      :actionColumn="actionColumn" @update:checked-row-keys="onCheckedRow" :scroll-x="1800">
    </BasicTable>


    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑">
      <n-form :model="editFormParams" :rules="newRecordRules" ref="formRef" label-placement="left" :label-width="150"
        class="py-4">
        <n-form-item label="标题" path="title">
          <n-input placeholder="请输入标题" v-model:value="editFormParams.title" />
        </n-form-item>
        <n-form-item label="描述" path="remark">
          <n-input type="textarea" placeholder="请输入描述" v-model:value="editFormParams.remark" />
        </n-form-item>
        <n-form-item label="是否公开" path="isPublic">
          <n-select placeholder="是否公开" :options="publicOpts" v-model:value="editFormParams.isPublic" />
        </n-form-item>
        <n-form-item label="文档切块时重叠数量" path="ingestMaxOverlap">
          <n-input-number placeholder="文档切块时重叠数量" v-model:value="editFormParams.ingestMaxOverlap" />
        </n-form-item>
        <n-form-item label="模型" path="ingestModelName">
          <n-select placeholder="抽取图谱知识时的模型" :options="aiModelOpts" v-model:value="editFormParams.ingestModelId"
            filterable clearable />
        </n-form-item>
        <n-form-item label="文档召回最大数量" path="retrieveMaxResults">
          <n-input-number placeholder="文档召回最大数量" v-model:value="editFormParams.retrieveMaxResults" />
        </n-form-item>
        <n-form-item label="文档召回最小分数" path="retrieveMinScore">
          <n-input-number placeholder="文档召回最小分数" v-model:value="editFormParams.retrieveMinScore" :precision="1" :min="0"
            :max="1" />
        </n-form-item>
        <n-form-item label="响应时的创造性" path="queryLlmTemperature">
          <n-input-number placeholder="响应时的创造性" v-model:value="editFormParams.queryLlmTemperature" :precision="1"
            :min="0" :max="1" />
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
import { h, onMounted, reactive, ref } from 'vue'
import { BasicTable, TableAction } from '@/components/Table'
import { BasicForm, FormSchema, useForm } from '@/components/Form/index'
import api from '@/api/knowledgeBase'
import aiModelApi from '@/api/aiModel'
import { columns, KbInfoData } from './columns'
import { type FormRules } from 'naive-ui'
import { useDialog } from 'naive-ui'

interface SelectOpt {
  label: string
  value: number
}
const showEditModal = ref(false)
const formBtnLoading = ref(false)
const editFormParams = reactive({
  uuid: '',
  title: '',
  remark: '',
  isPublic: 0,
  ingestMaxOverlap: 0,
  ingestModelId: 0,
  retrieveMaxResults: 0,
  retrieveMinScore: 0.0,
  queryLlmTemperature: 0.0
})
const publicOpts = [
  {
    label: '是',
    value: 1,
  },
  {
    label: '否',
    value: 0,
  },
]
const aiModelOpts = ref<SelectOpt[]>([])
const dialog = useDialog()
const formRef: any = ref(null)
const newRecordRules: FormRules = {
  title: {
    required: false,
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
      placeholder: '请输入名称',
      onInput: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'ownerName',
    component: 'NInput',
    label: '所属用户名称',
    componentProps: {
      placeholder: '请输入所属用户名称',
      onInput: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'isPublic',
    component: 'NSelect',
    label: '是否公开',
    componentProps: {
      options: publicOpts,
      onUpdateChecked: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'createDate',
    component: 'NDatePicker',
    label: '创建时间',
    componentProps: {
      type: 'datetimerange',
      'value-format': "yyyy.MM.dd HH:mm:ss",
      clearable: true,
      onUpdateValue: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'updateTime',
    component: 'NDatePicker',
    label: '更新时间',
    componentProps: {
      type: 'datetimerange',
      clearable: true,
      onUpdateValue: (e: any) => {
        console.log(e)
      },
    },
  },
]

const actionRef = ref()
const actionColumn = reactive({
  width: 140,
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
      await api.edit({ ...editFormParams, isPublic: editFormParams.isPublic === 1 ? true : false })
      window['$message'].success('编辑成功')
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
  editFormParams.isPublic = record.isPublic ? 1 : 0
}

async function handleDelete(record: Recordable) {
  await api.deleteOne(record.uuid)
  window['$message'].info('删除成功')
  reloadTable()
}

function handleSubmit(values: Recordable) {
  console.log(values)
  reloadTable()
}

function handleReset(values: Recordable) {
  console.log(values)
}

onMounted(async () => {
  if (aiModelOpts.value.length > 0) {
    return
  }
  const resp = await aiModelApi.search({ isEnable: true, type: 'text' }, { current: 1, size: 100 })
  if (resp && resp.records) {
    resp.records.forEach(item => {
      aiModelOpts.value.push({ label: item.name, value: item.id })
    })
  }
})
</script>

<style lang="less" scoped></style>
