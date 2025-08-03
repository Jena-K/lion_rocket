<template>
  <div class="chat-history">
    <div class="page-header">
      <h2>채팅 기록</h2>
      <p class="subtitle">이전 대화를 확인하고 관리하세요</p>
    </div>

    <!-- Search and Filter -->
    <div class="controls">
      <div class="search-box">
        <i class="search-icon">🔍</i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="채팅 검색..."
          class="search-input"
          @input="handleSearch"
        />
      </div>

      <select v-model="selectedCharacter" @change="filterChats" class="filter-select">
        <option value="">모든 캐릭터</option>
        <option v-for="char in characters" :key="char.id" :value="char.id">
          {{ char.name }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>채팅 기록을 불러오는 중...</p>
    </div>

    <!-- Chats Grid -->
    <div v-else-if="filteredChats.length > 0" class="chats-grid">
      <div v-for="chat in filteredChats" :key="chat.id" class="chat-card" @click="viewChat(chat)">
        <div class="chat-header">
          <div class="chat-avatar">
            <i>{{ getCharacterIcon(chat.character?.name) }}</i>
          </div>
          <div class="chat-info">
            <h4>{{ chat.character?.name || '알 수 없는 캐릭터' }}</h4>
            <p class="chat-date">{{ formatDate(chat.last_message_at || chat.created_at) }}</p>
          </div>
          <button @click.stop="confirmDelete(chat)" class="delete-btn" title="삭제">🗑️</button>
        </div>

        <div class="chat-preview">
          <p v-if="chat.message_count">
            <span class="message-count">{{ chat.message_count }}개의 메시지</span>
          </p>
          <p class="preview-text">클릭하여 대화 내용 보기</p>
        </div>

        <div class="chat-footer">
          <span class="chat-stat"> <i>📅</i> 시작: {{ formatDate(chat.created_at) }} </span>
          <span class="chat-stat">
            <i>⏰</i> 마지막: {{ formatRelativeTime(chat.last_message_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">💬</div>
      <h3>채팅 기록이 없습니다</h3>
      <p>새로운 대화를 시작해보세요!</p>
      <router-link to="/" class="start-chat-btn"> 채팅 시작하기 </router-link>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
        이전
      </button>
      <span class="page-info"> {{ currentPage }} / {{ totalPages }} </span>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        다음
      </button>
    </div>

    <!-- Chat Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedChat" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedChat.character?.name }} 대화 내용</h3>
            <button @click="closeModal" class="close-btn">✕</button>
          </div>

          <div class="modal-body">
            <div v-if="loadingMessages" class="loading-messages">
              <div class="spinner"></div>
            </div>

            <div v-else class="messages-list">
              <div
                v-for="message in messages"
                :key="message.id"
                class="message"
                :class="message.role"
              >
                <div class="message-avatar">
                  <i v-if="message.role === 'user'">👤</i>
                  <i v-else>{{ getCharacterIcon(selectedChat.character?.name) }}</i>
                </div>
                <div class="message-content">
                  <p>{{ message.content }}</p>
                  <span class="message-time">
                    {{ formatTime(message.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn secondary">닫기</button>
            <router-link :to="`/chat/${selectedChat.id}`" class="btn primary">
              대화 계속하기
            </router-link>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="chatToDelete" class="modal-overlay" @click="chatToDelete = null">
        <div class="modal confirm-modal" @click.stop>
          <div class="modal-header">
            <h3>채팅 삭제 확인</h3>
          </div>
          <div class="modal-body">
            <p>이 채팅을 삭제하시겠습니까?</p>
            <p class="warning">⚠️ 이 작업은 되돌릴 수 없습니다.</p>
          </div>
          <div class="modal-footer">
            <button @click="chatToDelete = null" class="btn secondary">취소</button>
            <button @click="deleteChat" class="btn danger">삭제</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { userService } from '../../services/user.service'
import { characterService } from '../../services/character.service'
import type { Chat, ChatMessage, Character } from '../../services/user.service'

// State
const chats = ref<Chat[]>([])
const characters = ref<Character[]>([])
const messages = ref<ChatMessage[]>([])
const loading = ref(false)
const loadingMessages = ref(false)
const searchQuery = ref('')
const selectedCharacter = ref('')
const selectedChat = ref<Chat | null>(null)
const chatToDelete = ref<Chat | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const limit = 12

// Computed
const filteredChats = computed(() => {
  let filtered = chats.value

  // Filter by character
  if (selectedCharacter.value) {
    filtered = filtered.filter((chat) => chat.character_id === parseInt(selectedCharacter.value))
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((chat) => chat.character?.name.toLowerCase().includes(query))
  }

  return filtered
})

// Methods
const getCharacterIcon = (name?: string) => {
  if (!name) return '🤖'

  const icons: Record<string, string> = {
    'Claude Assistant': '🤖',
    'Creative Writer': '✍️',
    'Code Helper': '💻',
    'Math Tutor': '📐',
  }

  return icons[name] || '🤖'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return '없음'

  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return formatDate(dateString)
}

const fetchChats = async () => {
  loading.value = true

  try {
    const response = await userService.getChats(currentPage.value, limit)
    chats.value = response.items
    totalPages.value = response.pages
  } catch (error) {
    console.error('Failed to fetch chats:', error)
  } finally {
    loading.value = false
  }
}

const fetchCharacters = async () => {
  try {
    characters.value = await characterService.getCharacters()
  } catch (error) {
    console.error('Failed to fetch characters:', error)
  }
}

const viewChat = async (chat: Chat) => {
  selectedChat.value = chat
  loadingMessages.value = true

  try {
    messages.value = await userService.getChatMessages(chat.id)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loadingMessages.value = false
  }
}

const closeModal = () => {
  selectedChat.value = null
  messages.value = []
}

const confirmDelete = (chat: Chat) => {
  chatToDelete.value = chat
}

const deleteChat = async () => {
  if (!chatToDelete.value) return

  try {
    await userService.deleteChat(chatToDelete.value.id)
    chats.value = chats.value.filter((c) => c.id !== chatToDelete.value!.id)
    chatToDelete.value = null

    // Refetch if page is empty
    if (chats.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
      fetchChats()
    }
  } catch (error) {
    console.error('Failed to delete chat:', error)
  }
}

const handleSearch = () => {
  // Reset to first page when searching
  currentPage.value = 1
}

const filterChats = () => {
  // Reset to first page when filtering
  currentPage.value = 1
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchChats()
  }
}

onMounted(() => {
  fetchChats()
  fetchCharacters()
})
</script>

<style scoped>
.chat-history {
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

/* Controls */
.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem;
  color: #718096;
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

/* Chats Grid */
.chats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chat-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.chat-info {
  flex: 1;
}

.chat-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  color: #2d3748;
}

.chat-date {
  margin: 0;
  font-size: 0.875rem;
  color: #718096;
}

.delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #fee;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0;
}

.chat-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #fed7d7;
  transform: scale(1.1);
}

.chat-preview {
  flex: 1;
}

.message-count {
  font-weight: 600;
  color: #667eea;
}

.preview-text {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #a0aec0;
}

.chat-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #a0aec0;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.chat-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #2d3748;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: #718096;
}

.start-chat-btn {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.start-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: #4a5568;
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
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f7fafc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.loading-messages {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 1rem;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  background: #f7fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.message.assistant .message-avatar {
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
}

.message-content {
  max-width: 70%;
}

.message-content p {
  margin: 0;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
  line-height: 1.5;
}

.message.user .message-content p {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-time {
  display: block;
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 0.25rem;
  text-align: right;
}

.message.user .message-time {
  text-align: left;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Confirm Modal */
.confirm-modal {
  max-width: 400px;
}

.warning {
  color: #e53e3e;
  font-weight: 500;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.btn.secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn.secondary:hover {
  background: #cbd5e0;
}

.btn.danger {
  background: #fc8181;
  color: white;
}

.btn.danger:hover {
  background: #f56565;
}

/* Responsive */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
  }

  .chats-grid {
    grid-template-columns: 1fr;
  }

  .message-content {
    max-width: 85%;
  }

  .modal {
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
