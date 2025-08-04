<template>
  <div class="user-chat-history">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">사용자별 채팅 기록</h2>
      <p class="page-subtitle">사용자의 채팅 내역과 통계를 확인할 수 있습니다</p>
    </div>

    <div class="content-layout">
      <!-- User Selection Sidebar -->
      <aside class="user-sidebar">
        <div class="sidebar-header">
          <h3>사용자 목록</h3>
          <div class="user-search">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              v-model="userSearch" 
              type="text" 
              placeholder="사용자 검색..."
              class="search-input"
            />
          </div>
        </div>
        
        <div class="user-list">
          <!-- Loading state for users -->
          <div v-if="loading && users.length === 0" class="loading-users">
            <div class="loading-spinner-small"></div>
            <p>사용자 목록을 불러오는 중...</p>
          </div>
          
          <div 
            v-for="user in filteredUsers" 
            :key="user.user_id"
            :class="['user-item', { active: selectedUser?.user_id === user.user_id }]"
            @click="selectUser(user)"
          >
            <div class="user-avatar">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <div class="user-name">{{ user.username }}</div>
              <div class="user-email">{{ user.email }}</div>
              <div class="user-stats">
                <span class="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {{ user.total_chats || 0 }} 대화
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- No User Selected State -->
        <div v-if="!selectedUser" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h3>사용자를 선택해주세요</h3>
          <p>좌측 목록에서 사용자를 선택하면 채팅 기록을 확인할 수 있습니다</p>
        </div>

        <!-- Character List for Selected User -->
        <div v-else-if="!selectedCharacter" class="character-section">
          <div class="section-header">
            <h3>{{ selectedUser.username }}님의 대화 캐릭터</h3>
            <p class="section-subtitle">총 {{ userCharacters.length }}명의 캐릭터와 대화했습니다</p>
          </div>

          <!-- Loading state for characters -->
          <div v-if="loading && userCharacters.length === 0" class="loading-characters">
            <div class="loading-spinner"></div>
            <p>캐릭터 통계를 불러오는 중...</p>
          </div>
          
          <!-- Empty state for characters -->
          <div v-else-if="!loading && userCharacters.length === 0" class="empty-characters">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3>아직 대화한 캐릭터가 없습니다</h3>
            <p>이 사용자는 아직 어떤 캐릭터와도 대화하지 않았습니다.</p>
          </div>

          <div v-else class="character-grid">
            <div 
              v-for="char in userCharacters" 
              :key="char.character_id"
              class="character-card"
              @click="selectCharacter(char)"
            >
              <div class="character-avatar">
                <img 
                  v-if="getAvatarUrl(char.avatar_url)" 
                  :src="getAvatarUrl(char.avatar_url)!" 
                  :alt="char.name"
                  class="avatar-image"
                  @error="handleAvatarError"
                  loading="lazy"
                />
                <span v-else class="avatar-text">
                  {{ char.name.charAt(0) }}
                </span>
              </div>
              <h4 class="character-name">{{ char.name }}</h4>
              <div class="character-stats">
                <div class="stat">
                  <span class="stat-value">{{ char.chatCount }}</span>
                  <span class="stat-label">대화</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ char.messageCount }}</span>
                  <span class="stat-label">메시지</span>
                </div>
              </div>
              <div class="last-chat">
                마지막 대화: {{ formatDate(char.lastChatDate) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Conversation Details -->
        <div v-else class="conversation-details">
          <div class="details-header">
            <button @click="selectedCharacter = null" class="back-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" />
              </svg>
              뒤로가기
            </button>
            <div class="header-info">
              <h3>{{ selectedUser.username }} - {{ selectedCharacter.name }} 대화 내역</h3>
              <p class="header-subtitle">
                총 {{ selectedCharacter.chatCount }}개의 대화, {{ selectedCharacter.messageCount }}개의 메시지
              </p>
            </div>
          </div>

          <!-- Conversation Stats -->
          <div class="conversation-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatDate(selectedCharacter.firstChatDate) }}</div>
                <div class="stat-label">첫 대화</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ selectedCharacter.avgMessagesPerChat }}</div>
                <div class="stat-label">평균 메시지/대화</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ selectedCharacter.avgChatDuration }}분</div>
                <div class="stat-label">평균 대화 시간</div>
              </div>
            </div>
          </div>

          <!-- All Messages -->
          <div class="conversation-messages">
            <h4>전체 대화 내역</h4>
            
            <!-- Loading state for messages -->
            <div v-if="loading && allChats.length === 0" class="loading-messages">
              <div class="loading-spinner"></div>
              <p>대화 내역을 불러오는 중...</p>
            </div>
            
            <div v-else class="messages-container">
              <div 
                v-for="(message, index) in allChats" 
                :key="message.message_id"
                class="message-item"
                :class="{ 
                  'user-message': message.isFromUser,
                  'ai-message': !message.isFromUser,
                  'new-day': isNewDay(index)
                }"
              >
                <!-- Date separator if new day -->
                <div v-if="isNewDay(index)" class="date-separator">
                  <span>{{ formatFullDate(message.timestamp) }}</span>
                </div>
                
                <!-- Message content -->
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-sender">
                      {{ message.isFromUser ? selectedUser.username : selectedCharacter.name }}
                    </span>
                    <span class="message-time">
                      {{ formatTime(message.timestamp) }}
                    </span>
                  </div>
                  <div class="message-text">
                    {{ message.content }}
                  </div>
                </div>
              </div>
              
              <!-- Empty state if no messages -->
              <div v-if="allChats.length === 0" class="no-messages">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <p>아직 대화 내역이 없습니다</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { adminService, type User, type CharacterChatStats, type Chat } from '@/services/admin.service'
import { useNotificationStore } from '@/stores/notification'
import { getAvatarUrl, getPlaceholderAvatar, handleAvatarError } from '@/services/avatar.service'

// Types
interface CharacterChat {
  character_id: number
  name: string
  avatar_url?: string
  chatCount: number
  messageCount: number
  lastChatDate: Date
  firstChatDate: Date
  avgMessagesPerChat: number
  avgChatDuration: number
}

interface Message {
  message_id: number
  content: string
  isFromUser: boolean
  timestamp: Date
}

// State
const notificationStore = useNotificationStore()
const userSearch = ref('')
const selectedUser = ref<User | null>(null)
const selectedCharacter = ref<CharacterChat | null>(null)
const loading = ref(false)

// Data
const users = ref<User[]>([])
const userCharacters = ref<CharacterChat[]>([])
const allChats = ref<Message[]>([])

// Computed
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  
  const search = userSearch.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(search) ||
    user.email.toLowerCase().includes(search)
  )
})

// API Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await adminService.getUsers(1, 100) // Get all users
    users.value = response.items
  } catch (error) {
    console.error('Failed to fetch users:', error)
    notificationStore.error('사용자 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const fetchUserCharacters = async (userId: number) => {
  try {
    loading.value = true
    const characterStats = await adminService.getUserCharacterStats(userId)
    userCharacters.value = characterStats.map(stat => ({
      character_id: stat.character_id,
      name: stat.name,
      avatar_url: stat.avatar_url,
      chatCount: stat.chatCount,
      messageCount: stat.messageCount,
      lastChatDate: new Date(stat.lastChatDate),
      firstChatDate: new Date(stat.firstChatDate),
      avgMessagesPerChat: stat.avgMessagesPerChat,
      avgChatDuration: stat.avgChatDuration
    }))
  } catch (error) {
    console.error('Failed to fetch user characters:', error)
    notificationStore.error('사용자 캐릭터 통계를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const fetchChats = async (userId: number, characterId: number) => {
  try {
    loading.value = true
    const response = await adminService.getUserChats2(userId, characterId, 1, 500) // Get all chats
    allChats.value = response.items.map(msg => ({
      message_id: msg.message_id,
      content: msg.content,
      isFromUser: msg.role === 'user',
      timestamp: new Date(msg.created_at)
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) // Sort chronologically
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    notificationStore.error('메시지를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// Methods
const selectUser = async (user: User) => {
  selectedUser.value = user
  selectedCharacter.value = null
  allChats.value = []
  
  // Fetch character stats for this user
  await fetchUserCharacters(user.user_id)
}

const selectCharacter = async (character: CharacterChat) => {
  selectedCharacter.value = character
  
  // Fetch messages for this user-character pair
  if (selectedUser.value) {
    await fetchChats(selectedUser.value.user_id, character.character_id)
  }
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return `${Math.floor(days / 30)}개월 전`
}

const formatFullDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const isNewDay = (index: number) => {
  if (index === 0) return true
  
  const currentMessage = allChats.value[index]
  const previousMessage = allChats.value[index - 1]
  
  const currentDate = new Date(currentMessage.timestamp).toDateString()
  const previousDate = new Date(previousMessage.timestamp).toDateString()
  
  return currentDate !== previousDate
}

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-chat-history {
  padding: 2rem;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

/* Layout */
.content-layout {
  display: flex;
  gap: 1.5rem;
  height: calc(100vh - 200px);
}

/* User Sidebar */
.user-sidebar {
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #1a202c;
}

.user-search {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.user-list {
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.user-item:hover {
  background: #f8fafc;
}

.user-item.active {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  padding-left: calc(1.5rem - 3px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #e0e7ff;
  color: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.125rem;
}

.user-email {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.user-stats {
  display: flex;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.stat-item svg {
  width: 14px;
  height: 14px;
}

/* Main Content */
.main-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  color: #94a3b8;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: #1a202c;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

/* Character Section */
.character-section {
  padding: 2rem;
  overflow-y: auto;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  color: #1a202c;
}

.section-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.character-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.character-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.character-avatar {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: #ddd6fe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7c3aed;
}

.character-name {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.character-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.last-chat {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Conversation Details */
.conversation-details {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.details-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  color: #475569;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #e2e8f0;
  color: #334155;
}

.back-button svg {
  width: 16px;
  height: 16px;
}

.header-info {
  flex: 1;
}

.header-info h3 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  color: #1a202c;
}

.header-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

/* Conversation Stats */
.conversation-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  color: #6366f1;
}

.stat-content {
  flex: 1;
}

.stat-content .stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-content .stat-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.125rem;
}

/* Conversation Messages */
.conversation-messages {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
}

.conversation-messages h4 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #1a202c;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-item {
  position: relative;
  margin-bottom: 0.5rem;
}

.message-item.new-day {
  margin-top: 2rem;
}

/* Date Separator */
.date-separator {
  text-align: center;
  margin: 1.5rem 0 1rem;
  position: relative;
}

.date-separator span {
  background: white;
  padding: 0 1rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.date-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
  z-index: 0;
}

/* Message Content */
.message-content {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  transition: all 0.2s;
}

.user-message .message-content {
  background: #eff6ff;
  border-color: #dbeafe;
  margin-left: 3rem;
}

.ai-message .message-content {
  background: #f0fdf4;
  border-color: #d1fae5;
  margin-right: 3rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-sender {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1a202c;
}

.user-message .message-sender {
  color: #1e40af;
}

.ai-message .message-sender {
  color: #166534;
}

.message-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.message-text {
  line-height: 1.6;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
}

/* No Messages State */
.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #94a3b8;
}

.no-messages svg {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.no-messages p {
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
    height: auto;
  }
  
  .user-sidebar {
    width: 100%;
    max-height: 300px;
  }
  
  .character-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

/* Loading States */
.loading-users {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #64748b;
}

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid #E5E7EB;
  border-top-color: #B8EEA2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

.loading-characters,
.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
}

.empty-characters {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #64748b;
}

.empty-characters .empty-icon {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-characters .empty-icon svg {
  width: 40px;
  height: 40px;
  color: #94a3b8;
}

.empty-characters h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: #1a202c;
}

.empty-characters p {
  margin: 0;
  color: #64748b;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>