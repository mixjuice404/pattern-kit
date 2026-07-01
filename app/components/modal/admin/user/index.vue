<script setup lang="ts">
import { ref, toRefs } from 'vue'

const props = defineProps<{
  rolesList: any[]
}>()

const emit = defineEmits(['success'])

const toast = useAppToast()
const { rolesList } = toRefs(props)

const showAddModal = ref(false)
const adding = ref(false)
const form = ref({ email: '', password: '', name: '' })
const selectedRole = ref<string>('')
const addResult = ref<'idle' | 'success' | 'error'>('idle')
const addErrorMessage = ref('')
const createdUserInfo = ref({ email: '', password: '', name: '' })

const open = () => {
  form.value = { email: '', password: '', name: '' }
  selectedRole.value = ''
  addResult.value = 'idle'
  addErrorMessage.value = ''
  showAddModal.value = true
}

const close = () => {
  showAddModal.value = false
}

defineExpose({ open, close })

const generatePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const num = '0123456789'
  const sym = '@#$%&*+?!' 
  const alphaNum = upper + lower + num 
  
  let pwd = ''
  pwd += upper[Math.floor(Math.random() * upper.length)]
  pwd += lower[Math.floor(Math.random() * lower.length)]
  pwd += num[Math.floor(Math.random() * num.length)]
  pwd += sym[Math.floor(Math.random() * sym.length)]
  
  if (Math.random() > 0.5) {
    pwd += sym[Math.floor(Math.random() * sym.length)]
  }

  while (pwd.length < 12) {
    pwd += alphaNum[Math.floor(Math.random() * alphaNum.length)]
  }
  
  form.value.password = pwd.split('').sort(() => 0.5 - Math.random()).join('')
}

const submitAddUser = async () => {
  if (!form.value.name && !form.value.email) return toast.warning('邮箱和用户名至少填一项')
  if (!form.value.password) return toast.warning('密码必填')
  
  adding.value = true
  addResult.value = 'idle'
  
  try {
    const payload = {
      ...form.value,
      roles: selectedRole.value ? [selectedRole.value] : []
    }
    await $fetch('/api/auth/admin/users', { method: 'POST', body: payload })
    toast.success('用户创建成功')
    
    createdUserInfo.value = { ...form.value }
    addResult.value = 'success'
    
    emit('success')
    
    form.value = { email: '', password: '', name: '' }
    selectedRole.value = ''
  } catch (e: any) {
    addResult.value = 'error'
    addErrorMessage.value = e.data?.message || '添加用户失败, 请检查邮箱是否已存在'
  } finally {
    adding.value = false
  }
}

const copyUserInfo = async () => {
  const { name, email, password } = createdUserInfo.value
  const textToCopy = `======================
Username: ${name || '-'}
Password: ${password}
Email: ${email || '-'}
======================`

  try {
    await navigator.clipboard.writeText(textToCopy)
    toast.success('复制成功')
  } catch (err) {
    console.error('Failed to copy text: ', err)
    toast.error('复制失败，请手动复制')
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': showAddModal }">
    <div class="modal-box custom-modal-box" style="max-width: 56rem;">
      <div class="modal-header">
        <div>
          <div class="modal-header__title">添加新用户</div>
          <div class="modal-header__subtitle">创建平台用户 & 生成随机密码</div>
        </div>
        <div class="modal-header__close-btn" @click="close">
          <icon name="hugeicons:cancel-01" size="22" />
        </div>
      </div>

      <div class="modal-body" style=" overflow: auto;">
        <div class="modal-form-card" style="margin-bottom: 0;">
          
          <div class="modal-form">
            <div class="modal-form__item">
                <div class="modal-form__item__label">Username / Nickname</div>
                <input
                v-model.trim="form.name"
                type="text"
                style="width: 100%;"
                class="input input-bordered"
                placeholder="Enter Username"
                />
            </div>
            <div class="modal-form__item">
              <div class="modal-form__item__label">Email</div>
              <input
                v-model.trim="form.email"
                type="text"
                style="width: 100%;"
                class="input input-bordered"
                placeholder="Enter Email (Optional)"
              />
            </div>
            
            <div class="modal-form__item">
              <div class="modal-form__item__label">Password</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input
                  v-model.trim="form.password"
                  type="text"
                  style="width: 100%;"
                  class="input input-bordered"
                  placeholder="Enter Password"
                />
                <button class="btn btn-soft btn-primary" @click="generatePassword">Generate</button>
              </div>
            </div>
            <div class="modal-form__item">
              <div class="modal-form__item__label">Roles</div>
              <select v-model="selectedRole" class="select select-bordered w-full">
                <option disabled value="">Pick a role</option>
                <option v-for="role in rolesList" :key="role.id" :value="role.name">
                  {{ role.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <div v-if="addResult === 'success'" class="modal-result-card modal-success-card">
          <div style="font-size: 14px; background-color: #f0fdf4; padding: 10px; border-radius: 6px;">
            <div class="flex gap-2 mb-2">
              <icon name="solar:shield-check-bold" style="color: #22c55e; margin-top:1px" size="20" />
              <div>
                <div style="font-weight: 500;">添加用户成功，请保存用户信息（密码仅出现一次）⚠️</div>
                <div style="font-size: 12px; margin-top: 8px; display: grid; grid-template-columns: 60px auto; gap: 4px;">
                    <div style="font-weight: 700; opacity: 0.6;">用户名</div>
                    <div>{{ createdUserInfo.name || '-' }}</div>
                    <div style="font-weight: 700; opacity: 0.6;" v-if="createdUserInfo.email">邮箱</div>
                    <div v-if="createdUserInfo.email">{{ createdUserInfo.email }}</div>
                    <div style="font-weight: 700; opacity: 0.6;">密码</div>
                    <div class="flex items-center gap-4">
                        <div>{{ createdUserInfo.password }}</div>
                        <div style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: #22c55e;" @click="copyUserInfo">
                            <icon name="solar:copy-broken" size="16" />
                            <div>复制信息</div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="addResult === 'error'" class="modal-result-card modal-error-card">
          <div style="font-size: 14px; background-color: #fef2f2; padding: 10px; border-radius: 6px;">
            <div class="flex gap-2">
              <icon name="solar:shield-warning-bold" style="color: #dc2626; margin-top:1px" size="20" />
              <div style="font-weight: 500; color: #dc2626;">{{ addErrorMessage }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <slot name="footer">
          <button type="button" class="btn btn-neutral" :disabled="adding" @click="submitAddUser">
            <span v-if="adding" class="loading loading-spinner loading-sm"></span>
            <icon v-else name="hugeicons:cloud-upload" size="16" />
            <span>Save</span>
          </button>
        </slot>
      </div>
    </div>
  </dialog>
</template>