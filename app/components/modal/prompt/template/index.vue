<template>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box custom-modal-box" style="max-width: 56rem;">
      <div class="modal-header">
        <div>
          <div class="modal-header__title">{{ title }}</div>
          <div class="modal-header__subtitle">{{ subtitle }}</div>
        </div>
        <div class="modal-header__close-btn" @click="close">
          <icon name="hugeicons:cancel-01" size="22" />
        </div>
      </div>

      <div class="modal-body" style="height: 78vh; overflow: auto;">
        <div class="modal-form-card" style="margin-bottom: 0">
          <div class="modal-form">
            <div class="modal-form__item">
              <div class="modal-form__item__label">Title</div>
              <input
                v-model.trim="nameModel"
                type="text"
                style="width: 100%;"
                class="input input-bordered"
                placeholder="Enter prompt name"
              />
            </div>
            <div class="modal-form__item">
              <div class="modal-form__item__label">Alias</div>
              <input
                v-model.trim="aliasModel"
                type="text"
                style="width: 100%;"
                class="input input-bordered"
                placeholder="Enter alias"
              />
            </div>
            <div class="modal-form__item" style="grid-column: span 2;">
              <div class="modal-form__item__label">Template Content</div>
              <div class="w-full rounded-lg bg-neutral text-neutral-content p-3 pb-6">
                <textarea
                  ref="templateTextareaRef"
                  v-model="templateModel"
                  class="textarea textarea-ghost w-full font-mono text-sm leading-6 whitespace-pre-wrap break-all overflow-x-hidden resize-none bg-transparent text-neutral-content focus:!bg-transparent focus:text-neutral-content modal-form__textarea"
                  placeholder="Enter template"
                  @input="autoResizeTemplate"
                ></textarea>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <slot name="footer">
          <button type="button" class="btn btn-neutral" @click="$emit('update')">
            <icon name="hugeicons:cloud-upload" size="16" />
            <span>Update</span>
          </button>
        </slot>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    name?: string
    alias?: string
    template?: string
  }>(),
  {
    title: 'Add Prompt',
    subtitle: '',
    name: '',
    alias: '',
    template: '',
  }
)

const emit = defineEmits<{
  (e: 'update'): void
  (e: 'close'): void
  (e: 'update:name', value: string): void
  (e: 'update:alias', value: string): void
  (e: 'update:template', value: string): void
}>()

const nameModel = computed({
  get: () => props.name,
  set: (v: string) => emit('update:name', v),
})

const aliasModel = computed({
  get: () => props.alias,
  set: (v: string) => emit('update:alias', v),
})

const templateModel = computed({
  get: () => props.template,
  set: (v: string) => emit('update:template', v),
})

const templateTextareaRef = ref<HTMLTextAreaElement | null>(null)

const autoResizeTemplate = () => {
  const el = templateTextareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight + 24}px`
}

watch(
  () => props.template,
  () => nextTick(autoResizeTemplate),
  { immediate: true }
)

const dialogRef = ref<HTMLDialogElement | null>(null)

const open = () => {
  dialogRef.value?.showModal()
  nextTick(autoResizeTemplate)
}

const close = () => {
  dialogRef.value?.close()
  emit('close')
}

defineExpose({ open, close })

const { title, subtitle } = toRefs(props)
</script>

<style scoped>
    .modal-form-card {
        background-color: #fff;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 20px;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.02);

        .modal-form-card__title {
            font-weight: 500;
            color: #666;
            margin-bottom: 5px;
            font-size: 14px;
        }

        .modal-form {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;

            .modal-form__item {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .modal-form__item__label {
                    font-weight: 600;
                    color: var(--color-neutral-500);
                    font-size: 14px;
                }
            }

            .modal-form__textarea {
                width: 100%;
                min-height: 240px;
                height: auto;
                outline: none;
                overflow: hidden;
                resize: none;
            }
        }

    }
</style>
