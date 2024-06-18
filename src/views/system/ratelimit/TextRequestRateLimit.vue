<template>
  <n-grid cols="2 s:2 m:2 l:3 xl:3 2xl:3" responsive="screen">
    <n-grid-item>
      <n-form :label-width="80" :model="formValue" :rules="rules" ref="formRef">
        <n-form-item label="请求数量" path="times">
          <n-input-number v-model:value="formValue.times" :min="0" />
        </n-form-item>

        <n-form-item label="时间窗口（分钟）" path="minutes">
          <n-input-number v-model:value="formValue.minutes" :min="0" />
        </n-form-item>

        <div>
          <n-space>
            <n-button type="primary" @click="formSubmit">更新文本请求限流规则</n-button>
          </n-space>
        </div>
      </n-form>
    </n-grid-item>
  </n-grid>
</template>

<script lang="ts" setup>
import { reactive, watch, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { RateLimitConfig } from '/#/sysConfig'
import api from '@/api/sysConfig.js'

const rules = {
}
interface Props {
  ratelimit: RateLimitConfig
}
interface Emit {
  (e: 'reloadConfig'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const formRef: any = ref(null)
const message = useMessage()
const formValue = reactive({
  times: 0,
  minutes: 0,
})
watch(
  () => props.ratelimit.times,
  () => {
    formValue.times = props.ratelimit.times
    formValue.minutes = props.ratelimit.minutes
  },
  { immediate: true}
)
function reloadConfig() {
  emit('reloadConfig')
}
function formSubmit() {
  formRef.value.validate(async (errors) => {
    await api.edit({ name: 'request_text_rate_limit', value: JSON.stringify({ times: formValue.times, minutes: formValue.minutes }) })
    if (!errors) {
      reloadConfig()
      message.success('更新成功')
    } else {
      message.error('更新成功，请填写完整信息')
    }
  })
}
</script>
