<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row: AiModelData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1800"
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
        :label-width="160"
        class="p-2"
        style="overflow-y: auto; overflow-x: hidden; max-height: 600px; width: 500px"
      >
        <n-form-item label="名称" path="name">
          <n-input placeholder="请输入模型名称" v-model:value="editFormParams.name" />
        </n-form-item>
        <n-form-item label="标题" path="title">
          <n-input placeholder="请输入模型标题" v-model:value="editFormParams.title" />
        </n-form-item>
        <n-form-item label="类型" path="type">
          <n-select
            placeholder="选择模型的类型"
            :options="MODEL_TYPES"
            v-model:value="editFormParams.type"
          />
        </n-form-item>
        <n-form-item label="平台" path="platform">
          <n-select
            placeholder="选择模型所属的平台"
            :options="allPlatforms"
            v-model:value="editFormParams.platform"
          />
        </n-form-item>
        <n-form-item label="上下文长度" path="contextWindow">
          <n-input-number
            placeholder="请输入上下文长度"
            v-model:value="editFormParams.contextWindow"
          />
        </n-form-item>
        <n-form-item label="最大输入token数" path="maxInputTokens">
          <n-input-number
            placeholder="请输入最大输入token数"
            v-model:value="editFormParams.maxInputTokens"
          />
        </n-form-item>
        <n-form-item label="最大输出token数" path="maxOutputTokens">
          <n-input-number
            placeholder="请输入最大输出token数"
            v-model:value="editFormParams.maxOutputTokens"
          />
        </n-form-item>
        <n-form-item label="输入类型" path="inputTypeList">
          <n-select
            multiple
            placeholder="选择模型的输入类型"
            :options="MODEL_INPUT_TYPES"
            v-model:value="editFormParams.inputTypeList"
          />
        </n-form-item>
        <n-form-item label="输出格式" path="responseFormatTypeList">
          <n-select
            multiple
            placeholder="选择输出格式"
            :options="MODEL_RESPONSE_FORMAT_TYPES"
            v-model:value="editFormParams.responseFormatTypeList"
          />
        </n-form-item>
        <n-form-item label="是否推理模型" path="isReasoner">
          <n-switch v-model:value="editFormParams.isReasoner" />
        </n-form-item>
        <n-form-item label="推理过程是否可以关闭" path="isThinkingClosable">
          <n-switch v-model:value="editFormParams.isThinkingClosable" />
        </n-form-item>
        <n-form-item label="是否支持web搜索" path="isSupportWebSearch">
          <n-switch v-model:value="editFormParams.isSupportWebSearch" />
        </n-form-item>
        <n-form-item label="个性化配置" path="setting">
          <n-input
            type="textarea"
            placeholder="个性化配置"
            v-model:value="editFormParams.setting"
          />
        </n-form-item>
        <n-form-item label="说明" path="remark">
          <n-input type="textarea" placeholder="请输入说明" v-model:value="editFormParams.remark" />
        </n-form-item>
        <n-form-item label="属性" path="properties">
          <JsonEditorVue
            v-model="editFormParams.properties"
            :main-menu-bar="false"
            :mode="Mode.text"
            style="width: 100%; height: 200px"
          />
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
  import { h, onMounted, reactive, ref, computed } from 'vue'
  import { BasicTable, TableAction } from '@/components/Table'
  import { BasicForm, useForm } from '@/components/Form/index'
  import api from '@/api/aiModel'
  import platformApi from '@/api/modelPlatform'
  import { MODEL_TYPES, MODEL_INPUT_TYPES, MODEL_RESPONSE_FORMAT_TYPES } from '@/utils/constants'
  import { columns, allPlatforms } from './columns'
  import { PlusOutlined } from '@vicons/antd'
  import { AiModelData } from '/#/aiModel'
  import type { FormItemRule, FormRules } from 'naive-ui'
  import { useDialog } from 'naive-ui'
  import JsonEditorVue from 'json-editor-vue'

  enum Mode {
    text = 'text',
    tree = 'tree',
  }

  const newRecordRules: FormRules = {
    name: {
      required: false,
      trigger: ['blur', 'input'],
      message: '请输入名称',
    },
    type: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入类型',
    },
    platform: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入平台',
    },
    inputTypeList: {
      required: true,
      trigger: ['blur'],
      message: '请选择输入类型',
      validator(rule: FormItemRule, value: string[]) {
        if (value.length === 0) {
          return new Error('至少选择一个输入类型')
        }
        return true
      },
    },
    responseFormatTypeList: {
      required: true,
      trigger: ['blur'],
      message: '请选择输出格式',
      validator(rule: FormItemRule, value: string[]) {
        if (value.length === 0) {
          return new Error('至少选择一个输出格式')
        }
        return true
      },
    },
  }

  const dialog = useDialog()
  const formRef: any = ref(null)
  const actionRef = ref()
  const showEditModal = ref(false)
  const formBtnLoading = ref(false)
  const editFormParams = reactive({
    label: '新建',
    id: '0',
    name: '',
    title: '',
    type: '',
    platform: '',
    contextWindow: 0,
    maxInputTokens: 0,
    maxOutputTokens: 0,
    inputTypeList: [],
    responseFormatTypeList: [],
    isReasoner: false,
    isThinkingClosable: false,
    isSupportWebSearch: false,
    setting: '',
    remark: '',
    properties: null as Record<string, any> | null,

    inputTypes: '',
    responseFormatTypes: '',
  })

  const actionColumn = reactive({
    width: 300,
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
          {
            label: '设为免费',
            onClick: handleFree.bind(null, record, true),
            ifShow: () => {
              return !record.isFree
            },
          },
          {
            label: '设为收费',
            onClick: handleFree.bind(null, record, false),
            ifShow: () => {
              return record.isFree
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
  })

  function addTable() {
    showEditModal.value = true
    editFormParams.label = '新建'
    editFormParams.id = ''
  }

  const loadDataTable = async (res) => {
    const resp = await api.search({ ...getFieldsValue() }, res)
    if (resp.data.records) {
      resp.data.records.forEach((item: AiModelData) => {
        item.inputTypeList = item.inputTypes.split(',')
        item.responseFormatTypeList = item.responseFormatTypes.split(',')
      })
    }
    return resp.data
  }

  const loadPlatforms = async () => {
    const resp = await platformApi.search({}, { current: 1, size: 100 })
    allPlatforms.length = 0
    resp.data.records.forEach((item) => {
      allPlatforms.push({ label: item.title, value: item.name })
    })
  }

  function onCheckedRow(rowKeys) {
    // 选中行回调
  }

  function reloadTable() {
    actionRef.value.reload()
  }

  function confirmForm(e) {
    e.preventDefault()
    formBtnLoading.value = true
    formRef.value.validate(async (errors) => {
      try {
        if (!errors) {
          editFormParams.inputTypes = editFormParams.inputTypeList.join(',')
          editFormParams.responseFormatTypes = editFormParams.responseFormatTypeList.join(',')
          // 处理 properties：如果是字符串则解析为对象
          let propertiesValue: Record<string, any> | null = editFormParams.properties
          if (typeof propertiesValue === 'string' && (propertiesValue as string).trim()) {
            try {
              propertiesValue = JSON.parse(propertiesValue as string)
            } catch {
              propertiesValue = null
            }
          }
          const submitData = {
            ...editFormParams,
            properties: propertiesValue || null,
          }
          if (editFormParams.id === '') {
            await api.addOne(submitData)
          } else {
            await api.edit(submitData)
          }
          window['$message'].success(`${editFormParams.label}成功`)
          setTimeout(() => {
            showEditModal.value = false
            reloadTable()
          })
        } else {
          window['$message'].error('请填写完整信息')
        }
      } catch (error) {
        window['$message'].error('操作失败')
      } finally {
        formBtnLoading.value = false
      }
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

  async function handleFree(record: Recordable, isFree: boolean) {
    await api.edit({ id: record.id, isFree })
    window['$message'].success('操作成功')
    reloadTable()
  }

  function handleEdit(record: Recordable) {
    showEditModal.value = true
    Object.assign(editFormParams, record)
    if (!editFormParams.setting) {
      editFormParams.setting = ''
    }
    // 处理 properties 字段（后端返回的可能是对象或字符串）
    if (record.properties) {
      if (typeof record.properties === 'string') {
        try {
          editFormParams.properties = JSON.parse(record.properties)
        } catch {
          editFormParams.properties = null
        }
      } else {
        editFormParams.properties = record.properties
      }
    } else {
      editFormParams.properties = null
    }
    editFormParams.label = '编辑'
  }

  async function handleDelete(record: Recordable) {
    await api.deleteOne(record.uuid)
    window['$message'].info('删除成功')
  }

  function handleSubmit(_values: Recordable) {
    reloadTable()
  }

  function handleReset(_values: Recordable) {
    // 重置回调
  }

  onMounted(() => {
    loadPlatforms()
  })
</script>

<style lang="less" scoped></style>
