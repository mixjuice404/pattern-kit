<template>
  <div class="default-container">
    <PageHeader title="Pattern Drafts" :breadcrumbs="breadcrumbs">
      <button class="btn btn-sm btn-neutral">
        <icon name="hugeicons:plus-sign-square" size="16" />
        <span>New Draft</span>
      </button>
    </PageHeader>

    <div style=" background-color: #fff; border-radius: 8px; padding: 10px;">
      <table class="table">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5">Loading...</td>
          </tr>
          <tr v-else-if="!drafts.length">
            <td colspan="5">No Data</td>
          </tr>
          <tr v-else v-for="(d, idx) in drafts" :key="d.id">
            <th>{{ idx + 1 }}</th>
            <td>{{ d.title }}</td>
            <td>{{ d.description || '-' }}</td>
            <td><div class="badge badge-primary">{{ d.status }}</div></td>
            <td>{{ formatUpdatedAt(d.updated_at) }}</td>
            <td>
              <div style="display: flex; gap: 10px; align-items: center; font-weight: 500;">
                <div style="cursor: pointer;" class="text-primary" @click="goToDetail(d.id)">Edit</div>
                <div style="cursor: pointer;" class="text-error">Remove</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from "~/types/ApiResponse";

definePageMeta({
  layout: "default",
});

const breadcrumbs = [
  { label: "Home", to: "/", icon: "solar:home-2-outline" },
  { label: "Patterns", icon: "solar:emoji-funny-circle-outline" },
  { label: "Drafts" },
];

type PatternDraftListItem = {
  id: number
  title: string
  description: string | null
  status: string
  updated_at: string | Date
}

const drafts = ref<PatternDraftListItem[]>([])
const loading = ref(false)

const formatUpdatedAt = (v: any) => {
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString()
}

const load = async () => {
  loading.value = true
  try {
    const res = await $fetch<ApiResponse<PatternDraftListItem[]>>('/api/pattern/draft/list', {
      method: 'GET',
      query: { page: 1, pageSize: 50 },
    })

    if (!res?.success) {
      throw new Error(res?.message || '加载列表失败')
    }

    drafts.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error('加载 Draft 列表失败:', e)
    drafts.value = []
  } finally {
    loading.value = false
  }
}

const goToDetail = (id: number) => {
  navigateTo(`/pattern/draft/detail?id=${id}`)
}

onMounted(load)
</script>
<style scoped lang="scss">

</style>