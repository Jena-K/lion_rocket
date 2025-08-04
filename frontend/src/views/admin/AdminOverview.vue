<template>
  <div class="admin-overview">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">대시보드</h1>
          <p class="page-subtitle">{{ currentDate }} 기준 서비스 현황</p>
        </div>
        <div class="header-actions">
          <div class="date-selector">
            <button class="date-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              지난 7일
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          <button class="export-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            내보내기
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card" v-if="isLoading">
        <div class="stat-loading">
          <div class="loading-spinner"></div>
          <p>데이터 로딩 중...</p>
        </div>
      </div>
      
      <template v-else>
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-label">총 채팅 수</h3>
            <p class="stat-value">{{ dashboardStats.total_chats?.toLocaleString() || '0' }}</p>
            <p class="stat-change neutral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              실제 데이터
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-label">사용자 수</h3>
            <p class="stat-value">{{ dashboardStats.total_users?.toLocaleString() || '0' }}</p>
            <p class="stat-change neutral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              실제 데이터
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- View Tabs -->
    <div class="view-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Date View -->
      <div v-if="activeTab === 'date'" class="date-view">
        <div class="chart-container">
          <div class="chart-header">
            <h3>일별 채팅 추이</h3>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-color" style="background: #3b82f6"></span>
                채팅 수
              </span>
              <span class="legend-item">
                <span class="legend-color" style="background: #10b981"></span>
                사용자 수
              </span>
            </div>
          </div>
          
          <!-- Line Chart Placeholder -->
          <div class="chart-placeholder">
            <svg viewBox="0 0 800 300" class="line-chart">
              <!-- Grid lines -->
              <g class="grid">
                <line x1="50" y1="250" x2="750" y2="250" stroke="#e5e7eb" />
                <line x1="50" y1="200" x2="750" y2="200" stroke="#e5e7eb" />
                <line x1="50" y1="150" x2="750" y2="150" stroke="#e5e7eb" />
                <line x1="50" y1="100" x2="750" y2="100" stroke="#e5e7eb" />
                <line x1="50" y1="50" x2="750" y2="50" stroke="#e5e7eb" />
              </g>
              
              <!-- Chat count line -->
              <polyline
                points="50,200 150,180 250,150 350,140 450,120 550,100 650,90 750,80"
                fill="none"
                stroke="#3b82f6"
                stroke-width="3"
              />
              
              <!-- User count line -->
              <polyline
                points="50,220 150,210 250,190 350,185 450,170 550,160 650,155 750,150"
                fill="none"
                stroke="#10b981"
                stroke-width="3"
              />
              
              <!-- Data points -->
              <g class="data-points">
                <circle cx="50" cy="200" r="4" fill="#3b82f6" />
                <circle cx="150" cy="180" r="4" fill="#3b82f6" />
                <circle cx="250" cy="150" r="4" fill="#3b82f6" />
                <circle cx="350" cy="140" r="4" fill="#3b82f6" />
                <circle cx="450" cy="120" r="4" fill="#3b82f6" />
                <circle cx="550" cy="100" r="4" fill="#3b82f6" />
                <circle cx="650" cy="90" r="4" fill="#3b82f6" />
                <circle cx="750" cy="80" r="4" fill="#3b82f6" />
              </g>
              
              <!-- Axis scales -->
              <g class="axis-scales">
                <!-- Y-axis scale (numbers) -->
                <text x="45" y="255" text-anchor="end" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">0</text>
                <text x="45" y="205" text-anchor="end" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">10</text>
                <text x="45" y="155" text-anchor="end" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">20</text>
                <text x="45" y="105" text-anchor="end" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">30</text>
                <text x="45" y="55" text-anchor="end" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">40</text>
                
                <!-- Y-axis tick marks -->
                <line x1="45" y1="250" x2="50" y2="250" stroke="#6b7280" stroke-width="1" />
                <line x1="45" y1="200" x2="50" y2="200" stroke="#6b7280" stroke-width="1" />
                <line x1="45" y1="150" x2="50" y2="150" stroke="#6b7280" stroke-width="1" />
                <line x1="45" y1="100" x2="50" y2="100" stroke="#6b7280" stroke-width="1" />
                <line x1="45" y1="50" x2="50" y2="50" stroke="#6b7280" stroke-width="1" />
                
                <!-- X-axis scale (dates) -->
                <text x="50" y="270" text-anchor="middle" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">07/28</text>
                <text x="150" y="270" text-anchor="middle" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">07/29</text>
                <text x="250" y="270" text-anchor="middle" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">07/30</text>
                <text x="350" y="270" text-anchor="middle" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">07/31</text>
                <text x="450" y="270" text-anchor="middle" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">08/01</text>
                <text x="550" y="270" text-anchor="middle" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">08/02</text>
                <text x="650" y="270" text-anchor="middle" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">08/03</text>
                <text x="750" y="270" text-anchor="middle" fill="#6b7280" font-size="10" font-family="Inter, system-ui, sans-serif">08/04</text>
                
                <!-- X-axis tick marks -->
                <line x1="50" y1="250" x2="50" y2="255" stroke="#6b7280" stroke-width="1" />
                <line x1="150" y1="250" x2="150" y2="255" stroke="#6b7280" stroke-width="1" />
                <line x1="250" y1="250" x2="250" y2="255" stroke="#6b7280" stroke-width="1" />
                <line x1="350" y1="250" x2="350" y2="255" stroke="#6b7280" stroke-width="1" />
                <line x1="450" y1="250" x2="450" y2="255" stroke="#6b7280" stroke-width="1" />
                <line x1="550" y1="250" x2="550" y2="255" stroke="#6b7280" stroke-width="1" />
                <line x1="650" y1="250" x2="650" y2="255" stroke="#6b7280" stroke-width="1" />
                <line x1="750" y1="250" x2="750" y2="255" stroke="#6b7280" stroke-width="1" />
              </g>
            </svg>
          </div>
        </div>

        <!-- Date Stats Table -->
        <div class="data-table-container">
          <h3>일별 상세 데이터</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>총 채팅 수</th>
                <th>활성 사용자</th>
                <th>인기 캐릭터</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in dateData" :key="day.date">
                <td>{{ formatDate(day.date) }}</td>
                <td>{{ day.chatCount.toLocaleString() }}</td>
                <td>{{ day.userCount }}</td>
                <td>
                  <span class="character-badge">{{ day.topCharacter }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User View -->
      <div v-if="activeTab === 'user'" class="user-view">
        <div class="chart-container">
          <div class="chart-header">
            <h3>사용자별 채팅 현황</h3>
            <select class="sort-select">
              <option>채팅 수 많은 순</option>
              <option>최근 활동 순</option>
              <option>가입일 순</option>
            </select>
          </div>

          <!-- User Ranking Cards -->
          <div class="user-ranking">
            <div v-for="(user, index) in topUsers" :key="user.user_id" class="user-rank-card">
              <div class="rank-number" :class="getRankClass(index + 1)">
                {{ index + 1 }}
              </div>
              <div class="user-avatar">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="user-info">
                <h4>{{ user.name }}</h4>
                <p>{{ user.email }}</p>
              </div>
              <div class="user-stats">
                <div class="mini-stat">
                  <span class="mini-value">{{ user.chatCount }}</span>
                  <span class="mini-label">채팅</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-value">{{ user.chatCount }}</span>
                  <span class="mini-label">메시지</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-value">{{ user.avgDuration }}분</span>
                  <span class="mini-label">평균 시간</span>
                </div>
              </div>
              <div class="activity-graph">
                <svg viewBox="0 0 100 30">
                  <rect x="0" y="20" width="8" height="10" fill="#e5e7eb" />
                  <rect x="10" y="15" width="8" height="15" fill="#e5e7eb" />
                  <rect x="20" y="10" width="8" height="20" fill="#3b82f6" />
                  <rect x="30" y="5" width="8" height="25" fill="#3b82f6" />
                  <rect x="40" y="8" width="8" height="22" fill="#3b82f6" />
                  <rect x="50" y="12" width="8" height="18" fill="#e5e7eb" />
                  <rect x="60" y="15" width="8" height="15" fill="#e5e7eb" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- User Details Table -->
        <div class="data-table-container">
          <h3>전체 사용자 목록</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>사용자</th>
                <th>총 채팅 수</th>
                <th>총 메시지</th>
                <th>마지막 활동</th>
                <th>선호 캐릭터</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in allUsers" :key="user.user_id">
                <td>
                  <div class="user-cell">
                    <div class="small-avatar">{{ user.name.charAt(0) }}</div>
                    <div>
                      <div class="user-name">{{ user.name }}</div>
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ user.chatCount }}</td>
                <td>{{ user.chatCount }}</td>
                <td>{{ formatRelativeTime(user.lastActive) }}</td>
                <td>
                  <span class="character-badge">{{ user.favoriteCharacter }}</span>
                </td>
                <td>
                  <span :class="['status-badge', user.status]">
                    {{ user.status === 'active' ? '활성' : '비활성' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Character View -->
      <div v-if="activeTab === 'character'" class="character-view">
        <div class="chart-container">
          <div class="chart-header">
            <h3>캐릭터별 인기도</h3>
            <button class="view-toggle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
          </div>

          <!-- Character Cards Grid -->
          <div class="character-grid">
            <div v-for="char in characters" :key="char.character_id" class="character-stat-card">
              <div class="character-header">
                <div class="character-avatar-large" :style="{ background: char.color }">
                  {{ char.name.charAt(0) }}
                </div>
                <div class="character-details">
                  <h4>{{ char.name }}</h4>
                  <p class="character-description">{{ char.description }}</p>
                </div>
              </div>
              
              <div class="character-metrics">
                <div class="metric">
                  <span class="metric-value">{{ char.chatCount }}</span>
                  <span class="metric-label">총 대화</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ char.userCount }}</span>
                  <span class="metric-label">사용자</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ char.avgRating }}</span>
                  <span class="metric-label">평점</span>
                </div>
              </div>

              <!-- Mini Donut Chart -->
              <div class="usage-chart">
                <svg viewBox="0 0 42 42" class="donut">
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke="#e5e7eb"
                    stroke-width="3"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    :stroke="char.color"
                    stroke-width="3"
                    :stroke-dasharray="`${char.percentage} ${100 - char.percentage}`"
                    stroke-dashoffset="25"
                    stroke-linecap="round"
                  />
                  <text x="21" y="24" text-anchor="middle" fill="#1a202c" font-size="8" font-weight="600">
                    {{ char.percentage }}%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Character Performance Table -->
        <div class="data-table-container">
          <h3>캐릭터 기본 통계</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>캐릭터</th>
                <th>총 대화 수</th>
                <th>활성 사용자</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="char in characterTableData" :key="char.character_id">
                <td>
                  <div class="character-cell">
                    <div class="small-avatar" :style="{ background: char.color }">
                      {{ char.name.charAt(0) }}
                    </div>
                    {{ char.name }}
                  </div>
                </td>
                <td>{{ char.totalChats }}</td>
                <td>{{ char.activeUsers }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import apiClient from '@/services/api.client'

// Tab icons as inline components
const CalendarIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>`
}

const UsersIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>`
}

const CharacterIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
  </svg>`
}

// State
const activeTab = ref('date')
const currentDate = computed(() => {
  return new Date().toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

// State
const isLoading = ref(true)
const dashboardStats = ref({
  total_chats: 0,
  total_users: 0
})
const errorMessage = ref('')

const tabs = [
  { id: 'date', label: '날짜별 보기', icon: CalendarIcon },
  { id: 'user', label: '사용자별 보기', icon: UsersIcon },
  { id: 'character', label: '캐릭터별 보기', icon: CharacterIcon }
]

// Date view data
const dateData = ref([
  { date: new Date('2024-01-15'), chatCount: 2341, userCount: 342, topCharacter: '미나' },
  { date: new Date('2024-01-14'), chatCount: 2156, userCount: 318, topCharacter: '지우' },
  { date: new Date('2024-01-13'), chatCount: 1987, userCount: 289, topCharacter: '미나' },
  { date: new Date('2024-01-12'), chatCount: 2234, userCount: 325, topCharacter: '하늘' },
  { date: new Date('2024-01-11'), chatCount: 2098, userCount: 301, topCharacter: '미나' },
  { date: new Date('2024-01-10'), chatCount: 1876, userCount: 278, topCharacter: '소라' },
  { date: new Date('2024-01-09'), chatCount: 2345, userCount: 356, topCharacter: '미나' }
])

// User view data
const topUsers = ref([
  { id: 1, name: 'user123', email: 'user123@example.com', chatCount: 234, chatCount: 3421, avgDuration: 25 },
  { id: 2, name: 'johndoe', email: 'john@example.com', chatCount: 198, chatCount: 2876, avgDuration: 22 },
  { id: 3, name: 'janedoe', email: 'jane@example.com', chatCount: 176, chatCount: 2543, avgDuration: 19 },
  { id: 4, name: 'testuser', email: 'test@example.com', chatCount: 165, chatCount: 2234, avgDuration: 18 },
  { id: 5, name: 'alice', email: 'alice@example.com', chatCount: 143, chatCount: 1987, avgDuration: 21 }
])

const allUsers = ref([
  { id: 1, name: 'user123', email: 'user123@example.com', chatCount: 234, chatCount: 3421, lastActive: new Date('2024-01-15T14:30'), favoriteCharacter: '미나', status: 'active' },
  { id: 2, name: 'johndoe', email: 'john@example.com', chatCount: 198, chatCount: 2876, lastActive: new Date('2024-01-15T10:20'), favoriteCharacter: '지우', status: 'active' },
  { id: 3, name: 'janedoe', email: 'jane@example.com', chatCount: 176, chatCount: 2543, lastActive: new Date('2024-01-14T18:45'), favoriteCharacter: '미나', status: 'active' },
  { id: 4, name: 'testuser', email: 'test@example.com', chatCount: 165, chatCount: 2234, lastActive: new Date('2024-01-13T09:15'), favoriteCharacter: '하늘', status: 'inactive' },
  { id: 5, name: 'alice', email: 'alice@example.com', chatCount: 143, chatCount: 1987, lastActive: new Date('2024-01-15T16:00'), favoriteCharacter: '소라', status: 'active' }
])

// Character view data
const characters = ref([
  { id: 1, name: '미나', description: '친근한 상담사', chatCount: 4532, userCount: 876, avgRating: 4.8, percentage: 28, color: '#8b5cf6' },
  { id: 2, name: '지우', description: '유머러스한 친구', chatCount: 3421, userCount: 654, avgRating: 4.6, percentage: 21, color: '#3b82f6' },
  { id: 3, name: '하늘', description: '차분한 조언자', chatCount: 2987, userCount: 543, avgRating: 4.7, percentage: 19, color: '#10b981' },
  { id: 4, name: '소라', description: '활발한 동료', chatCount: 2654, userCount: 487, avgRating: 4.5, percentage: 17, color: '#f59e0b' }
])

const characterTableData = ref([
  { id: 1, name: '미나', color: '#8b5cf6', totalChats: 4532, activeUsers: 876 },
  { id: 2, name: '지우', color: '#3b82f6', totalChats: 3421, activeUsers: 654 },
  { id: 3, name: '하늘', color: '#10b981', totalChats: 2987, activeUsers: 543 },
  { id: 4, name: '소라', color: '#f59e0b', totalChats: 2654, activeUsers: 487 }
])

// Methods
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  if (hours < 48) return '어제'
  return `${Math.floor(hours / 24)}일 전`
}

const getRankClass = (rank: number) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

// Load dashboard data
const loadDashboardStats = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const response = await apiClient.get('/admin/dashboard/simple-stats')
    dashboardStats.value = response.data
    
    console.log('Dashboard stats loaded:', response.data)
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
    errorMessage.value = 'Dashboard 데이터를 불러오는데 실패했습니다.'
    // Keep default values in case of error
    dashboardStats.value = {
      total_chats: 0,
      total_users: 0
    }
  } finally {
    isLoading.value = false
  }
}

// Load data on component mount
onMounted(() => {
  loadDashboardStats()
})
</script>

<style scoped>
.admin-overview {
  padding: 0;
}

/* Page Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  margin: -2rem -2rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.25rem;
}

.page-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.date-selector {
  position: relative;
}

.date-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.date-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.date-btn svg {
  width: 16px;
  height: 16px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  background: #2563eb;
}

.export-btn svg {
  width: 16px;
  height: 16px;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.blue {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-icon.green {
  background: #f0fdf4;
  color: #10b981;
}

.stat-icon.purple {
  background: #faf5ff;
  color: #8b5cf6;
}

.stat-icon.orange {
  background: #fffbeb;
  color: #f59e0b;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.stat-change.neutral {
  color: #6b7280;
}

.stat-change svg {
  width: 16px;
  height: 16px;
}

/* View Tabs */
.view-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.tab-btn.active {
  background: #3b82f6;
  color: white;
}

.tab-btn svg {
  width: 18px;
  height: 18px;
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Chart Container */
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
}

.line-chart {
  width: 100%;
  height: 100%;
}

/* Data Table */
.data-table-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table-container h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.data-table tr:hover {
  background: #f9fafb;
}

.character-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* User View Specific */
.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  cursor: pointer;
}

.user-ranking {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-rank-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.user-rank-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.rank-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
  background: #e5e7eb;
  color: #6b7280;
}

.rank-number.gold {
  background: #fef3c7;
  color: #d97706;
}

.rank-number.silver {
  background: #e0e7ff;
  color: #6366f1;
}

.rank-number.bronze {
  background: #fed7aa;
  color: #c2410c;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: #e0e7ff;
  color: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.user-info {
  flex: 1;
}

.user-info h4 {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a202c;
}

.user-info p {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.user-stats {
  display: flex;
  gap: 2rem;
}

.mini-stat {
  text-align: center;
}

.mini-value {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
}

.mini-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.activity-graph {
  width: 100px;
}

.activity-graph svg {
  width: 100%;
  height: 100%;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.small-avatar {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  color: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  color: #1a202c;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #f0fdf4;
  color: #10b981;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #ef4444;
}

/* Character View Specific */
.view-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.view-toggle svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.character-stat-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.character-stat-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.character-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.character-avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.character-details h4 {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
}

.character-description {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.character-metrics {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.metric {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}

.metric-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.usage-chart {
  display: flex;
  justify-content: center;
}

.donut {
  width: 80px;
  height: 80px;
  transform: rotate(-90deg);
}

.donut text {
  transform: rotate(90deg);
}

.character-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  position: relative;
  width: 100px;
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a202c;
}

.rating {
  display: flex;
  gap: 0.125rem;
}

.rating svg {
  width: 16px;
  height: 16px;
}

.trend {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.trend.up {
  background: #f0fdf4;
  color: #10b981;
}

.trend.down {
  background: #fef2f2;
  color: #ef4444;
}

.trend.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.trend svg {
  width: 16px;
  height: 16px;
}

/* Loading states */
.stat-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .user-ranking {
    max-height: 400px;
    overflow-y: auto;
  }

  .character-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .view-tabs {
    flex-direction: column;
  }

  .tab-btn {
    justify-content: flex-start;
  }

  .data-table {
    font-size: 0.75rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.5rem;
  }

  .user-stats {
    gap: 1rem;
  }

  .activity-graph {
    display: none;
  }
}
</style>