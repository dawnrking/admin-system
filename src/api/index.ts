const BASE_URL = 'https://admin-system-server.vercel.app/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })
  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(data.message || '请求失败')
  }
  return data.data
}

// 登录
export const login = (username: string, password: string) =>
  request<{ token: string; user: { username: string; name: string } }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })

// 仪表盘
export const getDashboardStats = () => request<{
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  growthRate: number
}>('/dashboard/stats')

export const getDashboardCharts = () => request<{
  weeklyVisits: number[]
  monthlySales: number[]
  categoryDistribution: { name: string; value: number }[]
}>('/dashboard/charts')

// 用户管理
export const getUsers = () => request<any[]>('/users')
export const createUser = (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) })
export const updateUser = (id: number, data: any) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteUser = (id: number) => request(`/users/${id}`, { method: 'DELETE' })

// 商品管理
export const getProducts = () => request<any[]>('/products')
export const createProduct = (data: any) => request('/products', { method: 'POST', body: JSON.stringify(data) })
export const updateProduct = (id: number, data: any) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteProduct = (id: number) => request(`/products/${id}`, { method: 'DELETE' })
export const updateProductStatus = (id: number, status: string) => 
  request(`/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })

// 数据管理
export const getDataItems = () => request<any[]>('/data')
export const createDataItem = (data: any) => request('/data', { method: 'POST', body: JSON.stringify(data) })
export const updateDataItem = (id: number, data: any) => request(`/data/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteDataItem = (id: number) => request(`/data/${id}`, { method: 'DELETE' })
