<template>
  <div class="m-4">
    <n-alert title="说明" type="info" :bordered="true" closable class="mb-4">
      合成器位置：<br>
      1. 客户端：表示使用客户端(如浏览器)的语音合成(TTS)功能，忽略【模型】、【平台】等参数，免费使用<br>
      2. 服务端：表示使用服务端的语音合成功能，实际上就是使用大语言模型如cosyvoice-v2，FunAudioLLM/CosyVoice2-0.5B等进行合成，通常需付费使用
    </n-alert>
    <n-form :label-width="150" :model="formValue" :rules="rules" ref="formRef" label-placement="left">
      <n-form-item label="合成器位置" path="synthesizer_side">
        <n-select :options="synthesizerSide" v-model:value="formValue.synthesizer_side" />
      </n-form-item>
      <n-form-item label="模型" path="platform">
        <n-select placeholder="选择模型" :options="modelOptions" :value="formValue.model_name"
          @update:value="handleModelChange" />
      </n-form-item>
      <n-form-item label="平台" path="platform">
        <n-select :options="modelPlatform" v-model:value="formValue.platform" disabled />
      </n-form-item>
    </n-form>
    <n-button type="primary" @click="formSubmit" :loading="submitting" :disable="!submitting">更新</n-button>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { AiModelData } from '/#/aiModel'
import { modelPlatform, synthesizerSide } from '@/utils/constants'
import api from '@/api/sysConfig.js'
import modelApi from '@/api/aiModel'
import { TtsConfig } from '/#/sysConfig'

interface modelOption {
  label: string
  value: string
}
const rules = {
}
const modelOptions = reactive<modelOption[]>([])
const models = reactive<AiModelData[]>([])
const formRef: any = ref(null)
const formValue = ref<TtsConfig>({
  model_name: '',
  platform: '',
  synthesizer_side: '',
})
const message = useMessage()
const submitting = ref(false)

async function reloadConfig() {
  const { data } = await api.search({ names: ['tts_setting'] }, 1, 100)
  console.log(data)
  data.records.forEach(record => {
    formValue.value = JSON.parse(record.value) as TtsConfig
  })

  const { data: modelData } = await modelApi.search({ type: 'tts' }, { current: 1, size: 100 })
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
      await api.edit({ name: 'tts_setting', value: JSON.stringify(formValue.value) })
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
