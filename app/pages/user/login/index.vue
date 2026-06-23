<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center mb-4">系统登录</h2>
        
        <form @submit.prevent="handleLogin">
          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text">邮箱</span>
            </label>
            <input 
              type="email" 
              v-model="email" 
              placeholder="请输入邮箱" 
              class="input input-bordered w-full" 
              required 
            />
          </div>

          <div class="form-control w-full mb-6">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input 
              type="password" 
              v-model="password" 
              placeholder="请输入密码" 
              class="input input-bordered w-full" 
              required 
            />
          </div>

          <div class="form-action">
            <button 
              type="submit" 
              class="btn btn-primary w-full" 
              :disabled="loading"
            >
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useCookie } from '#app'
import { useAppToast } from '~/composables/useAppToast'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'empty', // 如果你有空白布局可以用，没有就删掉这行
})

const email = ref('')
const password = ref('')
const loading = ref(false)

const router = useRouter()
const toast = useAppToast()
const { setUser } = useAuth()
const tokenCookie = useCookie('token', { maxAge: 60 * 60 * 24 * 7 }) // 7天过期

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return toast.warning('请输入邮箱和密码')
  }

  loading.value = true
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (res?.success) {
      // 1. 保存 Token
      tokenCookie.value = res.data.token
      // 2. 保存全局用户状态
      setUser(res.data.user)
      
      toast.success('登录成功')
      
      // 3. 跳转到首页或后台
      if (res.data.user.isRoot) {
         router.push('/admin/users') // ROOT 去管理面板
      } else {
         router.push('/') // 普通用户去首页
      }
    } else {
      toast.error(res?.message || '登录失败')
    }
  } catch (error: any) {
    console.error('登录异常:', error)
    toast.error(error?.data?.message || '邮箱或密码错误')
  } finally {
    loading.value = false
  }
}
</script>