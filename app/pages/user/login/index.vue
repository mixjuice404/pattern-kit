<template>
  <div class="login-container min-h-screen flex items-center justify-center relative overflow-hidden">
    <!-- 动态背景光斑 -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>
    
    <!-- 全屏高斯模糊/毛玻璃层 -->
    <div class="bg-glass"></div>

    <div class="login-content relative z-10 p-10 rounded-3xl" style="margin-top: -10vh;">
      <div style="display: flex; flex-direction: column; align-items: center;">
        <img src="~/assets/images/logo.png" alt="logo" width="120" />
        <div style="font-size: 24px; font-weight: 700; color: oklch(27.8% 0.033 256.848); font-family: 'Montserrat', Georgia, serif; margin-bottom: 42px;">
          <div style="color: oklch(55.3% 0.195 38.402)">Ethereal Yarnworks</div>
          <div style="font-size: 14px; font-weight: 500; opacity: 0.8; text-align: right;">Login in Console</div>
        </div>
        
        <form style="width: 280px;" @submit.prevent="handleLogin">
          <div class="form-control w-full mb-3">
            <label class="label ">
              <span style="margin-bottom: 8px; font-size: 14px; font-weight: 600; opacity: 0.8;">邮箱/用户名</span>
            </label>
            <input 
              type="text" 
              v-model="email" 
              placeholder="请输入邮箱或用户名" 
              class="input input-bordered w-full" 
              required 
            />
          </div>

          <div class="form-control w-full mb-8">
            <label class="label">
              <span style="margin-bottom: 8px; font-size: 14px; font-weight: 600; opacity: 0.8;">密码</span>
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
              class="btn btn-neutral w-full" 
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
import { AUTH_CONFIG } from '~/../shared/constants/auth'

definePageMeta({
  layout: 'empty', // 如果你有空白布局可以用，没有就删掉这行
})

const email = ref('')
const password = ref('')
const loading = ref(false)

const router = useRouter()
const toast = useAppToast()
const { setUser } = useAuth()
const config = useRuntimeConfig()
const tokenCookie = useCookie('token', { maxAge: config.public.authCookieMaxAge as number }) // 使用统一的30天配置

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return toast.warning('请输入邮箱/用户名和密码')
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
      
      // 3. 统一跳转到首页 (由首页重定向到列表页)
      router.push('/')
    } else {
      toast.error(res?.message || '登录失败')
    }
  } catch (error: any) {
    console.error('登录异常:', error)
    toast.error(error?.data?.message || '账号或密码错误')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  background-color: #f8fafc;
}

/* 动态光斑基础样式 */
.bg-shape {
  position: absolute;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.7;
  border-radius: 50%;
  animation: float 12s infinite ease-in-out alternate;
}

/* 光斑1: 品牌主色系(柔和的暖橘色) */
.shape-1 {
  width: 500px;
  height: 500px;
  background: oklch(85% 0.12 38.4);
  top: -10%;
  left: -5%;
  animation-delay: 0s;
}

/* 光斑2: 冷色系搭配(柔和的灰蓝色) */
.shape-2 {
  width: 600px;
  height: 600px;
  background: oklch(85% 0.08 256.8);
  bottom: -20%;
  right: -10%;
  animation-delay: -3s;
}

/* 光斑3: 辅色点缀(浅紫/粉色) */
.shape-3 {
  width: 400px;
  height: 400px;
  background: oklch(88% 0.1 320);
  top: 30%;
  left: 60%;
  animation-delay: -6s;
}

/* 全屏毛玻璃层，用于混合和柔化光斑 */
.bg-glass {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(100px);
  -webkit-backdrop-filter: blur(100px);
  background: rgba(255, 255, 255, 0.4);
  z-index: 1;
}

/* 登录框卡片自身的玻璃态(Glassmorphism)设计 */
.login-content {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
}

/* 光斑漂浮动画 */
@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  33% {
    transform: translate(30px, -50px) rotate(10deg) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) rotate(-5deg) scale(0.95);
  }
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
}
</style>