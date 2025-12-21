<template>
  <div class="flex items-center justify-between">
    <div class="text-sm opacity-70">Total {{ total }} items</div>
    <div class="join">
      <button
        class="btn btn-sm join-item"
        :disabled="page <= 1"
        @click="$emit('change', page - 1)"
      >
        Prev
      </button>
      <button class="btn btn-sm join-item" disabled>
        Page {{ page }} / {{ totalPages }}
      </button>
      <input
        class="input input-sm input-bordered join-item w-20 text-center"
        type="number"
        :min="1"
        :max="totalPages"
        v-model.number="pageInput"
        @keyup.enter="jump"
        placeholder="Page"
      />
      <button
        class="btn btn-sm join-item"
        :disabled="pageInput == null"
        @click="jump"
      >
        Go
      </button>
      <button
        class="btn btn-sm join-item"
        :disabled="page >= totalPages"
        @click="$emit('change', page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  total: number
  page: number
  totalPages: number
}>()

defineEmits<{
  (e: "change", page: number): void
}>()

const pageInput = ref<number | null>(null)

const jump = () => {
  if (pageInput.value == null) return
  const target = Math.min(props.totalPages, Math.max(1, Math.floor(pageInput.value)))
  pageInput.value = null
  if (target !== props.page) {
    ;(getCurrentInstance() as any)?.emit("change", target)
  }
}
</script>