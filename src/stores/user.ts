import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  id: number
  username: string
  avatar: string
  role: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const login = (username: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
          const mockToken = 'mock-token-' + Date.now()
          token.value = mockToken
          localStorage.setItem('token', mockToken)
          userInfo.value = {
            id: 1,
            username: 'Admin',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
            role: '超级管理员'
          }
          resolve(true)
        } else {
          resolve(false)
        }
      }, 500)
    })
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
