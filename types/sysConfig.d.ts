export interface QuotaConfig {
  daily: number
  monthly: number
}
export interface RateLimitConfig {
  times: number
  minutes: number
}
export interface AliyunOssConfig {
  access_key_id: string
  access_key_secret: string
  bucket_name: string
  endpoint: string
}