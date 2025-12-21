<template>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box custom-modal-box" style="max-width: 56rem;">
      <div class="modal-header">
        <div>
          <div class="modal-header__title">Edit Stitch</div>
          <div class="modal-header__subtitle">
            Manage definition and multi-language terminology
          </div>
        </div>
        <div class="modal-header__close-btn" @click="close">
          <icon name="hugeicons:cancel-01" size="22" />
        </div>
      </div>

      <div class="modal-body">
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
                    <select id="stitch-category" class="select">
                      <option selected>Basic</option>
                      <option>Textured</option>
                      <option>Lace</option>
                      <option>Cable</option>
                      <option>Colorwork</option>
                      <option>Tunisian</option>
                      <option>Flower/Motif</option>
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
                      <div class="stitch-level active">Beginner</div>
                      <div class="stitch-level">Intermediate</div>
                      <div class="stitch-level">Advanced</div>
                      <div class="stitch-level">Expert</div>
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
              <div class="stitch-term">
                <div class="flex items-center gap-2 justify-between">
                  <div style="font-size: 12px;" class="font-bold text-gray-500/80">
                    US Terms
                  </div>
                  <div style="font-size: 16px;">🇺🇸</div>
                </div>
                <div class="stitch-term-name text-neutral-900">
                  Single Crochet (sc)
                </div>
                <div></div>
              </div>

              <div class="stitch-term">
                <div class="flex items-center gap-2 justify-between">
                  <div style="font-size: 12px;" class="font-bold text-gray-500/80">
                    UK Terms
                  </div>
                  <div style="font-size: 16px;">🇬🇧</div>
                </div>
                <div class="stitch-term-name text-neutral-900">
                  Double Crochet (dc)
                </div>
                <div></div>
              </div>

              <div class="stitch-term">
                <div class="flex items-center gap-2 justify-between">
                  <div style="font-size: 12px;" class="font-bold text-gray-500/80">
                    Japanese
                  </div>
                  <div style="font-size: 16px;">🇯🇵</div>
                </div>
                <div class="stitch-term-name text-neutral-900">X (Coma)</div>
                <div></div>
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
        <button class="btn btn-neutral">
          <icon name="hugeicons:cloud-upload" size="16" />
          <span>Save Stitch</span>
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
const dialogRef = ref<HTMLDialogElement | null>(null)

const open = () => dialogRef.value?.showModal()
const close = () => dialogRef.value?.close()

defineExpose({ open, close })
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

        &:hover {
          border: 0.5px solid var(--color-indigo-300);
        }

        .stitch-term-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-neutral-900);
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