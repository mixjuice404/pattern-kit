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
            <div class="flex items-center">
                <button
                  class="btn btn-neutral btn-sm"
                  :disabled="!draftId || savingStatus"
                  @click="goToInfoCompletion"
                >
                    {{ savingStatus ? '处理中...' : '下一步：信息补全' }}
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

    <!-- 悬浮窗 -->
    <div
      ref="floatingEl"
      class="floating-window"
      :style="{
        position: 'fixed',
        right: `${ANCHOR}px`,
        bottom: `${ANCHOR}px`,
        transform: `translate3d(${dx}px, ${dy}px, 0)`,
        userSelect: dragging ? 'none' : 'auto',
      }"
    >
      <div>
        <div>
          <div
            class="window-title"
            :class="{ collapsed: !windowBodyOpen }"
            @click="toggleWindowBody"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          >
            <div>🛠 校验与修正报告</div>
            <div class="window-badge">{{ reportItems.length }}</div>
          </div>
          <div v-show="windowBodyOpen" class="window-body" style="max-height: 25vw; overflow-y: auto;">
            <div v-if="!reportItems.length" class="body-empty">No report items</div>
            <div v-else class="body-item" v-for="item in reportItems" :key="item.key">
              <div class="item-title">
                <div class="item-location">
                  <icon name="solar:pin-circle-bold" size="18" />
                  <div>{{ item.location }}</div>
                </div>
                <div class="badge badge-sm" :class="item.badgeClass">{{ item.badgeText }}</div>
              </div>
              <div class="item-content">
                <div class="item-original">{{ item.original }}</div>
                <div class="item-suggestion">{{ item.suggestion }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onMounted, watch } from "vue";
import MarkdownIt from "markdown-it";
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

const loadInfo = async () => {
  if (!draftId.value) {
    info.value = null;
    return;
  }

  const res = await $fetch<ApiResponse<{ draft: { info: any | null } }>>(`/api/pattern/draft/${draftId.value}`, {
    method: "GET",
  });

  if (!res?.success) {
    info.value = null;
    return;
  }

  const raw = (res as any)?.data?.draft?.info;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) {
      info.value = null;
      return;
    }
    try {
      info.value = JSON.parse(s);
    } catch {
      info.value = { text: raw };
    }
    return;
  }

  info.value = raw ?? null;
};

watch(
  draftId,
  () => {
    void loadInfo();
  },
  { immediate: true }
);

const ANCHOR = 20

const floatingEl = ref<HTMLElement | null>(null)
const dx = ref(0)
const dy = ref(0)
const dragging = ref(false)
const windowBodyOpen = ref(false)

let justDragged = false
const toggleWindowBody = () => {
  if (justDragged) return
  windowBodyOpen.value = !windowBodyOpen.value
}

const size = ref({ w: 0, h: 0 })
const updateSize = () => {
  const el = floatingEl.value
  if (!el) return
  size.value = { w: el.offsetWidth, h: el.offsetHeight }
}

const clamp = () => {
  const w = size.value.w
  const h = size.value.h
  const vw = window.innerWidth
  const vh = window.innerHeight

  const minX = w + ANCHOR - vw
  const maxX = ANCHOR
  const minY = h + ANCHOR - vh
  const maxY = ANCHOR

  dx.value = Math.min(Math.max(dx.value, Math.min(minX, maxX)), Math.max(minX, maxX))
  dy.value = Math.min(Math.max(dy.value, Math.min(minY, maxY)), Math.max(minY, maxY))
}

let start = { x: 0, y: 0, dx: 0, dy: 0 }
let activePointerId: number | null = null
let moved = false

const onPointerDown = (e: PointerEvent) => {
  if (activePointerId != null) return
  activePointerId = e.pointerId
  moved = false
  start = { x: e.clientX, y: e.clientY, dx: dx.value, dy: dy.value }
  ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (activePointerId !== e.pointerId) return

  const nextDx = start.dx + (e.clientX - start.x)
  const nextDy = start.dy + (e.clientY - start.y)

  if (!moved && Math.abs(nextDx - start.dx) + Math.abs(nextDy - start.dy) < 3) return

  moved = true
  dragging.value = true
  dx.value = nextDx
  dy.value = nextDy
  clamp()
  e.preventDefault()
}

const onPointerUp = (e: PointerEvent) => {
  if (activePointerId !== e.pointerId) return

  if (moved) {
    justDragged = true
    setTimeout(() => {
      justDragged = false
    }, 0)
  }

  dragging.value = false
  activePointerId = null
}

let ro: ResizeObserver | null = null
const onViewportResize = () => {
  updateSize()
  clamp()
}

onMounted(() => {
  updateSize()
  clamp()

  const el = floatingEl.value
  if (el) {
    ro = new ResizeObserver(() => {
      updateSize()
      clamp()
    })
    ro.observe(el)
  }

  window.addEventListener('resize', onViewportResize)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  window.removeEventListener('resize', onViewportResize)
})

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
  (e: "goToInfoCompletion"): void
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
    const res = await $fetch<ApiResponse<{ id: any; status: any }>>('/api/pattern/draft/status/update', {
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
    emit('goToInfoCompletion')
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
.floating-window {
  z-index: 1000;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  touch-action: none;

  .window-badge {
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
    background-color: var(--color-success);
    padding: 4px 6px;
    line-height: 1;
    border-radius: 4px;
    font-weight: 400;
  }

  .window-title {
    display: flex;
    align-items: center;
    background-color: var(--color-primary);
    border-radius: 6px 6px 0 0;
    color: #ffffff;
    justify-content: space-between;
    padding: 10px 15px;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &.collapsed {
      border-radius: 6px;
    }

    &:active {
      opacity: 0.9;
    }
  }

  .window-body {
    max-height: 35vw;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 10px 0;

    &::-webkit-scrollbar {
      display: none;
    }

    .body-item {
      font-size: 12px;
      min-width: 320px;
      max-width: 480px;
      padding: 10px 15px;
      font-weight: 400;
      &:hover {
        background-color: var(--color-neutral-100);
      }

      .item-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        justify-content: space-between;
        margin-bottom: 10px;

        .item-location {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }

      .item-content {
        border: 1px dashed var(--color-neutral-300);
        padding: 5px 10px;
        border-radius: 4px;
      }

      .item-original {
        padding: 5px 0;
        font-weight: 600;
        font-style: italic;
      }
    }
  }
}

.markdown-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  width: 100%;
  gap: 10px;
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
