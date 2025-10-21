import { defineNuxtPlugin } from '#app'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, {
    // Toast 位置
    position: POSITION.TOP_RIGHT,
    
    // 默认超时时间（毫秒）
    timeout: 3000,
    
    // 点击关闭
    closeOnClick: true,
    
    // 失去焦点时暂停
    pauseOnFocusLoss: true,
    
    // 鼠标悬停时暂停
    pauseOnHover: true,
    
    // 支持拖拽关闭
    draggable: true,
    draggablePercent: 0.6,
    
    // 悬停时显示关闭按钮
    showCloseButtonOnHover: false,
    
    // 隐藏进度条
    hideProgressBar: false,
    
    // 关闭按钮类型
    closeButton: "button",
    
    // 显示图标
    icon: true,
    
    // RTL 支持
    rtl: false,
    
    // 最大 Toast 数量
    maxToasts: 5,
    
    // 新 Toast 位置（top: 新的在上面，bottom: 新的在下面）
    newestOnTop: true
  })
})