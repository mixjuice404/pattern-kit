// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/icon',
    '@nuxt/image'
  ],
  css: [
    '~/assets/scss/main.scss',
    '~/assets/css/tailwind.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variables.scss" as *;'
        }
      }
    }
  },
  // 新增：确保 Prisma 被内联打包到 serverless 函数
  nitro: {
    preset: 'vercel',
    externals: {
      inline: ['@prisma/client', 'prisma']
    }
  }
})