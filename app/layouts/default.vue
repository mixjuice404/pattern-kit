<template>
  <div>
    <header class="main-header">
      <div class="logo">
        <img src="~/assets/images/logo.png" alt="logo" width="60" height="60" />
        <div style="line-height: 1.4; font-size: 12px;">
          <div style="font-size: 16px; letter-spacing: -0.5px; font-weight: 600;">Ethereal Yarnworks</div>
          <div>Admin Console.</div>
        </div>
      </div>
      <div class="header-nav">
        <div 
          v-for="nav in availableTopNavs" 
          :key="nav.id"
          class="header-nav-item" 
          :class="{ active: currentTopNav === nav.id }"
          @click="switchTopNav(nav.id)"
        >
          {{ nav.label }}
        </div>
      </div>
      <div class="profile" v-if="user">
        <div class="profile-action" @click="logout" title="Logout">
          <icon name="solar:logout-2-linear" size="20" />
        </div>
        <div class="profile-image">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="avatar" />
        </div>
        <div class="profile-info">
          <div class="profile-name">
            <div style="font-weight: 600;">{{ user.name || '-' }}</div>
            <div v-if="user.isRoot" class="badge badge-soft badge-sm badge-secondary" style="font-size: 12px; font-weight: 700;">ROOT</div>
            <div v-else-if="user.roles && user.roles.length" class="badge badge-soft badge-sm badge-primary" style="font-size: 12px; font-weight: 700;">{{ user.roles[0] }}</div>
          </div>
          <div class="profile-email">
            <span style="opacity: 0.7;">{{ user.email }}</span>
          </div>
        </div>
      </div>
    </header>
    
    <div class="main-body">
      <aside>
        <div v-for="(item, index) in menuItems" :key="index" class="aside-nav" >
          <div class="aside-nav-summary">
            {{ item.summary }}
          </div>
          <ul class="aside-menus">
            <li v-for="(subItem, subIndex) in item.children" :key="subIndex" 
            class="aside-menu-item" @click="goto(subItem)"
            :class="{'active': subItem.path === router.currentRoute.value.path}">
              <icon :name="subItem.icon" size="16" />
              <div class="item__text">{{ subItem.label }}</div>
            </li>
          </ul>
        </div>
      </aside>
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRoute, useRouter } from 'vue-router'

const { hasRole, hasPermission, user, logout } = useAuth()
const route = useRoute()
const router = useRouter()

// 顶部导航配置
const topNavs = [
  { id: 'apps', label: 'Creator Studio', default_path: '/pattern/list' },
  { id: 'admin', label: 'Workspace', roles: ['ROOT', 'ADMIN'], default_path: '/admin/users' }
]

// 过滤当前用户可见的顶部导航
const availableTopNavs = computed(() => {
  return topNavs.filter(nav => {
    if (nav.roles?.length && !nav.roles.some(r => hasRole(r))) return false
    return true
  })
})

// 根据当前路由判断激活的顶部导航
const currentTopNav = computed(() => {
  if (route.path.startsWith('/admin') || route.path.startsWith('/system')) {
    return 'admin'
  }
  return 'apps'
})

// 切换顶部导航并跳转到该导航下的第一个可用页面
const switchTopNav = (navId: string) => {
  if (currentTopNav.value === navId) return
  
  // 优先查找是否配置了默认跳转路径
  const navConfig = topNavs.find(n => n.id === navId)
  if (navConfig && navConfig.default_path) {
    router.push(navConfig.default_path)
    return
  }
  
  // 兜底：如果没有配置默认路径，则寻找该导航下的第一个可用页面
  const targetNavItems = baseMenuItems.filter(item => item.topNav === navId)
  for (const item of targetNavItems) {
    if (item.roles?.length && !item.roles.some((r: string) => hasRole(r))) continue
    
    for (const child of item.children) {
      if (child.roles?.length && !child.roles.some((r: string) => hasRole(r))) continue
      if (child.path) {
        router.push(child.path)
        return
      }
    }
  }
}

const baseMenuItems: any[] = [
  {
    topNav: 'apps',
    summary: 'Patterns',
    children: [
      { label: 'Listings', path: '/pattern/list', icon: 'hugeicons:archive-02' },
      { label: 'Templates', path: null, icon: 'hugeicons:folder-02' },
      { label: 'Drafts', path: '/pattern/draft', icon: 'hugeicons:document-attachment' },
    ]
  },
  {
    topNav: 'apps',
    summary: 'Ai Studio',
    children: [
      { label: 'Prompts', path: '/ai/prompt', icon: 'hugeicons:command-line', roles: ['ROOT', 'ADMIN'] },
      { label: 'Workflow', path: '/setting', icon: 'hugeicons:workflow-square-01' },
      { label: 'Integration', path: null, icon: 'hugeicons:api' }
    ]
  },
  {
    topNav: 'apps',
    summary: 'Dictionary',
    children: [
      { label: 'Stitch Dictionary', path: "/dict/stitch", icon: 'hugeicons:command-line' },
      { label: 'Localization', path: null, icon: 'hugeicons:language-square' }
    ]
  },
  {
    topNav: 'apps',
    summary: 'Apps',
    children: [
      { label: 'Marketing', path: '/apps/marketing', icon: 'hugeicons:rocket-01' },
    ]
  },
  {
    topNav: 'admin',
    summary: 'Permissions',
    roles: ['ROOT', 'ADMIN'], // 使用 roles 控制菜单显示
    children: [
      { label: 'Users', path: '/admin/users', icon: 'hugeicons:user-multiple', roles: ['ROOT', 'ADMIN'] },
    ]
  }
]

// 动态过滤菜单：根据 topNav、roles 或 permissions 校验
const menuItems = computed(() => {
  return baseMenuItems.filter(item => {
    // 只显示当前选中顶部导航对应的菜单
    if (item.topNav !== currentTopNav.value) return false;

    // 如果父菜单配置了权限，先校验父菜单
    if (item.roles?.length && !item.roles.some((r: string) => hasRole(r))) return false;
    if (item.permissions?.length && !item.permissions.some((p: string) => hasPermission(p))) return false;
    return true;
  }).map(item => {
    // 校验子菜单的权限
    const children = item.children.filter((child: any) => {
      if (child.roles?.length && !child.roles.some((r: string) => hasRole(r))) return false;
      if (child.permissions?.length && !child.permissions.some((p: string) => hasPermission(p))) return false;
      return true;
    })
    return { ...item, children }
  }).filter(item => item.children.length > 0) // 如果子菜单全被过滤掉，父菜单也不显示
})

const goto = (item: any) => {
  if (item.path) {
    router.push(item.path)
  }
}

</script>

<style scoped lang="scss">

.main-header {
  height: 64px;
  background-color: white; 
  border-bottom: 0.5px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;


  .logo {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .header-nav {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-grow: 1;
    padding: 0 40px;

    .header-nav-item {
      padding: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      position: relative;

      &:hover, &.active {
        color: var(--color-success);
      }
    }
     
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 12px;

    /* 悬停 profile 容器时，显示 action 按钮 */
    &:hover .profile-action {
      opacity: 0.6;
      visibility: visible;
      transform: translateX(0);
    }

    .profile-action {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      /* 初始状态：隐藏、透明并向右稍微偏移 */
      opacity: 0;
      visibility: hidden;
      transform: translateX(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        opacity: 1 !important;
        color: var(--color-error);
      }
    }

    .profile-info {
      font-size: 12px;

      .profile-name {
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
}


.main-body {
  height: calc(100vh - 64px);
  display: grid;
  grid-template-columns: 240px auto;

  aside {
    background-color: white;
    border-right: 0.5px solid oklch(92.8% 0.006 264.531);
    padding: 15px;
    

    .aside-nav {
      margin-bottom: 5px;

      .aside-nav-summary {
        font-size: 12px;
        text-transform: uppercase;
        color: var(--color-gray-400);
        font-weight: 600;
        padding-left: 4px;
      }

      .aside-menus {
        font-size: 14px; 
        padding: 10px 0; 
        display: flex; 
        flex-direction: 
        column; gap: 2px;

        .aside-menu-item {
          padding: 12px 10px;
          
          display: flex; 
          align-items: center; 
          gap: 10px;
          border-radius: 4px;
          cursor: pointer !important;
          font-weight: 500;
          
          transition: all 0.2s ease-in-out;
          border: 1px solid transparent;

          .item__text {
            line-height: 1;
            color: var(--color-slate-600);
          }

          &:hover {
            background-color: var(--color-gray-50);
          }

          &:focus {
            outline: none;
          }

          &.active {
            background-color: var(--color-slate-50);
            color: var(--color-success);
            border: 1px solid var(--color-gray-100);
          }
        }
      }
    }
  }

  main {
    padding: 25px;
    height: calc(100vh - 70px);
    overflow: auto;

    /* 隐藏滚动条 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  }

}
</style>