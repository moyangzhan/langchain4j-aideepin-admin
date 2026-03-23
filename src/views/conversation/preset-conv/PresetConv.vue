<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row: ConversationPreset) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1300"
    >
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

    <n-modal
      v-model:show="showEditModal"
      :show-icon="false"
      preset="dialog"
      :title="editFormParams.label"
    >
      <n-form
        :model="editFormParams"
        :rules="formRules"
        ref="formRef"
        label-placement="left"
        :label-width="100"
        class="py-4"
      >
        <n-form-item label="标题" path="title">
          <n-input
            placeholder="请输入名称"
            v-model:value="editFormParams.title"
            maxlength="45"
            show-count
          />
        </n-form-item>
        <n-form-item label="描述" path="remark">
          <n-input
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 10 }"
            placeholder="请输入描述"
            v-model:value="editFormParams.remark"
          />
        </n-form-item>
        <n-form-item label="角色设定" path="aiSystemMessage">
          <n-input
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 10 }"
            placeholder="请输入角色设定内容"
            v-model:value="editFormParams.aiSystemMessage"
          />
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
  import conversationApi from '@/api/conversation'
  import { columns } from './columns'
  import { ConversationPreset } from '/#/conversation'
  import { PlusOutlined } from '@vicons/antd'
  import { type FormRules } from 'naive-ui'
  import { useDialog } from 'naive-ui'

  const formRules: FormRules = {
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
      },
    },
    {
      field: 'remark',
      component: 'NInput',
      label: '描述',
      componentProps: {
        placeholder: '请输入描述',
      },
    },
    {
      field: 'createTime',
      component: 'NDatePicker',
      label: '创建时间',
      componentProps: {
        type: 'datetimerange',
        clearable: true,
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
    remark: '',
    aiSystemMessage: '',
  })

  const actionColumn = reactive({
    width: 120,
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
                // 取消删除
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
    editFormParams.title = ''
    editFormParams.remark = ''
    editFormParams.aiSystemMessage = ''
  }

  const loadDataTable = async (res) => {
    const resp = await conversationApi.searchPresetConvs({ ...getFieldsValue() }, res)
    return resp.data
  }

  function onCheckedRow(rowKeys) {
    // 选中行回调
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
          await conversationApi.addPresetConv(editFormParams)
        } else {
          await conversationApi.editPresetConv(editFormParams.uuid, editFormParams)
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

  function handleDelete(record: Recordable) {
    conversationApi.deletePresetConv(record.uuid)
    reloadTable()
  }

  function handleSubmit(values: Recordable) {
    reloadTable()
  }

  function handleReset(values: Recordable) {
    // 重置回调
  }
</script>

<style lang="less" scoped></style>
