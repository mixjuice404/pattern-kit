<script setup lang="ts">
import { computed, ref } from 'vue'
import UserModal from '~/components/modal/admin/user/index.vue'

// 核心：使用我们在中间件写的拦截器，必须具备 ROOT 或 ADMIN 角色才能访问该页面
definePageMeta({
  roles: ['ROOT', 'ADMIN']
})

const breadcrumbs = [
  { label: "Home", to: "/", icon: "solar:home-2-outline" },
  { label: "Permissions", icon: "solar:emoji-funny-circle-outline" },
  { label: "Users" },
];

// 获取用户列表和角色列表
const { data: userRes, pending: loadingUsers, refresh: refreshUsers } = await useFetch<any>('/api/auth/admin/users')
const { data: roleRes } = await useFetch<any>('/api/auth/admin/roles')

const users = computed(() => userRes.value?.data?.list || [])
const rolesList = computed(() => roleRes.value?.data || [])

const addUserModalRef = ref<InstanceType<typeof UserModal> | null>(null)
const deletingIds = ref<Set<number>>(new Set())
const toast = useAppToast()

const openAddModal = () => {
  addUserModalRef.value?.open()
}

const deleteUser = async (user: any) => {
  if (deletingIds.value.has(user.id)) return
  if (!confirm(`确定要删除用户 ${user.email || user.name} 吗？此操作不可恢复。`)) return

  deletingIds.value.add(user.id)
  try {
    const res: any = await $fetch(`/api/auth/admin/users/${user.id}`, { method: 'DELETE' })
    toast.success(res?.message || '删除成功')
    refreshUsers()
  } catch (e: any) {
    toast.error(e.data?.message || '删除失败')
  } finally {
    deletingIds.value.delete(user.id)
  }
}
</script>

<template>
  <div class="default-container">
    
    <PageHeader title="User List" :breadcrumbs="breadcrumbs" >
      <button class="btn btn-sm btn-soft btn-primary" @click="refreshUsers()" :disabled="loadingUsers">
        <icon v-if="!loadingUsers" name="solar:refresh-bold" size="16" />
        <span v-else class="loading loading-spinner loading-xs"></span>
      </button>
      <button class="btn btn-sm btn-primary" @click="openAddModal">
        <icon name="hugeicons:plus-sign-square" size="16" />
        <span>添加用户</span>
      </button>
    </PageHeader>

    <div style=" background-color: #fff; border-radius: 8px; padding: 10px;">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Nickname</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="hover">
            <td>{{ user.id }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.name || '-' }}</td>
            <td>
              <div class="flex gap-1">
                <div v-if="user.is_root" class="badge badge-outline badge-secondary" style="font-size: 12px; font-weight: 700;">Root</div>
                <div v-for="role in user.roles" :key="role" class="badge badge-outline badge-primary" style="font-size: 12px; font-weight: 700;">{{ role }}</div>
                <div v-if="!user.roles?.length && !user.is_root" class="text-gray-400 text-xs">无角色</div>
              </div>
            </td>
            <td>
              <div class="badge badge-soft" :class="user.status === 1 ? 'badge-success' : 'badge-neutral'">
                <span style="font-size: 12px; font-weight: 600;">{{ user.status === 1 ? 'Active' : 'Disabled' }}</span>
              </div>
            </td>
            <td>{{ new Date(user.created_at).toLocaleString() }}</td>
            <td>
              <div class="flex gap-1">
              
                <button class="btn btn-sm btn-soft btn-primary" >编辑</button>
                <button class="btn btn-sm btn-soft btn-primary" >重置密码</button>
                <button 
                  class="btn btn-sm btn-soft btn-error" 
                  v-if="!user.is_root" 
                  :disabled="deletingIds.has(user.id)" 
                  @click="deleteUser(user)"
                >
                  <span v-if="deletingIds.has(user.id)" class="loading loading-spinner loading-xs"></span>
                  <span v-else>删除</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加用户弹窗组件 -->
    <UserModal ref="addUserModalRef" :roles-list="rolesList" @success="refreshUsers" />

  </div>
</template>

<style scoped lang="scss">

</style>