import { BasicError } from '../../utils/errors'
import { createGeminiProvider } from './providers/gemini'

export type AiGenerateTextInput = {
  prompt: string
  model?: string
  temperature?: number
  topK?: number
  topP?: number
  maxOutputTokens?: number
}

type AiProvider = {
  name: 'gemini'
  generateText: (input: AiGenerateTextInput) => Promise<string>
}

let cached: { provider: AiProvider; apiKey: string } | null = null

function getProvider(): AiProvider {
  const config = useRuntimeConfig() as any
  const providerName = String(config.aiProvider ?? 'gemini').trim().toLowerCase() || 'gemini'
  if (providerName !== 'gemini') {
    throw new BasicError('PARAMETER_NOT_SUPPORTED_IN_VERSION', {
      statusCode: 400,
      message: `不支持的 AI Provider: ${providerName}`,
    })
  }

  const apiKey = String(config.geminiApiKey ?? '').trim()
  if (!apiKey) {
    throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'GEMINI_API_KEY 未配置' })
  }

  if (cached?.apiKey === apiKey) return cached.provider

  const provider = createGeminiProvider({ apiKey })
  cached = { provider, apiKey }
  return provider
}

export async function aiGenerateText(input: AiGenerateTextInput) {
  const prompt = String(input?.prompt ?? '')
  if (!prompt.trim()) {
    throw new BasicError('INVALID_PROMPT', { statusCode: 400, message: 'prompt 不能为空' })
  }

  const provider = getProvider()
  const text = await provider.generateText({
    ...input,
    prompt,
  })

  if (!String(text ?? '').trim()) {
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '模型返回空结果' })
  }

  return text
}