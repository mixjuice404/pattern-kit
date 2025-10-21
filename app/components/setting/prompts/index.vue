<template>
  <div>
    <h3 class="text-lg font-bold mb-4">提示词模板设置</h3>

    <!-- tabs 分成两个 一个是图解生成模板 一个是数据标准化模板 -->
    <div class="flex items-center gap-4 mb-4" style="font-size: 12px; font-weight: 500;">
        <div 
            v-for="tabItem in tabs" 
            :key="tabItem.key"
            style="padding: 5px 0; cursor: pointer;"
            :class="{'border-blue-500 border-b-2': tab === tabItem.key}" 
            @click="tab = tabItem.key">
            {{ tabItem.label }}
        </div>
    </div>

    <div class="prompt-editor">
      <label class="block text-sm font-medium mb-2">{{ tab === 'graph' ? '图解生成模板' : '数据标准化模板' }}</label>
      <div 
        ref="promptEditor"
        contenteditable="true"
        class="editable-div"
        @input="onPromptChange"
        @blur="savePrompt"
      ></div>
      <div class="mt-2 text-xs text-gray-500">
        支持 HTML 格式，按 Ctrl+S 或失去焦点时自动保存；<strong>&#123;&#123; 变量名 &#125;&#125;</strong>  为占位符，用于动态替换
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const tab = ref('pattern') // 默认选中图解生成模板
const promptEditor = ref<HTMLElement>()
const promptTemplate = ref('')
const templateId = ref<number | null>(null)

const tabs = [
  { key: 'pattern', label: '图解生成模板' },
  { key: 'normalize', label: '数据标准化模板' }
]

// 从服务器获取模板
const loadTemplate = async (alias: string) => {
  try {
    const { data } = await $fetch(`/api/pattern/prompt/${alias}`)
    if (data?.template) {
      promptTemplate.value = data.template.template
      templateId.value = data.template.id
      if (promptEditor.value) {
        promptEditor.value.textContent = promptTemplate.value
      }
    }
  } catch (error) {
    console.error('加载模板失败:', error)
  }
}

const onPromptChange = (event: Event) => {
  const target = event.target as HTMLElement
  promptTemplate.value = target.textContent || ''
}

const savePrompt = async () => {
  try {
    const currentTab = tabs.find(t => t.key === tab.value)
    await $fetch('/api/pattern/prompt/edit', {
      method: 'POST',
      body: {
        id: templateId.value,
        name: currentTab?.label || 'Default Template',
        template: promptTemplate.value,
        description: `${currentTab?.label || '默认'}提示词模板`,
        alias: tab.value
      }
    })
    console.log('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 页面加载时从服务器读取
onMounted(() => {
  loadTemplate(tab.value)
})

// 监听 tab 切换，自动加载对应模板
watch(tab, (newTab) => {
  // 切换时先清空当前内容
  templateId.value = null
  promptTemplate.value = ''
  if (promptEditor.value) {
    promptEditor.value.textContent = ''
  }
  loadTemplate(newTab)
})

// 监听 Ctrl+S 快捷键
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      savePrompt()
    }
  }
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>
<style scoped lang="scss">
.prompt-editor {
  .editable-div {
    min-height: 300px;
    max-height: 58vh;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: #ffffff;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    overflow-y: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &:hover {
      border-color: #9ca3af;
    }
    
    // 占位符样式
    &:empty:before {
      content: '请输入提示词模板...';
      color: #9ca3af;
      font-style: italic;
    }
  }
}
</style>
