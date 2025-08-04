<template>
  <div class="chats-container">
    <!-- Header -->
    <header class="chats-header">
      <div class="header-content">
        <h1 class="page-title">대화 내역</h1>
        <div class="header-actions">
          <button @click="createNewChat" class="new-chat-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            새 대화
          </button>
        </div>
      </div>
    </header>

    <!-- Chat List -->
    <main class="chats-main">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>대화 목록을 불러오는 중...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!chats.length" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3>아직 대화가 없습니다</h3>
        <p>캐릭터와 대화를 시작해보세요!</p>
        <button @click="goToCharacters" class="start-chat-btn">
          캐릭터 선택하기
        </button>
      </div>

      <!-- Chat List -->
      <div v-else class="chats-grid">
        <div
          v-for="chat in chats"
          :key="chat.id"
          @click="openChat(chat)"
          class="chat-card"
        >
          <div class="chat-avatar">
            <img 
              v-if="chat.character?.avatar_url" 
              :src="getAvatarUrl(chat.character.avatar_url)" 
              :alt="chat.character.name" 
              class="avatar-image"
              @error="handleImageError"
            />
            <span v-else class="avatar-text">{{ chat.character?.name?.charAt(0) || '?' }}</span>
          </div>
          
          <div class="chat-info">
            <h3 class="chat-title">{{ chat.title || `${chat.character?.name || '알 수 없음'}과의 대화` }}</h3>
            <p class="chat-preview" v-if="chat.last_message">
              {{ chat.last_message }}
            </p>
            <p class="chat-preview" v-else>
              대화를 시작해보세요
            </p>
            <div class="chat-meta">
              <span class="chat-date">{{ formatDate(chat.updated_at) }}</span>
              <span class="message-count" v-if="chat.message_count">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {{ chat.message_count }}
              </span>
            </div>
          </div>

          <button @click.stop="deleteChat(chat)" class="delete-btn" title="대화 삭제">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { chatService, type Chat } from '../services/chat.service'
import { getAvatarUrl } from '../services/avatar.service'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

// State
const chats = ref<Chat[]>([])
const isLoading = ref(true)
const currentPage = ref(1)
const pageSize = ref(12)
const totalChats = ref(0)

// Computed
const totalPages = computed(() => Math.ceil(totalChats.value / pageSize.value))

// Methods
const loadChats = async () => {
  isLoading.value = true
  
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const result = await chatService.getChats({
      skip,
      limit: pageSize.value
    })
    
    chats.value = result.chats
    totalChats.value = result.total
  } catch (err) {
    console.error('Failed to load chats:', err)
    toast.error('대화 목록을 불러오는데 실패했습니다')
  } finally {
    isLoading.value = false
  }
}

const openChat = (chat: Chat) => {
  router.push({
    name: 'chat',
    params: { chatId: chat.id },
    query: { characterId: chat.character_id }
  })
}

const createNewChat = () => {
  router.push('/characters')
}

const goToCharacters = () => {
  router.push('/characters')
}

const deleteChat = async (chat: Chat) => {
  if (!confirm('이 대화를 삭제하시겠습니까?')) return
  
  try {
    await chatService.deleteChat(chat.id)
    toast.success('대화가 삭제되었습니다')
    
    // Reload chats
    await loadChats()
  } catch (err) {
    console.error('Failed to delete chat:', err)
    toast.error('대화 삭제에 실패했습니다')
  }
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadChats()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '오늘'
  } else if (days === 1) {
    return '어제'
  } else if (days < 7) {
    return `${days}일 전`
  } else if (days < 30) {
    return `${Math.floor(days / 7)}주 전`
  } else if (days < 365) {
    return `${Math.floor(days / 30)}개월 전`
  } else {
    return `${Math.floor(days / 365)}년 전`
  }
}

const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement
  if (imgElement) {
    imgElement.style.display = 'none'
  }
}

// Lifecycle
onMounted(() => {
  loadChats()
})
</script>

<style scoped>
.chats-container {
  min-height: 100vh;
  background: #FAFAFA;
}

/* Header */
.chats-header {
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
}

.new-chat-btn {
  background: #5A8F47;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.new-chat-btn:hover {
  background: #4A7C3C;
  transform: translateY(-1px);
}

.new-chat-btn svg {
  width: 18px;
  height: 18px;
}

/* Main Content */
.chats-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: #6B7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E7EB;
  border-top-color: #5A8F47;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #6B7280;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #F3F4F6;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  color: #9CA3AF;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
}

.empty-state p {
  margin: 0 0 1.5rem;
  color: #6B7280;
}

.start-chat-btn {
  background: #5A8F47;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.start-chat-btn:hover {
  background: #4A7C3C;
  transform: translateY(-1px);
}

/* Chat Grid */
.chats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Chat Card */
.chat-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 1rem;
  position: relative;
}

.chat-card:hover {
  border-color: #B8EEA2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.chat-avatar {
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 12px;
  background: #B8EEA2;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-weight: 600;
  color: white;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  font-size: 1.25rem;
}

.chat-info {
  flex: 1;
  overflow: hidden;
}

.chat-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-preview {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: #6B7280;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.chat-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9CA3AF;
}

.message-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.message-count svg {
  width: 14px;
  height: 14px;
}

.delete-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: none;
  background: #FEE2E2;
  color: #DC2626;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.chat-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #FCA5A5;
  transform: scale(1.1);
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #B8EEA2;
  background: #F0FDF4;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn svg {
  width: 20px;
  height: 20px;
  color: #6B7280;
}

.page-info {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .chats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    padding: 1rem;
  }
  
  .chats-main {
    padding: 1rem;
  }
}
</style>