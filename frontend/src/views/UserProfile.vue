<template>
  <div class="user-profile-container">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <button @click="goBack" class="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
          뒤로
        </button>
        <div class="logo-title">
          <img src="/lion_rocket_logo.png" alt="LionRocket" class="logo" />
          <h1>사용자 프로필</h1>
        </div>
      </div>
      <div class="header-right">
        <span class="user-info">{{ authStore.user?.username }}</span>
        <button @click="handleLogout" class="logout-btn">로그아웃</button>
      </div>
    </header>

    <div class="content-wrapper">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>사용자 정보를 불러오는 중...</p>
      </div>

      <!-- Profile Content -->
      <div v-else-if="userStats" class="profile-content">
        <!-- User Info Card -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              {{ userStats.username.charAt(0).toUpperCase() }}
            </div>
            <div class="profile-info">
              <h2 class="profile-name">{{ userStats.username }}</h2>
              <p class="profile-email">{{ userStats.email }}</p>
              <span class="profile-badge" :class="{ admin: userStats.is_admin }">
                {{ userStats.is_admin ? '관리자' : '일반 사용자' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Usage Statistics -->
        <div class="stats-section">
          <h3 class="section-title">사용 통계</h3>
          
          <div class="stats-grid">
            <!-- Chats Stats -->
            <div class="stat-card">
              <div class="stat-icon chat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ formatNumber(userStats.total_chats) }}</div>
                <div class="stat-label">총 대화 수</div>
              </div>
            </div>

            <!-- Messages Stats -->
            <div class="stat-card">
              <div class="stat-icon message-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ formatNumber(userStats.total_prompts) }}</div>
                <div class="stat-label">총 메시지 수</div>
              </div>
            </div>

            <!-- Token Stats - Main Feature -->
            <div class="stat-card token-card">
              <div class="stat-icon token-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-number token-number">{{ formatNumber(userStats.total_tokens) }}</div>
                <div class="stat-label">총 토큰 사용량</div>
                <div class="stat-description">Claude AI API 토큰 사용량</div>
              </div>
            </div>

            <!-- Characters Stats -->
            <div class="stat-card">
              <div class="stat-icon character-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <path d="m22 11-3-3m3 3-3 3m3-3H15"></path>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ formatNumber(userStats.total_characters) }}</div>
                <div class="stat-label">대화한 캐릭터 수</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="account-section">
          <h3 class="section-title">계정 정보</h3>
          
          <div class="account-info">
            <div class="account-item">
              <span class="account-label">가입일</span>
              <span class="account-value">{{ formatDate(userStats.created_at) }}</span>
            </div>
            <div class="account-item">
              <span class="account-label">사용자 ID</span>
              <span class="account-value">#{{ userStats.user_id }}</span>
            </div>
            <div class="account-item">
              <span class="account-label">이메일</span>
              <span class="account-value">{{ userStats.email }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="error-container">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="error-title">정보를 불러올 수 없습니다</h3>
        <p class="error-description">사용자 정보를 가져오는 중 오류가 발생했습니다.</p>
        <button @click="loadUserStats" class="retry-button">다시 시도</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import type { UserWithStats } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const userStats = ref<UserWithStats | null>(null)

// Computed
const formattedStats = computed(() => {
  if (!userStats.value) return null
  
  return {
    ...userStats.value,
    formattedTokens: formatNumber(userStats.value.total_tokens),
    formattedChats: formatNumber(userStats.value.total_chats),
    formattedMessages: formatNumber(userStats.value.total_prompts)
  }
})

// Methods
const goBack = () => {
  router.back()
}

const handleLogout = async () => {
  await authStore.logout()
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadUserStats = async () => {
  loading.value = true
  try {
    userStats.value = await authStore.getCurrentUserStats()
    console.log('✅ User stats loaded:', userStats.value)
  } catch (error) {
    console.error('❌ Failed to load user stats:', error)
    notificationStore.error('사용자 정보를 불러올 수 없습니다.')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUserStats()
})
</script>

<style scoped>
.user-profile-container {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header */
.app-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.logo-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  height: 32px;
  width: auto;
}

.header-left h1 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  font-weight: 500;
  color: #666;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #FEE2E2;
  color: #DC2626;
  border: 1px solid #FECACA;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #FCA5A5;
  border-color: #F87171;
  transform: translateY(-1px);
}

/* Content */
.content-wrapper {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top-color: #B8EEA2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B8EEA2, #7EBF7E);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(184, 238, 162, 0.35);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.profile-email {
  font-size: 1rem;
  color: #666;
  margin: 0 0 0.75rem 0;
}

.profile-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  background: #E7F7E1;
  color: #5A8F47;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.profile-badge.admin {
  background: #FEF3C7;
  color: #92400E;
}

/* Statistics Section */
.stats-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f9fafb;
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

.token-card {
  background: linear-gradient(135deg, #F0FDF4, #E7F7E1);
  border: 2px solid #B8EEA2;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.chat-icon {
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
}

.message-icon {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
}

.token-icon {
  background: linear-gradient(135deg, #10B981, #059669);
}

.character-icon {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.token-number {
  color: #059669;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.stat-description {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
}

/* Account Section */
.account-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.account-item:last-child {
  border-bottom: none;
}

.account-label {
  font-weight: 500;
  color: #374151;
}

.account-value {
  color: #6b7280;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #666;
}

.error-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  color: #EF4444;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.error-description {
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
  max-width: 400px;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: #5A8F47;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(90, 143, 71, 0.25);
}

.retry-button:hover {
  background: #4A7C3C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(90, 143, 71, 0.35);
}

/* Responsive */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .account-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>