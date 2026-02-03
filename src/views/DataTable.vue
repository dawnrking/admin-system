<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  SearchIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  DownloadIcon,
  RefreshIcon
} from 'tdesign-icons-vue-next'
import { getDataItems, createDataItem, updateDataItem, deleteDataItem } from '../api'

interface DataItem {
  id: number
  orderNo: string
  productName: string
  category: string
  price: number
  quantity: number
  status: string
  createTime: string
}

const dataItems = ref<DataItem[]>([])
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

const formData = ref<Partial<DataItem>>({
  orderNo: '',
  productName: '',
  category: '',
  price: 0,
  quantity: 0,
  status: ''
})

const categories = ['电子产品', '服饰鞋包', '家居用品', '电脑配件']
const statusOptions = ['已完成', '进行中', '待处理', '已取消']

const filteredData = computed(() => {
  return dataItems.value.filter(item => {
    const matchKeyword = !searchKeyword.value ||
      item.orderNo.includes(searchKeyword.value) ||
      item.productName.includes(searchKeyword.value)
    const matchCategory = !selectedCategory.value || item.category === selectedCategory.value
    const matchStatus = !selectedStatus.value || item.status === selectedStatus.value
    return matchKeyword && matchCategory && matchStatus
  })
})

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'id', title: 'ID', width: 60 },
  { colKey: 'orderNo', title: '订单号', width: 140 },
  { colKey: 'productName', title: '商品名称', width: 160 },
  { colKey: 'category', title: '分类', width: 100 },
  { colKey: 'price', title: '单价', width: 100 },
  { colKey: 'quantity', title: '数量', width: 80 },
  { colKey: 'total', title: '总金额', width: 120 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'createTime', title: '创建时间', width: 120 },
  { colKey: 'operation', title: '操作', width: 150, fixed: 'right' }
]

const selectedRowKeys = ref<number[]>([])

const openAddDialog = () => {
  dialogTitle.value = '添加数据'
  isEdit.value = false
  formData.value = {
    orderNo: 'ORD' + Date.now().toString().slice(-8),
    productName: '',
    category: '',
    price: 0,
    quantity: 1,
    status: '待处理'
  }
  dialogVisible.value = true
}

const openEditDialog = (row: DataItem) => {
  dialogTitle.value = '编辑数据'
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.value.productName || !formData.value.category) {
    MessagePlugin.warning('请填写必填项')
    return
  }

  try {
    if (isEdit.value) {
      await updateDataItem(formData.value.id!, formData.value)
      const index = dataItems.value.findIndex(d => d.id === formData.value.id)
      if (index !== -1) {
        dataItems.value[index] = { ...dataItems.value[index], ...formData.value } as DataItem
      }
      MessagePlugin.success('更新成功')
    } else {
      const newItem = await createDataItem(formData.value) as DataItem
      dataItems.value.unshift(newItem)
      MessagePlugin.success('添加成功')
    }
    dialogVisible.value = false
  } catch (e) {
    MessagePlugin.error('操作失败')
  }
}

const handleDelete = async (row: DataItem) => {
  try {
    await deleteDataItem(row.id)
    dataItems.value = dataItems.value.filter(d => d.id !== row.id)
    MessagePlugin.success('删除成功')
  } catch (e) {
    MessagePlugin.error('删除失败')
  }
}

const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    MessagePlugin.warning('请选择要删除的数据')
    return
  }
  try {
    await Promise.all(selectedRowKeys.value.map(id => deleteDataItem(id)))
    dataItems.value = dataItems.value.filter(d => !selectedRowKeys.value.includes(d.id))
    selectedRowKeys.value = []
    MessagePlugin.success('批量删除成功')
  } catch (e) {
    MessagePlugin.error('批量删除失败')
  }
}

const handleRefresh = async () => {
  loading.value = true
  try {
    dataItems.value = await getDataItems()
    MessagePlugin.success('刷新成功')
  } catch (e) {
    MessagePlugin.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const handleExport = () => {
  MessagePlugin.info('导出功能演示')
}

const getStatusTag = (status: string) => {
  const themes: Record<string, string> = {
    '已完成': 'success',
    '进行中': 'primary',
    '待处理': 'warning',
    '已取消': 'danger'
  }
  return themes[status] || 'default'
}

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: computed(() => filteredData.value.length)
})

const fetchDataItems = async () => {
  loading.value = true
  try {
    dataItems.value = await getDataItems()
  } catch (e) {
    MessagePlugin.error('获取数据列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDataItems()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 搜索和操作栏 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex flex-wrap items-center gap-4">
        <t-input
          v-model="searchKeyword"
          placeholder="搜索订单号或商品名"
          clearable
          style="width: 240px"
        >
          <template #prefix-icon>
            <SearchIcon />
          </template>
        </t-input>

        <t-select
          v-model="selectedCategory"
          placeholder="选择分类"
          clearable
          style="width: 140px"
        >
          <t-option
            v-for="cat in categories"
            :key="cat"
            :value="cat"
            :label="cat"
          />
        </t-select>

        <t-select
          v-model="selectedStatus"
          placeholder="选择状态"
          clearable
          style="width: 120px"
        >
          <t-option
            v-for="status in statusOptions"
            :key="status"
            :value="status"
            :label="status"
          />
        </t-select>

        <div class="flex-1"></div>

        <t-button variant="outline" @click="handleRefresh">
          <template #icon><RefreshIcon /></template>
          刷新
        </t-button>

        <t-button variant="outline" @click="handleExport">
          <template #icon><DownloadIcon /></template>
          导出
        </t-button>

        <t-button
          theme="danger"
          variant="outline"
          :disabled="selectedRowKeys.length === 0"
          @click="handleBatchDelete"
        >
          <template #icon><DeleteIcon /></template>
          批量删除
        </t-button>

        <t-button theme="primary" @click="openAddDialog">
          <template #icon><AddIcon /></template>
          添加数据
        </t-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <t-table
        :data="filteredData"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        :selected-row-keys="selectedRowKeys"
        row-key="id"
        hover
        stripe
        @select-change="(keys: number[]) => selectedRowKeys = keys"
      >
        <template #price="{ row }">
          ¥{{ row.price.toFixed(2) }}
        </template>

        <template #total="{ row }">
          <span class="text-blue-600 font-medium">
            ¥{{ (row.price * row.quantity).toLocaleString() }}
          </span>
        </template>

        <template #status="{ row }">
          <t-tag :theme="getStatusTag(row.status)" variant="light">
            {{ row.status }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <div class="flex items-center space-x-2">
            <t-button theme="primary" variant="text" size="small" @click="openEditDialog(row)">
              <template #icon><EditIcon /></template>
              编辑
            </t-button>
            <t-popconfirm
              content="确定要删除该数据吗？"
              @confirm="handleDelete(row)"
            >
              <t-button theme="danger" variant="text" size="small">
                <template #icon><DeleteIcon /></template>
                删除
              </t-button>
            </t-popconfirm>
          </div>
        </template>
      </t-table>
    </div>

    <!-- 添加/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      :confirm-on-enter="true"
      @confirm="handleSubmit"
    >
      <t-form :data="formData" label-width="80px">
        <t-form-item label="订单号" name="orderNo">
          <t-input v-model="formData.orderNo" placeholder="请输入订单号" :disabled="isEdit" />
        </t-form-item>
        <t-form-item label="商品名称" name="productName">
          <t-input v-model="formData.productName" placeholder="请输入商品名称" />
        </t-form-item>
        <t-form-item label="分类" name="category">
          <t-select v-model="formData.category" placeholder="请选择分类">
            <t-option
              v-for="cat in categories"
              :key="cat"
              :value="cat"
              :label="cat"
            />
          </t-select>
        </t-form-item>
        <t-form-item label="单价" name="price">
          <t-input-number
            v-model="formData.price"
            :min="0"
            :decimal-places="2"
            style="width: 100%"
          />
        </t-form-item>
        <t-form-item label="数量" name="quantity">
          <t-input-number
            v-model="formData.quantity"
            :min="1"
            style="width: 100%"
          />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="formData.status" placeholder="请选择状态">
            <t-option
              v-for="status in statusOptions"
              :key="status"
              :value="status"
              :label="status"
            />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
