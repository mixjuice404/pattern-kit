import { GoogleGenAI } from '@google/genai'
import { createError } from 'h3'
import { BasicError } from '../../../utils/errors'
import type { AiGenerateTextInput } from '..'

function serializeError(error: unknown) {
  if (error instanceof BasicError) {
    return {
      name: 'BasicError',
      message: error.message,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      errorInfo: error.errorInfo,
      stack: error.stack,
    }
  }

  if (error instanceof Error) {
    const e: any = error
    const out: any = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }

    for (const k of ['code', 'status', 'statusCode', 'type']) {
      if (e?.[k] != null) out[k] = e[k]
    }

    const details = e?.details ?? e?.errorDetails
    if (details != null) out.details = details

    const apiError = e?.error ?? e?.response?.error
    if (apiError != null) out.error = apiError

    const cause = e?.cause
    if (cause != null && cause !== error) out.cause = cause instanceof Error ? { name: cause.name, message: cause.message, stack: cause.stack } : cause

    return out
  }

  return { message: String(error) }
}

function pickGeminiErrorMessage(detail: any): string | undefined {
  const direct = detail?.error?.message
  if (typeof direct === 'string' && direct.trim()) return direct

  const msg = detail?.message
  if (typeof msg !== 'string') return undefined

  const s = msg.trim()
  if (s.startsWith('{') && s.endsWith('}')) {
    try {
      const parsed = JSON.parse(s)
      const nested = parsed?.error?.message
      if (typeof nested === 'string' && nested.trim()) return nested
    } catch {}
  }

  return msg
}

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
        const detail = serializeError(error)
        const pickedMessage = pickGeminiErrorMessage(detail)
        console.error('Gemini 调用失败(0):', pickedMessage)
        if (error instanceof BasicError) throw error
        
        const message = pickedMessage ? `Gemini 调用失败: ${pickedMessage}` : 'Gemini 调用失败'
        if (process.env.NODE_ENV !== 'production') {
          throw createError({ statusCode: 500, statusMessage: message, data: { ...detail, pickedMessage } })
        }

        throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message })
      }
    },
  }
}