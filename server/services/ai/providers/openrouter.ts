import { createError } from 'h3'
import { BasicError } from '../../../utils/errors'
import type { AiGenerateTextInput } from '..'
import axios from 'axios'

export function createOpenRouterProvider(opts: { apiKey: string }) {
  const apiKey = String(opts?.apiKey ?? '').trim()
  if (!apiKey) {
    throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'OPENROUTER_API_KEY 未配置' })
  }

  return {
    name: 'openrouter' as const,
    async generateText(input: AiGenerateTextInput) {
      try {
        let model = String(input?.model ?? '').trim() || 'google/gemini-2.5-flash'
        // 自动将本地简写的 gemini 模型映射为 openrouter 的完整路径
        if (model === 'gemini-2.5-flash') {
          model = 'google/gemini-2.5-flash'
        }

        const prompt = String(input?.prompt ?? '')

        const body: any = {
          model,
          messages: [{ role: 'user', content: prompt }],
        }

        if (typeof input.temperature === 'number') body.temperature = input.temperature
        if (typeof input.topP === 'number') body.top_p = input.topP
        if (typeof input.maxOutputTokens === 'number') body.max_tokens = input.maxOutputTokens

        const fetchOptions: any = {
          method: 'POST',
          url: 'https://openrouter.ai/api/v1/chat/completions',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'PatternKit',
          },
          data: body,
          timeout: 60000, // 增加 60 秒超时
          proxy: false // 关键：强制关闭 axios 读取环境变量中的代理配置
        }

        // 使用 axios 替代原生 fetch
        const response = await axios(fetchOptions)

        const text = response.data?.choices?.[0]?.message?.content ?? ''

        console.log(`[AI] 成功通过 OpenRouter 调用模型: ${model}`)

        return text
      } catch (error: any) {
        console.error(`[AI] OpenRouter 调用失败:`, error.message)
        if (error instanceof BasicError) throw error
        
        const message = `OpenRouter 调用失败: ${error.message}`
        if (process.env.NODE_ENV !== 'production') {
          throw createError({ statusCode: 500, statusMessage: message, data: { message: error.message } })
        }
        throw new BasicError('AI_SERVICE_ERROR', { statusCode: 500, message: 'AI 服务调用失败，请稍后重试' })
      }
    }
  }
}