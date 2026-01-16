<template>
  <div class="default-container">
    <PageHeader
      title="Prompts Builder"
      :breadcrumbs="breadcrumbs">
       <button class="btn btn-sm btn-neutral" @click="openPromptTplModal">
        <icon name="solar:add-circle-bold" size="18" />
        <span>New Prompt</span>
      </button>
    </PageHeader>

    <div style=" background-color: #fff; border-radius: 8px; padding: 10px;">
      <table class="table">
        <!-- head -->
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Alias</th>
            <th>Description</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="listLoading">
            <td colspan="6">Loading...</td>
          </tr>
          <tr v-else-if="!templates.length">
            <td colspan="6">No Data</td>
          </tr>
          <tr v-else v-for="(t, idx) in templates" :key="t.id" class="hover:bg-base-200 hover:cursor-pointer" @click="openEditPrompt(t.id)">
            <th>{{ idx + 1 }}</th>
            <td>{{ t.name }}</td>
            <td>{{ t.alias }}</td>
            <td>-</td>
            <td>{{ formatUpdatedAt(t.updated_at) }}</td>
          </tr>
        </tbody>
      </table>


      <!-- <div style="display: grid; grid-template-columns: 160px auto; gap: 20px;">
        
        <div class="sidebar-menus">

                v-for="tabItem in tabs" 
                :key="tabItem.key"
                class="menus-item"
                :class="{'active text-primary': tab === tabItem.key}" 
                @click="tab = tabItem.key">
                <icon :name="tabItem.icon" size="16" />
                <div>{{ tabItem.label }}</div>
            </div>
        </div>

        <div class="prompt-editor">
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
      </div> -->
    </div>


    <PromptTemplateModal
      ref="promptTplModalRef"
      :title="editId ? 'Edit Prompt' : 'Add Prompt'"
      subtitle="Manage definition and multi-language terminology"
      v-model:name="editName"
      v-model:alias="editAlias"
      v-model:template="editTemplate"
      @update="saveEditPrompt"
    />

</div>
</template>
<script setup lang="ts">
import Pagination from "@/components/common/pagination/index.vue";
import PromptTemplateModal from "@/components/modal/prompt/template/index.vue";
import type { ApiResponse } from "~/types/ApiResponse";

definePageMeta({
  layout: 'default'
})

const breadcrumbs = [
  { label: 'Home', to: '/', icon: 'solar:home-2-outline' },
  { label: 'AI Config', icon: 'hugeicons:ai-brain-03' },
  { label: 'Prompts', icon: 'hugeicons:command-line' }
]

type PromptTemplateListItem = {
  id: number
  name: string
  alias: string
  updated_at: string | Date
}

const templates = ref<PromptTemplateListItem[]>([])
const listLoading = ref(false)

const formatUpdatedAt = (v: any) => {
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString()
}

type PromptTemplateModalExpose = {
  open: () => void
  close: () => void
}

const promptTplModalRef = ref<PromptTemplateModalExpose | null>(null)

type PromptTemplateDetail = {
  id: number
  name: string
  alias: string
  template: string
}

const editId = ref<number | null>(null)
const editName = ref('')
const editAlias = ref('')
const editTemplate = ref('')

const resetEditForm = () => {
  editId.value = null
  editName.value = ''
  editAlias.value = ''
  editTemplate.value = ''
}

const openPromptTplModal = () => {
  resetEditForm()
  promptTplModalRef.value?.open()
}

const openEditPrompt = async (id: number) => {
  editId.value = id
  editName.value = ''
  editAlias.value = ''
  editTemplate.value = ''
  promptTplModalRef.value?.open()

  try {
    const res = await $fetch<ApiResponse<{ template: PromptTemplateDetail }>>(`/api/pattern/prompt/id/${id}`, {
      method: 'GET',
    })

    if (!res?.success || !res?.data?.template) {
      throw new Error(res?.message || '加载详情失败')
    }

    editId.value = res.data.template.id
    editName.value = res.data.template.name || ''
    editAlias.value = res.data.template.alias || ''
    editTemplate.value = res.data.template.template || ''
  } catch (error) {
    console.error('加载 Prompt 详情失败:', error)
  }
}

const saveEditPrompt = async () => {
  const name = editName.value.trim()
  const alias = editAlias.value.trim()
  const template = editTemplate.value.trim()

  if (!name || !alias || !template) return

  try {
    const res = await $fetch<ApiResponse<{ id: number }>>('/api/pattern/prompt/edit', {
      method: 'POST',
      body: {
        ...(editId.value != null ? { id: editId.value } : {}),
        name,
        alias,
        template,
      },
    })

    if (!res?.success) {
      throw new Error(res?.message || '保存失败')
    }

    promptTplModalRef.value?.close()
    await loadTemplateList()
  } catch (error) {
    console.error('保存 Prompt 失败:', error)
  }
}

const loadTemplateList = async () => {
  listLoading.value = true
  try {
    const res = await $fetch<
      ApiResponse<{ list: PromptTemplateListItem[]; total: number; page: number; pageSize: number }>
    >('/api/pattern/prompt/list', {
      method: 'GET',
      query: { page: 1, pageSize: 50 },
    })

    if (!res?.success) {
      throw new Error(res?.message || '加载列表失败')
    }

    templates.value = Array.isArray(res.data?.list) ? res.data.list : []
  } catch (error) {
    console.error('加载 Prompt 列表失败:', error)
    templates.value = []
  } finally {
    listLoading.value = false
  }
}

const tab = ref('pattern') // 默认选中图解生成模板
const promptEditor = ref<HTMLElement>()
const promptTemplate = ref('')
const templateId = ref<number | null>(null)

const tabs = [
  { key: 'pattern', label: '图解生成模板', icon: 'solar:emoji-funny-circle-outline' },
  { key: 'normalize', label: '数据标准化模板', icon: 'hugeicons:ai-folder-02' }
]

// 从服务器获取模板
const loadTemplate = async (alias: string) => {
  try {
    const { data } = await $fetch<any>(`/api/pattern/prompt/${alias}`)
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
  loadTemplateList()
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
    max-height: 65vh;
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