<template>
  <div style="height: 100%; width: 100%; display: flex; justify-content: center; background-color: var(--color-neutral-100); position: relative;">
    <div style="height: 100%; width: 60vw; padding: 20px; background-color: #ffffff; overflow-y: auto;">
      <div v-if="loading" style="font-size: 14px; opacity: 0.7;">加载中...</div>
      <div v-else-if="errorText" style="font-size: 14px; color: #ef4444;">{{ errorText }}</div>
      <div v-else-if="!markdownText" style="font-size: 14px; opacity: 0.7;">无内容</div>
      <div v-else class="prose prose-sm max-w-none" v-html="previewHtml" />
    </div>
    <div style="position: absolute; top: 20px; right: 20px;">
      <div class="header-button">
        <button
          class="btn btn-sm btn-neutral"
          :disabled="exportingDocx || !markdownText"
          @click="exportDocx"
        >
          {{ exportingDocx ? 'Exporting...' : '导出可编辑文档' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import type { ApiResponse } from '~/types/ApiResponse'
import { useAppToast } from '~/composables/useAppToast'

const route = useRoute()
const toast = useAppToast()

const draftId = computed(() => {
  const v = Number(route.query.id)
  return Number.isFinite(v) && v > 0 ? v : 0
})

const loading = ref(false)
const errorText = ref('')
const markdownText = ref('')
const exportingDocx = ref(false)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const previewHtml = computed(() => md.render(String(markdownText.value ?? '')))

const exportDocx = async () => {
  if (exportingDocx.value) return

  const bodyHtml = String(previewHtml.value ?? '').trim()
  if (!bodyHtml) {
    toast.warning('无可导出内容')
    return
  }

  exportingDocx.value = true
  try {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" />
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Noto Sans",sans-serif;line-height:1.6;padding:24px;}
  img{max-width:100%;height:auto;}
  table{border-collapse:collapse;width:100%;}
  th,td{border:1px solid #ddd;padding:6px 8px;vertical-align:top;}
  pre,code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;}
</style></head><body>${bodyHtml}</body></html>`

    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pattern-draft-${draftId.value || 'export'}.doc`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    toast.success('已导出')
  } catch (e: any) {
    console.error('导出失败:', e)
    toast.error(e?.message || '导出失败')
  } finally {
    exportingDocx.value = false
  }
}

const load = async () => {
  if (!draftId.value) {
    markdownText.value = ''
    errorText.value = '缺少 draftId'
    return
  }

  loading.value = true
  errorText.value = ''
  try {
    const res = await $fetch<ApiResponse<{ content: any }>>(`/api/pattern/draft/assmbly/${draftId.value}`, {
      method: 'POST',
    })

    const content = (res as any)?.data?.content
    if (!res?.success) throw new Error(res?.message || '加载失败')

    markdownText.value = String(content ?? '')
  } catch (e: any) {
    console.error('加载组装结果失败:', e)
    markdownText.value = ''
    errorText.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

watch(draftId, load, { immediate: true })
</script>