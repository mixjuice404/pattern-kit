<template>
</template>

<script lang="ts" setup>

definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/pattern/list')
    }
  ]
})
</script>