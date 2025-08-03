<template>
  <div class="user-stats">
    <div class="page-header">
      <h2>사용 통계</h2>
      <p class="subtitle">AI 채팅 사용 패턴과 통계를 확인하세요</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>통계를 불러오는 중...</p>
    </div>

    <!-- Stats Content -->
    <div v-else-if="stats" class="stats-content">
      <!-- Overview Cards -->
      <div class="overview-grid">
        <div class="stat-card primary">
          <div class="card-icon">💬</div>
          <div class="card-content">
            <h3>총 채팅</h3>
            <p class="stat-value">{{ stats.total_chats }}</p>
            <span class="stat-trend">{{ chatTrend }}</span>
          </div>
        </div>

        <div class="stat-card success">
          <div class="card-icon">📝</div>
          <div class="card-content">
            <h3>총 메시지</h3>
            <p class="stat-value">{{ stats.total_messages }}</p>
            <span class="stat-average">채팅당 평균 {{ avgMessagesPerChat }}개</span>
          </div>
        </div>

        <div class="stat-card info">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <h3>토큰 사용량</h3>
            <p class="stat-value">{{ formatTokens(stats.total_tokens_used) }}</p>
            <span class="stat-average">메시지당 평균 {{ avgTokensPerMessage }}</span>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <h3>활동일</h3>
            <p class="stat-value">{{ stats.active_days }}일</p>
            <span class="stat-since">{{ memberDuration }} 동안</span>
          </div>
        </div>
      </div>

      <!-- Favorite Character -->
      <div class="favorite-section" v-if="stats.favorite_character">
        <h3>가장 많이 대화한 캐릭터</h3>
        <div class="favorite-card">
          <div class="favorite-icon">{{ getCharacterIcon(stats.favorite_character) }}</div>
          <div class="favorite-info">
            <h4>{{ stats.favorite_character }}</h4>
            <p>주로 이 캐릭터와 대화를 나누셨네요!</p>
          </div>
        </div>
      </div>

      <!-- Usage Patterns -->
      <div class="patterns-section">
        <h3>사용 패턴</h3>
        <div class="patterns-grid">
          <div class="pattern-card">
            <h4>일 평균 채팅</h4>
            <p class="pattern-value">{{ avgChatsPerDay }}</p>
            <div class="pattern-bar">
              <div class="bar-fill" :style="{ width: chatActivityPercent + '%' }"></div>
            </div>
          </div>

          <div class="pattern-card">
            <h4>일 평균 메시지</h4>
            <p class="pattern-value">{{ avgMessagesPerDay }}</p>
            <div class="pattern-bar">
              <div class="bar-fill success" :style="{ width: messageActivityPercent + '%' }"></div>
            </div>
          </div>

          <div class="pattern-card">
            <h4>일 평균 토큰</h4>
            <p class="pattern-value">{{ formatTokens(avgTokensPerDay) }}</p>
            <div class="pattern-bar">
              <div class="bar-fill info" :style="{ width: tokenActivityPercent + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Activity Chart -->
      <div class="activity-section">
        <h3>주간 활동</h3>
        <div class="activity-chart">
          <div class="chart-days">
            <div v-for="day in weekDays" :key="day.name" class="day-column">
              <div class="day-bar" :style="{ height: day.activity + '%' }">
                <span class="day-value">{{ day.value }}</span>
              </div>
              <span class="day-name">{{ day.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-section">
        <h3>최근 활동</h3>
        <div class="activity-timeline">
          <div v-if="stats.last_chat_date" class="timeline-item">
            <div class="timeline-icon">💬</div>
            <div class="timeline-content">
              <h4>마지막 채팅</h4>
              <p>{{ formatDate(stats.last_chat_date) }}</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon">🎉</div>
            <div class="timeline-content">
              <h4>첫 채팅</h4>
              <p>{{ formatDate(authStore.user?.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Fun Facts -->
      <div class="facts-section">
        <h3>재미있는 사실</h3>
        <div class="facts-grid">
          <div class="fact-card">
            <i>🏆</i>
            <p>{{ getMilestone() }}</p>
          </div>
          <div class="fact-card">
            <i>📚</i>
            <p>{{ getReadingEstimate() }}</p>
          </div>
          <div class="fact-card">
            <i>⚡</i>
            <p>{{ getUsageLevel() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <p>통계를 불러올 수 없습니다</p>
      <button @click="fetchStats" class="retry-btn">다시 시도</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { userService } from '../../services/user.service'
import type { UserStats } from '../../services/user.service'

const authStore = useAuthStore()

// State
const stats = ref<UserStats | null>(null)
const loading = ref(false)

// Computed
const avgMessagesPerChat = computed(() => {
  if (!stats.value || stats.value.total_chats === 0) return 0
  return Math.round(stats.value.total_messages / stats.value.total_chats)
})

const avgTokensPerMessage = computed(() => {
  if (!stats.value || stats.value.total_messages === 0) return '0'
  const avg = stats.value.total_tokens_used / stats.value.total_messages
  return formatTokens(avg)
})

const avgChatsPerDay = computed(() => {
  if (!stats.value || stats.value.active_days === 0) return '0'
  return (stats.value.total_chats / stats.value.active_days).toFixed(1)
})

const avgMessagesPerDay = computed(() => {
  if (!stats.value || stats.value.active_days === 0) return '0'
  return Math.round(stats.value.total_messages / stats.value.active_days)
})

const avgTokensPerDay = computed(() => {
  if (!stats.value || stats.value.active_days === 0) return 0
  return stats.value.total_tokens_used / stats.value.active_days
})

const chatTrend = computed(() => {
  const avg = parseFloat(avgChatsPerDay.value)
  if (avg >= 5) return '매우 활발'
  if (avg >= 2) return '활발'
  if (avg >= 1) return '꾸준함'
  return '가끔씩'
})

const memberDuration = computed(() => {
  if (!authStore.user) return ''
  const created = new Date(authStore.user.created_at)
  const now = new Date()
  const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))

  if (days < 30) return `${days}일`
  if (days < 365) return `${Math.floor(days / 30)}개월`
  return `${Math.floor(days / 365)}년`
})

const chatActivityPercent = computed(() => {
  const avg = parseFloat(avgChatsPerDay.value)
  return Math.min(100, (avg / 10) * 100)
})

const messageActivityPercent = computed(() => {
  const avg = parseInt(avgMessagesPerDay.value)
  return Math.min(100, (avg / 50) * 100)
})

const tokenActivityPercent = computed(() => {
  const avg = avgTokensPerDay.value
  return Math.min(100, (avg / 10000) * 100)
})

// Mock weekly data
const weekDays = computed(() => {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days.map((name, index) => ({
    name,
    value: Math.floor(Math.random() * 10) + 1,
    activity: Math.random() * 100,
  }))
})

// Methods
const formatTokens = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return Math.round(value).toString()
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getCharacterIcon = (name: string) => {
  const icons: Record<string, string> = {
    'Claude Assistant': '🤖',
    'Creative Writer': '✍️',
    'Code Helper': '💻',
    'Math Tutor': '📐',
  }
  return icons[name] || '🤖'
}

const getMilestone = () => {
  if (!stats.value) return ''
  const messages = stats.value.total_messages

  if (messages >= 1000) return '1000개 이상의 메시지를 주고받으셨어요!'
  if (messages >= 500) return '500개 이상의 메시지를 주고받으셨어요!'
  if (messages >= 100) return '100개 이상의 메시지를 주고받으셨어요!'
  if (messages >= 50) return '50개 이상의 메시지를 주고받으셨어요!'
  return 'AI와의 대화를 시작하셨네요!'
}

const getReadingEstimate = () => {
  if (!stats.value) return ''
  // Assuming average reading speed and words per message
  const minutes = Math.round(stats.value.total_messages * 0.5)

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    return `약 ${hours}시간의 대화를 나누셨어요`
  }
  return `약 ${minutes}분의 대화를 나누셨어요`
}

const getUsageLevel = () => {
  const avg = parseFloat(avgChatsPerDay.value)

  if (avg >= 5) return 'AI 채팅 고급 사용자입니다!'
  if (avg >= 2) return 'AI를 적극적으로 활용하고 계시네요!'
  if (avg >= 1) return 'AI와 꾸준히 대화하고 계시네요!'
  return 'AI와 친해지고 계시는군요!'
}

const fetchStats = async () => {
  loading.value = true

  try {
    stats.value = await userService.getStats()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.user-stats {
  max-width: 1200px;
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

/* Loading State */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
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
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

/* Overview Grid */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 1.5rem;
  align-items: center;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 3rem;
  opacity: 0.9;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

.stat-value {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-trend,
.stat-average,
.stat-since {
  font-size: 0.75rem;
  color: #a0aec0;
}

/* Card Colors */
.stat-card.primary {
  border-left: 4px solid #667eea;
}
.stat-card.success {
  border-left: 4px solid #48bb78;
}
.stat-card.info {
  border-left: 4px solid #4299e1;
}
.stat-card.warning {
  border-left: 4px solid #ed8936;
}

/* Favorite Section */
.favorite-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.favorite-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.favorite-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border-radius: 12px;
}

.favorite-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.favorite-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.favorite-info p {
  margin: 0;
  color: #718096;
}

/* Patterns Section */
.patterns-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.patterns-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.pattern-card {
  text-align: center;
}

.pattern-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #718096;
}

.pattern-value {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
}

.pattern-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-fill.success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.bar-fill.info {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

/* Activity Section */
.activity-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.activity-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.activity-chart {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
}

.chart-days {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
}

.day-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.day-bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: all 0.3s;
}

.day-bar:hover {
  transform: translateY(-4px);
}

.day-value {
  position: absolute;
  top: -20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
}

.day-name {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

/* Recent Section */
.recent-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.recent-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
}

.timeline-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.timeline-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #2d3748;
}

.timeline-content p {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
}

/* Facts Section */
.facts-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.facts-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.fact-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border-radius: 12px;
  text-align: center;
  transition: all 0.2s;
}

.fact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.fact-card i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.fact-card p {
  margin: 0;
  color: #4a5568;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .patterns-grid,
  .facts-grid {
    grid-template-columns: 1fr;
  }

  .chart-days {
    height: 150px;
  }

  .day-bar {
    max-width: 30px;
  }
}
</style>
