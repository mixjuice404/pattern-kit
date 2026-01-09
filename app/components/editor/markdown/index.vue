<template>
  <div class="markdown-container">
    <div class="markdown-editor">
      <div class="markdown-header">
        <div class="editor-header">
            <div class="header-title">Editor</div>
            <div class="flex items-center">
                <div class="flex items-center header-button">
                    <icon name="hugeicons:file-upload" size="16" />
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
                <div class="flex items-center header-button__preview">
                    <icon name="hugeicons:arrow-expand" size="16" />
                </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import MarkdownIt from "markdown-it";

type ScrollSource = "editor" | "preview";

const editorEl = ref<HTMLTextAreaElement | null>(null);
const previewEl = ref<HTMLElement | null>(null);

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

const emit = defineEmits<{ (e: "update:markdown", value: string): void }>();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const localMarkdown = ref(props.markdown);
const preview = ref(md.render(localMarkdown.value));

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
.markdown-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  width: 100%;
  gap: 10px;
}

.markdown-header {
  width: 100%;
  color: #ffffff;

  .header-title {
    font-size: 14px;
    font-weight: 600;
  }

  .header-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px;
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
    background-color: var(--color-neutral-800);
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
    background-color: var(--color-neutral-700);
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
