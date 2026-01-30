<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  RefreshIcon,
  CheckCircleIcon,
  CloseCircleIcon
} from 'tdesign-icons-vue-next'
import { mockProducts, type Product } from '../mock/data'

const products = ref<Product[]>([...mockProducts])
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('新增商品')
const currentProduct = ref<Partial<Product>>({})
const isEdit = ref(false)

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const categories = ['电子产品', '服饰鞋包', '家居用品', '电脑配件']

const filteredProducts = computed(() => {
  let result = products.value
  if (searchKeyword.value) {
    result = result.filter(p => p.name.includes(searchKeyword.value))
  }
  if (statusFilter.value) {
    result = result.filter(p => p.status === statusFilter.value)
  }
  if (categoryFilter.value) {
    result = result.filter(p => p.category === categoryFilter.value)
  }
  pagination.value.total = result.length
  return result
})

const columns = [
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'image', title: '图片', width: 100 },
  { colKey: 'name', title: '商品名称', width: 200 },
  { colKey: 'category', title: '分类', width: 120 },
  { colKey: 'price', title: '价格', width: 120 },
  { colKey: 'stock', title: '库存', width: 100 },
  { colKey: 'status', title: '状态', width: 120 },
  { colKey: 'createTime', title: '创建时间', width: 150 },
  { colKey: 'operation', title: '操作', width: 200, fixed: 'right' }
]

const handleSearch = () => {
  pagination.value.current = 1
}

const handleReset = () => {
  searchKeyword.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
  pagination.value.current = 1
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增商品'
  currentProduct.value = {
    name: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'off_sale',
    image: '',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: Product) => {
  isEdit.value = true
  dialogTitle.value = '编辑商品'
  currentProduct.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: Product) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除商品"${row.name}"吗？`,
    confirmBtn: '确定',
    cancelBtn: '取消',
    onConfirm: () => {
      products.value = products.value.filter(p => p.id !== row.id)
      MessagePlugin.success('删除成功')
      dialog.destroy()
    }
  })
}

const handleToggleStatus = (row: Product) => {
  const newStatus = row.status === 'on_sale' ? 'off_sale' : 'on_sale'
  const action = newStatus === 'on_sale' ? '上架' : '下架'
  const dialog = DialogPlugin.confirm({
    header: `确认${action}`,
    body: `确定要${action}商品"${row.name}"吗？`,
    confirmBtn: '确定',
    cancelBtn: '取消',
    onConfirm: () => {
      const index = products.value.findIndex(p => p.id === row.id)
      if (index !== -1) {
        products.value[index].status = newStatus
        MessagePlugin.success(`${action}成功`)
      }
      dialog.destroy()
    }
  })
}

const handleSubmit = () => {
  if (!currentProduct.value.name || !currentProduct.value.category) {
    MessagePlugin.warning('请填写完整信息')
    return
  }
  
  if (isEdit.value) {
    const index = products.value.findIndex(p => p.id === currentProduct.value.id)
    if (index !== -1) {
      products.value[index] = { ...products.value[index], ...currentProduct.value } as Product
      MessagePlugin.success('编辑成功')
    }
  } else {
    const newId = Math.max(...products.value.map(p => p.id)) + 1
    products.value.unshift({
      ...currentProduct.value,
      id: newId,
      createTime: new Date().toISOString().split('T')[0]
    } as Product)
    MessagePlugin.success('添加成功')
  }
  dialogVisible.value = false
}

const getStatusTag = (status: string) => {
  return status === 'on_sale'
    ? { theme: 'success', text: '在售' }
    : { theme: 'default', text: '下架' }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 搜索区域 -->
    <t-card :bordered="false">
      <div class="flex flex-wrap gap-4 items-end">
        <t-input
          v-model="searchKeyword"
          placeholder="搜索商品名称"
          clearable
          style="width: 200px"
          @enter="handleSearch"
        >
          <template #prefix-icon><SearchIcon /></template>
        </t-input>
        <t-select
          v-model="statusFilter"
          placeholder="状态筛选"
          clearable
          style="width: 150px"
        >
          <t-option value="on_sale" label="在售" />
          <t-option value="off_sale" label="下架" />
        </t-select>
        <t-select
          v-model="categoryFilter"
          placeholder="分类筛选"
          clearable
          style="width: 150px"
        >
          <t-option v-for="cat in categories" :key="cat" :value="cat" :label="cat" />
        </t-select>
        <t-button theme="primary" @click="handleSearch">
          <template #icon><SearchIcon /></template>
          搜索
        </t-button>
        <t-button theme="default" @click="handleReset">
          <template #icon><RefreshIcon /></template>
          重置
        </t-button>
        <div class="flex-1"></div>
        <t-button theme="primary" @click="handleAdd">
          <template #icon><AddIcon /></template>
          新增商品
        </t-button>
      </div>
    </t-card>

    <!-- 数据表格 -->
    <t-card :bordered="false">
      <t-table
        :data="filteredProducts"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        hover
        stripe
        @page-change="(pageInfo: any) => pagination.current = pageInfo.current"
      >
        <template #image="{ row }">
          <t-image
            :src="row.image"
            :style="{ width: '60px', height: '60px' }"
            fit="cover"
            shape="round"
          />
        </template>
        <template #price="{ row }">
          <span class="text-orange-500 font-semibold">¥{{ row.price.toLocaleString() }}</span>
        </template>
        <template #stock="{ row }">
          <span :class="row.stock === 0 ? 'text-red-500' : ''">
            {{ row.stock }}
          </span>
        </template>
        <template #status="{ row }">
          <t-tag :theme="getStatusTag(row.status).theme as any" variant="light">
            {{ getStatusTag(row.status).text }}
          </t-tag>
        </template>
        <template #operation="{ row }">
          <div class="flex gap-2">
            <t-button
              v-if="row.status === 'off_sale'"
              theme="success"
              variant="text"
              size="small"
              @click="handleToggleStatus(row)"
            >
              <template #icon><CheckCircleIcon /></template>
              上架
            </t-button>
            <t-button
              v-else
              theme="warning"
              variant="text"
              size="small"
              @click="handleToggleStatus(row)"
            >
              <template #icon><CloseCircleIcon /></template>
              下架
            </t-button>
            <t-button theme="primary" variant="text" size="small" @click="handleEdit(row)">
              <template #icon><EditIcon /></template>
              编辑
            </t-button>
            <t-button theme="danger" variant="text" size="small" @click="handleDelete(row)">
              <template #icon><DeleteIcon /></template>
              删除
            </t-button>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 新增/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      width="600px"
      :confirm-on-enter="true"
      @confirm="handleSubmit"
    >
      <t-form :data="currentProduct" label-width="100px">
        <t-form-item label="商品名称" name="name">
          <t-input v-model="currentProduct.name" placeholder="请输入商品名称" />
        </t-form-item>
        <t-form-item label="分类" name="category">
          <t-select v-model="currentProduct.category" placeholder="请选择分类">
            <t-option v-for="cat in categories" :key="cat" :value="cat" :label="cat" />
          </t-select>
        </t-form-item>
        <t-form-item label="价格" name="price">
          <t-input-number
            v-model="currentProduct.price"
            :min="0"
            :decimal-places="2"
            theme="normal"
            style="width: 100%"
          />
        </t-form-item>
        <t-form-item label="库存" name="stock">
          <t-input-number
            v-model="currentProduct.stock"
            :min="0"
            theme="normal"
            style="width: 100%"
          />
        </t-form-item>
        <t-form-item label="图片链接" name="image">
          <t-input v-model="currentProduct.image" placeholder="请输入图片链接" />
        </t-form-item>
        <t-form-item label="商品描述" name="description">
          <t-textarea
            v-model="currentProduct.description"
            placeholder="请输入商品描述"
            :maxlength="200"
          />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="currentProduct.status">
            <t-radio value="on_sale">上架</t-radio>
            <t-radio value="off_sale">下架</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
