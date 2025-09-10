# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 组件文档

### Upload 图片上传组件

位置：`/app/components/upload/index.vue`

一个功能完整的图片上传组件，支持拖拽上传、点击上传、图片预览，并且允许外部自定义样式。

#### 🎯 核心功能
- **多种上传方式**：支持点击上传和拖拽上传
- **图片预览**：实时预览已选择的图片
- **文件验证**：支持文件类型、大小、数量限制
- **进度显示**：上传进度条（可选）
- **响应式设计**：适配移动端

#### 🎨 样式定制
- **外部样式**：通过 `customClass` prop 自定义样式
- **插槽支持**：`hint` 插槽自定义上传提示内容
- **主题适配**：默认样式支持浅色主题，易于扩展

#### 📝 使用示例

```vue
<template>
  <!-- 基础用法 -->
  <Upload v-model="files" @upload="handleUpload" />
  
  <!-- 多文件上传 -->
  <Upload 
    v-model="files"
    :multiple="true"
    :max-count="5"
    :max-size="5"
    custom-class="my-upload"
    @change="handleChange"
    @error="handleError"
  />
  
  <!-- 自定义提示内容 -->
  <Upload v-model="files">
    <template #hint>
      <div class="custom-hint">
        <Icon name="upload" />
        <p>上传您的设计图片</p>
      </div>
    </template>
  </Upload>
</template>

<script setup>
const files = ref([])

const handleUpload = (file) => {
  console.log('上传文件:', file)
}

const handleChange = (files) => {
  console.log('文件列表变化:', files)
}

const handleError = (error) => {
  console.error('上传错误:', error)
}
</script>

<style>
.my-upload {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
}
</style>
```

#### 🔧 Props 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `v-model` | `File[]` | `[]` | 双向绑定的文件列表 |
| `accept` | `string` | `'image/*'` | 接受的文件类型 |
| `multiple` | `boolean` | `false` | 是否支持多选 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `maxSize` | `number` | `10` | 最大文件大小(MB) |
| `maxCount` | `number` | `1` | 最大文件数量 |
| `customClass` | `string` | `''` | 自定义样式类名 |

#### 📡 Events 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `change` | `files: File[]` | 文件列表变化时触发 |
| `upload` | `file: File` | 单个文件上传时触发 |
| `remove` | `file: File, index: number` | 移除文件时触发 |
| `error` | `error: string` | 发生错误时触发 |

#### 🔌 暴露的方法

通过 `ref` 可以调用以下方法：

```vue
<template>
  <Upload ref="uploadRef" v-model="files" />
  <button @click="clearAll">清空所有文件</button>
  <button @click="triggerUpload">手动触发上传</button>
</template>

<script setup>
const uploadRef = ref()
const files = ref([])

const clearAll = () => {
  uploadRef.value?.clearFiles()
}

const triggerUpload = () => {
  uploadRef.value?.triggerFileInput()
}
</script>
```

| 方法 | 参数 | 说明 |
|------|------|------|
| `triggerFileInput()` | - | 手动触发文件选择对话框 |
| `removeImage(index)` | `index: number` | 移除指定索引的图片 |
| `clearFiles()` | - | 清空所有文件 |

#### 💡 使用技巧

1. **文件类型限制**：
   ```vue
   <!-- 只允许 PNG 和 JPG -->
   <Upload accept="image/png,image/jpeg" />
   
   <!-- 允许所有图片格式 -->
   <Upload accept="image/*" />
   ```

2. **样式自定义**：
   ```vue
   <Upload custom-class="custom-upload" />
   
   <style>
   .custom-upload {
     border: 2px solid #3b82f6;
     border-radius: 12px;
     background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
   }
   </style>
   ```

3. **错误处理**：
   ```vue
   <Upload 
     @error="handleError"
     :max-size="2"
     :max-count="3"
   />
   
   <script setup>
   const handleError = (error) => {
     // 显示用户友好的错误提示
     ElMessage.error(error)
   }
   </script>
   ```

这个组件提供了完整的图片上传功能，支持高度自定义，可以满足各种业务场景的需求。



