<template>
  <dialog id="local_modal" class="modal" ref="dialogRef">
    <div class="modal-box custom-modal-box" style="max-width: 30rem;">
      <div class="modal-header">
        <div>
          <div class="modal-header__title">Manage Localization</div>
          <div class="modal-header__subtitle">Manage multi-language standard for this stitch</div>
        </div>
        <div class="modal-header__close-btn" @click="$emit('close')">
          <icon name="hugeicons:cancel-01" size="22" />
        </div>
      </div>
      <div class="modal-body">
        <div class="stitch-standards" style="margin-bottom: 10px;">
          <div class="stitch-standard-group">
            <!-- 动态列表 -->
            <div v-for="lang in languages" :key="lang.code" class="stitch-standard-item">
              <div class="stitch-standard-item__content">
                <div style="font-size: 12px; border-radius: 4px;" class="bg-blue-100 text-blue-800 px-2">{{ lang.code.toUpperCase() }}</div>
                <div class="text-lg">{{ lang.flag }}</div>
                <div>{{ lang.name }}</div>
              </div>
              <div style="padding-left: 10px;" class="flex items-center text-red-400 hover:text-red-500 cursor-pointer" @click="removeLanguage(lang.code)">
                <icon name="hugeicons:delete-02" size="16" />
              </div>
            </div>
            <em style="font-size: 12px; color: var(--color-neutral-400); padding: 0 2px;">Tips: If the current standard is still linked to any stitches, then this standard cannot be deleted. </em>
          </div>
        </div>
        <div>
          <div style="font-size: 12px; text-transform: uppercase; margin-bottom: 10px;" class="font-bold text-gray-500">Add New Standard</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 10px; margin-bottom: 10px;">
            <input type="text" placeholder="Code(en,cn)" class="input input-sm" v-model="form.code" />
            <input type="text" placeholder="Flag e.g. 🇨🇳" class="input input-sm" v-model="form.flag" />
            <input type="text" placeholder="Language (e.g. Chinese)" class="input input-sm" v-model="form.name" />
          </div>
          <button type="button" class="btn btn-sm btn-neutral w-full" @click="addLanguage">Add Stitch Standard</button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAppToast } from '~/composables/useAppToast';

defineEmits(['close'])

const toast = useAppToast()
const dialogRef = ref<HTMLDialogElement | null>(null)
const languages = ref<Array<{ code: string; name: string; flag: string }>>([])
const form = ref<{ code: string; flag: string; name: string }>({ code: '', flag: '', name: '' })

async function fetchLanguages() {
  try {
    const res = await $fetch('/api/dict/stitch/language', { method: 'GET' })
    languages.value = res?.data?.result ?? []
  } catch (err: any) {
    console.error('Failed to fetch languages:', err)
    toast.error(err.message || 'Failed to fetch languages')
    languages.value = []
  }
}

async function addLanguage() {
  const code = form.value.code.trim()
  const flag = form.value.flag.trim()
  const name = form.value.name.trim()
  if (!code || !flag || !name) return
  try {
    await $fetch('/api/dict/stitch/language', { method: 'POST', body: { languageCode: code, flag, name } })
    form.value = { code: '', flag: '', name: '' }
    toast.success('Stitch standard added successfully!')
  } catch (err: any) {
    console.error('Failed to add language:', err)
    toast.error(err.message || 'Failed to add stitch standard')
  } finally {
    await fetchLanguages()
  }
}

async function removeLanguage(code: string) {
  if (!code) return
  try {
    await $fetch(`/api/dict/stitch/language/${code}`, { method: 'DELETE' })
    toast.success('Stitch standard removed successfully!')
  } catch (err: any) {
    console.error('Failed to remove language:', err)
    toast.error(err.message || 'Failed to remove stitch standard')
  } finally {
    await fetchLanguages()
  }
}

let observer: MutationObserver | null = null
onMounted(() => {
  const el = dialogRef.value
  if (!el) return
  observer = new MutationObserver(() => {
    if (el.open) fetchLanguages()
  })
  observer.observe(el, { attributes: true, attributeFilter: ['open'] })
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped lang="scss">
.stitch-standards {
    display: flex; 
    flex-direction: column; 
    gap: 10px;
    padding-bottom: 15px;
    border-bottom: 1px dashed var(--color-gray-200);

    .stitch-standard-group {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .stitch-standard-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: white;
            padding: 10px 16px;
            border-radius: 6px;
            border: 0.5px solid var(--color-gray-200);
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.02);

            .stitch-standard-item__content {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                font-weight: 600;
                color: var(--color-neutral-600);
            }
        }
    }
}
</style>