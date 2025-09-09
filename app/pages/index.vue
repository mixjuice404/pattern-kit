<template>
  <div class="pattern-page">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Crochet Patterns</h2>
      <div style="display: flex; align-items: center; gap: 10px">
        <button class="btn btn-primary" @click="load" :disabled="loading" :class="{ loading }">
            {{ loading ? 'Loading' : 'Reload' }}
        </button>
        <button class="btn btn-neutral" @click="goCreate">New Pattern</button>
      </div>
      
    </div>

    <div v-if="error" class="alert alert-error mb-4">
      <span>{{ error }}</span>
    </div>

    <!-- 加载占位骨架屏 -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="card bg-base-100 shadow">
        <div class="skeleton h-40 w-full"></div>
        <div class="card-body">
          <div class="skeleton h-5 w-2/3"></div>
          <div class="skeleton h-4 w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- 列表卡片 -->
    <div v-else>
      <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div v-for="item in list" :key="item.id"
             class="card bg-base-100 shadow cursor-pointer hover:shadow-lg transition"
             @click="goDetail(item.id)">
          <figure v-if="item.cover_image">
            <img :src="item.cover_image" alt="" class="h-40 w-full object-cover" />
          </figure>
          <div class="card-body">
            <h3 class="card-title">
              {{ item.title }}
              <div class="badge badge-ghost">#{{ item.id }}</div>
            </h3>
            <p class="text-sm text-base-content/60">Updated: {{ formatDate(item.updated_at) }}</p>

            <!-- 新增：卡片操作区 -->
            <div class="card-actions justify-end mt-2">
              <button
                class="btn btn-error btn-xs"
                :disabled="deletingIds.has(item.id)"
                @click.stop="removeItem(item.id)"
              >
                <span v-if="deletingIds.has(item.id)" class="loading loading-spinner loading-xs"></span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="alert alert-info">
        <span>No data</span>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
type ApiResponse<T> = {
  success: boolean
  errorCode: string | null
  data: T
  message: string
}

type PatternItem = {
  id: number
  title: string
  cover_image: string | null
  updated_at: string // 后端 Date 序列化后是 ISO 字符串
}

const list = ref<PatternItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const formatDate = (iso: string) => new Date(iso).toLocaleString()

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<ApiResponse<PatternItem[]>>('/api/pattern/list', { method: 'GET' })
    if (res?.success && Array.isArray(res.data)) {
      list.value = res.data
    } else {
      error.value = res?.message || 'Unexpected response'
    }
  } catch (e: any) {
    error.value = e?.message || 'Request failed'
  } finally {
    loading.value = false
  }
}

onMounted(load)
  const router = useRouter()
  const goDetail = (id: number) => router.push(`/editor/${id}`)
  const goCreate = () => navigateTo('/editor/add')

  // 记录正在删除的 id，避免重复点击
  const deletingIds = ref<Set<number>>(new Set())

  // 删除函数：确认 -> 请求删除 -> 本地移除
  const removeItem = async (id: number) => {
    if (deletingIds.value.has(id)) return
    const ok = confirm('确定删除该 Pattern 吗？此操作不可撤销。')
    if (!ok) return

    deletingIds.value.add(id)
    try {
      await $fetch(`/api/pattern/remove/${id}`, { method: 'POST' })
      // 本地移除
      list.value = list.value.filter((i: any) => i.id !== id)
    } catch (e) {
      console.error('Delete failed:', e)
      alert('删除失败，请稍后重试')
    } finally {
      deletingIds.value.delete(id)
    }
  }
</script>
<style scoped lang="scss">
.pattern-page { padding: 16px; }
.pattern-item { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eee; }
.cover { width: 64px; height: 64px; object-fit: cover; border-radius: 4px; background: #f4f4f4; }
.title { font-weight: 600; }
.sub { color: #666; font-size: 12px; }
</style>
