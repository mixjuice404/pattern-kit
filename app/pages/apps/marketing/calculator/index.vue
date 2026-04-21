<template>
  <div class="default-container">
    
    <PageHeader
      title="Pricing & Margin Simulator"
      :breadcrumbs="breadcrumbs">
        <button class="btn btn-sm btn-primary">
            <icon name="hugeicons:task-add-01" size="16" />
            <span>New Event</span>
        </button>
    </PageHeader>

    <div>

      <div>
        汇率（主要核算货币）
        目标毛利率
      </div>
      <div>
        <div>
          参数
        </div>
        <div>
          
        </div>
      </div>

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
  { label: 'Calculator', icon: 'hugeicons:calculator-02' }
]
</script>