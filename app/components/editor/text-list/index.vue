<template>
  <div class="input-item">
    <div class="input-label" style="margin-bottom: 8px; display: flex; align-items: center; gap: 5px">
      <input type="checkbox" :checked="true" class="checkbox checkbox-success checkbox-xs" />
      <div>{{ label }}</div>
    </div>
    
    <!-- 可选的标题输入框 -->
    <div v-if="needTitle" style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
      <input 
        type="text" 
        class="input" 
        style="width: 100%;" 
        :placeholder="titlePlaceholder" 
        v-model="localTitle"
      />
    </div>
    
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
      <input 
        type="text" 
        class="input" 
        style="width: 100%;" 
        :placeholder="textPlaceholder" 
        v-model="localValue.text"
      />
      <button class="btn btn-soft btn-primary" @click="addListItem">
        <icon name="hugeicons:add-01" />
      </button>
    </div>
    <div v-for="(item, index) in localValue.list" :key="index" style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
      <div>
        <icon name="solar:minus-square-bold" style="flex-shrink: 0; opacity: 0.5;" class="remove-btn" size="20" @click="removeListItem(index)" />
      </div>
      <input 
        type="text" 
        class="input" 
        style="width: 100%;" 
        :placeholder="listPlaceholder" 
        v-model="localValue.list[index]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextListData } from '~/types/PatternInfo'

// Props 定义
interface Props {
  modelValue: TextListData
  title?: string
  label: string
  needTitle?: boolean
  titlePlaceholder?: string
  textPlaceholder?: string
  listPlaceholder?: string
}

// Emits 定义
interface Emits {
  (e: 'update:modelValue', value: TextListData): void
  (e: 'update:title', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  needTitle: false,
  titlePlaceholder: 'Enter title...',
  textPlaceholder: 'Enter description...',
  listPlaceholder: 'Enter list item...'
})

const emit = defineEmits<Emits>()

// 本地响应式数据
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 标题的双向绑定
const localTitle = computed({
  get: () => props.title,
  set: (value) => emit('update:title', value)
})

// 添加新的列表项
const addListItem = () => {
  const newList = [...localValue.value.list, '']
  localValue.value = {
    ...localValue.value,
    list: newList
  }
}

// 删除指定索引的列表项
const removeListItem = (index: number) => {
  if (index >= 0 && index < localValue.value.list.length) {
    const newList = localValue.value.list.filter((_, i) => i !== index)
    localValue.value = {
      ...localValue.value,
      list: newList
    }
  }
}
</script>

<style scoped lang="scss">
.remove-btn {
  cursor: pointer;
  &:hover {
    color: #ef4444;
    opacity: 1;
  }
}

.input-item {
    margin-bottom: 25px;

    .input-label {
        font-size: 12px;
        font-weight: 500;
        opacity: 0.6;
    }
}
</style>