<template>
  <div>
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
          <TextRequestRateLimit v-if="type === 1" :ratelimit="textConfig" @reload-config="reloadConfig" />
          <ImageGenerateRateLimit v-if="type === 2" :ratelimit="imageConfig" @reload-config="reloadConfig" />
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import TextRequestRateLimit from './TextRequestRateLimit.vue'
import ImageGenerateRateLimit from './ImageGenerateRateLimit.vue'
import api from '@/api/sysConfig.js'

const typeTabList = [
  {
    name: '文本请求',
    desc: '文本请求限流规则',
    key: 1,
  },
  {
    name: '图片生成',
    desc: '图片生成限流规则',
    key: 2,
  },
]

const type = ref(1)
const typeTitle = ref('TOKEN额度')
const textConfig = reactive({
  times: 0,
  minutes: 0
})
const imageConfig = reactive({
  times: 0,
  minutes: 0
})
function switchType(e) {
  type.value = e.key
  typeTitle.value = e.name
}
async function reloadConfig() {
  const { records } = await api.search({ keyword: 'rate_limit' }, 1, 100)
  console.log(records)
  records.forEach(element => {
    const val = element.value
    if (element.name === 'request_text_rate_limit') {
      const jsonVal = JSON.parse(val)
      textConfig.times = jsonVal.times
      textConfig.minutes = jsonVal.minutes
    } else if (element.name === 'request_image_rate_limit') {
      const jsonVal = JSON.parse(val)
      imageConfig.times = jsonVal.times
      imageConfig.minutes = jsonVal.minutes
    }
  })
}
onMounted(async () => {
  reloadConfig()
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
