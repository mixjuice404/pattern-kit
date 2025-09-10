<template>
  <div 
    :class="[
      'upload-container',
      { 'upload-dragover': isDragOver, 'upload-disabled': disabled },
      customClass
    ]"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="triggerFileInput"
  >
    <!-- 文件输入框 -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleFileChange"
      class="upload-input"
    />
    
    <!-- 上传区域内容 -->
    <div class="upload-content">
      <!-- 已上传图片预览 -->
      <div v-if="previewImages.length > 0" class="upload-preview">
        <div 
          v-for="(image, index) in previewImages" 
          :key="index" 
          class="preview-item shadow"
        >
          <img :src="image.url" :alt="image.name" class="preview-image" />
          <!-- 上传状态指示器 -->
          <div class="upload-status">
            <icon v-if="image.uploadStatus === 'success'" name="solar:check-square-bold" size="18" style="color: oklch(72.3% 0.219 149.579);" />
            <icon v-else-if="image.uploadStatus === 'error'" name="solar:shield-warning-bold-duotone" size="18" style="color: oklch(70.5% 0.213 47.604)" />
          </div>
          <div class="preview-overlay">
            <button 
              @click.stop="removeImage(index)"
              class="remove-btn"
              :disabled="disabled"
            >
              <icon name="solar:trash-bin-trash-bold" size="18" />
            </button>
            <!-- 非自动上传模式下显示上传按钮 -->
            <!-- <button 
              v-if="autoUpload && image.uploadStatus === 'pending'"
              @click.stop="uploadFile(index)"
              class="upload-btn"
              :disabled="disabled"
            >
              ↑
            </button> -->
          </div>
          
          <span class="preview-name">{{ image.name }}</span>
        </div>
      </div>
      
      <!-- 上传提示区域 -->
      <div v-if="previewImages.length === 0 || multiple" class="upload-hint">
        <slot name="hint">
          <div class="default-hint">
            <icon name="solar:cloud-upload-broken" size="28" class="upload-icon" />
            <p class="hint-text">
              {{ isDragOver ? '释放文件以上传' : '点击或拖拽图片到此处上传' }}
            </p>
            <p class="hint-desc" v-if="accept">
              支持格式：{{ accept.replace(/image\//g, '').toUpperCase() }}
            </p>
          </div>
        </slot>
      </div>
    </div>
    
    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <div class="radial-progress text-primary" 
            style="--size:3.5rem; font-size: 12px"
           :style="{ '--value': Math.round(progress) }" 
           :aria-valuenow="Math.round(progress)"
           aria-valuemin="0"
           aria-valuemax="100"
           role="progressbar">
        {{ Math.round(progress) }}%
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitUploadNetworkError,
  ImageKitServerError
} from '@imagekit/vue'

interface PreviewImage {
  file?: File  // 改为可选，支持纯URL预览
  url: string
  name: string
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error' | 'initial'
  uploadResult?: any
  isFromUrl?: boolean  // 标识是否来自URL
}

interface Props {
  // 接受的文件类型
  accept?: string
  // 是否支持多选
  multiple?: boolean
  // 是否禁用
  disabled?: boolean
  // 最大文件大小（MB）
  maxSize?: number
  // 最大文件数量
  maxCount?: number
  // 自定义样式类名
  customClass?: string
  // 已有的文件列表
  modelValue?: File[]
  // 是否自动上传
  autoUpload?: boolean
  // 新增上传标识符
  uploadId?: string 
  // 新增：初始预览URL
  initialUrl?: string
}

interface Emits {
  (e: 'update:modelValue', files: File[]): void
  (e: 'change', files: File[]): void
  (e: 'upload', file: File): void
  (e: 'remove', uploadId: string, file: File | null, index: number, isUrl?: boolean): void  // 扩展参数
  (e: 'error', error: string): void
  (e: 'upload-success', uploadId: string, result: any, file: File): void
  (e: 'upload-error', uploadId: string, error: any, file: File): void
  // 移除 url-removed 事件
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
  multiple: false,
  disabled: false,
  maxSize: 10, // 10MB
  maxCount: 1,
  customClass: '',
  autoUpload: true
})

const emit = defineEmits<Emits>()

// 响应式数据
const fileInputRef = ref<HTMLInputElement>()
const isDragOver = ref(false)
const uploading = ref(false)
const progress = ref(0)
const previewImages = ref<PreviewImage[]>([])

// ImageKit 认证函数
async function authenticate() {
  const res = await fetch('/api/auth/upload/imagekit')
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`认证请求失败: ${res.status} ${errorText}`)
  }
  
  const text = await res.text()
  if (!text) {
    throw new Error('服务器返回空响应')
  }
  
  try {
    const data = JSON.parse(text)
    return data as {
      signature: string; expire: number; token: string; publicKey: string
    }
  } catch (e) {
    console.error('JSON parse failed:', text)
    throw new Error(`响应格式错误: ${text}`)
  }
}

// ImageKit 上传函数
async function uploadToImageKit(file: File): Promise<any> {
  let creds
  try {
    creds = await authenticate()
  } catch (e) {
    console.error('Auth failed', e)
    throw e
  }

  try {
    const resp = await upload({
      ...creds,
      file,
      fileName: file.name,
      folder: '/pattern', 
      overwriteFile: true, // 允许覆盖同名文件
      onProgress: (e) => {
        progress.value = (e.loaded / e.total) * 100
      }
    })
    return resp
  } catch (err) {
    if (err instanceof ImageKitAbortError) {
      console.warn('Upload aborted')
    } else if (err instanceof ImageKitInvalidRequestError) {
      console.error('Bad request')
    } else if (err instanceof ImageKitUploadNetworkError) {
      console.error('Network error')
    } else if (err instanceof ImageKitServerError) {
      console.error('Server side error')
    } else {
      console.error('Upload error:', err)
    }
    throw err
  }
}

// 在现有watch之前添加初始URL处理
watch(() => props.initialUrl, (newUrl) => {
  if (newUrl && previewImages.value.length === 0) {
    const fileName = newUrl.split('/').pop() || 'image'
    previewImages.value = [{
      url: newUrl,
      name: fileName,
      uploadStatus: 'initial',
      isFromUrl: true
    }]
  } else if (!newUrl) {
    // 清除URL预览
    previewImages.value = previewImages.value.filter(img => !img.isFromUrl)
  }
}, { immediate: true })

// 监听外部传入的文件列表
watch(() => props.modelValue, (newFiles) => {
  if (newFiles && newFiles.length > 0) {
    updatePreviewImages(newFiles)
  }
}, { immediate: true })

// 更新预览图片
const updatePreviewImages = (files: File[]) => {
  previewImages.value = files.map(file => ({
    file,
    url: URL.createObjectURL(file),
    name: file.name,
    uploadStatus: 'pending'
  }))
}

// 验证文件
const validateFile = (file: File): string | null => {
  // 检查文件类型
  if (props.accept && !file.type.match(props.accept.replace(/\*/g, '.*'))) {
    return `不支持的文件类型：${file.type}`
  }
  
  // 检查文件大小
  if (file.size > props.maxSize * 1024 * 1024) {
    return `文件大小超过限制：${props.maxSize}MB`
  }
  
  return null
}

// 处理单个文件上传
const handleSingleFileUpload = async (file: File, index: number, forceUpload = false) => {
  if (!props.autoUpload && !forceUpload) return
  
  const previewImage = previewImages.value[index]
  if (!previewImage) return
  
  previewImage.uploadStatus = 'uploading'
  uploading.value = true
  progress.value = 0
  
  try {
    const result = await uploadToImageKit(file)
    previewImage.uploadStatus = 'success'
    previewImage.uploadResult = result
    emit('upload-success', props.uploadId || 'default', result, file)
  } catch (error) {
    previewImage.uploadStatus = 'error'
    emit('upload-error', props.uploadId || 'default', error, file)
    emit('error', `上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    uploading.value = false
    progress.value = 0
  }
}

// 手动上传文件（用于非自动上传模式）
const uploadFile = async (index: number) => {
  const previewImage = previewImages.value[index]
  if (!previewImage || previewImage.uploadStatus === 'uploading') return
  
  // 类型守卫：确保有file对象才能上传
  if (!previewImage.file) {
    emit('error', '无法上传：这是URL预览，不是文件')
    return
  }
  
  // 强制执行上传
  await handleSingleFileUpload(previewImage.file, index, true)
}

// 同时修改handleFiles中的上传调用
const handleFiles = async (files: FileList | File[]) => {
  const fileArray = Array.from(files)
  const validFiles: File[] = []
  
  for (const file of fileArray) {
    const error = validateFile(file)
    if (error) {
      emit('error', error)
      continue
    }
    
    validFiles.push(file)
  }
  
  if (validFiles.length === 0) return
  
  // 检查文件数量限制
  const currentFiles = previewImages.value
    .map(img => img.file)
    .filter((file): file is File => file !== undefined) // 类型守卫，过滤undefined
  let newFiles = props.multiple ? [...currentFiles, ...validFiles] : validFiles
  
  if (newFiles.length > props.maxCount) {
    newFiles = newFiles.slice(0, props.maxCount)
    emit('error', `最多只能上传 ${props.maxCount} 个文件`)
  }
  
  updatePreviewImages(newFiles)
  emit('update:modelValue', newFiles)
  emit('change', newFiles)
  
  // 触发单个文件上传事件
  validFiles.forEach((file, index) => {
    emit('upload', file)
    // 如果是自动上传，开始上传
    if (props.autoUpload) {
      const fileIndex = props.multiple ? currentFiles.length + index : index
      // 这里file肯定存在，所以可以直接传递
      handleSingleFileUpload(file, fileIndex)
    }
  })
}

// 文件输入框变化
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFiles(target.files)
  }
  // 清空输入框，允许重复选择同一文件
  target.value = ''
}

// 拖拽处理
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (!props.disabled) {
    isDragOver.value = true
  }
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (props.disabled) return
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFiles(files)
  }
}

// 触发文件选择
const triggerFileInput = () => {
  if (!props.disabled && fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// 移除图片
const removeImage = (index: number) => {
  const removedImage = previewImages.value[index]
  
  if (!removedImage) {
    console.warn(`Invalid index: ${index}. No image found at this position.`)
    return
  }
  
  previewImages.value.splice(index, 1)
  
  // 只有File对象才需要释放URL
  if (removedImage.file && !removedImage.isFromUrl) {
    URL.revokeObjectURL(removedImage.url)
  }
  
  // 更新modelValue（只包含File对象）
  const newFiles = previewImages.value
    .filter(img => img.file)
    .map(img => img.file!)
  
  emit('update:modelValue', newFiles)
  emit('change', newFiles)
  
  // 统一的remove事件，通过isUrl参数区分类型
  emit('remove', 
    props.uploadId || 'default', 
    removedImage.file || null,  // URL预览时file为null
    index, 
    removedImage.isFromUrl || false  // 标识是否为URL预览
  )
}

// 清理资源
onUnmounted(() => {
  previewImages.value.forEach(image => {
    URL.revokeObjectURL(image.url)
  })
})

// 暴露方法给父组件
defineExpose({
  triggerFileInput,
  removeImage,
  uploadFile,
  clearFiles: () => {
    previewImages.value.forEach(image => {
      URL.revokeObjectURL(image.url)
    })
    previewImages.value = []
    emit('update:modelValue', [])
    emit('change', [])
  }
})
</script>

<style scoped lang="scss">
.upload-container {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  
  &:hover {
    border-color: #3b82f6;
    background-color: #f8faff;
  }
  
  &.upload-dragover {
    border-color: #3b82f6;
    background-color: #eff6ff;
    transform: scale(1.02);
  }
  
  &.upload-disabled {
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
      border-color: #d1d5db;
      background-color: #fafafa;
    }
  }
}

.upload-input {
  display: none;
}

.upload-content {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-preview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  
  .preview-item {
    position: relative;
    width: 100%;

    border-radius: 6px;
    overflow: hidden;
    
    
    &.upload-pending {
      border-color: #f59e0b;
    }
    
    &.upload-uploading {
      border-color: #3b82f6;
      animation: pulse 2s infinite;
    }
    
    &.upload-success {
      border-color: #10b981;
    }
    
    &.upload-error {
      border-color: #ef4444;
    }
    
    .preview-image {
      width: 100%;
      height: 90px;
      object-fit: cover;
    }
    
    .preview-overlay {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      display: flex;
      justify-content: flex-end;
      background: rgba(255, 255, 255, 0.8);
      padding: 2px 2px;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      
      
      .remove-btn, .upload-btn {
        border: none;
        width: 20px;
        height: 20px;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: .7;

        &:hover {
          color:oklch(63.7% 0.237 25.331);
        }
      
        
        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }
      
      // .remove-btn {
      //   border-radius: 50%;
      // }
      
      .upload-btn {
        background: rgba(59, 130, 246, 0.9);
        border-radius: 0 0 0 6px;
        
        &:hover {
          background: rgba(59, 130, 246, 1);
        }
      }
    }
    
    .upload-status {
      position: absolute;
      top: 2px;
      left: 2px;
      font-size: 10px;
    }
    
    .preview-name {
      display: block;
      padding: 6px 4px;
      font-size: 10px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: #fff;
    }
  }

  .preview-item:hover .preview-overlay {
    opacity: 0.8;
  }
}

.upload-hint {

  padding: 15px;

  .default-hint {
    opacity: 0.7;
    .upload-icon {
      margin-bottom: 5px;
    }
    
    .hint-text {
      font-size: 12px;
      color: #374151;
      margin: 0 0 2px;
      font-weight: 500;
    }
    
    .hint-desc {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }
  }
}

.upload-progress {
  border-radius: 6px;
  position: absolute;
  bottom: 0px;
  top: 0;
  left: 0px;
  right: 0px;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(3px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .progress-bar {
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
    
    .progress-fill {
      height: 100%;
      background: #3b82f6;
      transition: width 0.3s ease;
    }
  }
  
  .progress-text {
    font-size: 12px;
    color: #6b7280;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 640px) {
  .upload-container {
    padding: 16px;
  }
  
  .upload-preview {
    .preview-item {
      width: 80px;
      height: 100px;
      
      .preview-image {
        height: 64px;
      }
    }
  }
}
</style>

