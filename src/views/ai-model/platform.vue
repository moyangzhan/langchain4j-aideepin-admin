<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row: AiPlatformData) => row.name"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1000"
    >
    </BasicTable>

    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑">
      <n-form
        :model="editFormParams"
        :rules="newRecordRules"
        ref="formRef"
        label-placement="left"
        :label-width="120"
        class="py-4"
      >
        <template v-for="(, key) in editFormParams.jsonValue" :key="key">
          <n-form-item :label="key" :path="key">
            <n-input :placeholder="'请输入' + key" v-model:value="editFormParams.jsonValue[key]" />
          </n-form-item>
        </template>
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
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import api from '@/api/sysConfig';
  import { AiPlatformData, columns } from './platformColumns';
  import { type FormRules } from 'naive-ui';

  const showEditModal = ref(false);
  const formBtnLoading = ref(false);
  const editFormParams = reactive({
    name: '',
    value: '',
    jsonValue: {},
  });
  const formRef: any = ref(null);
  const newRecordRules: FormRules = {
    value: {
      required: false,
      trigger: ['blur', 'input'],
      message: '请输入标题',
    },
  };

  const actionRef = ref();
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
      });
    },
  });

  const loadDataTable = async () => {
    return await api.search(
      {
        names: [
          'openai_setting',
          'dashscope_setting',
          'qianfan_setting',
          'ollama_setting',
          'deepseek_setting',
          'siliconflow_setting',
        ],
      },
      1,
      100
    );
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function confirmForm(e) {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate(async (errors) => {
      if (!errors) {
        editFormParams.value = JSON.stringify(editFormParams.jsonValue);
        await api.edit(editFormParams);
        window['$message'].success('编辑成功');
        setTimeout(() => {
          showEditModal.value = false;
          reloadTable();
        });
      } else {
        window['$message'].error('请填写完整信息');
      }
      formBtnLoading.value = false;
    });
  }

  function handleEdit(record: Recordable) {
    showEditModal.value = true;
    editFormParams.name = record.name;
    editFormParams.value = record.value;
    editFormParams.jsonValue = JSON.parse(record.value);
  }
</script>

<style lang="less" scoped></style>
