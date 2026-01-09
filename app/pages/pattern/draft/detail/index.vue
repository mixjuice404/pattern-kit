<template>
  <div class="draft-container">
    <div class="draft-header">
      <div class="header-title">Draft Detail</div>
      <div>
        <div class="custom-steps">
          <div
            v-for="(label, idx) in steps"
            :key="label"
            class="step-item"
            :class="{ active: idx <= activeStep }"
            @click="activeStep = idx"
          >
            {{ label }}
          </div>
        </div>
      </div>
      <div class="header-button">
        <div class="header-button__preview">Preview</div>
      </div>
    </div>

    <!-- 草稿内容操作区 -->
    <div class="draft-body">
      <Preprocess v-show="activeStep === 0" />
      <MarkdownEditor v-show="activeStep === 1" v-model:markdown="markdown" />
      <div v-show="activeStep === 2" class="draft-panel">标准化</div>
      <div v-show="activeStep === 3" class="draft-panel">审核中</div>
      <div v-show="activeStep === 4" class="draft-panel">已通过</div>
    </div>
 
  </div>
</template>

<script setup lang="ts">
import MarkdownEditor from '@/components/editor/markdown/index.vue'
import Preprocess from '@/pages/pattern/draft/detail/preprocess/index.vue'


definePageMeta({
  layout: 'empty'
})

const steps = ['预处理', '修订中', '标准化', '审核中', '已通过'] as const
const activeStep = ref(0)

const markdown = ref('# Hello Markdown')

</script>
<style scoped lang="scss">

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