<template>
  <div class="page-header">
    <div style="padding-left: 2px;">
      <div class="page-title">{{ title }}</div>
      <div class="breadcrumbs text-sm">
        <ul>
          <li v-for="(bc, idx) in breadcrumbs" :key="idx">
            <component :is="bc.to ? 'NuxtLink' : 'span'" v-bind="bc.to ? { to: bc.to } : {}">
              <icon v-if="bc.icon" :name="bc.icon" size="16" class="mr-1" />
              {{ bc.label }}
            </component>
          </li>
        </ul>
      </div>
    </div>

    <div class="page-btn-group">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

const {
  title,
  breadcrumbs,
  loading = false,
  showReload = true,
  showSettings = true,
  showCreate = true
} = defineProps<{
  title: string
  breadcrumbs: BreadcrumbItem[]
  loading?: boolean
  showReload?: boolean
  showSettings?: boolean
  showCreate?: boolean
}>()

defineEmits<{
  (e: 'reload'): void
  (e: 'settings'): void
  (e: 'create'): void
}>()
</script>