<template>
  <div class="draft-container">
    <div class="draft-header">
      <div class="header-title">
        <div class="go-back-btn" @click="goBack">
          <icon name="solar:square-alt-arrow-left-broken" size="18" />
        </div>
        <div>图解预处理</div>
      </div>
      <div>
        <div class="custom-steps">
          <div
            v-for="(label, idx) in steps"
            :key="label"
            class="step-item"
            :class="{ active: idx <= currentStep }"
            @click="setActiveStep(idx)"
          >
            {{ label }}
          </div>
        </div>
      </div>
      <div class="header-button">
        
      </div>
    </div>

    <!-- 草稿内容操作区 -->
    <div class="draft-body">
      <Preprocess
        v-if="activeStep === 0"
        :draft="draft"
        @updated="loadDraft"
      />

      <KeepAlive>
        <MarkdownEditor
          v-if="activeStep === 1"
          :key="draftId"
          v-model:markdown="markdown"
          @updated="loadDraft"
        />
      </KeepAlive>

      <KeepAlive>
        <InfoCompletion
          v-if="activeStep === 2"
          :key="draftId"
          :markdown="markdown"
          :info="draft?.info"
          :title="draft?.title"
          :description="draft?.description || ''"
          :supplies="draft?.supplies"
          @updated="loadDraft"
        />
      </KeepAlive>

      <KeepAlive>
        <Translate
          v-if="activeStep === 3"
          :key="draftId"
          :draft="draft"
          @updated="loadDraft"
        />
      </KeepAlive>

      <KeepAlive>
        <Complete
          v-if="activeStep === 4"
          :key="draftId"
          :draft="draft"
          @updated="loadDraft"
        />
      </KeepAlive>
    </div>
 
  </div>
</template>

<script setup lang="ts">
import MarkdownEditor from '@/components/editor/markdown/index.vue'
import Preprocess from '@/pages/pattern/draft/detail/preprocess/index.vue'
import InfoCompletion from '@/pages/pattern/draft/detail/info/index.vue'
import Translate from '@/pages/pattern/draft/detail/translate/index.vue'
import Complete from '@/pages/pattern/draft/detail/complete/index.vue'
import type { ApiResponse } from '~/types/ApiResponse'

definePageMeta({
  layout: 'empty'
})

type PatternDraftDetail = {
  id: number
  title: string
  description?: string | null
  supplies?: any | null
  status: string
  state: number
  raw_content: string | null
  revised_content: string | null
  result_content: string | null
  meta: any | null
  info?: any | null
  updated_at: string | Date
}

const route = useRoute()
const draftId = computed(() => {
  const v = Number(route.query.id)
  return Number.isFinite(v) && v > 0 ? v : 0
})

const draft = ref<PatternDraftDetail | null>(null)

const steps = ['预处理', '人工审核中', '信息补全', '翻译校对', '完成'] as const
const activeStep = ref(0)

const getStepByState = (state: number) => {
  if (state >= 0 && state <= 3) return 0
  if (state === 4) return 1
  if (state === 5) return 2
  if (state === 6) return 3
  if (state === 7) return 4
  return 0
}

const currentStep = computed(() => getStepByState(Number(draft.value?.state) || 0))

const setActiveStep = (idx: number) => {
  if (idx < 0 || idx > currentStep.value) return
  activeStep.value = idx
}

const markdown = ref('')

const goBack = () => navigateTo('/pattern/draft')

let loadSeq = 0

const loadDraft = async () => {
  if (!draftId.value) return

  const seq = ++loadSeq

  try {
    const res = await $fetch<ApiResponse<{ draft: PatternDraftDetail }>>(`/api/pattern/draft/${draftId.value}`, {
      method: 'GET',
    })

    if (seq !== loadSeq) return

    if (!res?.success || !res.data?.draft) {
      throw new Error(res?.message || '加载草稿失败')
    }

    draft.value = res.data.draft
    activeStep.value = currentStep.value
    markdown.value = String(draft.value.revised_content ?? draft.value.raw_content ?? '')
  } catch (e) {
    if (seq !== loadSeq) return
    console.error('加载 Draft 详情失败:', e)
    draft.value = null
    activeStep.value = 0
    markdown.value = ''
  }
}

onMounted(loadDraft)
watch(draftId, loadDraft)
</script>
<style scoped lang="scss">

  .go-back-btn {
    cursor: pointer;
    transition: all 0.2s ease;
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    &:hover {
      background-color: var(--color-neutral-100);
    }

  }

  .draft-container {
    height: 100vh;
    width: 100vw;

    .draft-header {
      height: 50px;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      gap: 20px;
      border-bottom: 1px solid var(--color-neutral-100);

      .header-title {
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .draft-body {
      height: calc(100vh - 50px);
      width: 100vw;
    }

    .draft-panel {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-neutral-500);
      font-size: 14px;
    }
  }

  .custom-steps {
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    border-radius: 50px;
    height: 30px;
    gap: 20px;

    .step-item {
      cursor: pointer;
      line-height: 1;
      border-radius: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-neutral-400);
      font-weight: 300;

      &.active {
        color: var(--color-success);
        font-weight: 600;
      }
    }
  }

</style>