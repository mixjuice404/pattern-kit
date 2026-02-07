<template>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box custom-modal-box" style="max-width: 56rem;">
      <div class="modal-header">
        <div>
          <div class="modal-header__title">{{ isEdit ? 'Edit Stitch' : 'Add Stitch' }}</div>
          <div class="modal-header__subtitle">
            Manage definition and multi-language terminology
          </div>
        </div>
        <div class="modal-header__close-btn" @click="close">
          <icon name="hugeicons:cancel-01" size="22" />
        </div>
      </div>

      <div class="modal-body" style="max-height: 90vh;">
        <div class="modal-form">
          <div>
            <div class="modal-form-card card__normal">
              <div class="form-card-header">
                <div class="card__title">
                  <icon name="hugeicons:information-square" size="16" />
                  <div class="text-md font-bold">Basic Information</div>
                </div>
                <div class="autofill-btn">
                  <icon name="hugeicons:ai-beautify" size="12" />
                  <div>AI Autofill</div>
                </div>
              </div>

              <div class="card-form mb-2">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div
                      style="font-size: 12px; padding-left: 2px; margin-bottom: 5px;"
                      class="font-semibold text-gray-500/90 uppercase"
                    >
                      Stitch Name
                    </div>
                    <input
                      id="stitch-name"
                      v-model.trim="stitch.defaultName"
                      type="text"
                      placeholder="e.g. Single Crochet"
                      class="input"
                    />
                  </div>

                  <div>
                    <div
                      style="font-size: 12px; padding-left: 2px; margin-bottom: 5px;"
                      class="font-semibold text-gray-500/90 uppercase"
                    >
                      Category
                    </div>
                    <select id="stitch-category" v-model="stitch.type" class="select">
                      <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
                    </select>
                  </div>

                  <div class="col-span-2">
                    <div
                      style="font-size: 12px; padding-left: 2px; margin-bottom: 5px;"
                      class="font-semibold text-gray-500/90 uppercase"
                    >
                      Difficulty
                    </div>
                    <div class="grid grid-cols-4 gap-2">
                      <div
                        v-for="l in levelOptions"
                        :key="l.key"
                        class="stitch-level"
                        :class="{ active: stitch.level === l.key }"
                        @click="setLevel(l.key)"
                      >
                        {{ l.label }}
                      </div>
                    </div>
                  </div>

                  <div class="col-span-2">
                    <div
                      style="font-size: 12px; padding-left: 2px; margin-bottom: 5px;"
                      class="font-semibold text-gray-500/90 uppercase"
                    >
                      Description
                    </div>
                    <textarea
                      v-model="stitch.description"
                      class="textarea w-full"
                      placeholder="Brief description of the stitch ..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-form-card card__normal">
              <div class="form-card-header">
                <div class="card__title">
                  <icon name="hugeicons:information-square" size="16" />
                  <div class="text-md font-bold">Detailed Instructions</div>
                </div>
              </div>
              <textarea
                class="textarea w-full"
                rows="5"
                placeholder="Detailed step-by-step instructions ..."
              />
            </div>
          </div>

          <div class="modal-form-card card__i18n">
            <div class="stitch-alias">
              <div class="i18n-icon">
                <icon name="hugeicons:globe-02" size="22" />
              </div>
              <div>
                <div style="font-size: 14px;" class="font-bold">
                  Terminology Matrix
                </div>
                <div style="font-size: 10px;" class="text-gray-500">
                  Map terms across 3 configured standards
                </div>
              </div>
            </div>

            <div class="stitch-term-group" style="margin-bottom: 10px;">
              <div
                v-for="term in termItems"
                :key="term.key"
                class="stitch-term"
                @click="startEdit(term.key)"
              >
                <div class="flex items-center gap-2 justify-between">
                  <div style="font-size: 12px;" class="font-bold text-gray-500/80">
                    {{ term.label }}
                  </div>
                  <div style="font-size: 16px;">{{ term.flag }}</div>
                </div>

                <div style="display: flex; align-items: center; justify-content: between;">
                  <div class="stitch-term-name text-neutral-900" style="flex-grow: 1;">
                    <div
                      v-if="isEditing(term.key)"
                      :ref="(el) => setNameRef(term.key, el)"
                      contenteditable="true"
                      data-placeholder="Term name"
                      @click.stop
                      @input="onNameInput"
                      @keydown.enter.prevent
                    />
                    <template v-else>
                      {{ term.name || '-' }}
                    </template>
                  </div>
                  <div style="font-size: 12px; flex-shrink: 0; line-height: 1; padding: 4px 8px; border-radius: 4px; font-weight: 500;" class="text-gray-800 bg-gray-100">
                    <div
                      v-if="isEditing(term.key)"
                      :ref="(el) => setAbbrevRef(term.key, el)"
                      contenteditable="true"
                      data-placeholder="Abbrev"
                      @click.stop
                      @input="onAbbrevInput"
                      @keydown.enter.prevent
                    />
                    <template v-else>
                      {{ term.abbrev || '-' }}
                    </template>
                  </div>
                </div>
                

                <div
                  v-if="isEditing(term.key)"
                  :ref="(el) => setDescRef(term.key, el)"
                  contenteditable="true"
                  class="stitch-term-description mt-1"
                  data-placeholder="Description"
                  @click.stop
                  @input="onDescInput"
                />

                <div
                  v-if="isEditing(term.key)"
                  class="mt-3 flex items-center justify-end gap-2"
                  @click.stop
                >
                  <button class="btn btn-xs btn-neutral" @click="confirmEdit">
                    Confirm
                  </button>
                  <button class="btn btn-xs" @click="cancelEdit">Cancel</button>
                </div>
              </div>
            </div>

            <div class="stitch-term-tip">
              <em>
                Tip: Use the AI Autofill button to attempt to find translations
                automatically. You can add more languages in the main settings.
              </em>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-neutral" :disabled="!stitch.defaultName.trim()" @click="handleSave">
          <icon name="hugeicons:cloud-upload" size="16" />
          <span>{{ isEdit ? 'Save Stitch' : 'Create Stitch' }}</span>
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
type StitchForm = {
  id: number | null
  defaultName: string
  description: string
  type: string
  level: string
}

const dialogRef = ref<HTMLDialogElement | null>(null)

const typeOptions = [
  "Basic",
  "Textured",
  "Lace",
  "Cable",
  "Colorwork",
  "Tunisian",
  "Flower/Motif",
] as const

const levelOptions = [
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
  { key: "expert", label: "Expert" },
] as const

type StitchLocalizationForm = {
  languageCode: string
  flag: string
  name: string
  abbrev: string
  description: string
}

type TermItem = {
  key: string
  label: string
  flag: string
  name: string
  description: string
  abbrev: string
}

const normalizeCode = (code: any) => String(code ?? "").toUpperCase()

const localizations = ref<StitchLocalizationForm[]>([])

const termItems = computed<TermItem[]>(() =>
  localizations.value.map((l) => ({
    key: normalizeCode(l.languageCode),
    label: `${normalizeCode(l.languageCode)} Terms`,
    flag: l.flag,
    name: l.name,
    description: l.description,
    abbrev: l.abbrev,
  }))
)

const editingKey = ref<string | null>(null)
const draftName = ref("")
const draftAbbrev = ref("")
const draftDescription = ref("")

const nameRefMap = new Map<string, HTMLDivElement>()
const abbrevRefMap = new Map<string, HTMLDivElement>()
const descRefMap = new Map<string, HTMLDivElement>()

const setNameRef = (key: string, el: any) => {
  const k = normalizeCode(key)
  if (el) nameRefMap.set(k, el as HTMLDivElement)
  else nameRefMap.delete(k)
}

const setAbbrevRef = (key: string, el: any) => {
  const k = normalizeCode(key)
  if (el) abbrevRefMap.set(k, el as HTMLDivElement)
  else abbrevRefMap.delete(k)
}

const setDescRef = (key: string, el: any) => {
  const k = normalizeCode(key)
  if (el) descRefMap.set(k, el as HTMLDivElement)
  else descRefMap.delete(k)
}

const isEditing = (key: string) => editingKey.value === normalizeCode(key)

const onNameInput = (e: Event) => {
  draftName.value = (e.target as HTMLElement)?.textContent ?? ""
}

const onAbbrevInput = (e: Event) => {
  draftAbbrev.value = (e.target as HTMLElement)?.textContent ?? ""
}

const onDescInput = (e: Event) => {
  draftDescription.value = (e.target as HTMLElement)?.textContent ?? ""
}

const startEdit = async (key: string) => {
  const code = normalizeCode(key)
  const l = localizations.value.find((x) => normalizeCode(x.languageCode) === code)
  if (!l) return
  editingKey.value = code
  draftName.value = l.name
  draftAbbrev.value = l.abbrev
  draftDescription.value = l.description

  await nextTick()
  const nameEl = nameRefMap.get(code)
  if (nameEl) {
    nameEl.textContent = draftName.value
    nameEl.focus()
  }
  const abbrevEl = abbrevRefMap.get(code)
  if (abbrevEl) {
    abbrevEl.textContent = draftAbbrev.value
  }
  const descEl = descRefMap.get(code)
  if (descEl) {
    descEl.textContent = draftDescription.value
  }
}

const confirmEdit = () => {
  const code = editingKey.value
  if (!code) return
  const l = localizations.value.find((x) => normalizeCode(x.languageCode) === code)
  if (!l) return
  l.name = draftName.value.trim()
  l.abbrev = draftAbbrev.value.trim()
  l.description = draftDescription.value.trim()
  editingKey.value = null
}

const cancelEdit = () => {
  editingKey.value = null
}

const defaultForm = (): StitchForm => ({
  id: null,
  defaultName: "",
  description: "",
  type: "Basic",
  level: "beginner",
})

const stitch = ref<StitchForm>(defaultForm())

const isEdit = computed(
  () => typeof stitch.value.id === "number" && !Number.isNaN(stitch.value.id)
)

const emit = defineEmits<{
  (e: "save", payload: StitchForm & { localizations: StitchLocalizationForm[] }): void
}>()

const open = () => dialogRef.value?.showModal()
const close = () => dialogRef.value?.close()

const setStitch = (data: any) => {
  const base = defaultForm()
  stitch.value = {
    ...base,
    ...(data ?? {}),
    id: typeof data?.id === "number" && !Number.isNaN(Number(data.id)) ? Number(data.id) : null,
    defaultName: typeof data?.defaultName === "string" ? data.defaultName : base.defaultName,
    description: data?.description == null ? "" : String(data.description),
    type: typeof data?.type === "string" ? data.type : base.type,
    level: typeof data?.level === "string" ? data.level : base.level,
  }

  const rawLocs = Array.isArray(data?.localizations) ? data.localizations : []
  localizations.value = rawLocs
    .map((l: any) => ({
      languageCode: normalizeCode(l?.languageCode),
      flag: String(l?.flag ?? ""),
      name: l?.name == null ? "" : String(l.name),
      abbrev: l?.abbrev == null ? "" : String(l.abbrev),
      description: l?.description == null ? "" : String(l.description),
    }))
    .filter((l: StitchLocalizationForm) => l.languageCode)

  editingKey.value = null
}

const setLevel = (level: string) => {
  stitch.value.level = level
}

const handleSave = () => {
  const locs = localizations.value
    .map((l) => ({
      languageCode: normalizeCode(l.languageCode),
      flag: l.flag,
      name: l.name.trim(),
      abbrev: l.abbrev.trim(),
      description: l.description.trim(),
    }))
    .filter((l) => l.languageCode && l.name && l.description)

  emit("save", {
    ...stitch.value,
    defaultName: stitch.value.defaultName.trim(),
    localizations: locs,
  })
}

defineExpose({ open, close, setStitch })
</script>

<style scoped lang="scss">
.modal-form {
  display: grid;
  grid-template-columns: 61% auto;
  gap: 20px;
  align-items: start;

  .modal-form-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.02);

    .form-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .card__title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 700;
      }

      .autofill-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 8px 14px;
        border-radius: 100px;
        line-height: 1;
        font-weight: 500;
        font-size: 12px;
        background-color: var(--color-violet-50);
        color: var(--color-violet-500);
      }
    }
  }

  .card__normal {
    background-color: white;
    border: 0.5px solid var(--color-gray-200);
  }

  .card__i18n {
    border: 0.5px solid var(--color-indigo-200);
    background-color: oklch(96.2% 0.018 272.314 / 0.5);

    .stitch-alias {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;

      .i18n-icon {
        height: 36px;
        width: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-indigo-200);
        border-radius: 6px;
        color: var(--color-indigo-500);
      }
    }

    .stitch-term-tip {
      font-size: 10px;
      padding: 10px;
      border-radius: 6px;
      line-height: 1.2;
      opacity: 0.8;
      background-color: var(--color-gray-50);
      border: 0.5px solid var(--color-gray-200);
      color: var(--color-gray-500);
    }

    .stitch-term-group {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .stitch-term {
        background-color: white;
        padding: 10px 16px;
        border-radius: 6px;
        border: 0.5px solid var(--color-indigo-100);
        position: relative;

        &:hover {
          border: 0.5px solid var(--color-indigo-300);
        }

        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          opacity: 0.5;
        }

        [contenteditable]:focus {
          outline: none;
        }

        .stitch-term-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-neutral-900);
        }

        .stitch-term-description {
          font-size: 12px;
          font-weight: 400;
          color: var(--color-neutral-500);
        }
      }
    }
  }

  .stitch-level {
    font-size: 12px;
    padding: 10px 0;
    border-radius: 6px;
    line-height: 1;
    border: 1px solid var(--color-gray-200);
    color: var(--color-gray-500);
    text-align: center;
    font-weight: 500;
    cursor: pointer;

    &.active {
      background-color: var(--color-neutral);
      border-color: var(--color-neutral);
      color: white;
    }
  }
}
</style>