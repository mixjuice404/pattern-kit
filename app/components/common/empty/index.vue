<template>
  <div class="empty-state">
    <icon class="empty-state__icon" name="hugeicons:search-visual" size="52" />
    <div class="empty-state__notice">{{ notice }}</div>
    <div v-if="text" class="empty-state__text">{{ text }}</div>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{
  notice?: string
  text?: string
}>(), {
  notice: 'No patterns found', // Or 'No data'
  text: ''
})
</script>
<style scoped lang="scss">
// no data style
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background-color: #fafafa;
  border-radius: 4px;

  .empty-state__icon {
    opacity: 0.7; 
    margin-bottom: 18px;
  }

  .empty-state__notice {
    font-size: 18px;
    font-weight: 700;
    color: var(--secondary-color);
    margin-bottom: 5px;
  }

  .empty-state__text {
    font-size: 14px;
    font-weight: 400;
    color: var(--secondary-color);
  }
}
</style>