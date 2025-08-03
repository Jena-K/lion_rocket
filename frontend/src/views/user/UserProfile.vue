<template>
  <div class="user-profile">
    <div class="page-header">
      <h2>내 프로필</h2>
      <p class="subtitle">계정 정보를 확인하고 관리하세요</p>
    </div>

    <!-- Profile Card -->
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-large">
            <span>{{ userInitial }}</span>
          </div>
          <div class="avatar-info">
            <h3>{{ user?.username }}</h3>
            <p>{{ user?.email }}</p>
            <span class="member-since">
              <i>📅</i> {{ formatDate(user?.created_at) }}부터 회원
            </span>
          </div>
        </div>
        <button @click="isEditing = !isEditing" class="edit-btn">
          {{ isEditing ? '취소' : '프로필 수정' }}
        </button>
      </div>

      <!-- Profile Info -->
      <div class="profile-info" v-if="!isEditing">
        <div class="info-grid">
          <div class="info-item">
            <label>사용자명</label>
            <p>{{ user?.username }}</p>
          </div>
          <div class="info-item">
            <label>이메일</label>
            <p>{{ user?.email }}</p>
          </div>
          <div class="info-item">
            <label>계정 유형</label>
            <p>
              <span class="badge" :class="user?.is_admin ? 'admin' : 'user'">
                {{ user?.is_admin ? '관리자' : '일반 사용자' }}
              </span>
            </p>
          </div>
          <div class="info-item">
            <label>가입일</label>
            <p>{{ formatDate(user?.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <form v-else @submit.prevent="updateProfile" class="edit-form">
        <div class="form-group">
          <label for="email">이메일</label>
          <input id="email" v-model="editForm.email" type="email" class="form-input" required />
        </div>

        <div class="form-actions">
          <button type="button" @click="isEditing = false" class="btn secondary">취소</button>
          <button type="submit" class="btn primary" :disabled="saving">
            {{ saving ? '저장 중...' : '변경사항 저장' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Password Change Card -->
    <div class="password-card">
      <h3>비밀번호 변경</h3>
      <p class="card-subtitle">보안을 위해 정기적으로 비밀번호를 변경하세요</p>

      <form @submit.prevent="changePassword" class="password-form">
        <div class="form-group">
          <label for="current_password">현재 비밀번호</label>
          <input
            id="current_password"
            v-model="passwordForm.current_password"
            type="password"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="new_password">새 비밀번호</label>
          <input
            id="new_password"
            v-model="passwordForm.new_password"
            type="password"
            class="form-input"
            required
            minlength="8"
          />
          <small class="help-text"> 최소 8자 이상, 대소문자, 숫자, 특수문자 포함 </small>
        </div>

        <div class="form-group">
          <label for="confirm_password">새 비밀번호 확인</label>
          <input
            id="confirm_password"
            v-model="passwordForm.confirm_password"
            type="password"
            class="form-input"
            required
          />
        </div>

        <button type="submit" class="btn primary" :disabled="changingPassword">
          {{ changingPassword ? '변경 중...' : '비밀번호 변경' }}
        </button>
      </form>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <h3>빠른 통계</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-content">
            <p class="stat-value">{{ stats?.total_chats || 0 }}</p>
            <p class="stat-label">총 채팅</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <p class="stat-value">{{ stats?.total_messages || 0 }}</p>
            <p class="stat-label">총 메시지</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <p class="stat-value">{{ formatTokens(stats?.total_tokens_used || 0) }}</p>
            <p class="stat-label">토큰 사용량</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <p class="stat-value">{{ stats?.active_days || 0 }}</p>
            <p class="stat-label">활동일</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { userService } from '../../services/user.service'
import type { UserProfile, UserStats } from '../../services/user.service'

const authStore = useAuthStore()

// State
const user = ref<UserProfile | null>(authStore.user)
const stats = ref<UserStats | null>(null)
const isEditing = ref(false)
const saving = ref(false)
const changingPassword = ref(false)

// Forms
const editForm = reactive({
  email: user.value?.email || '',
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

// Toast
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

// Computed
const userInitial = computed(() => {
  return user.value?.username?.charAt(0).toUpperCase() || '?'
})

// Methods
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const updateProfile = async () => {
  saving.value = true

  try {
    const updated = await userService.updateProfile({
      email: editForm.email,
    })
    user.value = updated
    await authStore.getCurrentUser() // Update auth store
    isEditing.value = false
    showToast('프로필이 업데이트되었습니다!', 'success')
  } catch (error: any) {
    showToast(error.response?.data?.detail || '프로필 업데이트 실패', 'error')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    showToast('새 비밀번호가 일치하지 않습니다', 'error')
    return
  }

  changingPassword.value = true

  try {
    await userService.updatePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    })

    // Clear form
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''

    showToast('비밀번호가 변경되었습니다!', 'success')
  } catch (error: any) {
    showToast(error.response?.data?.detail || '비밀번호 변경 실패', 'error')
  } finally {
    changingPassword.value = false
  }
}

const fetchStats = async () => {
  try {
    stats.value = await userService.getStats()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.user-profile {
  max-width: 900px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #2d3748;
}

.subtitle {
  margin: 0;
  color: #718096;
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  color: white;
}

.avatar-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  color: #2d3748;
}

.avatar-info p {
  margin: 0 0 0.5rem 0;
  color: #718096;
}

.member-since {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #a0aec0;
}

.edit-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

/* Profile Info */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
  margin-bottom: 0.5rem;
}

.info-item p {
  margin: 0;
  font-size: 1rem;
  color: #2d3748;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge.admin {
  background: #48bb78;
  color: white;
}

.badge.user {
  background: #718096;
  color: white;
}

/* Forms */
.edit-form,
.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #4a5568;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help-text {
  font-size: 0.875rem;
  color: #718096;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Password Card */
.password-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
}

.password-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.card-subtitle {
  margin: 0 0 1.5rem 0;
  color: #718096;
}

/* Quick Stats */
.quick-stats {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.quick-stats h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #f7fafc;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  margin: 0;
  font-size: 0.875rem;
  color: #718096;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: #667eea;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn.secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn.secondary:hover {
  background: #cbd5e0;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 2000;
}

.toast.success {
  background: #48bb78;
}

.toast.error {
  background: #f56565;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .avatar-section {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-actions {
    flex-direction: column;
  }

  .toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
</style>
