<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { SearchIcon, AddIcon, EditIcon, DeleteIcon } from 'tdesign-icons-vue-next'
import { mockUsers, type User } from '../mock/data'

const users = ref<User[]>([...mockUsers])
const searchKeyword = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

const formData = ref<Partial<User>>({
  name: '',
  email: '',
  phone: '',
  department: '',
  status: ''
})

const departments = ['技术部', '产品部', '市场部', '人事部', '财务部', '运营部']
const statusOptions = ['在职', '离职', '休假']

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchKeyword = !searchKeyword.value ||
      user.name.includes(searchKeyword.value) ||
      user.email.includes(searchKeyword.value)
    const matchDepartment = !selectedDepartment.value || user.department === selectedDepartment.value
    const matchStatus = !selectedStatus.value || user.status === selectedStatus.value
    return matchKeyword && matchDepartment && matchStatus
  })
})

const columns = [
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'name', title: '姓名', width: 100 },
  { colKey: 'email', title: '邮箱', width: 200 },
  { colKey: 'phone', title: '手机号', width: 140 },
  { colKey: 'department', title: '部门', width: 120 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'createTime', title: '创建时间', width: 120 },
  { colKey: 'operation', title: '操作', width: 150, fixed: 'right' }
]

const openAddDialog = () => {
  dialogTitle.value = '添加用户'
  isEdit.value = false
  formData.value = {
    name: '',
    email: '',
    phone: '',
    department: '',
    status: '在职'
  }
  dialogVisible.value = true
}

const openEditDialog = (row: User) => {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (!formData.value.name || !formData.value.email) {
    MessagePlugin.warning('请填写必填项')
    return
  }

  if (isEdit.value) {
    const index = users.value.findIndex(u => u.id === formData.value.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...formData.value } as User
    }
    MessagePlugin.success('更新成功')
  } else {
    const newUser: User = {
      id: Math.max(...users.value.map(u => u.id)) + 1,
      name: formData.value.name!,
      email: formData.value.email!,
      phone: formData.value.phone || '',
      department: formData.value.department || '',
      status: formData.value.status || '在职',
      createTime: new Date().toISOString().split('T')[0]
    }
    users.value.unshift(newUser)
    MessagePlugin.success('添加成功')
  }
  dialogVisible.value = false
}

const handleDelete = (row: User) => {
  users.value = users.value.filter(u => u.id !== row.id)
  MessagePlugin.success('删除成功')
}

const getStatusTag = (status: string) => {
  const themes: Record<string, string> = {
    '在职': 'success',
    '离职': 'danger',
    '休假': 'warning'
  }
  return themes[status] || 'default'
}

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: computed(() => filteredUsers.value.length)
})
</script>

<template>
  <div class="space-y-6">
    <!-- 搜索和操作栏 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex flex-wrap items-center gap-4">
        <t-input
          v-model="searchKeyword"
          placeholder="搜索姓名或邮箱"
          clearable
          style="width: 240px"
        >
          <template #prefix-icon>
            <SearchIcon />
          </template>
        </t-input>

        <t-select
          v-model="selectedDepartment"
          placeholder="选择部门"
          clearable
          style="width: 160px"
        >
          <t-option
            v-for="dept in departments"
            :key="dept"
            :value="dept"
            :label="dept"
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

        <t-button theme="primary" @click="openAddDialog">
          <template #icon><AddIcon /></template>
          添加用户
        </t-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <t-table
        :data="filteredUsers"
        :columns="columns"
        :pagination="pagination"
        row-key="id"
        hover
        stripe
      >
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
              content="确定要删除该用户吗？"
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
        <t-form-item label="姓名" name="name">
          <t-input v-model="formData.name" placeholder="请输入姓名" />
        </t-form-item>
        <t-form-item label="邮箱" name="email">
          <t-input v-model="formData.email" placeholder="请输入邮箱" />
        </t-form-item>
        <t-form-item label="手机号" name="phone">
          <t-input v-model="formData.phone" placeholder="请输入手机号" />
        </t-form-item>
        <t-form-item label="部门" name="department">
          <t-select v-model="formData.department" placeholder="请选择部门">
            <t-option
              v-for="dept in departments"
              :key="dept"
              :value="dept"
              :label="dept"
            />
          </t-select>
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
