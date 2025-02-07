<template>
  <div>
    用户上传的文件（图片、文档等）存储到服务所在的服务器硬盘中
  </div>
  <br>
  <n-button type="primary" :loading="loading" @click="activeSetting">使用该存储位置</n-button>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import api from '@/api/sysConfig.js'

interface Emit {
  (e: 'reload'): void
}
const emit = defineEmits<Emit>()
const loading = ref<boolean>(false)
const message = useMessage()
async function activeSetting() {
  if (loading.value) return
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
  await api.edit({ name: 'storage_location', value: '1' })
  message.success('设置成功，后续上传的文件将存储到服务器本地硬盘中')
  emit('reload')
}

</script>