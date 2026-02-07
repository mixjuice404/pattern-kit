<template>
  <div class="preview-container">
    <!-- 打印按钮（仅在屏幕显示） -->
    <div class="btn-container">
      <select class="select" v-model="selectedLang" @change="load">
        <option v-for="opt in LANG_OPTIONS" :key="opt.value" :value="opt.value">
          {{ opt.flag }} {{ opt.label }}
        </option>
      </select>
      <button class="btn btn-neutral" @click="openPromptBuilderModal"> 
        Prompt Builder
      </button>
      <button class="btn btn-neutral" @click="openReviewJsonModal"> 
        查看JSON
      </button>
      <button @click="printPDF" class="btn btn-primary" :disabled="loading">
        {{ loading ? '加载中…' : '导出 PDF' }}
      </button>
      <button class="btn btn-primary" @click="printA4PDF">
        分页导出 PDF
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="alert alert-error m-4">
      <span>{{ error }}</span>
    </div>


    <!-- 预览内容 -->
    <div>
      <div v-if="hasPatternJson" id="pdf-content" class="print-content">
        <component
          :is="currentTemplate"
          :key="selectedLang + ':' + patternInfo.template"
          v-if="!loading"
          style="width: 100%;"
          :padding-x="90"
          :padding-y="90"
          :pattern-data="patternInfo"
        />
      </div>
      <div v-else class="print-content__empty">
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 20px; justify-content: center;font-size: 14px;">
          <div style="opacity: 0.8;">暂无预览内容</div>
          <div style="font-weight: 600;">【{{ selectedLang }}】</div>
        </div>
        <button class="btn btn-primary" @click="load">AI翻译</button>
      </div>
    </div>


    <dialog id="review-json" class="modal">
      <div class="modal-box" style="max-width: 50rem; ">
        <div style="margin-bottom: 10px;" class="text-lg font-bold">Pattern Info JSON</div>
        <div style="margin-bottom: 15px; color: text-secondary; font-size: 12px;">
          该 JSON 包含了完整的 pattern 信息，用于调试和分析。
        </div>
        <pre ref="promptResult" class="bg-base-200 p-4 rounded-lg overflow-auto max-h-100 whitespace-pre-wrap text-primary" style="font-size: 12px;">{{ JSON.stringify(patternInfo, null, 2) }}</pre>
        <div class="modal-action">
          <form method="dialog" style="display: flex; align-items: center; gap: 10px;">
            <button type="button" class="btn" @click="copyJsonToClipboard">{{ copyButtonText }}</button>
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>


    <dialog id="prompt-builder" class="modal">
      <div class="modal-box" style="max-width: 50rem;">
        <div style="margin-bottom: 10px;" class="text-lg font-bold">Pattern Info JSON</div>
        <div style="margin-bottom: 15px; color: text-secondary; font-size: 12px;">
          该 JSON 包含了完整的 prompt 信息，用于调试和分析。
        </div>
        <pre ref="promptResult" class="bg-base-200 p-4 rounded-lg overflow-auto max-h-100 whitespace-pre-wrap text-primary" style="font-size: 12px;">{{ promptLoading ? '加载中...' : builtPrompt }}</pre>
        <div class="modal-action">
          <form method="dialog" style="display: flex; align-items: center; gap: 10px;">
            <button type="button" class="btn" @click="copyPromptToClipboard">Copy Prompt</button>
            <button type="button" class="btn btn-primary" @click="buildPrompt">Build</button>
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
    

  </div>
</template>

<script setup lang="ts">
import BaseTemplate from '~/components/template/base/index.vue'
import SimpleTemplate from '~/components/template/simple/index.vue'
import { PatternInfo } from '~/types/PatternInfo'
import type { ApiResponse } from "~/types/ApiResponse"

definePageMeta({
  layout: 'empty'
})

useHead({
  title: '',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const route = useRoute()
const LANG_OPTIONS = [
  { value: 'en', flag: '🇺🇸', label: 'English' },
  { value: 'fr', flag: '🇫🇷', label: 'French' },
  { value: 'de', flag: '🇩🇪', label: 'German' },
  { value: 'es', flag: '🇪🇸', label: 'Spanish' },
] as const
const selectedLang = ref<'en' | 'fr' | 'de' | 'es'>('en')
const loading = ref(true)
const error = ref<string | null>(null)
const patternInfo = reactive(new PatternInfo())
const hasPatternJson = ref(false)

watch(selectedLang, (v) => {
  patternInfo.lang = v
})

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const id = Number(route.params.id)
    if (Number.isNaN(id)) {
      throw new Error('无效的 ID')
    }
    const res = await $fetch<ApiResponse<{ pattern: any }>>(`/api/pattern/${id}?lang=${selectedLang.value}`)
    const pattern = res?.data?.pattern
    if (!res?.success || !pattern) {
      throw new Error(res?.message || '未获取到 pattern 详情')
    }

    // 标题
    if (pattern.title) {
      patternInfo.title = pattern.title
    }

    // 反序列化 JSON 并注入到 PatternInfo
    const raw = typeof pattern.pattern_json === 'string'
      ? JSON.parse(pattern.pattern_json)
      : pattern.pattern_json
    hasPatternJson.value = !!raw
    if (raw) {
      const info = PatternInfo.fromJSON(raw)
      Object.assign(patternInfo, info)
    }

    patternInfo.lang = selectedLang.value

    // 等待内容渲染后，计算打印高度
    nextTick(() => {
      setTimeout(updatePageHeight, 300)
    })
  } catch (e: any) {
    console.error(e)
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)

// 打印函数
const printPDF = () => {
  // 保存原始标题
  const originalTitle = document.title
  
  // 生成文件名
  const fileName = patternInfo.title 
    ? `${patternInfo.title.replace(/[^\w\s-]/g, '').trim()}_pattern`
    : 'crochet_pattern'
  
  // 临时设置页面标题（影响默认文件名）
  document.title = fileName
  
  // 执行打印
  window.print()
  
  // 恢复原始标题
  setTimeout(() => {
    document.title = originalTitle
  }, 100)
}

// A4 尺寸分页打印
const printA4PDF = () => {
  const originalTitle = document.title

  // 生成文件名（区分 A4 分页导出）
  const fileName = patternInfo.title 
    ? `${patternInfo.title.replace(/[^\w\s-]/g, '').trim()}_pattern_A4`
    : 'crochet_pattern_A4'

  // 设置页面标题影响导出文件名
  document.title = fileName

  // 临时将页面高度设置为 A4 高度，启用分页
  document.documentElement.style.setProperty('--page-height', '297mm')
  // 为分页导出添加上下页边距（左右保持 0）
  document.documentElement.style.setProperty('--page-margin', '10mm 0')

  window.print()

  // 恢复标题并恢复为自适应单页高度
  setTimeout(() => {
    document.title = originalTitle
    document.documentElement.style.removeProperty('--page-margin')
    updatePageHeight()
  }, 100)
}

// 动态计算页面高度
const updatePageHeight = () => {
  const content = document.querySelector('.print-content') as HTMLElement | null
  if (!content) return
  const contentHeight = content.scrollHeight
  const heightInMm = Math.ceil((contentHeight + 151) * 0.264583) // 转为 mm 并加边距
  document.documentElement.style.setProperty('--page-height', `${heightInMm}mm`)
}

// 动态组件计算
const currentTemplate = computed(() => {
  return patternInfo.template === 'simple' ? SimpleTemplate : BaseTemplate
})


// 格式化 JSON 显示
const formattedJson = computed(() => {
  return JSON.stringify(patternInfo, null, 2)
})

// 复制功能
const copyButtonText = ref('Copy JSON')

const copyPromptToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(builtPrompt.value)
    // 可以添加成功提示
    console.log('Prompt 已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const copyJsonToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    copyButtonText.value = 'Copied'
    setTimeout(() => {
      copyButtonText.value = 'Copy JSON'
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const openReviewJsonModal = () => {
  ;(document.getElementById('review-json') as HTMLDialogElement)?.showModal()
}

const openPromptBuilderModal = () => {
  ;(document.getElementById('prompt-builder') as HTMLDialogElement)?.showModal()
}


// 响应式变量存储构建的 prompt
const builtPrompt = ref('无内容')
const promptLoading = ref(false)

// 执行 prompt builder 功能
const buildPrompt = async () => {
  promptLoading.value = true
  try {
    const res = await $fetch<any>('/api/pattern/prompt/build', {
      method: 'POST',
      body: { content: patternInfo },
    })

    const prompt = res?.data?.prompt
    if (!res?.success || !prompt) {
      throw new Error(res?.message || '构建 prompt 失败')
    }

    builtPrompt.value = prompt
  } catch (e: any) {
    console.error('构建 prompt 失败:', e)
    builtPrompt.value = `❌ 构建 prompt 失败: ${e?.message || 'Unknown error'}`
  } finally {
    promptLoading.value = false
  }
}

</script>

<style scoped>
.preview-container {
  min-height: 100vh;
  background: white;
  padding: 0;
  margin: 0;
  position: relative;
}

.btn-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 10px;
  bottom: 20px;
  right: 20px;
}

.print-content__empty {
   width: 210mm; /* A4宽度 */
   margin: 0 auto;
   background: white;
   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
   padding: 50px;
   text-align: center;
}

.print-content {
  width: 210mm; /* A4宽度 */
  min-height: 297mm; /* A4高度 */
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 0;
}

/* 打印样式优化 */
@media print {
  .btn-container { display: none !important; }

  @page {
    margin: var(--page-margin, 0);
    size: 210mm var(--page-height, 3000mm);
  }

  .preview-container {
    margin: 0;
    padding: 0;
    background: white;
  }

  .print-content {
    width: 100%;
    height: auto;
    margin: 0;
    padding: 0;
    box-shadow: none;
  }

  body * { visibility: hidden; }
  .print-content, .print-content * { visibility: visible; }
  .print-content { position: absolute; left: 0; top: 0; }
}

/* 屏幕预览样式 */
@media screen {
  .preview-container {
    padding: 20px;
    background: #f5f5f5;
  }
}
</style>