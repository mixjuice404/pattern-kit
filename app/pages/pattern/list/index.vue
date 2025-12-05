<template>
  <div class="default-container">
    <PageHeader title="Patterns List" :breadcrumbs="breadcrumbs">
      <!-- <button
        class="btn btn-sm btn-primary"
        :disabled="loading"
        :class="{ loading }"
        @click="load"
      >
        <icon name="solar:refresh-square-broken" size="18" />
        <span>{{ loading ? "Loading" : "Reload" }}</span>
      </button> -->
      <!-- <button class="btn btn-sm btn-primary" @click="goToSettings">
        <icon name="solar:settings-broken" size="18" />
        <span>Settings</span>
      </button> -->
      <button class="btn btn-sm btn-neutral" @click="goCreate">
        <icon name="hugeicons:plus-sign-square" size="16" />
        <span>New Pattern</span>
      </button>
    </PageHeader>

    <div>
      <!-- 加载占位骨架屏 -->
      <div v-if="loading" class="grid grid-cols-4 2xl:grid-cols-5 gap-4">
        <div v-for="n in 6" :key="n" class="card bg-base-100 shadow">
          <div class="skeleton h-40 w-full"></div>
          <div class="card-body">
            <div class="skeleton h-5 w-2/3"></div>
            <div class="skeleton h-4 w-1/3"></div>
          </div>
        </div>
      </div>

      <div v-else>
        <div v-if="list.length" class="grid grid-cols-4 2xl:grid-cols-5 gap-4">
          <div
            v-for="item in list"
            :key="item.id"
            class="default-card"
            @click="goDetail(item.id)"
          >
            <figure v-if="item.cover_image">
              <img
                :src="item.cover_image"
                alt=""
                class="h-45 2xl:h-46 w-full card-image"
              />
            </figure>
            <div class="card-content">
              <div class="shadow-lg card-id"># {{ item.id }}</div>
              <div class="card-title">
                <div class="card-title__text">{{ item.title }}</div>
                <div class="card-title__subtext">
                  {{ formatDate(item.updated_at) }}
                </div>
              </div>
              <div
                class="card-actions"
                style="
                  display: flex;
                  align-items: center;
                  gap: 5px;
                  justify-content: flex-end;
                "
              >
                <div>
                  <button
                    class="btn btn-sm btn-link text-primary"
                    @click.stop="preview(item.id)"
                  >
                    <icon name="solar:eye-linear" size="18" />
                  </button>
                  <button
                    class="btn btn-sm btn-link text-error"
                    :disabled="deletingIds.has(item.id)"
                    @click.stop="removeItem(item.id)"
                  >
                    <span
                      v-if="deletingIds.has(item.id)"
                      class="loading loading-spinner loading-xs"
                    ></span>
                    <icon v-else name="solar:trash-bin-2-broken" size="18" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Empty v-else notice="No patterns found." text="Try adjusting filters or add a new pattern." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Empty from "@/components/common/empty/index.vue";

type ApiResponse<T> = {
  success: boolean;
  errorCode: string | null;
  data: T;
  message: string;
};

type PatternItem = {
  id: number;
  title: string;
  cover_image: string | null;
  updated_at: string; // 后端 Date 序列化后是 ISO 字符串
};

const list = ref<PatternItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await $fetch<ApiResponse<PatternItem[]>>("/api/pattern/list", {
      method: "GET",
    });
    if (res?.success && Array.isArray(res.data)) {
      list.value = res.data;
    } else {
      error.value = res?.message || "Unexpected response";
    }
  } catch (e: any) {
    error.value = e?.message || "Request failed";
  } finally {
    loading.value = false;
  }
};

onMounted(load);
const router = useRouter();
const goDetail = (id: number) => router.push(`/pattern/editor/${id}`);
const goCreate = () => navigateTo("/pattern/editor/add");
const goToSettings = () => navigateTo("/setting");

// 记录正在删除的 id，避免重复点击
const deletingIds = ref<Set<number>>(new Set());

// 删除函数：确认 -> 请求删除 -> 本地移除
const removeItem = async (id: number) => {
  if (deletingIds.value.has(id)) return;
  const ok = confirm("确定删除该 Pattern 吗？此操作不可撤销。");
  if (!ok) return;

  deletingIds.value.add(id);
  try {
    await $fetch(`/api/pattern/remove/${id}`, { method: "POST" });
    // 本地移除
    list.value = list.value.filter((i: any) => i.id !== id);
  } catch (e) {
    console.error("Delete failed:", e);
  } finally {
    deletingIds.value.delete(id);
  }
};

const preview = (id: number) => router.push(`/pattern/preview/${id}`);

const breadcrumbs = [
  { label: "Home", to: "/", icon: "solar:home-2-outline" },
  { label: "Patterns", icon: "solar:emoji-funny-circle-outline" },
  { label: "All List" },
];
</script>
<style scoped lang="scss">
.pattern-page {
  padding: 0;
}
.pattern-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.cover {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
  background: #f4f4f4;
}
.title {
  font-weight: 600;
}
.sub {
  color: #666;
  font-size: 12px;
}
</style>
