<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { UserIcon, LockOnIcon } from 'tdesign-icons-vue-next'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const formData = ref({
  username: '',
  password: ''
})
const loading = ref(false)

const handleLogin = async () => {
  if (!formData.value.username || !formData.value.password) {
    MessagePlugin.warning('请输入用户名和密码')
    return
  }
  
  loading.value = true
  const success = await userStore.login(formData.value.username, formData.value.password)
  loading.value = false
  
  if (success) {
    MessagePlugin.success('登录成功')
    router.push('/')
  } else {
    MessagePlugin.error('用户名或密码错误')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
    <div class="absolute inset-0 bg-black/20"></div>
    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-2xl font-bold">A</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">后台管理系统</h1>
          <p class="text-gray-500 mt-2">请登录您的账户</p>
        </div>
        
        <t-form :data="formData" @submit="handleLogin">
          <t-form-item name="username">
            <t-input
              v-model="formData.username"
              placeholder="请输入用户名"
              size="large"
              clearable
            >
              <template #prefix-icon>
                <UserIcon />
              </template>
            </t-input>
          </t-form-item>
          
          <t-form-item name="password">
            <t-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              clearable
            >
              <template #prefix-icon>
                <LockOnIcon />
              </template>
            </t-input>
          </t-form-item>
          
          <t-form-item>
            <t-button
              theme="primary"
              type="submit"
              block
              size="large"
              :loading="loading"
            >
              登 录
            </t-button>
          </t-form-item>
        </t-form>
        
        <div class="mt-6 text-center text-sm text-gray-500">
          <p>演示账号: admin / admin123</p>
        </div>
      </div>
    </div>
  </div>
</template>
