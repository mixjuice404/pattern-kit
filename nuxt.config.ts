// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@nuxt/image'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap'
        }
      ]
    }
  },
  build: {
    transpile: ['vue-toastification']
  },
  css: [
    '~/assets/scss/main.scss',
    '~/assets/css/tailwind.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      exclude: ['sharp'],
    },
    ssr: {
      external: ['sharp'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variables.scss" as *;'
        }
      }
    }
  },
  // 关键：确保 Prisma 内联进 serverless 函数
  nitro: {
    preset: 'vercel'
    // 不要在这里 inline @prisma/client 或 prisma，也不要 alias .prisma
  },
  runtimeConfig: {
    imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    public: {
      imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      imagekitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    }
  },

})