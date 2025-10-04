<template>
  <div class="preview-container">
    <!-- 打印按钮（仅在屏幕显示） -->
    <div class="btn-container">
      <button @click="printPDF" class="btn" :disabled="loading">
        {{ loading ? '加载中…' : '导出 PDF' }}
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="alert alert-error m-4">
      <span>{{ error }}</span>
    </div>

    <!-- 预览内容 -->
    <div id="pdf-content" class="print-content">
      <component
        :is="currentTemplate"
        :key="patternInfo.template"
        v-if="!loading"
        style="width: 100%;"
        :padding-x="90"
        :padding-y="90"
        :pattern-data="patternInfo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseTemplate from '~/components/template/base/index.vue'
import SimpleTemplate from '~/components/template/simple/index.vue'
import { PatternInfo } from '~/types/PatternInfo'

useHead({
  title: '',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

type ApiResponse<T> = {
  success: boolean
  errorCode: string | null
  data: T
  message: string
}

const route = useRoute()
const loading = ref(true)
const error = ref<string | null>(null)
const patternInfo = reactive(new PatternInfo())

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const id = Number(route.params.id)
    if (Number.isNaN(id)) {
      throw new Error('无效的 ID')
    }
    const res = await $fetch<ApiResponse<{ pattern: any }>>(`/api/pattern/${id}`)
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
    if (raw) {
      const info = PatternInfo.fromJSON(raw)
      Object.assign(patternInfo, info)
    }

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
  window.print()
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
  bottom: 20px;
  right: 20px;
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
    margin: 0;
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