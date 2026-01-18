<template>
  <div class="tranlate-container">
    <div class="translate-input">
      <div class="input-header">
        <div class="header-title">编辑翻译文本</div>
        <div class="flex items-center">
            <div class="flex items-center header-button" @click="saveResultContent">
                <icon name="hugeicons:file-upload" size="16" />
                <div>{{ savingUpdate ? 'Saving...' : 'Update' }}</div>
            </div>
        </div>
      </div>
      <textarea
        ref="editorEl"
        v-model="content"
        class="input-textarea"
        @scroll="onScroll('editor')"
      />
    </div>

    <div class="translate-priview">
      <div class="output-header">
        <div class="output-title">翻译预览</div>
      </div>
      <div
        ref="previewEl"
        class="preview-content prose prose-sm max-w-none"
        v-html="previewHtml"
        @scroll="onScroll('preview')"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import type { ApiResponse } from '~/types/ApiResponse'
import { useAppToast } from '~/composables/useAppToast'

type ScrollSource = 'editor' | 'preview'

type PatternDraftDetail = {
  id: number
  result_content: string | null
}

const route = useRoute()
const draftId = computed(() => {
  const v = Number(route.query.id)
  return Number.isFinite(v) && v > 0 ? v : 0
})

const toast = useAppToast()

const content = ref('')
const savingUpdate = ref(false)

const saveResultContent = async () => {
  if (!draftId.value || savingUpdate.value) return

  savingUpdate.value = true
  try {
    const res = await $fetch<ApiResponse<{ id: any }>>('/api/pattern/draft/update', {
      method: 'POST',
      body: {
        id: draftId.value,
        result_content: content.value,
      },
    })

    if (!res?.success) {
      throw new Error(res?.message || '更新失败')
    }

    toast.success('更新成功')
  } catch (e) {
    console.error('更新 result_content 失败:', e)
    toast.error('更新失败')
  } finally {
    savingUpdate.value = false
  }
}

const load = async () => {
  if (!draftId.value) {
    content.value = ''
    return
  }

  try {
    const res = await $fetch<ApiResponse<{ draft: PatternDraftDetail }>>(`/api/pattern/draft/${draftId.value}`, {
      method: 'GET',
    })

    if (!res?.success || !res.data?.draft) {
      content.value = ''
      return
    }

    content.value = String(res.data.draft.result_content ?? '')
  } catch {
    content.value = ''
  }
}

onMounted(load)
watch(draftId, load)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const previewHtml = computed(() => md.render(String(content.value ?? '')))

const editorEl = ref<HTMLTextAreaElement | null>(null)
const previewEl = ref<HTMLElement | null>(null)
let syncing = false

const onScroll = (source: ScrollSource) => {
  if (syncing) return

  const src = source === 'editor' ? editorEl.value : previewEl.value
  const dst = source === 'editor' ? previewEl.value : editorEl.value
  if (!src || !dst) return

  const srcMax = Math.max(0, src.scrollHeight - src.clientHeight)
  const ratio = srcMax ? src.scrollTop / srcMax : 0

  const dstMax = Math.max(0, dst.scrollHeight - dst.clientHeight)

  syncing = true
  requestAnimationFrame(() => {
    dst.scrollTop = ratio * dstMax
    syncing = false
  })
}
</script>
<style scoped lang="scss">

.tranlate-container {
  height: calc(100vh - 50px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  position: relative;
  overflow: hidden;

  .header-button {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;
    cursor: pointer;
    
    &:hover {
      background-color: var(--color-neutral-600);
    }
  }

  .translate-input {
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    box-sizing: border-box;
    background-color: var(--color-neutral-800);
    display: flex;
    flex-direction: column;

    .input-textarea {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 15px;
        box-sizing: border-box;
        color: #ffffff;
        resize: none;
        overflow: auto;
        outline: none;
    }

    .input-header {
        padding: 0 15px;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--color-neutral-700);
        color: #ffffff;

        .header-title {
            font-size: 14px;
            font-weight: 600;
        }
    }

  }
  
  .translate-priview {
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    box-sizing: border-box;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;

    .output-header {
        padding: 0 15px;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--color-neutral-50);

        .output-title {
            font-size: 14px;
            font-weight: 600;
        }
    }

    .preview-content {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: 15px;
      box-sizing: border-box;
    }
  }
}
</style>
