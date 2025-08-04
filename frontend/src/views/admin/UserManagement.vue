<template>
  <div class="user-management">
    <div class="page-header">
      <h2>사용자 관리</h2>
      <div class="header-actions">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="사용자 검색..."
          class="search-input"
          @input="debouncedSearch"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !users.length" class="loading-state">
      <div class="spinner"></div>
      <p>사용자 목록을 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <p>{{ error }}</p>
      <button @click="fetchUsers" class="retry-btn">다시 시도</button>
    </div>

    <!-- Users Table -->
    <div v-else-if="users.length > 0" class="users-container">
      <div class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>사용자명</th>
              <th>이메일</th>
              <th>권한</th>
              <th>채팅 수</th>
              <th>토큰 사용량</th>
              <th>마지막 활동</th>
              <th>가입일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <div class="user-info">
                  <span>{{ user.username }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['badge', user.is_admin ? 'badge-admin' : 'badge-user']">
                  {{ user.is_admin ? '관리자' : '일반 사용자' }}
                </span>
              </td>
              <td>{{ user.total_chats || 0 }}</td>
              <td>{{ formatTokens(user.total_tokens || 0) }}</td>
              <td>{{ user.last_active ? formatDate(user.last_active) : '-' }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    @click="toggleAdmin(user)"
                    class="action-btn admin-btn"
                    :disabled="user.id === authStore.user?.id"
                    :title="user.is_admin ? '관리자 권한 해제' : '관리자 권한 부여'"
                  >
                    <svg v-if="user.is_admin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    class="action-btn delete-btn"
                    :disabled="user.id === authStore.user?.id"
                    title="삭제"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
          이전
        </button>
        <span class="page-info"> {{ currentPage }} / {{ totalPages }} 페이지 </span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          다음
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <p>사용자가 없습니다.</p>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="userToDelete" class="modal-overlay" @click="userToDelete = null">
        <div class="modal confirm-modal" @click.stop>
          <div class="modal-header">
            <h3>사용자 삭제 확인</h3>
          </div>
          <div class="modal-body">
            <p class="confirm-message">
              정말로 <strong>{{ userToDelete.username }}</strong> 사용자를 삭제하시겠습니까?
            </p>
            <p class="warning-message">
              <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              이 작업은 되돌릴 수 없으며, 모든 채팅 기록과 데이터가 영구적으로 삭제됩니다.
            </p>
          </div>
          <div class="modal-footer">
            <button @click="userToDelete = null" class="modal-btn secondary">취소</button>
            <button @click="deleteUser" class="modal-btn danger">삭제</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import { adminService, type User } from '../../services/admin.service'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// State
const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalUsers = ref(0)
const searchQuery = ref('')
const userToDelete = ref<User | null>(null)

const limit = 20

// Format helpers
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTokens = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

// Fetch users from real API
const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await adminService.getUsers(currentPage.value, limit)
    
    users.value = response.items
    totalUsers.value = response.total
    totalPages.value = response.pages
    currentPage.value = response.page
  } catch (err: any) {
    console.error('Error fetching users:', err)
    error.value = err.response?.data?.detail || '사용자 목록을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// Search handling
const handleSearch = () => {
  // Reset to first page when searching
  currentPage.value = 1
  fetchUsers()
}

// Debounced search to avoid too many API calls
let searchTimeout: NodeJS.Timeout | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
}

// Pagination
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchUsers()
  }
}

// User actions
const toggleAdmin = async (user: User) => {
  try {
    const updatedUser = await adminService.toggleAdminStatus(user.id)
    
    // Update the user in the current view
    const index = users.value.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    
    // Show success message
    const message = updatedUser.is_admin 
      ? `${user.username}님에게 관리자 권한을 부여했습니다.`
      : `${user.username}님의 관리자 권한을 해제했습니다.`
    notificationStore.success(message)
  } catch (err: any) {
    console.error('Error toggling admin status:', err)
    const errorMessage = err.response?.data?.detail || '권한 변경 중 오류가 발생했습니다.'
    notificationStore.error(errorMessage)
  }
}

const confirmDelete = (user: User) => {
  userToDelete.value = user
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  try {
    await adminService.deleteUser(userToDelete.value.id)
    
    // Show success message
    notificationStore.success(`${userToDelete.value.username} 사용자가 삭제되었습니다.`)
    
    userToDelete.value = null
    
    // Refetch current page
    // If the current page is now empty and not the first page, go to previous page
    if (users.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    
    await fetchUsers()
  } catch (err: any) {
    console.error('Error deleting user:', err)
    const errorMessage = err.response?.data?.detail || '사용자 삭제 중 오류가 발생했습니다.'
    notificationStore.error(errorMessage)
    userToDelete.value = null
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h2 {
  margin: 0;
  font-size: 1.75rem;
  color: #1e293b;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 250px;
  transition: all 0.2s;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Loading & Error States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Table */
.users-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.users-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.users-table tbody tr {
  transition: background-color 0.15s;
}

.users-table tbody tr:hover {
  background: #f8fafc;
}

/* Center the actions column */
.users-table th:last-child,
.users-table td:last-child {
  text-align: center;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-admin {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.badge-user {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  background: white;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.admin-btn {
  color: #f59e0b;
}

.admin-btn:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #fbbf24;
  color: #d97706;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  color: #64748b;
  font-weight: 500;
  font-size: 0.875rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8fafc;
}

.modal-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.modal-btn.primary {
  background: #3b82f6;
  color: white;
}

.modal-btn.primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-btn.secondary {
  background: #e5e7eb;
  color: #374151;
}

.modal-btn.secondary:hover {
  background: #d1d5db;
}

.modal-btn.danger {
  background: #ef4444;
  color: white;
}

.modal-btn.danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Confirm Modal */
.confirm-modal {
  max-width: 400px;
}

.confirm-message {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.warning-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #ef4444;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .users-table {
    font-size: 0.875rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
