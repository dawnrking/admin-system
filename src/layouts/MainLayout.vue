<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  DashboardIcon,
  UserIcon,
  ChartIcon,
  SettingIcon,
  LogoutIcon,
  MenuFoldIcon,
  MenuUnfoldIcon,
  FullscreenIcon,
  FullscreenExitIcon,
  ShopIcon
} from 'tdesign-icons-vue-next'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

userStore.getUserInfo()

const collapsed = ref(false)
const isFullscreen = ref(false)

const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: DashboardIcon },
  { path: '/users', title: '用户管理', icon: UserIcon },
  { path: '/products', title: '商品管理', icon: ShopIcon },
  { path: '/data', title: '数据管理', icon: ChartIcon }
]

const activeMenu = computed(() => route.path)

const handleMenuChange = (path: string) => {
  router.push(path)
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleLogout = () => {
  userStore.logout()
  MessagePlugin.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <div class="h-screen flex bg-gray-100">
    <!-- 侧边栏 -->
    <aside
      :class="[
        'bg-white shadow-lg transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-56'
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center border-b border-gray-100">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <span class="text-white text-lg font-bold">A</span>
        </div>
        <span v-if="!collapsed" class="ml-3 text-lg font-semibold text-gray-800">Admin</span>
      </div>

      <!-- 菜单 -->
      <nav class="flex-1 py-4">
        <div
          v-for="item in menuItems"
          :key="item.path"
          :class="[
            'flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all',
            activeMenu === item.path
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          ]"
          @click="handleMenuChange(item.path)"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span v-if="!collapsed" class="ml-3">{{ item.title }}</span>
        </div>
      </nav>

      <!-- 设置 -->
      <div class="border-t border-gray-100 py-4">
        <div
          class="flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-50"
        >
          <SettingIcon class="w-5 h-5" />
          <span v-if="!collapsed" class="ml-3">系统设置</span>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部导航 -->
      <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6">
        <div class="flex items-center">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
            @click="toggleCollapse"
          >
            <MenuFoldIcon v-if="!collapsed" class="w-5 h-5 text-gray-600" />
            <MenuUnfoldIcon v-else class="w-5 h-5 text-gray-600" />
          </button>
          <t-breadcrumb class="ml-4">
            <t-breadcrumb-item>首页</t-breadcrumb-item>
            <t-breadcrumb-item>{{ route.meta.title }}</t-breadcrumb-item>
          </t-breadcrumb>
        </div>

        <div class="flex items-center space-x-4">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
            @click="toggleFullscreen"
          >
            <FullscreenExitIcon v-if="isFullscreen" class="w-5 h-5 text-gray-600" />
            <FullscreenIcon v-else class="w-5 h-5 text-gray-600" />
          </button>

          <t-dropdown>
            <div class="flex items-center cursor-pointer">
              <t-avatar
                :image="userStore.userInfo?.avatar"
                size="small"
              />
              <span class="ml-2 text-gray-700">{{ userStore.userInfo?.username }}</span>
            </div>
            <template #dropdown>
              <t-dropdown-menu>
                <t-dropdown-item @click="handleLogout">
                  <LogoutIcon class="mr-2" />
                  退出登录
                </t-dropdown-item>
              </t-dropdown-menu>
            </template>
          </t-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
