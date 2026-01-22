<template>
  <div class="markdown-container">
    <div class="markdown-editor">
      <div class="markdown-header">
        <div class="editor-header">
            <div class="header-title">Editor</div>
            <div class="flex items-center">
                <div class="flex items-center header-button" @click="saveRevisedContent">
                    <icon name="hugeicons:file-upload" size="16" />
                    <div>Update</div>
                </div>
            </div>
        </div>
      </div>
      <textarea
        ref="editorEl"
        v-model="localMarkdown"
        class="markdown-textarea"
        @scroll="onScroll('editor')"
      />
    </div>
    
    <div class="markdown-preview">
      <div class="markdown-header">
        <div class="preview-header">
            <div class="header-title">Preview</div>
            <div class="flex items-center gap-2">
              <button class="btn btn-primary btn-sm" @click="stitchWindowOpen = true">针法元数据 <span v-if="!stitches?.length">⚠️</span></button>
              <button
                class="btn btn-neutral btn-sm"
                :disabled="!draftId || savingStatus"
                @click="goToInfoCompletion">
                  {{ savingStatus ? '处理中...' : '保存 & 下一步：信息补全' }}
              </button>
            </div>
        </div>
      </div>
      <div
        ref="previewEl"
        v-html="preview"
        class="markdown-preview-content prose prose-sm max-w-none"
        @scroll="onScroll('preview')"
      />
    </div>

    <!-- Report 悬浮窗 -->
    <ReportWindow :items="reportItems" />

    <!-- Stitch 悬浮窗 -->
    <div
      v-if="stitchWindowOpen"
      class="stitch-window shadow-lg"
      :style="{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: `translate3d(calc(-50% + ${stitchDx}px), calc(-50% + ${stitchDy}px), 0)`,
        userSelect: stitchDragging ? 'none' : 'auto',
      }"
      @pointerdown="onStitchPointerDown"
      @pointermove="onStitchPointerMove"
      @pointerup="onStitchPointerUp"
      @pointercancel="onStitchPointerUp">
      
      <div class="window-header">
        <div class="header-title">针法元数据校验</div>
        <div class="flex items-center justify-center cursor-pointer" data-stitch-no-drag @click="stitchWindowOpen = false">
          <icon name="solar:close-square-bold" size="22" />
        </div>
      </div>
      <div style="padding: 10px; min-height: 260px;">
        <table class="table table-sm">
          <!-- head -->
          <thead>
            <tr>
              <th>Alias</th>
              <th>Us terms</th>
              <th>Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!stitchRows.length">
              <td colspan="4" style="text-align: center; padding: 30px 0;">
                <div style="margin-bottom: 20px; opacity: 0.6; font-size: 14px;">暂无 Stitches 数据</div>
                <button class="btn btn-primary btn-sm" :disabled="!draftId || extractingStitches" @click="extractStitches">
                  {{ extractingStitches ? '提取中...' : '提取针法数据' }}
                </button>
              </td>
            </tr>
            <tr v-else v-for="it in stitchRows" :key="it.key">
              <td>{{ it.alias }}</td>
              <td><input v-model="it.usTerms" type="text" class="input input-sm" /></td>
              <td>{{ it.title }}</td>
              <td>{{ it.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center gap-2 justify-end" style="padding: 10px;">
        <button class="btn btn-soft" :disabled="!draftId || extractingStitches" @click="extractStitches">
          {{ extractingStitches ? '提取中...' : '重试' }}
        </button>
        <button class="btn btn-neutral" :disabled="!draftId || savingStitches" @click="saveStitches">
          {{ savingStitches ? '保存中...' : '保存并关闭' }}
        </button>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import MarkdownIt from "markdown-it";
import ReportWindow from '@/components/editor/window/report/index.vue'
import type { ApiResponse } from "~/types/ApiResponse";
import { useAppToast } from '~/composables/useAppToast';

const toast = useAppToast()

type ScrollSource = "editor" | "preview";

type ReportViewItem = {
  key: string
  location: string
  badgeText: string
  badgeClass: string
  original: string
  suggestion: string
}

const editorEl = ref<HTMLTextAreaElement | null>(null);
const previewEl = ref<HTMLElement | null>(null);

const route = useRoute();
const draftId = computed(() => {
  const v = Number(route.query.id);
  return Number.isFinite(v) && v > 0 ? v : 0;
});

const info = ref<any | null>(null);
const stitches = ref<any | null>(null);
const stitchWindowOpen = ref(false)
const extractingStitches = ref(false)
const savingStitches = ref(false)

const toText = (v: any) => (v == null ? "" : typeof v === "string" ? v : String(v));

const pickText = (obj: any, keys: string[]) => {
  if (!obj || typeof obj !== "object") return "";
  for (const k of keys) {
    const s = toText((obj as any)[k]).trim();
    if (s) return s;
  }
  return "";
};

const normalizeSeverity = (v: any) => {
  const s = toText(v).trim().toLowerCase();
  if (!s) return "info";
  if (s.includes("error") || s.includes("fail") || s.includes("invalid")) return "error";
  if (s.includes("warn")) return "warning";
  if (s.includes("success") || s.includes("pass") || s.includes("ok")) return "success";
  return "info";
};

const badgeClassBySeverity = (sev: string) => {
  if (sev === "error") return "badge-error";
  if (sev === "warning") return "badge-warning";
  if (sev === "success") return "badge-success";
  return "badge-neutral";
};

const reportItems = computed<ReportViewItem[]>(() => {
  const report = (info.value as any)?.report;
  const list = Array.isArray(report) ? report : [];

  return list.map((r: any, idx: number) => {
    const location =
      pickText(r, [
        "location",
        "loc",
        "position",
        "where",
        "round",
        "step",
        "title",
        "node",
      ]) || `#${idx + 1}`;

    const sev = normalizeSeverity(pickText(r, ["severity", "level", "type", "status", "result"]));
    const original = pickText(r, ["original", "source", "expr", "expression", "text", "content", "pattern"]);
    const suggestion = pickText(r, [
      "suggestion",
      "message",
      "analysis",
      "reason",
      "advice",
      "fix",
      "detail",
      "description",
    ]);

    return {
      key: `${idx}-${location}`,
      location,
      badgeText: pickText(r, ["label", "severity", "level", "type", "status", "result"]) || sev,
      badgeClass: badgeClassBySeverity(sev),
      original: original || "-",
      suggestion: suggestion || "-",
    };
  });
});

type StitchRow = {
  key: string
  alias: string
  usTerms: string
  title: string
  description: string
}

const stitchRows = ref<StitchRow[]>([])

const normalizeStitchList = (v: any) => {
  if (Array.isArray(v?.items)) return v.items
  if (Array.isArray(v?.stitches)) return v.stitches
  if (Array.isArray(v)) return v
  return []
}

watch(
  stitches,
  () => {
    const list = normalizeStitchList(stitches.value)
    stitchRows.value = list.map((s: any, idx: number) => {
      const alias = pickText(s, ['alias', 'abbrev', 'us_abbrev', 'notation', 'symbol']) || `#${idx + 1}`
      const usTerms = pickText(s, ['us', 'us_terms', 'en', 'en_alias', 'term']) || '-'
      const title = pickText(s, ['title', 'name', 'chinese', 'defaultName']) || '-'
      const description = pickText(s, ['description', 'us_description', 'desc', 'detail']) || '-'
      return { key: `${idx}-${alias}`, alias, usTerms, title, description }
    })
  },
  { immediate: true }
)

const stitchDx = ref(0)
const stitchDy = ref(0)
const stitchDragging = ref(false)

let stitchStart = { x: 0, y: 0, dx: 0, dy: 0 }
let stitchPointerId: number | null = null
let stitchMoved = false

const onStitchPointerDown = (e: PointerEvent) => {
  const target = e.target as HTMLElement | null
  if (target?.closest('[data-stitch-no-drag], button, input, textarea, select, a')) return
  if (stitchPointerId != null) return
  stitchPointerId = e.pointerId
  stitchMoved = false
  stitchStart = { x: e.clientX, y: e.clientY, dx: stitchDx.value, dy: stitchDy.value }
  ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
}

const onStitchPointerMove = (e: PointerEvent) => {
  if (stitchPointerId !== e.pointerId) return

  const nextDx = stitchStart.dx + (e.clientX - stitchStart.x)
  const nextDy = stitchStart.dy + (e.clientY - stitchStart.y)

  if (!stitchMoved && Math.abs(nextDx - stitchStart.dx) + Math.abs(nextDy - stitchStart.dy) < 3) return

  stitchMoved = true
  stitchDragging.value = true
  stitchDx.value = nextDx
  stitchDy.value = nextDy
  e.preventDefault()
}

const onStitchPointerUp = (e: PointerEvent) => {
  if (stitchPointerId !== e.pointerId) return
  stitchDragging.value = false
  stitchPointerId = null
}

const extractStitches = async () => {
  if (!draftId.value || extractingStitches.value) return

  extractingStitches.value = true
  try {
    const res = await $fetch<ApiResponse<{ info: any }>>(`/api/pattern/draft/stitches/meta/${draftId.value}`, {
      method: 'POST',
    })

    if (!res?.success) {
      throw new Error(res?.message || '提取针法元数据失败')
    }

    stitches.value = (res as any)?.data?.info ?? null
    toast.success('针法元数据已提取')
  } catch (e) {
    console.error('提取针法元数据失败:', e)
    toast.error((e as any)?.message || '提取针法元数据失败')
  } finally {
    extractingStitches.value = false
  }
}

const saveStitches = async () => {
  if (!draftId.value || savingStitches.value) return

  savingStitches.value = true
  try {
    const items = stitchRows.value.map((it) => ({
      alias: it.alias,
      us_terms: it.usTerms,
      title: it.title,
      description: it.description,
    }))

    const nextStitches = {
      ...(typeof stitches.value === 'object' && stitches.value ? stitches.value : {}),
      timestamp: Date.now(),
      items,
    }

    const res = await $fetch<ApiResponse<{ id: any }>>('/api/pattern/draft/update', {
      method: 'POST',
      body: {
        id: draftId.value,
        stitches: nextStitches,
      },
    })

    if (!res?.success) {
      throw new Error(res?.message || '保存失败')
    }

    stitches.value = nextStitches
    stitchWindowOpen.value = false
    toast.success('已保存')
  } catch (e) {
    console.error('保存 stitches 失败:', e)
    toast.error((e as any)?.message || '保存失败')
  } finally {
    savingStitches.value = false
  }
}

const loadInfo = async () => {
  if (!draftId.value) {
    info.value = null;
    stitches.value = null;
    return;
  }

  const res = await $fetch<ApiResponse<{ draft: { info: any | null; stitches: any | null } }>>(`/api/pattern/draft/${draftId.value}`, {
    method: "GET",
  });

  if (!res?.success) {
    info.value = null;
    return;
  }

  const draft = (res as any)?.data?.draft

  const rawInfo = draft?.info
  if (typeof rawInfo === "string") {
    const s = rawInfo.trim();
    if (s) {
      try {
        info.value = JSON.parse(s);
      } catch {
        info.value = { text: rawInfo };
      }
    } else {
      info.value = null
    }
  } else {
    info.value = rawInfo ?? null;
  }

  const rawStitches = draft?.stitches
  if (typeof rawStitches === 'string') {
    const s = rawStitches.trim()
    if (s) {
      try {
        stitches.value = JSON.parse(s)
      } catch {
        stitches.value = null
      }
    } else {
      stitches.value = null
    }
  } else {
    stitches.value = rawStitches ?? null
  }
};

watch(
  draftId,
  () => {
    void loadInfo();
  },
  { immediate: true }
);

let syncing = false;

const onScroll = (source: ScrollSource) => {
  if (syncing) return;

  const src = source === "editor" ? editorEl.value : previewEl.value;
  const dst = source === "editor" ? previewEl.value : editorEl.value;
  if (!src || !dst) return;

  const srcScrollHeight = src.scrollHeight;
  const srcClientHeight = src.clientHeight;
  const srcMax = Math.max(0, srcScrollHeight - srcClientHeight);
  const ratio = srcMax ? src.scrollTop / srcMax : 0;

  const dstScrollHeight = dst.scrollHeight;
  const dstClientHeight = dst.clientHeight;
  const dstMax = Math.max(0, dstScrollHeight - dstClientHeight);

  syncing = true;
  requestAnimationFrame(() => {
    dst.scrollTop = ratio * dstMax;
    syncing = false;
  });
};

const props = defineProps({
  markdown: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "update:markdown", value: string): void
  (e: "updated"): void
}>();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

const localMarkdown = ref(props.markdown);
const preview = ref(md.render(localMarkdown.value));

const savingRevisedContent = ref(false)
const saveRevisedContent = async () => {
  if (!draftId.value || savingRevisedContent.value) return

  savingRevisedContent.value = true
  try {
    const res = await $fetch<ApiResponse<{ id: any }>>('/api/pattern/draft/update', {
      method: 'POST',
      body: {
        id: draftId.value,
        revised_content: localMarkdown.value,
      },
    })

    if (!res?.success) {
      throw new Error(res?.message || '更新失败')
    }

    toast.success('更新成功')
  } catch (e) {
    console.error('更新 revised_content 失败:', e)
  } finally {
    savingRevisedContent.value = false
  }
}

const savingStatus = ref(false)
const goToInfoCompletion = async () => {
  if (!draftId.value || savingStatus.value) return

  savingStatus.value = true
  try {
    const res = await $fetch<ApiResponse<{ id: any; status: any }>>('/api/pattern/draft/review/confirm', {
      method: 'POST',
      body: {
        id: draftId.value,
        status: 'info_completion',
      },
    })

    if (!res?.success) {
      throw new Error(res?.message || '更新状态失败')
    }

    toast.success('已进入信息补全')
    emit('updated')
  } catch (e) {
    console.error('更新 status 失败:', e)
  } finally {
    savingStatus.value = false
  }
}

watch(
  () => props.markdown,
  (newVal) => {
    const next = String(newVal ?? "");
    if (next !== localMarkdown.value) localMarkdown.value = next;
  }
);

watch(
  localMarkdown,
  (val) => {
    const next = String(val ?? "");
    preview.value = md.render(next);
    emit("update:markdown", next);
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.stitch-window {
  z-index: 900;
  background-color: #ffffff;
  border-radius: 6px;
  width: 750px;
  min-height: 260px;
  touch-action: none;

  .window-header {
    padding: 12px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 6px 6px 0 0;
    font-size: 14px;
    font-weight: 600;
    background-color: var(--color-primary);
    color: #ffffff;
  }
}

.markdown-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  width: 100%;
  position: relative;
}

.markdown-header {
  width: 100%;
  color: #ffffff;

  .header-title {
    font-size: 14px;
    font-weight: 600;
  }

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

  .header-button__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;
    cursor: pointer;
    
    &:hover {
      background-color: var(--color-neutral-200);
    }
  }

  .editor-header {
    padding: 10px 15px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--color-neutral-700);
  }
  .preview-header {
    padding: 10px 15px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--color-neutral-100);
    color: var(--color-neutral-800);
  }

}

.markdown-editor {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  textarea:focus {
    outline: none;
  }

  .markdown-textarea {
    width: 100%;
    flex: 1;
    min-height: 0;
    display: block;
    box-sizing: border-box;
    resize: none;
    overflow-y: auto;
    overflow-x: hidden;
    overflow-wrap: anywhere;
    background-color: var(--color-neutral-800);
    padding: 30px 20px;
    color: #ffffff;
  }
}

.markdown-preview {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;

  .markdown-preview-content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 30px 20px;
  }
}
</style>
