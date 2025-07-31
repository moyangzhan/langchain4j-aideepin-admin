<template>
  <div class="m-4">
    <n-form :label-width="150" :model="formValue" :rules="rules" ref="formRef" label-placement="left">
      <n-form-item label="模型" path="platform">
        <n-select placeholder="选择模型" :options="modelOptions" :value="formValue.model_name"
          @update:value="handleModelChange" />
      </n-form-item>
      <n-form-item label="平台" path="platform">
        <n-select :options="modelPlatform" v-model:value="formValue.platform" disabled />
      </n-form-item>
      <n-form-item label="最大识别时长(秒)" path="max_record_duration">
        <n-input-number v-model:value="formValue.max_record_duration" />
      </n-form-item>
      <n-form-item label="最大文件大小(KB)" path="max_file_size">
        <n-input-number v-model:value="formValue.max_file_size" />
      </n-form-item>
    </n-form>
    <n-button type="primary" @click="formSubmit" :loading="submitting" :disable="!submitting">更新</n-button>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { AiModelData } from '/#/aiModel'
import { modelPlatform } from '@/utils/constants'
import api from '@/api/sysConfig.js'
import modelApi from '@/api/aiModel'
import { AsrConfig } from '/#/sysConfig'

interface modelOption {
  label: string
  value: string
}
const rules = {
}
const modelOptions = reactive<modelOption[]>([])
const models = reactive<AiModelData[]>([])
const formRef: any = ref(null)
const formValue = ref<AsrConfig>({
  model_name: '',
  platform: '',
  max_record_duration: 0,
  max_file_size: 0,
})
const message = useMessage()
const submitting = ref(false)

async function reloadConfig() {
  const { data } = await api.search({ names: ['asr_setting'] }, 1, 100)
  console.log(data)
  data.records.forEach(record => {
    formValue.value = JSON.parse(record.value) as AsrConfig
  })

  const { data: modelData } = await modelApi.search({ type: 'asr' }, { current: 1, size: 100 })
  if (modelData.records.length === 0) {
    console.log('can not find asr model')
    return
  }
  modelData.records.forEach(element => {
    modelOptions.push({ label: element.title, value: element.name })
    models.push({ ...element })
  })
}

function handleModelChange(modelName) {
  formValue.value.model_name = modelName
  const md = models.find(model => model.name === modelName)
  if (!md) {
    message.error('Model not found:' + modelName)
    return
  }
  formValue.value.platform = md.platform
}

function formSubmit() {
  if (submitting.value) {
    return
  }
  formRef.value.validate(async (errors) => {
    if (errors) {
      message.error('请填写完整信息')
    }
    submitting.value = true
    try {
      await api.edit({ name: 'asr_setting', value: JSON.stringify(formValue.value) })
      reloadConfig()
      message.success('更新成功')
    } catch (error) {
      console.error('Error updating ASR config:', error)
      message.error('更新失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}
onMounted(async () => {
  reloadConfig()
})
</script>
