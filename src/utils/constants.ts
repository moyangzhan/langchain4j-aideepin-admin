export const DEFAULT_MODEL_PLATFORMS = [
  {
    label: 'Openai',
    value: 'openai',
  },
  {
    label: '灵积',
    value: 'dashscope',
  },
  {
    label: '千帆',
    value: 'qianfan',
  },
  {
    label: 'Ollama',
    value: 'ollama',
  },
  {
    label: '深度求索',
    value: 'deepseek',
  },
  {
    label: '硅基流动',
    value: 'siliconflow',
  },
]
export const MODEL_TYPES = [
  {
    label: '文本',
    value: 'text',
  },
  {
    label: '图像',
    value: 'image',
  },
  {
    label: '嵌入',
    value: 'embedding',
  },
  {
    label: '重排',
    value: 'rerank',
  },
  {
    label: '文本转语音',
    value: 'tts',
  },
  {
    label: '语音识别',
    value: 'asr',
  },
]
export const mcpTransportType = [
  {
    label: '网络传输(sse)',
    value: 'sse',
  },
  {
    label: '标准输入输出',
    value: 'stdio',
  },
]
export const mcpInstallType = [
  {
    label: 'docker',
    value: 'docker',
  },
  {
    label: '本地',
    value: 'local',
  },
  {
    label: '远程',
    value: 'remote',
  },
  {
    label: 'WebAssembly',
    value: 'wasm',
  },
]
export const synthesizerSide = [
  {
    label: '客户端',
    value: 'client',
  },
  {
    label: '服务端',
    value: 'server',
  },
]

export const YES_NO = [
  {
    label: '是',
    value: true,
  },
  {
    label: '否',
    value: false,
  },
]