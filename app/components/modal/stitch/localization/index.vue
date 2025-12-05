<template>
  <dialog id="local_modal" class="modal">
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
            <div class="stitch-standard-item">
              <div class="stitch-standard-item__content">
                <div style="font-size: 12px; border-radius: 4px;" class="bg-blue-100 text-blue-800 px-2">US</div>
                <div class="text-lg">🇺🇸</div>
                <div>US Terms</div>
              </div>
              <div style="padding-left: 10px;" class="flex items-center text-red-400 hover:text-red-500 cursor-pointer">
                <icon name="hugeicons:delete-02" size="16" />
              </div>
            </div>  
            <div class="stitch-standard-item">
              <div class="stitch-standard-item__content">
                <div style="font-size: 12px; border-radius: 4px;" class="bg-green-100 text-green-800 px-2">UK</div>
                <div class="text-lg">🇬🇧</div>
                <div>UK Terms</div>
              </div>
              <div style="padding-left: 10px;" class="flex items-center text-red-400 hover:text-red-500 cursor-pointer">
                <icon name="hugeicons:delete-02" size="16" />
              </div>
            </div>  
            <em style="font-size: 12px; color: var(--color-neutral-400); padding: 0 2px;">Tips: If the current standard is still linked to any stitches, then this standard cannot be deleted. </em>
          </div>
        </div>
        <div>
          <div style="font-size: 12px; text-transform: uppercase; margin-bottom: 10px;" class="font-bold text-gray-500">Add New Standard</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 10px; margin-bottom: 10px;">
            <input type="text" placeholder="Code(en,cn)" class="input input-sm" />
            <input type="text" placeholder="Flag e.g. 🇨🇳" class="input input-sm" />
            <input type="text" placeholder="Language (e.g. Chinese)" class="input input-sm" />
            
          </div>
          <button type="submit" class="btn btn-sm btn-neutral w-full">Add Stitch Standard</button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
defineEmits(['close'])
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