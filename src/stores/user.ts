import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi } from '../api'

export interface UserInfo {
  id: number
  username: string
  avatar: string
  role: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await loginApi(username, password)
      token.value = data.token
      localStorage.setItem('token', data.token)
      userInfo.value = {
        id: 1,
        username: data.user.name,
        avatar: data.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        role: '超级管理员'
      }
      return true
    } catch (e) {
      return false
    }
  }

  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
  }

  const getUserInfo = () => {
    if (token.value && !userInfo.value) {
      userInfo.value = {
        id: 1,
        username: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        role: '超级管理员'
      }
    }
  }

  return { userInfo, token, login, logout, getUserInfo }
})
