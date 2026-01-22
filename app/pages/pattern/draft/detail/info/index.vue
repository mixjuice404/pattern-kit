<template>
  <div class="info-container">
    <div class="info-preview">
      <div v-if="!markdownText" class="empty">暂无 revised_content</div>
      <div v-else class="prose prose-sm max-w-none" v-html="previewHtml"></div>
    </div>
    <div class="info-content">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background-color: #ffffff;">
        <div style="font-size: 14px;font-weight: 500;">图解信息补全</div>
        <button class="btn btn-sm btn-neutral" :disabled="!draftId || translating" @click="runTranslate">
          {{ translating ? '处理中...' : '确认，下一步：标准翻译' }}
        </button>
      </div>
      <div style="flex: 1; padding: 10px;">
        <div class="info-content-card mb-2">
          <div class="font-bold mb-4 flex items-center justify-between">
            <div style="font-size: 14px;font-weight: 500;">基本信息</div>
            <div style="display: flex; gap: 5px; align-items: center;">
              <button
                class="btn btn-sm btn-neutral btn-soft"
                :disabled="!draftId || savingBasic || !localTitle.trim()"
                @click="saveBasic"
              >
                {{ savingBasic ? 'Saving...' : '保存' }}
              </button>
              <button
                class="btn btn-sm btn-neutral"
                :disabled="!draftId || generatingText || !localTitle.trim()"
                @click="runGenText"
              >
                {{ generatingText ? '处理中...' : '执行' }}
              </button>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <div class="mb-2">
                <div class="input-label__title">标题</div>
                <input class="input input-bordered input-sm w-full" v-model="localTitle" @input="dirtyBasic = true" />
              </div>
              <div>
                <div class="input-label__title">图解描述</div>
                <textarea class="textarea textarea-bordered textarea-sm w-full" v-model="localDescription" @input="dirtyBasic = true"></textarea>
              </div>
            </div>
            <div>
              <textarea class="preview-textarea" rows="2" :value="infoPreviewTitle" readonly placeholder="无内容（图解标题）" />
              <textarea class="preview-textarea" rows="8" :value="infoPreviewDescription" readonly placeholder="无内容（图解描述）" />
            </div>
          </div>
        </div>
        <div class="info-content-card mb-2">
          <div class="font-bold mb-4 flex items-center justify-between">
            <div style="font-size: 14px;font-weight: 500;">图解配件与材料</div>
            <div style="display: flex; gap: 5px; align-items: center;">
              <button class="btn btn-sm btn-neutral btn-soft">保存</button>
              <button
                class="btn btn-sm btn-neutral"
                :disabled="!draftId || normalizingSupplies"
                @click="runNormalizeSupplies"
              >
                {{ normalizingSupplies ? '处理中...' : '执行' }}
              </button>
            </div>
          </div>
          <div>
            <textarea
              v-model="suppliesText"
              style="min-height: 200px;"
              class="textarea textarea-bordered textarea-sm w-full"
              placeholder="输入图解配件与材料原文（执行后会替换为规范化结果，可继续编辑）"
              @input="dirtySupplies = true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import type { ApiResponse } from '~/types/ApiResponse'
import { useAppToast } from '~/composables/useAppToast'

const toast = useAppToast()

const emit = defineEmits<{ (e: 'updated'): void }>()

const props = defineProps({
  markdown: {
    type: String,
    default: '',
  },
  info: {
    type: [Object, String, Array] as any,
    default: null,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  supplies: {
    type: [String, Object, Array] as any,
    default: '',
  },
})

const route = useRoute()
const draftId = computed(() => {
  const v = Number(route.query.id)
  return Number.isFinite(v) && v > 0 ? v : 0
})

const markdownText = computed(() => String(props.markdown ?? '').trim())

const toText = (v: any) => (v == null ? '' : typeof v === 'string' ? v : String(v))

const savingBasic = ref(false)
const dirtyBasic = ref(false)
const localTitle = ref('')
const localDescription = ref('')

const generatingText = ref(false)
const generatedInfo = ref<{ title: string; description: string } | null>(null)

const dirtySupplies = ref(false)
const suppliesText = ref('')
const normalizingSupplies = ref(false)

watch(
  () => props.supplies,
  () => {
    if (dirtySupplies.value) return
    suppliesText.value = toText(props.supplies)
  },
  { immediate: true }
)

watch(
  () => [props.title, props.description],
  () => {
    if (dirtyBasic.value) return
    localTitle.value = toText(props.title)
    localDescription.value = toText(props.description)
  },
  { immediate: true }
)

const translating = ref(false)

const runTranslate = async () => {
  if (!draftId.value || translating.value) return

  translating.value = true
  try {
    const res = await $fetch<ApiResponse<{ prompt: any }>>('/api/pattern/draft/translate', {
      method: 'POST',
      body: { id: draftId.value },
    })

    if (!res?.success) {
      throw new Error(res?.message || '执行翻译失败')
    }

    toast.success('已提交翻译')
    emit('updated')
  } catch (e) {
    console.error('执行翻译失败:', e)
    toast.error((e as any)?.message || '执行翻译失败')
  } finally {
    translating.value = false
  }
}

const saveBasic = async () => {
  if (!draftId.value || savingBasic.value) return

  savingBasic.value = true
  try {
    const res = await $fetch<ApiResponse<{ id: any }>>('/api/pattern/draft/update', {
      method: 'POST',
      body: {
        id: draftId.value,
        title: localTitle.value,
        description: localDescription.value,
      },
    })

    if (!res?.success) {
      throw new Error(res?.message || '更新失败')
    }

    dirtyBasic.value = false
    toast.success('更新成功')
  } catch (e) {
    console.error('更新 title/description 失败:', e)
    toast.error('更新失败')
  } finally {
    savingBasic.value = false
  }
}

const normalizeInfo = (v: any) => {
  if (v == null) return null
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return null
    try {
      return JSON.parse(s)
    } catch {
      return null
    }
  }
  if (typeof v === 'object') return v
  return null
}

const infoPreview = computed(() => {
  const g = generatedInfo.value
  if (g) return g
  const raw = normalizeInfo(props.info)
  const title = toText((raw as any)?.title).trim()
  const description = toText((raw as any)?.description).trim()
  if (!title && !description) return null
  return { title, description }
})

const infoPreviewTitle = computed(() => String(infoPreview.value?.title ?? ''))
const infoPreviewDescription = computed(() => String(infoPreview.value?.description ?? ''))

const runGenText = async () => {
  if (!draftId.value || generatingText.value || !localTitle.value.trim()) return

  generatingText.value = true
  try {
    const res = await $fetch<ApiResponse<{ info: any }>>('/api/pattern/draft/gen/text', {
      method: 'POST',
      body: {
        id: draftId.value,
        title: localTitle.value,
        description: localDescription.value,
      },
    })

    const info = (res as any)?.data?.info
    if (!res?.success || !info) {
      throw new Error(res?.message || '生成失败')
    }

    generatedInfo.value = {
      title: toText(info?.title).trim(),
      description: toText(info?.description).trim(),
    }

    toast.success('已生成')
  } catch (e: any) {
    console.error('生成图解信息失败:', e)
    toast.error(e?.message || '生成失败')
  } finally {
    generatingText.value = false
  }
}

const runNormalizeSupplies = async () => {
  if (!draftId.value || normalizingSupplies.value) return

  const supplies = String(suppliesText.value ?? '').trim()
  if (!supplies) {
    toast.warning('请输入图解配件与材料原文')
    return
  }

  normalizingSupplies.value = true
  try {
    const res = await $fetch<ApiResponse<{ normalized: any }>>('/api/pattern/draft/normalize/supplies', {
      method: 'POST',
      body: {
        id: draftId.value,
        supplies,
      },
    })

    const normalized = (res as any)?.data?.normalized
    if (!res?.success || normalized == null) {
      throw new Error(res?.message || '生成失败')
    }

    suppliesText.value = toText(normalized)
    toast.success('已生成')
  } catch (e: any) {
    console.error('生成图解配件与材料失败:', e)
    toast.error(e?.message || '生成失败')
  } finally {
    normalizingSupplies.value = false
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

.input-label__title {
  font-weight: 600; 
  margin-bottom: 5px; 
  color: var(--color-neutral-400); 
  font-size: 13px;

}

.info-container {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: #ffffff;

    .info-preview {
        height: 100%;
        border-right: 1px solid var(--color-neutral-100);
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
        overflow: auto;
        display: flex;
        flex-direction: column;
        background-color: var(--color-neutral-100);

        .info-content-card {
          border-radius: 6px;
          padding: 15px;
          background-color: #ffffff;
        }
    }
}

.preview-textarea {
  width: 100%;
  outline: none;
  font-size: 12px; 
  background-color: var(--color-neutral-100); 
  padding: 10px; 
  border-radius: 4px;
}
</style>