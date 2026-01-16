<template>
  <div class="preprocess-container">
    <div class="preprocess-input">
      <div class="preprocess-input-header">
        <div class="header__title">{{ headerTitle }}</div>
        <div class="header__btn-group">
          <div
            class="header__btn"
            :style="saving || !draftId ? 'opacity:0.6;pointer-events:none;' : ''"
            @click="saveCurrentContent"
          >
            <icon name="hugeicons:upload-01" size="14" />
            <span>{{ saving ? 'Saving...' : 'Update' }}</span>
          </div>
        </div>
      </div>
      <textarea
        v-model="content"
        class="preprocess-textarea"
        placeholder="请输入需要预处理的文本内容"
      ></textarea>
    </div>
    <div class="preprocess-data">
      <button class="btn btn-primary w-full mb-4" :disabled="processing || !draftId" @click="runPreprocess">
        <icon name="hugeicons:magic-wand-01" />
        <span>{{ processing ? '处理中...' : 'AI 文本预处理' }}</span>
      </button>
      <div class="preprocess-timeline">
        <div class="timeline-item">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="timeline-item__dot" :class="{ active: hasRawContent || step1Status === 'running' }"></div>
            <div class="timeline-item__title">原文本上传</div>
          </div>
          <div class="timeline-item-body">
            <div class="body__content">
              <div v-if="step1Status === 'error'" class="text-error">执行异常，请重试：{{ step1Error }}</div>
              <div v-else-if="hasRawContent">已完成原文本上传。可点击 <a href="#" class="text-primary">查看详情</a> 在左侧查看和修改</div>
              <div v-else-if="step1Status === 'running'" class="body__loading">
                <icon name="line-md:uploading-loop" size="18" />
                <div>任务执行中 ... ...</div>
              </div>
              <div v-else>No task running</div>
            </div>
            <div v-if="hasRawContent" class="body__btn-group">
              <button class="btn btn-soft btn-xs" :disabled="processing" @click="runPreprocess">重试</button>
              <button class="btn btn-soft btn-xs" :disabled="processing" @click="runNormalize">下一步</button>
            </div>
          </div>
        </div>
        <div class="timeline-item">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="timeline-item__dot" :class="{ active: hasRevisedContent || step2Status === 'running' }"></div>
            <div class="timeline-item__title">标准格式化</div>
          </div>
          <div class="timeline-item-body">
            <div>
              <div v-if="step2Status === 'running'" class="body__loading">
                <icon name="line-md:uploading-loop" size="18" />
                <div>任务执行中 ... ...</div>
              </div>
              <div v-else-if="hasRevisedContent">已完成图解标准化。可点击 <a href="#" class="text-primary">查看详情</a> 在左侧查看和修改</div>
              <div v-else-if="step2Status === 'error'" class="text-error">执行异常，请重试：{{ step2Error }}</div>
              <div v-else>No task running</div>
            </div>
            
            <div v-if="hasRevisedContent" class="body__btn-group">
              <button class="btn btn-soft btn-xs" :disabled="processing" @click="runNormalize">重试</button>
              <button class="btn btn-soft btn-xs" :disabled="processing || step3Status === 'running'" @click="runReview">下一步</button>
            </div>
          </div>
        </div>
        <div class="timeline-item">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="timeline-item__dot" :class="{ active: isManualReviewDone || step3Status === 'running' }"></div>
            <div class="timeline-item__title">图解内容审查</div>
          </div>
          <div class="timeline-item-body">
            <div v-if="step3Status === 'running'" class="body__loading">
              <icon name="line-md:uploading-loop" size="18" />
              <div>任务执行中 ... ...</div>
            </div>
            <div v-else-if="isManualReviewDone">
              已完成图解内容审查。总计 {{ infoReportCount }} 项复查节点
            </div>
            <div v-else-if="step3Status === 'error'" class="text-error">执行异常，请重试：{{ step3Error }}</div>
            <div v-else>No task running</div>
          </div>
        </div>
        <div class="timeline-item">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="timeline-item__dot"></div>
            <div class="timeline-item__title">完成</div>
          </div>  
          <div class="timeline-item-body">
            <div class="text-success">
              文本预处理，已完成标准格式化和内容审查。请在下一步进行人工审核！
            </div>
            <button class="btn btn-neutral btn-sm mt-4">
              下一步：人工审核
            </button>
          </div>      
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from "~/types/ApiResponse";

// =====================
// Meta
// =====================
definePageMeta({
  title: '预处理',
})

// =====================
// Types
// =====================
type StepStatus = 'idle' | 'running' | 'success' | 'error'

type PatternDraftDetail = {
  id: number
  status: string
  raw_content: string | null
  revised_content: string | null
  info: any | null
}

// =====================
// Route
// =====================
const route = useRoute()
const draftId = computed(() => {
  const v = Number(route.query.id)
  return Number.isFinite(v) && v > 0 ? v : 0
})

// =====================
// State
// =====================
const draft = ref<PatternDraftDetail | null>(null)
const editingField = ref<'raw_content' | 'revised_content'>('raw_content')
const content = ref('')

// =====================
// Helpers
// =====================
const getErrorMessage = (e: any, fallback = 'Unknown error') => e?.message || fallback

const setDraftField = (field: 'raw_content' | 'revised_content', value: string) => {
  if (draft.value) {
    ;(draft.value as any)[field] = value
  }
}

const fetchDraftDetail = async () => {
  return await $fetch<ApiResponse<{ draft: PatternDraftDetail }>>(`/api/pattern/draft/${draftId.value}`, {
    method: 'GET',
  })
}

const updateDraft = async (data: Record<string, any>) => {
  return await $fetch<ApiResponse<{ id: any }>>('/api/pattern/draft/update', {
    method: 'POST',
    body: {
      id: draftId.value,
      ...data,
    },
  })
}

// =====================
// Data Loading
// =====================
const syncEditingFromDraft = () => {
  const revised = String(draft.value?.revised_content ?? '').trim()
  if (revised) {
    editingField.value = 'revised_content'
    content.value = String(draft.value?.revised_content ?? '')
    return
  }

  editingField.value = 'raw_content'
  content.value = String(draft.value?.raw_content ?? '')
}

const loadDraft = async () => {
  if (!draftId.value) return

  try {
    const res = await fetchDraftDetail()

    if (!res?.success || !res.data?.draft) {
      throw new Error(res?.message || '加载草稿失败')
    }

    draft.value = res.data.draft
    syncEditingFromDraft()
  } catch (e) {
    console.error('加载 Draft 详情失败:', e)
    draft.value = null
    editingField.value = 'raw_content'
    content.value = ''
  }
}

watch(draftId, loadDraft)

// =====================
// Manual Edit / Save
// =====================
const saving = ref(false)

const saveCurrentContent = async () => {
  if (!draftId.value || saving.value) return

  saving.value = true
  try {
    const res = await updateDraft({
      [editingField.value]: content.value,
    })

    if (!res?.success) {
      throw new Error(res?.message || '保存失败')
    }

    setDraftField(editingField.value, content.value)
  } catch (e) {
    console.error('保存 Draft 失败:', e)
  } finally {
    saving.value = false
  }
}

onMounted(loadDraft)

// =====================
// Status & Derived
// =====================
const processing = ref(false)
const step1Status = ref<StepStatus>('idle')
const step1Error = ref('')
const step2Status = ref<StepStatus>('idle')
const step2Error = ref('')
const step3Status = ref<StepStatus>('idle')
const step3Error = ref('')

const hasRawContent = computed(() => Boolean(String(draft.value?.raw_content ?? '').trim()))
const hasRevisedContent = computed(() => Boolean(String(draft.value?.revised_content ?? '').trim()))

const info = computed<any | null>(() => {
  const v = (draft.value as any)?.info
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

const infoReportCount = computed(() => {
  const report = (info.value as any)?.report
  return Array.isArray(report) ? report.length : 0
})

const hasInfo = computed(() => {
  const v = info.value
  if (v == null) return false
  if (typeof v === 'string') return Boolean(v.trim())
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v).length > 0
  return true
})

const isManualReviewDone = computed(() => String(draft.value?.status ?? '') === 'manual_review' && hasInfo.value)

const headerTitle = computed(() => (hasRevisedContent.value ? '标准化' : '图解原文'))

// =====================
// Actions
// =====================
const runNormalize = async () => {
  if (!draftId.value) return
  step2Status.value = 'running'
  step2Error.value = ''

  try {
    const res = await $fetch<ApiResponse<{ normalized: string }>>('/api/pattern/draft/normalize', {
      method: 'POST',
      body: { id: draftId.value, content: content.value },
    })

    if (!res?.success) {
      throw new Error(res?.message || '标准化失败')
    }

    const normalized = String(res.data?.normalized ?? '')
    content.value = normalized
    editingField.value = 'revised_content'
    setDraftField('revised_content', normalized)
    step2Status.value = 'idle'
  } catch (e: any) {
    step2Status.value = 'error'
    step2Error.value = getErrorMessage(e)
  }
}

const runReview = async () => {
  if (!draftId.value) return
  step3Status.value = 'running'
  step3Error.value = ''

  try {
    const res = await $fetch<ApiResponse<{ text: any }>>('/api/pattern/draft/review', {
      method: 'POST',
      body: { id: draftId.value },
    })

    if (!res?.success) {
      throw new Error(res?.message || '内容审查失败')
    }

    const nextInfo = (res as any)?.data?.text
    if (draft.value) {
      ;(draft.value as any).status = 'manual_review'
      ;(draft.value as any).info = nextInfo
    }

    step3Status.value = 'idle'
  } catch (e: any) {
    step3Status.value = 'error'
    step3Error.value = getErrorMessage(e)
  }
}

const runPreprocess = async () => {
  if (!draftId.value) return
  const raw = String(content.value ?? '')
  if (!raw.trim()) return

  processing.value = true
  step1Status.value = 'running'
  step1Error.value = ''
  step2Status.value = 'idle'
  step2Error.value = ''

  try {
    const res = await updateDraft({ raw_content: raw })

    if (!res?.success) {
      throw new Error(res?.message || '保存失败')
    }

    setDraftField('raw_content', raw)

    step1Status.value = 'success'
    await runNormalize()
  } catch (e: any) {
    step1Status.value = 'error'
    step1Error.value = getErrorMessage(e)
  } finally {
    processing.value = false
  }
}
</script>

<style scoped lang="scss">

.preprocess-timeline {
    height: calc(100vh - 130px);
    display: flex;
    flex-direction: column;
    font-size: 14px;
    overflow-y: scroll;
    padding: 10px 0;

    .timeline-item {

        .timeline-item__dot {
            width: 16px;
            height: 16px;
            box-sizing: border-box;
            border-radius: 50%;
            border: 1px dotted var(--color-neutral-500);

            &.active {
              border: 4px solid var(--color-success);
              background-color: var(--color-white);
            }
        }

        .timeline-item__title {
          color: var(--color-neutral-800);
          font-weight: 600;
          line-height: 20px;
          padding: 10px 0;
          font-size: 16px;
        }

        .timeline-item-body {
          padding: 15px 0;
          padding-left: 25px;
          position: relative;
          font-size: 14px;
          color: var(--color-neutral-600);

          .body__loading {
            display: flex;
            align-items: center;
            gap: 5px;
            opacity: 0.8;
          }

          .body__content {
            padding-bottom: 5px;
          }

          .body__btn-group {
            margin-top: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
         
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 7px;
            width: 1px;
            height: 100%;
            opacity: 0.5;
            border-left: 1px dashed var(--color-neutral-400);
          }

        }
    }
}

.preprocess-container {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: #dfe6e9;

    .preprocess-input {
        height: 100%;
        border: none;
        outline: none;
        background-color: var(--color-neutral-800);
        color: var(--color-white);
        display: flex;
        flex-direction: column;

        .preprocess-input-header {
          font-size: 14px; 
          font-weight: 500; 
          margin-bottom: 10px;
          background-color: var(--color-neutral-700);
          padding: 10px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .header__title {
            font-size: 14px;
            font-weight: 500;
          }

          .header__btn-group {
            display: flex;
            align-items: center;
            gap: 5px;

            .header__btn {
              font-size: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 5px;
              padding: 5px 10px;
              border-radius: 4px;
              transition: background-color 0.2s ease-in-out;
              cursor: pointer;
              color: var(--color-white);
              background-color: var(--color-neutral-600);
              
              &:hover {
                background-color: var(--color-neutral-500);
              }
            }

          }
        }

        .preprocess-textarea {
          width: 100%;
          flex: 1;
          min-height: 0;
          display: block;
          box-sizing: border-box;
          resize: none;
          overflow-y: auto;
          overflow-x: hidden;
          overflow-wrap: anywhere;
          padding: 20px;
          padding-bottom: 200px;
          color: #ffffff;
          outline: none;
        }
    }

    .preprocess-data {
        height: 100%;
        padding: 20px;
        padding-bottom: 0;
        border: none;
        outline: none;
        background-color: var(--color-white);
    }

}

</style>
