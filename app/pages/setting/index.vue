<template>
  <div class="container mx-auto"  style="padding: 16px;">
    <div class="flex items-center justify-between mb-10">
      <div style="display: flex; align-items: center; gap: 20px;">
        <icon @click="goBack" name="solar:square-alt-arrow-left-broken" size="22" style="cursor: pointer;" />
        <h2 class="text-2xl font-bold">Settings</h2>
      </div>
      
     </div>
    <div style="display: grid; grid-template-columns: 18vw auto; grid-gap: 20px;">
      <div class="shadow-sm rounded-md" style="background-color: #ffffff; padding: 12px;">
        <div class="sidebar-group">
          <div class="sidebar-item" :class="{ active: activeMenu === 'prompt' }" @click="activeMenu = 'prompt'">提示词模板 Prompt</div>
          <div class="sidebar-item" :class="{ active: activeMenu === 'template' }" @click="activeMenu = 'template'">模板设置 Template</div>
          <div class="sidebar-item" :class="{ active: activeMenu === 'general' }" @click="activeMenu = 'general'">通用 General</div>
        </div>
      </div>
      <div class="shadow-sm rounded-md" style="background-color: #ffffff; padding: 20px;">
        <div v-if="activeMenu === 'prompt'">
           <!-- 提示词模板内容 -->
          <Prompts />
        </div>
        
        <div v-if="activeMenu === 'template'">
          <h3 class="text-lg font-bold mb-4">模板设置</h3>
          <p class="text-gray-600 mb-4">配置默认使用的模板样式</p>
          <!-- 模板设置内容 -->
        </div>
        
        <div v-if="activeMenu === 'general'">
          <h3 class="text-lg font-bold mb-4">通用设置</h3>
          <p class="text-gray-600 mb-4">配置应用的通用选项</p>
          <!-- 通用设置内容 -->
        </div>
      </div>

    </div>
    
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import Prompts from '@/components/setting/prompts/index.vue'



const router = useRouter()
const activeMenu = ref('prompt') // 默认选中"提示词模板"

const goBack = () => {
  router.back()
}
</script>
<style lang="scss" scoped>

.sidebar-group {

  display: flex;
  flex-direction: column;
  gap: 5px;

  .sidebar-item {
    padding: 10px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }

    &.active {
      background-color: #0f172a;
      color: #ffffff;
    }
  }

}

</style>
