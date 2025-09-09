<template>
  <div class="workspase-panel">
    <div class="panel-editor">
        <div style="display: flex; align-items: center; padding-left: 15px">
            <icon
              style="cursor: pointer;"
              name="solar:square-alt-arrow-left-broken"
              size="18"
              @click="router.push('/')"
            />
            <h2 class="font-semibold py-1" style="padding: 15px; font-size: 20px;">Crochet Pattern Editor</h2>
        </div>
      <Eidtor :pattern-info="patternInfo" />
      <div class="floating-item">
        <button
          class="btn btn-neutral btn-block"
          :disabled="isUploading"
          @click="onUpload">
          {{ isUploading ? 'Saving...' : 'Save Changes' }}
        </button>
        <button
          class="btn btn-neutral btn-block"
          :disabled="isUploading"
          @click="onPreview">
          Preview
        </button>
      </div>
    </div>
    <div class="panel-preview">
      <div id="pdf-content" class="preview-body w-full 2xl:w-[1200px]">
        <BaseTemplate
          style="width: 100%;"
          :padding-x="90"
          :padding-y="90"
          :pattern-data="patternInfo"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseTemplate from '~/components/template/base/index.vue'
import Eidtor from '~/components/editor/index.vue'
import { PatternInfo } from '~/types/PatternInfo'

const route = useRoute()
const router = useRouter()

// 编辑态：根据路由参数 id 加载详情
const patternInfo = reactive(new PatternInfo())
const isUploading = ref(false)
const patternId = ref<number | null>(null)

const loadDetail = async (id: number) => {
  try {
    const res = await $fetch(`/api/pattern/${id}`)
    const pattern = res?.data?.pattern
    if (!pattern) return

    patternId.value = pattern.id ?? id
    if (pattern.title) patternInfo.title = pattern.title

    if (pattern.pattern_json) {
      const raw = typeof pattern.pattern_json === 'string'
        ? JSON.parse(pattern.pattern_json)
        : pattern.pattern_json
      const info = PatternInfo.fromJSON(raw)
      Object.assign(patternInfo, info)
    }
  } catch (e) {
    console.error('Load detail failed:', e)
  }
}

onMounted(() => {
  const idParam = Number(route.params.id)
  if (!Number.isNaN(idParam)) {
    loadDetail(idParam)
  } else {
    console.warn('Invalid editor id param:', route.params.id)
  }
})

onBeforeUnmount(() => {
  isUploading.value = false
})

const onUpload = async (): Promise<number | null> => {
  if (isUploading.value) return null
  isUploading.value = true
  try {
    const res = await $fetch('/api/pattern/edit', {
      method: 'POST',
      body: {
        id: patternId.value, // 编辑页：始终带 id -> 更新
        title: patternInfo.title,
        pattern_json: patternInfo.toJSON(),
      },
    })
    if (res?.data?.id) patternId.value = res.data.id
    console.log('Saved pattern id:', patternId.value)
    return patternId.value ?? null
  } catch (err) {
    console.error('Save failed:', err)
    return null
  } finally {
    isUploading.value = false
  }
}

const onPreview = async () => {
  if (isUploading.value) return
  const savedId = await onUpload()
  const targetId = savedId ?? patternId.value
  if (targetId) {
    router.push(`/preview/${targetId}`)
  } else {
    console.warn('Preview aborted: no pattern id available.')
  }
}
</script>

<style scoped lang="scss">
.workspase-panel {
  height: 100vh;
  display: flex;

  .panel-editor {
    flex-shrink: 0;
    width: 29vw;
    height: 100vh;
    background-color: $light-color;
    line-height: 1;
    display: flex;
    flex-direction: column;
    position: relative;

    .floating-item {
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      box-sizing: border-box;
      padding: 15px;
      padding-top: 20px;
      width: 100%;
      background-image: linear-gradient(to bottom, transparent, $light-color);
    }
  }

  .panel-preview {
    flex-grow: 1;
    height: 100vh;
    padding: 20px;
    padding-bottom: 100px;
    position: relative;
    background-color: #ffffff;
    overflow-y: auto;

    .preview-body {
      border: 1px dashed #e5e5e5;
      border-radius: 4px;
    }
  }
}
</style>