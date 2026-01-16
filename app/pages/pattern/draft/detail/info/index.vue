<template>
  <div class="info-container">
    <div class="info-preview">
      <div v-if="!markdownText" class="empty">暂无 revised_content</div>
      <div v-else class="prose prose-sm max-w-none" v-html="previewHtml"></div>
    </div>
    <div class="info-content">
      <div class="mb-4 info-content-card">
        <div class="font-bold mb-4 flex items-center justify-between">
            <div>钩织针法</div>
            <button class="btn btn-sm btn-neutral" :disabled="!draftId || savingInfo" @click="saveInfo">
              {{ savingInfo ? 'Saving...' : 'Update' }}
            </button>
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Alias</th>
              <th>Us terms</th>
              <th>Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!abbrevList.length">
              <td colspan="4" style="opacity: 0.6;">暂无 abbrev 数据</td>
            </tr>
            <tr v-else v-for="(row, idx) in editableAbbrevList" :key="`${idx}-${toText(row?.alias)}`">
              <td>{{ toText(row?.alias) }}</td>
              <td>
                <input
                  class="input input-bordered input-xs"
                  v-model="editableAbbrevList[idx].en_alias"
                  @input="dirty = true"
                />
              </td>
              <td>{{ toText(row?.name_zh) }}</td>
              <td>{{ toText(row?.description) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- <div class="info-content-card">
        <div class="font-bold mb-4 flex items-center justify-between">
            <div>图解信息</div>
            <button class="btn btn-sm btn-neutral">Update</button>
        </div>
        <div class="text-neutral-500 text-sm">开发中 ...</div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import type { ApiResponse } from '~/types/ApiResponse'
import { useAppToast } from '~/composables/useAppToast'

const toast = useAppToast()

const props = defineProps({
  markdown: {
    type: String,
    default: '',
  },
  info: {
    type: [Object, String, Array] as any,
    default: null,
  },
})

const route = useRoute()
const draftId = computed(() => {
  const v = Number(route.query.id)
  return Number.isFinite(v) && v > 0 ? v : 0
})

const markdownText = computed(() => String(props.markdown ?? '').trim())

const toText = (v: any) => (v == null ? '' : typeof v === 'string' ? v : String(v))

const normalizedInfo = computed<any | null>(() => {
  const v = (props as any).info
  if (v == null) return null
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return null
    try {
      return JSON.parse(s)
    } catch {
      return { text: v }
    }
  }
  return v
})

const abbrevList = computed<any[]>(() => {
  const list = (normalizedInfo.value as any)?.abbrev
  return Array.isArray(list) ? list : []
})

const editableAbbrevList = ref<any[]>([])
const savingInfo = ref(false)
const dirty = ref(false)

watch(
  abbrevList,
  (list) => {
    if (dirty.value) return
    editableAbbrevList.value = list.map((x: any) => ({ ...(x ?? {}) }))
  },
  { immediate: true }
)

const saveInfo = async () => {
  if (!draftId.value || savingInfo.value) return

  const base = normalizedInfo.value
  const nextInfo = base && typeof base === 'object' && !Array.isArray(base) ? { ...(base as any) } : {}
  nextInfo.abbrev = editableAbbrevList.value.map((x: any) => ({ ...(x ?? {}) }))

  savingInfo.value = true
  try {
    const res = await $fetch<ApiResponse<{ id: any }>>('/api/pattern/draft/update', {
      method: 'POST',
      body: {
        id: draftId.value,
        info: nextInfo,
      },
    })

    if (!res?.success) {
      throw new Error(res?.message || '更新失败')
    }

    dirty.value = false
    toast.success('更新成功')
  } catch (e) {
    console.error('更新 info 失败:', e)
    toast.error('更新失败')
  } finally {
    savingInfo.value = false
  }
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const previewHtml = computed(() => md.render(String(props.markdown ?? '')))
</script>
<style scoped lang="scss">
.info-container {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;

    .info-preview {
        height: 100%;
        border: none;
        outline: none;
        padding: 16px;
        overflow: auto;
        background-color: #ffffff;


        .empty {
          font-size: 12px;
          opacity: 0.7;
        }

        :deep(.prose) {
          color: inherit;
        }

        :deep(.prose a) {
          color: #93c5fd;
        }
    }

    .info-content {
        height: 100%;
        border: none;
        outline: none;
        padding: 10px;
        overflow: auto;

        .info-content-card {
          border-radius: 5px;
          padding: 10px;
          background-color: #ffffff;
        }
    }
}
</style>