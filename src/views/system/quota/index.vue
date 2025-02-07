<template>
  <div>
    <n-alert title="提示" type="info" :bordered="true" closable>
      配置变更后10分钟内生效
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
          <TokenSetting v-if="type === 1" :quota="tokenQuota" @reload-config="reloadConfig" />
          <RequestSetting v-if="type === 2" :quota="requestQuota" @reload-config="reloadConfig" />
          <ImageGenerateSetting v-if="type === 3" :quota="imageGenerateQuota" @reload-config="reloadConfig" />
          <KnowledgeBaseSetting v-if="type === 4" :quota="qaQuota" @reload-config="reloadConfig" />
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import TokenSetting from './TokenSetting.vue'
import ImageGenerateSetting from './ImageGenerateSetting.vue'
import RequestSetting from './RequestSetting.vue'
import KnowledgeBaseSetting from './KnowledgeBaseSetting.vue'
import api from '@/api/sysConfig.js'
import { QuotaConfig } from '/#/sysConfig'

const typeTabList = [
  {
    name: 'TOKEN额度',
    desc: '用户消耗TOKEN的额度设置',
    key: 1,
  },
  {
    name: '请求额度',
    desc: '用户请求大语言模型的次数设置',
    key: 2,
  },
  {
    name: '图片额度',
    desc: '用户生成图片的数量设置',
    key: 3,
  },
  {
    name: '聊天额度',
    desc: '用户对话的数量设置',
    key: 4,
  },
]

const type = ref(1)
const typeTitle = ref('TOKEN额度')
const tokenQuota = ref<QuotaConfig>({
  daily: 0,
  monthly: 0
})
const imageGenerateQuota = reactive({
  daily: 0,
  monthly: 0
})
const requestQuota = reactive({
  daily: 0,
  monthly: 0
})
const qaQuota = reactive({
  daily: 0,
  monthly: 0
})
function switchType(e) {
  type.value = e.key
  typeTitle.value = e.name
}
async function reloadConfig() {
  const { records } = await api.search({ keyword: 'quota_by' }, 1, 100)
  console.log(records)
  records.forEach(element => {
    const val = parseInt(element.value)
    if (element.name === 'quota_by_token_daily') {
      tokenQuota.value.daily = val
    } else if (element.name === 'quota_by_token_monthly') {
      tokenQuota.value.monthly = val
    } else if (element.name === 'quota_by_request_daily') {
      requestQuota.daily = val
    } else if (element.name === 'quota_by_request_monthly') {
      requestQuota.monthly = val
    } else if (element.name === 'quota_by_image_daily') {
      imageGenerateQuota.daily = val
    } else if (element.name === 'quota_by_image_monthly') {
      imageGenerateQuota.monthly = val
    } else if (element.name === 'quota_by_qa_ask_daily') {
      qaQuota.daily = val
    } else if (element.name === 'quota_by_qa_item_monthly') {
      qaQuota.monthly = val
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
