<template>
  <div class="default-container">
    
    <PageHeader
      title="Calendar"
      :breadcrumbs="breadcrumbs">
        <button class="btn btn-sm btn-primary">
            <icon name="hugeicons:task-add-01" size="16" />
            <span>New Event</span>
        </button>
    </PageHeader>

    <div class="calendar-wrapper">
        <Calendar />
    </div>

  </div>
</template>

<style scoped lang="scss">
</style>

<script setup lang="ts">
import { ref } from 'vue'

const breadcrumbs = [
  { label: 'Home', to: '/', icon: 'solar:home-2-outline' },
  { label: 'Apps', icon: 'hugeicons:ai-brain-03' },
  { label: 'Marketing', to: '/apps/marketing', icon: 'hugeicons:command-line' },
  { label: 'Calendar', to: '/apps/marketing/calendar', icon: 'hugeicons:calendar-02' }
]
</script>