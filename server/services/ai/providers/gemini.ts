import { GoogleGenAI } from '@google/genai'
import { BasicError } from '../../../utils/errors'
import type { AiGenerateTextInput } from '..'

export function createGeminiProvider(opts: { apiKey: string }) {
  const apiKey = String(opts?.apiKey ?? '').trim()
  if (!apiKey) {
    throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'GEMINI_API_KEY 未配置' })
  }

  const ai = new GoogleGenAI({ apiKey })

  return {
    name: 'gemini' as const,
    async generateText(input: AiGenerateTextInput) {
      try {
        const model = String(input?.model ?? '').trim() || 'gemini-2.5-flash'
        const prompt = String(input?.prompt ?? '')

        const config: Record<string, number> = {}
        if (typeof input.temperature === 'number') config.temperature = input.temperature
        if (typeof input.topK === 'number') config.topK = input.topK
        if (typeof input.topP === 'number') config.topP = input.topP
        if (typeof input.maxOutputTokens === 'number') config.maxOutputTokens = input.maxOutputTokens

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          ...(Object.keys(config).length ? { config } : {}),
        })

        return response.text ?? ''
      } catch (error) {
        console.error('Gemini 调用失败:', error)
        if (error instanceof BasicError) throw error
        throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: 'Gemini 调用失败' })
      }
    },
  }
}