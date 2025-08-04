<template>
  <div class="chat-container">
    <!-- 깔끔한 헤더 -->
    <header class="chat-header">
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
        </button>
        
        <div class="character-info" v-if="currentCharacter">
          <div class="character-avatar">
            <div class="avatar-placeholder">
              {{ getPlaceholderAvatar(currentCharacter) }}
            </div>
            <div class="status-dot"></div>
          </div>
          <div class="character-details">
            <h2 class="character-name">{{ currentCharacter.name }}</h2>
          </div>
        </div>

        <div class="header-actions">
          <button @click="handleLogout" class="logout-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 메시지 영역 -->
    <main class="messages-area" ref="messagesContainer">
      <div class="messages-wrapper">
        <!-- 메시지 로딩 상태 -->
        <div v-if="isLoadingMessages" class="loading-state">
          <div class="loading-spinner"></div>
          <p>대화 기록을 불러오는 중...</p>
        </div>

        <!-- 환영 메시지 -->
        <div v-else-if="messages.length === 0" class="welcome-message">
          <div class="welcome-avatar">
            <div v-if="currentCharacter" class="welcome-avatar-placeholder">
              {{ getPlaceholderAvatar(currentCharacter) }}
            </div>
          </div>
          <h3>AI와 대화를 시작해보세요!</h3>
          <p>메시지를 입력하면 대화가 시작됩니다.</p>
        </div>

        <!-- 메시지 목록 -->
        <div v-else class="messages-list">
          <div 
            v-for="(message, index) in messages" 
            :key="message.chat_id"
            :class="['message-item', message.role === 'user' ? 'user-message' : 'character-message']"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <!-- 캐릭터 메시지 -->
            <template v-if="message.role === 'assistant'">
              <div class="message-avatar">
                <div v-if="currentCharacter" class="msg-avatar-placeholder">
                  {{ getPlaceholderAvatar(currentCharacter) }}
                </div>
              </div>
              <div class="message-bubble character-bubble">
                <p>{{ message.content }}</p>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
              </div>
            </template>

            <!-- 사용자 메시지 -->
            <template v-else>
              <div class="message-bubble user-bubble">
                <p>{{ message.content }}</p>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
              </div>
            </template>
          </div>

          <!-- 타이핑 인디케이터 -->
          <div v-if="isTyping" class="message-item character-message typing-message">
            <div class="message-avatar">
              <img 
                v-if="currentCharacter && getAvatarUrl(currentCharacter.avatar_url)" 
                :src="getAvatarUrl(currentCharacter.avatar_url)!" 
                :alt="currentCharacter.name" 
                class="msg-avatar-img"
                @error="handleAvatarError"
              />
              <div v-else-if="currentCharacter" class="msg-avatar-placeholder">
                {{ currentCharacter.name.charAt(0) }}
              </div>
            </div>
            <div class="message-bubble character-bubble typing-bubble">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 입력 영역 -->
    <footer class="input-area">
      <div class="input-container">
        <input
          ref="messageInput"
          v-model="newMessage"
          @keydown.enter="sendMessage"
          type="text"
          placeholder="메시지를 입력하세요..."
          class="message-input"
          :disabled="isSending"
        />
        <button 
          @click="sendMessage" 
          class="send-btn"
          :disabled="!newMessage.trim() || isSending"
        >
          <svg v-if="!isSending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <div v-else class="sending-spinner"></div>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getPlaceholderAvatar, getAvatarUrl, handleAvatarError } from '../services/avatar.service'
import { characterService } from '../services/character.service'
import { chatService } from '../services/chat.service'
import type { Character } from '@/types'
import type { Message, ChatRole } from '@/types/chat'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Import the Character type from @/types instead of defining locally
// The Character type is already imported at the top of the file

// State
const characterId = computed(() => Number(route.params.characterId))
const currentCharacter = ref<Character | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLInputElement>()
const isTyping = ref(false)
const isSending = ref(false)
const isLoadingMessages = ref(false)

// Methods
const loadCharacter = async () => {
  try {
    const character = await characterService.getCharacter(characterId.value)
    currentCharacter.value = character
  } catch (err) {
    console.error('Failed to load character:', err)
    // Handle error - redirect back to character selection
    router.push('/character-selection')
  }
}

const loadMessages = async () => {
  if (!characterId.value) return
  
  isLoadingMessages.value = true
  try {
    const existingMessages = await chatService.getMessages(characterId.value)
    messages.value = existingMessages
    await scrollToBottom()
  } catch (err) {
    console.error('Failed to load messages:', err)
    // Continue with empty messages array
  } finally {
    isLoadingMessages.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value || !currentCharacter.value) return
  
  const messageContent = newMessage.value.trim()
  newMessage.value = ''
  isSending.value = true
  
  try {
    // Send message to backend API
    const response = await chatService.sendMessage({
      content: messageContent,
      character_id: currentCharacter.value.character_id
    })
    
    // The user message will be handled by SSE events
    // Just show typing indicator for AI response
    isTyping.value = true
    
  } catch (err: any) {
    console.error('Failed to send message:', err)
    newMessage.value = messageContent
    // Show error message to user
    const errorMessage: Message = {
      chat_id: Date.now(),
      content: '메시지 전송에 실패했습니다. 다시 시도해주세요.',
      role: 'assistant' as ChatRole,
      created_at: new Date().toISOString(),
      user_id: authStore.user?.user_id || 0,
      character_id: currentCharacter.value?.character_id || 0
    }
    messages.value.push(errorMessage)
    await scrollToBottom()
  } finally {
    isSending.value = false
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const goBack = () => {
  router.push('/characters')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// SSE Message handling
const handleSSEMessage = (event: MessageEvent) => {
  const data = event.data
  
  if (event.type === 'message') {
    // User message received
    const message = data.message
    messages.value.push(message)
    scrollToBottom()
  } else if (event.type === 'message_start') {
    // AI started responding
    isTyping.value = true
  } else if (event.type === 'message_complete') {
    // AI response completed
    const message = data.message
    messages.value.push(message)
    isTyping.value = false
    scrollToBottom()
  } else if (event.type === 'error') {
    // Error occurred
    isTyping.value = false
    const errorMessage: Message = {
      chat_id: Date.now(),
      content: data.error || '응답 생성 중 오류가 발생했습니다.',
      role: 'assistant' as ChatRole,
      created_at: new Date().toISOString(),
      user_id: authStore.user?.user_id || 0,
      character_id: currentCharacter.value?.character_id || 0
    }
    messages.value.push(errorMessage)
    scrollToBottom()
  }
}

// Lifecycle
onMounted(async () => {
  await loadCharacter()
  await loadMessages()
  
  // Connect to SSE for real-time messages
  if (currentCharacter.value) {
    chatService.connectToCharacter(
      currentCharacter.value.character_id,
      handleSSEMessage,
      (error) => {
        console.error('SSE connection error:', error)
      },
      () => {
        console.log('SSE connection established')
      }
    )
  }
  
  messageInput.value?.focus()
})

// Cleanup on unmount
onUnmounted(() => {
  if (currentCharacter.value) {
    chatService.disconnectFromCharacter(currentCharacter.value.character_id)
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
}

/* 헤더 */
.chat-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f3f4f6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #6b7280;
}

.back-btn:hover {
  background: #4caf50;
  color: white;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.character-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.character-avatar {
  position: relative;
  width: 44px;
  height: 44px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  border: 3px solid #e5e7eb;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #4caf50;
  border: 2px solid white;
  border-radius: 50%;
}

.character-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.character-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}


.header-actions {
  display: flex;
  gap: 0.5rem;
}

.logout-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #ffcdd2;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #c62828;
}

.logout-btn:hover {
  background: #ffb3ba;
}

.logout-btn svg {
  width: 18px;
  height: 18px;
}

/* 메시지 영역 */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1.5rem;
  scroll-behavior: smooth;
}

.messages-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 스크롤바 스타일링 */
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: #4caf50;
}

/* 환영 메시지 */
.welcome-message {
  text-align: center;
  padding: 3rem 2rem;
  color: #1f2937;
}

.welcome-avatar {
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
}

.welcome-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e5e7eb;
}

.welcome-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 2rem;
  border: 4px solid #e5e7eb;
}

.welcome-message h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.welcome-message p {
  margin: 0;
  opacity: 0.8;
  font-size: 1rem;
}

/* 메시지 목록 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  display: flex;
  gap: 0.75rem;
  animation: fadeIn 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.user-message {
  justify-content: flex-end;
}

.character-message {
  justify-content: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.msg-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.msg-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border: 2px solid #e5e7eb;
}

/* 메시지 버블 */
.message-bubble {
  max-width: 70%;
  padding: 0.875rem 1.125rem;
  border-radius: 20px;
  position: relative;
  border: 1px solid #e5e7eb;
  transition: background-color 0.3s ease;
}

.message-bubble:hover {
  background-color: rgba(76, 175, 80, 0.05);
}

.character-bubble {
  background: #f9fafb;
  color: #1f2937;
  border-bottom-left-radius: 8px;
}

.user-bubble {
  background: #f0fdf4;
  color: #166534;
  border-bottom-right-radius: 8px;
  margin-left: auto;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.message-bubble p {
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  display: block;
}

/* 타이핑 인디케이터 */
.typing-bubble {
  background: #f9fafb;
  padding: 1rem 1.125rem;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  animation: typingDot 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

/* 입력 영역 */
.input-area {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.input-container {
  display: flex;
  gap: 0.75rem;
  max-width: 800px;
  margin: 0 auto;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

.message-input:focus {
  border-color: #4caf50;
  background: white;
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #4caf50;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: white;
}

.send-btn:hover:not(:disabled) {
  background: #388e3c;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 20px;
  height: 20px;
}

.sending-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-header {
    padding: 1rem;
  }
  
  .messages-area {
    padding: 1.5rem 1rem;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .input-area {
    padding: 1rem;
  }
  
  .welcome-message {
    padding: 2rem 1rem;
  }
  
  .welcome-message h3 {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    gap: 0.75rem;
  }
  
  .character-name {
    font-size: 1rem;
  }
  
  .messages-area {
    padding: 1rem 0.75rem;
  }
  
  .input-container {
    gap: 0.5rem;
  }
  
  .send-btn {
    width: 44px;
    height: 44px;
  }
}
</style>