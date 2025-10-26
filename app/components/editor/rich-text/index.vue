<template>
  <div class="border border-base-300 rounded-lg overflow-hidden bg-base-100">
    <!-- 工具栏 -->
    <div class="flex items-center gap-1 p-2 border-b border-base-300 bg-base-200" v-if="editor">
      <div class="flex items-center gap-1">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="editor.isActive('bold') ? 'btn btn-primary btn-sm w-8 h-8 p-0 min-h-0' : 'btn btn-ghost btn-sm w-8 h-8 p-0 min-h-0'"
          type="button"
        >
          <Icon name="heroicons:bold" />
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="editor.isActive('italic') ? 'btn btn-primary btn-sm w-8 h-8 p-0 min-h-0' : 'btn btn-ghost btn-sm w-8 h-8 p-0 min-h-0'"
          type="button"
        >
          <Icon name="heroicons:italic" />
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :class="editor.isActive('strike') ? 'btn btn-primary btn-sm w-8 h-8 p-0 min-h-0' : 'btn btn-ghost btn-sm w-8 h-8 p-0 min-h-0'"
          type="button"
        >
          <Icon name="heroicons:strikethrough" />
        </button>
      </div>
      
      <div class="w-px h-6 bg-base-300 mx-2"></div>
      
      <div class="flex items-center gap-1">
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="editor.isActive('bulletList') ? 'btn btn-primary btn-sm w-8 h-8 p-0 min-h-0' : 'btn btn-ghost btn-sm w-8 h-8 p-0 min-h-0'"
          type="button"
        >
          <Icon name="heroicons:list-bullet" />
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="editor.isActive('orderedList') ? 'btn btn-primary btn-sm w-8 h-8 p-0 min-h-0' : 'btn btn-ghost btn-sm w-8 h-8 p-0 min-h-0'"
          type="button"
        >
          <Icon name="heroicons:numbered-list" />
        </button>
      </div>
      
      <div class="w-px h-6 bg-base-300 mx-2"></div>
      
      <div class="flex items-center gap-1">
        <button
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().chain().focus().undo().run()"
          :class="!editor.can().chain().focus().undo().run() ? 'btn btn-ghost btn-sm w-8 h-8 p-0 min-h-0 opacity-50 cursor-not-allowed' : 'btn btn-ghost btn-sm w-8 h-8 p-0 min-h-0'"
          type="button"
        >
          <Icon name="heroicons:arrow-uturn-left" />
        </button>
        <button
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().chain().focus().redo().run()"
          :class="!editor.can().chain().focus().redo().run() ? 'btn btn-ghost btn-sm w-8 h-8 p-0 min-h-0 opacity-50 cursor-not-allowed' : 'btn btn-ghost btn-sm w-8 h-8 p-0 min-h-0'"
          type="button"
        >
          <Icon name="heroicons:arrow-uturn-right" />
        </button>
      </div>
    </div>
    
    <!-- 编辑器内容区域 -->
    <EditorContent 
      :editor="editor" 
      class="w-full"
      :style="{ minHeight: `${rows * 1.5}rem` }"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  rows?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Start typing...',
  rows: 10
})

const emit = defineEmits<Emits>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    })
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-full p-4',
      placeholder: props.placeholder
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue, false)
  }
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
:deep(.ProseMirror) {
  outline: none;
  padding: 1rem;
  min-height: 100%;
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: 0;
  white-space: pre-wrap;
}

:deep(.ProseMirror p) {
  margin: 0 0 0.5rem 0;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: rgba(156, 163, 175, 0.5);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.ProseMirror ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
}

:deep(.ProseMirror ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

:deep(.ProseMirror li) {
  margin-bottom: 0.25rem;
}

:deep(.ProseMirror strong) {
  font-weight: bold;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
}
</style>