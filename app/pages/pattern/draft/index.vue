<template>
  <div class="default-container">
    <PageHeader title="Pattern Drafts" :breadcrumbs="breadcrumbs">
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
      <button class="btn btn-sm btn-neutral">
        <icon name="hugeicons:plus-sign-square" size="16" />
        <span>New Draft</span>
      </button>
    </PageHeader>

    <div>
        <button class="btn btn-sm btn-neutral" @click="goToDetail">Detail</button>
    </div>
      
  </div>
</template>

<script setup lang="ts">
import Empty from "@/components/common/empty/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import type { ApiResponse } from "~/types/ApiResponse";

const breadcrumbs = [
  { label: "Home", to: "/", icon: "solar:home-2-outline" },
  { label: "Patterns", icon: "solar:emoji-funny-circle-outline" },
  { label: "Drafts" },
];

const router = useRouter()
const goToDetail = () => {
  router.push('/pattern/draft/detail')
}



</script>
<style scoped lang="scss">

</style>