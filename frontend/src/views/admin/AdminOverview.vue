<template>
  <div class="admin-overview">
    <div class="page-header">
      <h2>시스템 대시보드</h2>
      <button @click="refreshStats" :disabled="loading" class="refresh-btn">
        <span v-if="!loading">🔄 새로고침</span>
        <span v-else>⏳ 로딩중...</span>
      </button>
    </div>

    <div v-if="loading && !stats" class="loading-state">
      <div class="spinner"></div>
      <p>통계 데이터를 불러오는 중...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <button @click="refreshStats" class="retry-btn">다시 시도</button>
    </div>

    <div v-else-if="stats" class="stats-container">
      <!-- 주요 통계 카드 -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>전체 사용자</h3>
            <p class="stat-value">{{ stats.total_users.toLocaleString() }}</p>
            <span class="stat-label">명</span>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>오늘 활성 사용자</h3>
            <p class="stat-value">{{ stats.active_users_today.toLocaleString() }}</p>
            <span class="stat-label">명</span>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">💬</div>
          <div class="stat-content">
            <h3>전체 채팅</h3>
            <p class="stat-value">{{ stats.total_chats.toLocaleString() }}</p>
            <span class="stat-label">개</span>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>전체 메시지</h3>
            <p class="stat-value">{{ stats.total_messages.toLocaleString() }}</p>
            <span class="stat-label">개</span>
          </div>
        </div>
      </div>

      <!-- 토큰 사용량 정보 -->
      <div class="token-stats">
        <h3>🎯 토큰 사용량 분석</h3>
        <div class="token-grid">
          <div class="token-card">
            <h4>전체 토큰 사용량</h4>
            <p class="token-value">{{ formatTokens(stats.total_tokens_used) }}</p>
          </div>
          <div class="token-card">
            <h4>사용자당 평균 토큰</h4>
            <p class="token-value">{{ formatTokens(stats.average_tokens_per_user) }}</p>
          </div>
        </div>
      </div>

      <!-- 빠른 액션 -->
      <div class="quick-actions">
        <h3>⚡ 빠른 작업</h3>
        <div class="action-grid">
          <router-link :to="{ name: 'admin-users' }" class="action-card">
            <i>👥</i>
            <span>사용자 관리</span>
          </router-link>
          <router-link :to="{ name: 'admin-characters' }" class="action-card">
            <i>🤖</i>
            <span>캐릭터 추가</span>
          </router-link>
          <router-link :to="{ name: 'admin-prompts' }" class="action-card">
            <i>📝</i>
            <span>프롬프트 편집</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminService, type SystemStats } from '../../services/admin.service'

const stats = ref<SystemStats | null>(null)
const loading = ref(false)
const error = ref('')

const formatTokens = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

const fetchStats = async () => {
  loading.value = true
  error.value = ''

  try {
    stats.value = await adminService.getSystemStats()
  } catch (err: any) {
    error.value = err.response?.data?.detail || '통계를 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const refreshStats = () => {
  fetchStats()
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.admin-overview {
  max-width: 1200px;
  margin: 0 auto;
}

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

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
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

/* Error State */
.error-state {
  text-align: center;
  padding: 3rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-state p {
  color: #dc3545;
  margin-bottom: 1rem;
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.8;
}

.stat-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Stat Card Colors */
.stat-card.primary {
  border-left: 4px solid #007bff;
}
.stat-card.success {
  border-left: 4px solid #28a745;
}
.stat-card.info {
  border-left: 4px solid #17a2b8;
}
.stat-card.warning {
  border-left: 4px solid #ffc107;
}

/* Token Stats */
.token-stats {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.token-stats h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.token-card {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.token-card h4 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.token-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: bold;
  color: #007bff;
}

/* Quick Actions */
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quick-actions h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #495057;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.action-card:hover {
  background: #e9ecef;
  border-color: #007bff;
  color: #007bff;
  transform: translateY(-2px);
}

.action-card i {
  font-size: 2rem;
}

.action-card span {
  font-weight: 500;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .refresh-btn {
    width: 100%;
  }
}
</style>
