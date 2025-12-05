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
      <div class="profile">
        <div class="profile-image"></div>
        <div class="profile-info">
          <div class="profile-name">Mixjuice</div>
          <div class="profile-email">mixjuice404@gmail.com</div>
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
const menuItems = [
  {
    summary: 'Patterns',
    children: [
      { label: 'Listings', path: '/pattern/list', icon: 'hugeicons:archive-02' },
      { label: 'Templates', path: null, icon: 'hugeicons:folder-02' }
    ]
  },
  {
    summary: 'Ai Studio',
    children: [
      { label: 'Prompts', path: '/ai/prompt', icon: 'hugeicons:command-line' },
      { label: 'Workflow', path: '/setting', icon: 'hugeicons:workflow-square-01' },
      { label: 'Integration', path: null, icon: 'hugeicons:api' }
    ]
  },
  {
    summary: 'Dictionary',
    children: [
      { label: 'Stitch Dictionary', path: "/dict/stitch", icon: 'hugeicons:command-line' },
      { label: 'Localization', path: null, icon: 'hugeicons:language-square' }
    ]
  }
]

const router = useRouter()
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

  .profile {
    display: flex;
    align-items: center;

    .profile-info {
      font-size: 12px;

      .profile-name {
        font-size: 14px;
        font-weight: bold;
      }
    }
  }
}


.main-body {
  height: calc(100vh - 64px);
  display: grid;
  grid-template-columns: 260px 1fr;

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