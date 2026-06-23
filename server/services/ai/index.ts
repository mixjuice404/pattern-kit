import { BasicError } from '../../utils/errors'
import { createGeminiProvider } from './providers/gemini'
import { createOpenRouterProvider } from './providers/openrouter'

export type AiGenerateTextInput = {
  prompt: string
  model?: string
  temperature?: number
  topK?: number
  topP?: number
  maxOutputTokens?: number
}

type AiProvider = {
  name: 'gemini' | 'openrouter'
  generateText: (input: AiGenerateTextInput) => Promise<string>
}

let cached: { provider: AiProvider; providerName: string; apiKey: string } | null = null

function getProvider(): AiProvider {
  const config = useRuntimeConfig() as any
  const providerName = String(config.aiProvider ?? 'gemini').trim().toLowerCase() || 'gemini'
  
  console.log(`[AI] 正在初始化 Provider: ${providerName}`)

  let apiKey = ''
  if (providerName === 'gemini') {
    apiKey = String(config.geminiApiKey ?? '').trim()
    if (!apiKey) throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'GEMINI_API_KEY 未配置' })
  } else if (providerName === 'openrouter') {
    apiKey = String(config.openrouterApiKey ?? '').trim()
    if (!apiKey) throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'OPENROUTER_API_KEY 未配置' })
  } else {
    throw new BasicError('PARAMETER_NOT_SUPPORTED_IN_VERSION', {
      statusCode: 400,
      message: `不支持的 AI Provider: ${providerName}`,
    })
  }

  if (cached?.providerName === providerName && cached?.apiKey === apiKey) {
    console.log(`[AI] 使用缓存的 Provider: ${providerName}`)
    return cached.provider
  }

  let provider: AiProvider
  if (providerName === 'openrouter') {
    provider = createOpenRouterProvider({ apiKey })
  } else {
    provider = createGeminiProvider({ apiKey })
  }
  
  console.log(`[AI] Provider ${providerName} 初始化成功`)
  cached = { provider, providerName, apiKey }
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