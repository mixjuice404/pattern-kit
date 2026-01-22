<template>
  <div class="default-container">
    <PageHeader title="Pattern Drafts" :breadcrumbs="breadcrumbs">
      <button class="btn btn-sm btn-neutral" @click="openNewDraftModal">
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
            <th>{{ d.id }}</th>
            <td>{{ d.title }}</td>
            <td>{{ d.description || '-' }}</td>
            <td><div class="badge badge-primary">{{ d.status }}</div></td>
            <td>{{ formatUpdatedAt(d.updated_at) }}</td>
            <td>
              <div style="display: flex; gap: 10px; align-items: center; font-weight: 500;">
                <div style="cursor: pointer;" class="text-primary" @click="goToDetail(d.id)">Edit</div>
                <div style="cursor: pointer;" class="text-error" @click="removeDraft(d.id)">{{ removingId === d.id ? 'Removing...' : 'Remove' }}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <dialog id="new_draft_modal" ref="newDraftModal" class="modal">
      <div class="modal-box custom-modal-box">
        <div class="modal-header">
          <div>
            <div class="modal-header__title">New Pattern Draft</div>
            <div class="modal-header__subtitle">Create a new pattern draft</div>
          </div>
          <div class="modal-header__close-btn" role="button" tabindex="0" @click="closeNewDraftModal">
            <icon name="hugeicons:cancel-01" size="22" />
          </div>
        </div>
        <div style="padding: 20px;">
          <div class="mb-4">
            <div class="modal-body__title">Pattern Title</div>
            <input
              v-model="newTitle"
              type="text"
              placeholder="Type here, e.g. Simple Button"
              class="input input-bordered w-full"
            />
          </div>
          <div class="mb-4">
            <div class="modal-body__title">Description</div>
            <textarea
              v-model="newDescription"
              placeholder="Type here, e.g. A simple pattern draft"
              class="textarea textarea-bordered w-full"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button
              type="button"
              class="btn btn-neutral"
              :disabled="savingCreate || !newTitle.trim()"
              @click="createDraft"
            >
              <icon name="hugeicons:cloud-upload" size="16" />
              <span>{{ savingCreate ? 'Saving...' : 'Save' }}</span>
            </button>
          </slot>
        </div>
      </div>
    </dialog>
      
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from "~/types/ApiResponse";
import { useAppToast } from '~/composables/useAppToast'

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

const toast = useAppToast()

const newDraftModal = ref<HTMLDialogElement | null>(null)
const newTitle = ref('')
const newDescription = ref('')
const savingCreate = ref(false)

const openNewDraftModal = () => {
  newTitle.value = ''
  newDescription.value = ''
  newDraftModal.value?.showModal()
}

const closeNewDraftModal = () => {
  newDraftModal.value?.close()
}

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

const removingId = ref<number | null>(null)

const removeDraft = async (id: number) => {
  if (!id || removingId.value != null) return

  removingId.value = id
  try {
    const res = await $fetch<ApiResponse<any>>(`/api/pattern/draft/remove/${id}`, {
      method: 'POST',
    })

    if (!res?.success) {
      throw new Error(res?.message || '删除失败')
    }

    drafts.value = drafts.value.filter((d) => d.id !== id)
    toast.success('删除成功')
  } catch (e) {
    console.error('删除 Draft 失败:', e)
    toast.error('删除失败')
  } finally {
    removingId.value = null
  }
}

const createDraft = async () => {
  if (savingCreate.value) return

  const title = String(newTitle.value ?? '').trim()
  const description = String(newDescription.value ?? '')
  if (!title) return

  savingCreate.value = true
  try {
    const res = await $fetch<ApiResponse<{ id: any }>>('/api/pattern/draft/create', {
      method: 'POST',
      body: { title, description },
    })

    if (!res?.success) {
      throw new Error(res?.message || '创建失败')
    }

    const id = Number((res as any)?.data?.id)
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('创建失败：无效 id')
    }

    toast.success('创建成功')
    closeNewDraftModal()
    goToDetail(id)
  } catch (e) {
    console.error('创建 Draft 失败:', e)
    toast.error('创建失败')
  } finally {
    savingCreate.value = false
  }
}

onMounted(load)
</script>
<style scoped lang="scss">

.modal-body__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-500);
  padding-left: 2px; 
  margin-bottom: 4px;
}


</style>