<template>
  <div>
    <n-alert title="提示" type="info" :bordered="true">
      当前存储位置：<span class="font-bold">{{ selectedStorageLocation === 1 ? '本地存储' : '阿里云OSS' }}</span>
    </n-alert>
    <n-grid :x-gap="24">
      <n-grid-item span="6">
        <n-card :bordered="false" size="small" class="proCard">
          <n-thing class="thing-cell" v-for="item in typeTabList" :key="item.key"
            :class="{ 'thing-cell-on': type === item.key }" @click="switchType(item)">
            <template #header>{{ item.name }}</template>
            <template #description>{{ item.desc }}</template>
          </n-thing>
        </n-card>
      </n-grid-item>
      <n-grid-item span="18">
        <n-card :bordered="false" size="small" :title="typeTitle" class="proCard">
          <LocalConfig v-if="type === 1" @reload="loadData" />
          <AliyunOssConfig v-if="type === 2" @reload="loadData" />
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import LocalConfig from './LocalConfig.vue'
import AliyunOssConfig from './AliyunOssConfig.vue'
import api from '@/api/sysConfig.js'

const typeTabList = [
  {
    name: '本地存储',
    desc: '文件存储到服务器本地硬盘中',
    key: 1,
  },
  {
    name: '阿里云OSS',
    desc: '文件存储到阿里云OSS',
    key: 2,
  },
]

const selectedStorageLocation = ref<number>(1)
const type = ref<number>(1)
const typeTitle = ref<string>('本地存储')
function switchType(e) {
  type.value = e.key
  typeTitle.value = e.name
}
async function loadData() {
  const { data: records } = await api.search({ names: ['storage_location'] }, 1, 10)
  if (records.length === 0) {
    console.log('can not find storage_location confing')
    return
  }
  selectedStorageLocation.value = parseInt(records[0].value)
}
onMounted(() => {
  loadData()
})
</script>
<style lang="less" scoped>
.thing-cell {
  margin: 0 -16px 10px;
  padding: 5px 16px;

  &:hover {
    background: #f3f3f3;
    cursor: pointer;
  }
}

.thing-cell-on {
  background: #f0faff;
  color: #2d8cf0;

  ::v-deep(.n-thing-main .n-thing-header .n-thing-header__title) {
    color: #2d8cf0;
  }

  &:hover {
    background: #f0faff;
  }
}
</style>
