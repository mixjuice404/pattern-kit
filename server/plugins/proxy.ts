// server/plugins/proxy.ts
import { ProxyAgent, setGlobalDispatcher } from 'undici'

export default defineNitroPlugin((nitroApp) => {
  // 1. 获取环境变量中的代理地址
  // 在 Nuxt/Nitro 中，process.env.LOCAL_PROXY_URL 可以直接读取 .env 文件
  const proxyUrl = process.env.LOCAL_PROXY_URL

  // 2. 核心判断逻辑：
  // 只有在 'development' 模式下，且 proxyUrl 存在时，才启用代理
  if (process.env.NODE_ENV === 'development' && proxyUrl) {
    try {
      const dispatcher = new ProxyAgent(proxyUrl)
      setGlobalDispatcher(dispatcher)
      console.log(`✅ [Gemini Proxy] 已启用本地代理: ${proxyUrl}`)
    } catch (error) {
      console.error('❌ [Gemini Proxy] 代理设置失败:', error)
    }
  } else {
    // 3. 在 Vercel (Production) 环境下
    // 代码会走到这里，什么都不做，使用默认的直连网络
    console.log('🚀 [Gemini Proxy] 生产环境或无代理配置，使用直连模式')
  }
})