<template>
  <div class="chat-container">
    <!-- Modern Glassmorphic Header -->
    <header class="chat-header">
      <div class="header-blur"></div>
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="back-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" />
            </svg>
          </button>
          <div class="character-info" v-if="currentCharacter">
            <div class="character-avatar">
              <div class="avatar-glow"></div>
              <img 
                v-if="getAvatarUrl(currentCharacter.avatar_url)" 
                :src="getAvatarUrl(currentCharacter.avatar_url)!" 
                :alt="currentCharacter.name" 
                class="avatar-header-image"
                @error="handleAvatarError"
              />
              <span v-else class="avatar-text">{{ currentCharacter.name.charAt(0) }}</span>
            </div>
            <div class="character-details">
              <h2 class="character-name">{{ currentCharacter.name }}</h2>
              <div class="character-status">
                <span class="status-indicator"></span>
                온라인
              </div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <button @click="endConversation" class="end-chat-btn" title="대화 종료 및 요약">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 9V6a3 3 0 013-3v0a3 3 0 013 3v3m0 0v3a3 3 0 01-3 3v0a3 3 0 01-3-3V9m6 0H9" />
            </svg>
            <span>대화 종료</span>
          </button>
          <button @click="handleLogout" class="logout-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Modern Messages Area with Gradient Background -->
    <main class="chat-main">
      <div class="background-pattern"></div>
      <div class="messages-container" ref="messagesContainer">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>대화를 불러오는 중...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="retryLoad" class="retry-button">다시 시도</button>
        </div>

        <!-- Messages -->
        <template v-else>
          <!-- Date Separator -->
          <div class="date-separator">
            <span>오늘</span>
          </div>
          
          <!-- Messages with Modern Card Design -->
          <div v-for="message in messages" :key="message.id" 
               :class="['message-wrapper', message.is_from_user ? 'user-message' : 'character-message']">
            
            <!-- Character Avatar for their messages -->
            <div v-if="!message.is_from_user && currentCharacter" class="message-avatar">
              <div class="avatar-small">
                <img 
                  v-if="getAvatarUrl(currentCharacter.avatar_url)" 
                  :src="getAvatarUrl(currentCharacter.avatar_url)!" 
                  :alt="currentCharacter.name" 
                  class="avatar-small-image"
                  @error="handleAvatarError"
                />
                <span v-else class="avatar-text-small">{{ currentCharacter.name.charAt(0) }}</span>
              </div>
            </div>
            
            <!-- Modern Message Card -->
            <div class="message-card">
              <div class="message-content">
                <p class="message-text">{{ message.content }}</p>
              </div>
              <div class="message-meta">
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
                <svg v-if="message.is_from_user" class="message-status" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="message-wrapper character-message">
            <div v-if="currentCharacter" class="message-avatar">
              <div class="avatar-small">
                <img 
                  v-if="getAvatarUrl(currentCharacter.avatar_url)" 
                  :src="getAvatarUrl(currentCharacter.avatar_url)!" 
                  :alt="currentCharacter.name" 
                  class="avatar-small-image"
                  @error="handleAvatarError"
                />
                <span v-else class="avatar-text-small">{{ currentCharacter.name.charAt(0) }}</span>
              </div>
            </div>
            <div class="typing-indicator">
              <div class="typing-bubble">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <!-- Modern Input Area with Glassmorphism -->
    <div class="chat-input-container">
      <div class="input-wrapper">
        <button @click="toggleEmojiPicker" class="emoji-button" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </button>
        
        <input
          ref="messageInput"
          v-model="newMessage"
          @keydown.enter="sendMessage"
          type="text"
          placeholder="메시지를 입력하세요..."
          class="message-input"
          :disabled="isLoading || isSending"
        />
        
        <button 
          @click="sendMessage" 
          class="send-button"
          :disabled="!newMessage.trim() || isLoading || isSending"
        >
          <svg v-if="!isSending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <div v-else class="sending-spinner"></div>
        </button>
      </div>

      <!-- Emoji Picker -->
      <transition name="emoji-slide">
        <div v-if="showEmojiPicker" class="emoji-picker">
          <div class="emoji-grid">
            <button 
              v-for="emoji in commonEmojis" 
              :key="emoji"
              @click="insertEmoji(emoji)"
              class="emoji-item"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { chatService, type Message } from '../services/chat.service'
import { characterService, type Character } from '../services/character.service'
import { getAvatarUrl, handleAvatarError } from '../services/avatar.service'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State
const characterId = computed(() => Number(route.params.characterId))
const currentCharacter = ref<Character | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const showEmojiPicker = ref(false)
const messagesContainer = ref<HTMLElement>()
const isTyping = ref(false)
const isLoading = ref(true)
const isSending = ref(false)
const error = ref<string | null>(null)
const streamingMessage = ref<Message | null>(null)

// Common emojis
const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '😊',
  '😇', '😉', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😎', '🥳', '😌', '😛', '😜', '😝', '🤪', '🤨',
  '👍', '👎', '👏', '🙏', '❤️', '💔', '💕', '💖'
]

// Methods
const loadCharacter = async () => {
  if (!characterId.value) return
  
  try {
    currentCharacter.value = await characterService.getCharacter(characterId.value)
  } catch (err) {
    console.error('Failed to load character:', err)
    toast.error('캐릭터 정보를 불러오는데 실패했습니다')
  }
}

const loadMessages = async () => {
  try {
    messages.value = await chatService.getMessages(characterId.value)
    await scrollToBottom()
  } catch (err) {
    console.error('Failed to load messages:', err)
    error.value = '대화 내용을 불러오는데 실패했습니다'
  }
}

const initializeChat = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    await loadCharacter()
    await loadMessages()
    setupSSEConnection()
  } catch (err) {
    console.error('Failed to initialize chat:', err)
    error.value = '채팅을 초기화하는데 실패했습니다'
  } finally {
    isLoading.value = false
  }
}

const setupSSEConnection = () => {
  chatService.connectToCharacter(
    characterId.value,
    handleSSEMessage,
    handleSSEError,
    handleSSEOpen
  )
}

const handleSSEOpen = () => {
  console.log('SSE connection established')
}

const handleSSEError = (error: Event) => {
  console.error('SSE connection error:', error)
  toast.error('실시간 연결이 끊어졌습니다. 페이지를 새로고침해주세요.')
}

const handleSSEMessage = (event: MessageEvent) => {
  const data = event.data
  const eventType = event.type
  
  switch (eventType) {
    case 'message':
      // New complete message
      messages.value.push(data.message)
      scrollToBottom()
      break
      
    case 'message_start':
      // AI started generating response
      isTyping.value = true
      streamingMessage.value = data.message
      messages.value.push(data.message)
      scrollToBottom()
      break
      
    case 'message_complete':
      // AI completed response
      isTyping.value = false
      // Update the message with final content
      const messageIndex = messages.value.findIndex(m => m.id === data.message.id)
      if (messageIndex > -1) {
        messages.value[messageIndex] = data.message
      }
      streamingMessage.value = null
      scrollToBottom()
      break
      
    case 'error':
      isTyping.value = false
      toast.error(data.error || '메시지 전송 중 오류가 발생했습니다')
      break
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return
  
  const messageContent = newMessage.value.trim()
  newMessage.value = ''
  isSending.value = true
  
  try {
    await chatService.sendMessage({
      content: messageContent,
      character_id: characterId.value
    })
  } catch (err: any) {
    console.error('Failed to send message:', err)
    toast.error(err.response?.data?.detail || '메시지 전송에 실패했습니다')
    // Restore the message on error
    newMessage.value = messageContent
  } finally {
    isSending.value = false
  }
}

const endConversation = async () => {
  try {
    const result = await chatService.endConversation(characterId.value)
    if (result.summary_created) {
      toast.success('대화가 요약되었습니다')
    }
    // Navigate back to character selection
    router.push('/characters')
  } catch (err) {
    console.error('Failed to end conversation:', err)
    toast.error('대화 종료에 실패했습니다')
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji: string) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
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

const retryLoad = () => {
  initializeChat()
}

// Focus on input when component mounts
const messageInput = ref<HTMLInputElement>()
onMounted(() => {
  initializeChat()
  messageInput.value?.focus()
})

// Cleanup on unmount
onUnmounted(() => {
  chatService.disconnectFromCharacter(characterId.value)
})

// Watch for route changes
watch(() => route.params.characterId, (newCharacterId) => {
  if (newCharacterId) {
    chatService.disconnectFromCharacter(characterId.value)
    initializeChat()
  }
})
</script>

<style scoped>
/* Container */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
}

/* Header Styles */
.chat-header {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(184, 238, 162, 0.1) 0%, rgba(90, 143, 71, 0.1) 100%);
  z-index: -1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;
}

.back-button:hover {
  background: white;
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.back-button svg {
  width: 20px;
  height: 20px;
}

/* Character Info in Header */
.character-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.character-avatar {
  position: relative;
}

.avatar-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(135deg, #B8EEA2, #5A8F47);
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(8px);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}

.avatar-header-image {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 1;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-text {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B8EEA2, #5A8F47);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  position: relative;
  z-index: 1;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.character-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.character-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.character-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

/* Header Right Actions */
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.end-chat-btn,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.end-chat-btn:hover {
  background: #FEF3C7;
  border-color: #F59E0B;
  color: #92400E;
}

.logout-btn:hover {
  background: #FEE2E2;
  border-color: #EF4444;
  color: #991B1B;
}

.end-chat-btn svg,
.logout-btn svg {
  width: 16px;
  height: 16px;
}

/* Main Chat Area */
.chat-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(184, 238, 162, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(90, 143, 71, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.messages-container {
  height: 100%;
  overflow-y: auto;
  padding: 2rem;
  scroll-behavior: smooth;
}

/* Custom Scrollbar */
.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(184, 238, 162, 0.2);
  border-top-color: #B8EEA2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #5A8F47;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #4A7C3C;
}

/* Date Separator */
.date-separator {
  text-align: center;
  margin: 2rem 0;
  position: relative;
}

.date-separator span {
  background: #f5f7fa;
  padding: 0 1rem;
  color: #666;
  font-size: 0.875rem;
  position: relative;
}

.date-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
}

/* Message Styles */
.message-wrapper {
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-end;
  gap: 0.75rem;
}

.user-message {
  justify-content: flex-end;
}

.character-message {
  justify-content: flex-start;
}

/* Message Avatar */
.message-avatar {
  flex-shrink: 0;
}

.avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #B8EEA2, #5A8F47);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-small-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text-small {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Message Card */
.message-card {
  max-width: 70%;
  min-width: 100px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.user-message .message-card {
  background: linear-gradient(135deg, #5A8F47, #4A7C3C);
  color: white;
}

.character-message .message-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.message-content {
  padding: 1rem 1.25rem;
}

.message-text {
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.user-message .message-text {
  color: white;
}

.character-message .message-text {
  color: #333;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.25rem;
  background: rgba(0, 0, 0, 0.05);
  font-size: 0.75rem;
}

.user-message .message-meta {
  background: rgba(255, 255, 255, 0.1);
}

.message-time {
  opacity: 0.7;
}

.message-status {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

/* Typing Indicator */
.typing-indicator {
  padding: 1rem 1.25rem;
}

.typing-bubble {
  display: flex;
  gap: 4px;
}

.typing-bubble span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  animation: typing 1.4s infinite;
}

.typing-bubble span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-bubble span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px);
  }
}

/* Input Area */
.chat-input-container {
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1.5rem 2rem;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.1);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.emoji-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.emoji-button:hover {
  background: rgba(184, 238, 162, 0.2);
  color: #5A8F47;
}

.emoji-button svg {
  width: 20px;
  height: 20px;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1.25rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.02);
}

.message-input:focus {
  border-color: #B8EEA2;
  background: white;
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #5A8F47;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.send-button:hover:not(:disabled) {
  background: #4A7C3C;
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button svg {
  width: 20px;
  height: 20px;
}

.sending-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Emoji Picker */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 2rem;
  right: 2rem;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
}

.emoji-item {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.emoji-item:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.2);
}

/* Transitions */
.emoji-slide-enter-active,
.emoji-slide-leave-active {
  transition: all 0.3s ease;
}

.emoji-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.emoji-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }
  
  .messages-container {
    padding: 1rem;
  }
  
  .message-card {
    max-width: 85%;
  }
  
  .chat-input-container {
    padding: 1rem;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>