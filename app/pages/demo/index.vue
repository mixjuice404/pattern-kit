<template>
  <div>
    <h1>Test Page</h1>

    <div style="padding: 20px; width: 340px">
      <Upload 
        style="margin-bottom: 10px;"
        ref="uploadRef"
        v-model="files"
        :multiple="true" 
        :max-count="5"
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
      />
      
      <!-- 手动上传按钮 -->
      <button class="btn btn-primary" style="width: 100%;" @click="handleManualUpload" :disabled="files.length === 0">
        开始上传
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Upload from '~/components/upload/index.vue'

const uploadRef = ref()
const files = ref<File[]>([])

// 手动触发上传
const handleManualUpload = () => {
  if (uploadRef.value && files.value.length > 0) {
    console.log("进入上传通道 ============")
    // 上传第一个文件（索引为 0）
    uploadRef.value.uploadFile(0)
  }
}

const handleUploadSuccess = (uploadId: string, result: any, file: File) => {
  console.log('Upload success', result, file)
}

const handleUploadError = (uploadId: string, err: Error, file: File) => {
  console.error('Upload error', err, file)
}
</script>
<style scoped lang="scss">
</style>