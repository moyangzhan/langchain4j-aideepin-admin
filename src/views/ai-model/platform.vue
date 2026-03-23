<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row: AiPlatformData) => row.name"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="800"
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
      style="width: 550px"
    >
      <n-form
        :model="editFormParams"
        :rules="newRecordRules"
        ref="formRef"
        label-placement="left"
        :label-width="150"
        class="py-4"
        style="overflow-y: auto; overflow-x: hidden; max-height: 600px; width: 500px"
      >
        <n-form-item label="名称" path="name">
          <n-input placeholder="请输入名称" v-model:value="editFormParams.name" />
        </n-form-item>
        <n-form-item label="标题" path="title">
          <n-input placeholder="请输入标题" v-model:value="editFormParams.title" />
        </n-form-item>
        <n-form-item label="接口地址" path="baseUrl">
          <n-input placeholder="请输入接口地址" v-model:value="editFormParams.baseUrl" />
        </n-form-item>
        <n-form-item label="Api Key" path="apiKey">
          <n-input
            placeholder="Api Key"
            v-model:value="editFormParams.apiKey"
            type="password"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item label="Secret Key" path="secretKey">
          <n-input
            placeholder="Secret Key"
            v-model:value="editFormParams.secretKey"
            type="password"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item
          label="启用代理"
          path="isProxyEnable"
          feedback="详细的代理配置存放于项目代码的配置文件中"
        >
          <n-radio-group v-model:value="editFormParams.isProxyEnable" name="rg1">
            <n-radio v-for="opt in YES_NO" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item
          label="是否兼容OpenAI API"
          path="isOpenaiApiCompatible"
          feedback="兼容OpenAI API的平台，无需另外增加代码适配"
        >
          <n-radio-group v-model:value="editFormParams.isOpenaiApiCompatible" name="rg1">
            <n-radio v-for="opt in YES_NO" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="说明" path="remark">
          <n-input type="textarea" placeholder="请输入说明" v-model:value="editFormParams.remark" />
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
  import { FormSchema, useForm } from '@/components/Form/index'
  import api from '@/api/modelPlatform'
  import { AiPlatformData, columns } from './platformColumns'
  import { PlusOutlined } from '@vicons/antd'
  import { YES_NO, DEFAULT_MODEL_PLATFORMS } from '@/utils/constants'
  import { type FormRules, useDialog } from 'naive-ui'

  const showEditModal = ref(false)
  const formBtnLoading = ref(false)
  const editFormParams = reactive({
    label: '新建',
    id: '0',
    name: '',
    title: '',
    baseUrl: '',
    apiKey: '',
    secretKey: '',
    isProxyEnable: false,
    isOpenaiApiCompatible: false,
    remark: '',
  })
  const dialog = useDialog()
  const formRef: any = ref(null)
  const newRecordRules: FormRules = {
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

  const actionRef = ref()
  const actionColumn = reactive({
    width: 160,
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
            ifShow: () => {
              return !DEFAULT_MODEL_PLATFORMS.find((item) => item.value == record.name)
            },
          },
        ],
        select: (key) => {
          if (key === 'delete') {
            dialog.warning({
              title: '提示',
              content: `删除后数据无法恢复，并且可能影响到模型调用，确定要删除模型平台【${record.name}】吗?`,
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

  const schemas: FormSchema[] = [
    {
      field: 'name',
      component: 'NInput',
      label: '名称',
      componentProps: {
        placeholder: '请输入名称',
      },
    },
    {
      field: 'title',
      component: 'NInput',
      label: '标题',
      componentProps: {
        placeholder: '请输入标题',
      },
    },
  ]

  const [register, { getFieldsValue }] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 120,
    schemas,
  })

  const loadDataTable = async () => {
    const resp = await api.search(
      { ...getFieldsValue() },
      {
        current: 1,
        size: 100,
      }
    )
    return resp.data
  }

  function addTable() {
    showEditModal.value = true
    editFormParams.label = '新建'
    editFormParams.id = ''
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
        if (editFormParams.id === '') {
          await api.addOne(editFormParams)
        } else {
          await api.edit(editFormParams)
        }
        window['$message'].success(editFormParams.label + '成功')
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

  function handleSubmit(values: Recordable) {
    console.log(values)
    reloadTable()
  }

  function handleReset(values: Recordable) {
    console.log(values)
  }

  async function handleDelete(record: Recordable) {
    await api.deleteOne(record.uuid)
    window['$message'].info('删除成功')
  }

  function handleEdit(record: Recordable) {
    showEditModal.value = true
    Object.assign(editFormParams, record)
    editFormParams.label = '编辑'
  }
</script>

<style lang="less" scoped></style>
