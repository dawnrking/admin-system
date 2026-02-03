<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  UserIcon,
  CartIcon,
  MoneyIcon,
  TrendingUpIcon
} from 'tdesign-icons-vue-next'
import { getDashboardStats, getDashboardCharts } from '../api'

const dashboardStats = ref({
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  growthRate: 0
})

const chartData = ref({
  weeklyVisits: [] as number[],
  monthlySales: [] as number[],
  categoryDistribution: [] as { name: string; value: number }[]
})

const stats = computed(() => [
  {
    title: '用户总数',
    value: dashboardStats.value.totalUsers,
    icon: UserIcon,
    color: 'bg-blue-500',
    change: '+12%',
    trend: 'up'
  },
  {
    title: '订单总数',
    value: dashboardStats.value.totalOrders,
    icon: CartIcon,
    color: 'bg-green-500',
    change: '+8%',
    trend: 'up'
  },
  {
    title: '总收入',
    value: '¥' + dashboardStats.value.totalRevenue.toLocaleString(),
    icon: MoneyIcon,
    color: 'bg-purple-500',
    change: '+15%',
    trend: 'up'
  },
  {
    title: '增长率',
    value: dashboardStats.value.growthRate + '%',
    icon: TrendingUpIcon,
    color: 'bg-orange-500',
    change: '+2.5%',
    trend: 'up'
  }
])

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const recentOrders = ref([
  { id: 'ORD001', customer: '张三', amount: '¥1,299', status: '已完成', time: '10分钟前' },
  { id: 'ORD002', customer: '李四', amount: '¥599', status: '进行中', time: '25分钟前' },
  { id: 'ORD003', customer: '王五', amount: '¥2,199', status: '待处理', time: '1小时前' },
  { id: 'ORD004', customer: '赵六', amount: '¥899', status: '已完成', time: '2小时前' },
  { id: 'ORD005', customer: '钱七', amount: '¥459', status: '已完成', time: '3小时前' }
])

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    '已完成': 'bg-green-100 text-green-600',
    '进行中': 'bg-blue-100 text-blue-600',
    '待处理': 'bg-yellow-100 text-yellow-600'
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

const maxVisit = computed(() => Math.max(...(chartData.value.weeklyVisits.length ? chartData.value.weeklyVisits : [1])))
const maxSales = computed(() => Math.max(...(chartData.value.monthlySales.length ? chartData.value.monthlySales : [1])))

onMounted(async () => {
  try {
    const [statsData, chartsData] = await Promise.all([
      getDashboardStats(),
      getDashboardCharts()
    ])
    dashboardStats.value = statsData
    chartData.value = chartsData
  } catch (e) {
    console.error('获取仪表盘数据失败', e)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">{{ stat.title }}</p>
            <p class="text-2xl font-bold text-gray-800 mt-2">{{ stat.value }}</p>
            <p class="text-green-500 text-sm mt-2">{{ stat.change }} 较上月</p>
          </div>
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', stat.color]">
            <component :is="stat.icon" class="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 访问量图表 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">本周访问量</h3>
        <div class="h-64 flex items-end justify-between space-x-2">
          <div
            v-for="(value, index) in chartData.weeklyVisits"
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div
              class="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
              :style="{ height: (value / maxVisit * 200) + 'px' }"
            ></div>
            <span class="text-xs text-gray-500 mt-2">{{ weekDays[index] }}</span>
          </div>
        </div>
      </div>

      <!-- 销售额图表 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">月度销售额</h3>
        <div class="h-64 flex items-end justify-between space-x-1">
          <div
            v-for="(value, index) in chartData.monthlySales"
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div
              class="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
              :style="{ height: (value / maxSales * 200) + 'px' }"
            ></div>
            <span class="text-xs text-gray-500 mt-2">{{ months[index] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 下方区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 分类占比 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">分类占比</h3>
        <div class="space-y-4">
          <div
            v-for="(item, index) in chartData.categoryDistribution"
            :key="index"
            class="space-y-2"
          >
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">{{ item.name }}</span>
              <span class="text-gray-800 font-medium">{{ item.value }}%</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="[
                  index === 0 ? 'bg-blue-500' :
                  index === 1 ? 'bg-green-500' :
                  index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                ]"
                :style="{ width: item.value + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近订单 -->
      <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">最近订单</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-gray-500 text-sm border-b">
                <th class="pb-3 font-medium">订单号</th>
                <th class="pb-3 font-medium">客户</th>
                <th class="pb-3 font-medium">金额</th>
                <th class="pb-3 font-medium">状态</th>
                <th class="pb-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in recentOrders"
                :key="order.id"
                class="border-b last:border-0 hover:bg-gray-50"
              >
                <td class="py-4 text-gray-800">{{ order.id }}</td>
                <td class="py-4 text-gray-600">{{ order.customer }}</td>
                <td class="py-4 text-gray-800 font-medium">{{ order.amount }}</td>
                <td class="py-4">
                  <span :class="['px-2 py-1 rounded-full text-xs', getStatusColor(order.status)]">
                    {{ order.status }}
                  </span>
                </td>
                <td class="py-4 text-gray-500 text-sm">{{ order.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
