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
          @input="handleSearch"
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
      <p>❌ {{ error }}</p>
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
              <th>가입일</th>
              <th>채팅 수</th>
              <th>토큰 사용량</th>
              <th>마지막 활동</th>
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
              <td>{{ formatDate(user.created_at) }}</td>
              <td>{{ user.total_chats || 0 }}</td>
              <td>{{ formatTokens(user.total_tokens || 0) }}</td>
              <td>{{ user.last_active ? formatDate(user.last_active) : '-' }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    @click="viewUserDetail(user)"
                    class="action-btn view-btn"
                    title="상세 보기"
                  >
                    👁️
                  </button>
                  <button
                    @click="toggleAdmin(user)"
                    class="action-btn admin-btn"
                    :disabled="user.id === authStore.user?.id"
                    :title="user.is_admin ? '관리자 권한 해제' : '관리자 권한 부여'"
                  >
                    {{ user.is_admin ? '👤' : '👑' }}
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    class="action-btn delete-btn"
                    :disabled="user.id === authStore.user?.id"
                    title="삭제"
                  >
                    🗑️
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
      <p>🔍 사용자가 없습니다.</p>
    </div>

    <!-- User Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedUser" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>사용자 상세 정보</h3>
            <button @click="closeModal" class="close-btn">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-item">
                <label>ID:</label>
                <span>{{ selectedUser.id }}</span>
              </div>
              <div class="detail-item">
                <label>사용자명:</label>
                <span>{{ selectedUser.username }}</span>
              </div>
              <div class="detail-item">
                <label>이메일:</label>
                <span>{{ selectedUser.email }}</span>
              </div>
              <div class="detail-item">
                <label>권한:</label>
                <span :class="['badge', selectedUser.is_admin ? 'badge-admin' : 'badge-user']">
                  {{ selectedUser.is_admin ? '관리자' : '일반 사용자' }}
                </span>
              </div>
              <div class="detail-item">
                <label>가입일:</label>
                <span>{{ formatDate(selectedUser.created_at) }}</span>
              </div>
              <div class="detail-item">
                <label>총 채팅 수:</label>
                <span>{{ selectedUser.total_chats || 0 }}개</span>
              </div>
              <div class="detail-item">
                <label>총 토큰 사용량:</label>
                <span>{{ formatTokens(selectedUser.total_tokens || 0) }}</span>
              </div>
              <div class="detail-item">
                <label>마지막 활동:</label>
                <span>{{
                  selectedUser.last_active ? formatDate(selectedUser.last_active) : '없음'
                }}</span>
              </div>
            </div>

            <div class="modal-actions">
              <button @click="viewUserChats(selectedUser)" class="modal-btn primary">
                채팅 기록 보기
              </button>
              <button @click="viewUserUsage(selectedUser)" class="modal-btn secondary">
                사용량 통계 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
              ⚠️ 이 작업은 되돌릴 수 없으며, 모든 채팅 기록과 데이터가 영구적으로 삭제됩니다.
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
import { adminService, type User } from '../../services/admin.service'

const authStore = useAuthStore()

// State
const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalUsers = ref(0)
const searchQuery = ref('')
const selectedUser = ref<User | null>(null)
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

// Fetch users
const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await adminService.getUsers(currentPage.value, limit)
    users.value = response.items
    totalUsers.value = response.total
    totalPages.value = response.pages
  } catch (err: any) {
    error.value = err.response?.data?.detail || '사용자 목록을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// Search handling
const handleSearch = () => {
  // In a real app, you'd implement server-side search
  // For now, we'll just refetch the first page
  currentPage.value = 1
  fetchUsers()
}

// Pagination
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchUsers()
  }
}

// User actions
const viewUserDetail = (user: User) => {
  selectedUser.value = user
}

const closeModal = () => {
  selectedUser.value = null
}

const toggleAdmin = async (user: User) => {
  try {
    const updatedUser = await adminService.toggleAdminStatus(user.id)
    // Update user in list
    const index = users.value.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], is_admin: updatedUser.is_admin }
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || '권한 변경 중 오류가 발생했습니다.')
  }
}

const confirmDelete = (user: User) => {
  userToDelete.value = user
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  try {
    await adminService.deleteUser(userToDelete.value.id)
    // Remove from list
    users.value = users.value.filter((u) => u.id !== userToDelete.value!.id)
    userToDelete.value = null

    // Refetch if page is now empty
    if (users.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
      fetchUsers()
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || '사용자 삭제 중 오류가 발생했습니다.')
  }
}

const viewUserChats = (user: User) => {
  // TODO: Implement user chats view
  alert(`${user.username}의 채팅 기록 보기 - 준비 중`)
}

const viewUserUsage = (user: User) => {
  // TODO: Implement user usage statistics view
  alert(`${user.username}의 사용량 통계 보기 - 준비 중`)
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
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 250px;
}

/* Loading & Error States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
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
  padding: 0.5rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

/* Table */
.users-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.users-table tr:hover {
  background: #f8f9fa;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-admin {
  background: #28a745;
  color: white;
}

.badge-user {
  background: #6c757d;
  color: white;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.view-btn {
  background: #17a2b8;
  color: white;
}

.view-btn:hover:not(:disabled) {
  background: #138496;
}

.admin-btn {
  background: #ffc107;
  color: #212529;
}

.admin-btn:hover:not(:disabled) {
  background: #e0a800;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.page-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.page-info {
  color: #495057;
  font-weight: 500;
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
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.modal-btn.primary {
  background: #007bff;
  color: white;
}

.modal-btn.primary:hover {
  background: #0056b3;
}

.modal-btn.secondary {
  background: #6c757d;
  color: white;
}

.modal-btn.secondary:hover {
  background: #5a6268;
}

.modal-btn.danger {
  background: #dc3545;
  color: white;
}

.modal-btn.danger:hover {
  background: #c82333;
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
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0;
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
