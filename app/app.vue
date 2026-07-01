<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

// 可以通过 JavaScript 动态切换主题
// document.documentElement.setAttribute('data-theme', 'dark')

const { user, setUser } = useAuth()
</script>
