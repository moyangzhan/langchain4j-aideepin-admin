// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
import { VAxios } from './Axios'
import { AxiosTransform } from './axiosTransform'
import axios, { AxiosResponse } from 'axios'
import { checkStatus } from './checkStatus'
import { joinTimestamp, formatRequestDate } from './helper'
import { RequestEnum, ContentTypeEnum } from '@/enums/httpEnum'

import { useGlobSetting } from '@/hooks/setting'

import { isString } from '@/utils/is/'
import { deepMerge, isUrl } from '@/utils'
import { setObjToUrlParams } from '@/utils/urlUtils'

import { RequestOptions, Result, CreateAxiosOptions } from './types'
import { PageEnum } from '@/enums/pageEnum';
import { useUser } from '@/store/modules/user'
import router from '@/router/index';
const globSetting = useGlobSetting()
const urlPrefix = globSetting.urlPrefix || ''

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理请求数据
   */
  transformRequestData: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const {
      isShowMessage = true,
      isShowSuccessMessage,
      successMessageText,
      errorMessageText,
      isReturnNativeResponse,
    } = options

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res
    }

    const { data } = res

    const $dialog = window['$dialog']
    const $message = window['$message']

    if (!data) {
      // return '[HTTP] Request has no return value';
      throw new Error('请求出错，请稍候重试')
    }
    //  这里 code，result，message为 后台统一的字段，需要修改为项目自己的接口返回格式
    const { code, success, message, data: responseData } = data
    // 请求成功
    const hasSuccess = success
    // 是否显示提示信息
    if (isShowMessage) {
      if (hasSuccess && (successMessageText || isShowSuccessMessage)) {
        // 是否显示自定义信息提示
        $dialog.success({
          type: 'success',
          content: successMessageText || message || '操作成功！',
        })
      } else if (!hasSuccess && errorMessageText) {
        // 是否显示自定义信息提示
        $message.error(message || errorMessageText || '操作失败！')
      } else if (!hasSuccess) {
        // 接口请求错误，统一提示错误信息 这里逻辑可以根据项目进行修改
        if (responseData) {
          if (typeof responseData === 'string') {
            $message.error(responseData)
          } else {
            $message.error(JSON.stringify(responseData))
          }
        } else {
          $message.error(message)
        }
      }
    }

    return data
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true, urlPrefix } = options

    const isUrlStr = isUrl(config.url as string)

    if (!isUrlStr && joinPrefix) {
      config.url = `${urlPrefix}${config.url}`
    }

    if (!isUrlStr && apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`
    }
    const params = config.params || {}
    const data = config.data || false
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
      } else {
        // 兼容restful风格
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`
        config.params = undefined
      }
    } else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params)
        if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
          config.data = data
          config.params = params
        } else {
          config.data = params
          config.params = undefined
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(
            config.url as string,
            Object.assign({}, config.params, config.data)
          )
        }
      } else {
        // 兼容restful风格
        config.url = config.url + params
        config.params = undefined
      }
    }
    return config
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config, options) => {
    const userStore = useUser()
    // 请求之前处理config
    const token = userStore.getToken
    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      // jwt token
      (config as Recordable).headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token
    }
    return config
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    const $dialog = window['$dialog']
    const $message = window['$message']
    const { response, code, message } = error || {}
    // TODO 此处要根据后端接口返回格式修改
    const msg: string =
      response && response.data && response.data.message ? response.data.message : ''
    const err: string = error.toString()
    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        $message.error('接口请求超时，请刷新页面重试!')
        return
      }
      if (err && err.includes('Network Error')) {
        $dialog.info({
          title: '网络异常',
          content: '请检查您的网络连接是否正常',
          positiveText: '确定',
          //negativeText: '取消',
          closable: false,
          maskClosable: false,
          onPositiveClick: () => { },
          onNegativeClick: () => { },
        })
        return Promise.reject(error)
      }
    } catch (error) {
      throw new Error(error as any)
    }
    // 请求是否被取消
    const isCancel = axios.isCancel(error)
    if (!isCancel) {
      checkStatus(error.response && error.response.status, msg)
      if (error.response && error.response.status === 401) {
        setTimeout(() => {
          const userStore = useUser()
          userStore.clearToken()
          router.replace(PageEnum.BASE_LOGIN)
          // window.location.href = PageEnum.BASE_LOGIN
        })
      }
    } else {
      console.warn(error, '请求被取消！')
    }
    //return Promise.reject(error);
    return Promise.reject(response?.data)
  },
}

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    deepMerge(
      {
        timeout: 10 * 1000,
        authenticationScheme: '',
        // 接口前缀
        prefixUrl: urlPrefix,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: 'none',
          // 接口地址
          apiUrl: globSetting.apiUrl,
          // 接口拼接地址
          urlPrefix: urlPrefix,
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
        },
        withCredentials: false,
      },
      opt || {}
    )
  )
}

export const http = createAxios()

// 项目，多个不同 api 地址，直接在这里导出多个
// src/api ts 里面接口，就可以单独使用这个请求，
// import { httpTwo } from '@/utils/http/axios'
// export const httpTwo = createAxios({
//   requestOptions: {
//     apiUrl: 'http://localhost:9001',
//     urlPrefix: 'api',
//   },
// });
