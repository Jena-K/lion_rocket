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
            :class="[
              'message-item', 
              message.role === 'user' ? 'user-message' : 'character-message',
              pendingMessageIds?.has(message.chat_id) ? 'pending-message' : '',
              (message as any).failed ? 'failed-message' : ''
            ]"
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
              <div class="message-avatar">
                <div v-if="authStore.user" class="msg-avatar-placeholder user-avatar">
                  {{ getUserPlaceholderAvatar(authStore.user) }}
                </div>
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
        <div class="input-wrapper">
          <input
            ref="messageInput"
            v-model="newMessage"
            @keydown.enter="sendMessage"
            type="text"
            placeholder="메시지를 입력하세요..."
            class="message-input"
            :maxlength="200"
          />
          <span class="character-counter" :class="{ 'warning': newMessage.length > 180, 'error': newMessage.length >= 200 }">
            {{ newMessage.length }}/200
          </span>
        </div>
        <button 
          @click="sendMessage" 
          class="send-btn"
          :disabled="!newMessage.trim() || newMessage.length > 200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getPlaceholderAvatar, getUserPlaceholderAvatar, getAvatarUrl, handleAvatarError } from '../services/avatar.service'
import { characterService } from '../services/character.service'
import { chatService, type ChatMessageResponse } from '../services/chat.service'
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
const messages = ref<ExtendedMessage[]>([])
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLInputElement>()
const isTyping = ref(false)
const isSending = ref(false)
const isLoadingMessages = ref(false)
const pendingMessageIds = ref<Set<number>>(new Set())

// Extended Message type to include failed state
interface ExtendedMessage extends Message {
  failed?: boolean
}

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
    // Use instant scroll for initial load, then smooth scroll for new messages
    await scrollToBottom(false)
  } catch (err) {
    console.error('Failed to load messages:', err)
    // Continue with empty messages array
  } finally {
    isLoadingMessages.value = false
  }
}

// Generate unique message ID
let messageIdCounter = Date.now()
const generateMessageId = () => {
  return messageIdCounter++
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentCharacter.value) return
  
  // Check character limit
  if (newMessage.value.length > 200) {
    console.warn('Message exceeds 200 character limit')
    return
  }
  
  const messageContent = newMessage.value.trim()
  newMessage.value = ''
  
  // Create user message with unique ID
  const userMessageId = generateMessageId()
  const userMessage: ExtendedMessage = {
    chat_id: userMessageId,
    content: messageContent,
    role: 'user' as ChatRole,
    created_at: new Date().toISOString(),
    user_id: authStore.user?.user_id || 0,
    character_id: currentCharacter.value.character_id
  }
  
  // Add user message immediately for optimistic UI
  messages.value.push(userMessage)
  
  // Track this pending message
  pendingMessageIds.value.add(userMessageId)
  
  // Show typing indicator if this is the first pending message
  if (pendingMessageIds.value.size === 1) {
    isTyping.value = true
  }
  
  // Send message asynchronously (no await here, allowing multiple messages)
  handleMessageSend(userMessage, messageContent).catch(err => {
    console.error('Message send handler error:', err)
  })
}

// Separate async handler for message sending
const handleMessageSend = async (userMessage: ExtendedMessage, messageContent: string) => {
  try {
    // Send message to backend API and get both user and AI response
    const response = await chatService.sendMessage({
      content: messageContent,
      character_id: currentCharacter.value!.character_id
    })
    
    // Don't replace the user message - just mark it as sent by removing from pending
    // The user message stays exactly as it was displayed initially
    
    // Add AI message
    messages.value.push(response.ai_message)
    
    // Remove from pending set
    pendingMessageIds.value.delete(userMessage.chat_id)
    
    // Hide typing indicator only if no more pending messages
    if (pendingMessageIds.value.size === 0) {
      isTyping.value = false
    }
    
  } catch (err: any) {
    console.error('Failed to send message:', err)
    
    // Mark message as failed instead of removing it
    const failedIndex = messages.value.findIndex(msg => msg.chat_id === userMessage.chat_id)
    if (failedIndex !== -1) {
      // Create a new message object to trigger Vue reactivity
      messages.value[failedIndex] = {
        ...messages.value[failedIndex],
        failed: true
      }
    }
    
    // Remove from pending set
    pendingMessageIds.value.delete(userMessage.chat_id)
    
    // Hide typing indicator only if no more pending messages
    if (pendingMessageIds.value.size === 0) {
      isTyping.value = false
    }
    
    // Show error message to user
    const errorMessage: Message = {
      chat_id: Date.now(),
      content: `메시지 전송에 실패했습니다. 다시 시도해주세요.`,
      role: 'assistant' as ChatRole,
      created_at: new Date().toISOString(),
      user_id: authStore.user?.user_id || 0,
      character_id: currentCharacter.value?.character_id || 0
    }
    messages.value.push(errorMessage)
  }
}

const scrollToBottom = async (smooth: boolean = true) => {
  await nextTick()
  if (messagesContainer.value) {
    const scrollElement = messagesContainer.value
    const scrollHeight = scrollElement.scrollHeight
    const clientHeight = scrollElement.clientHeight
    const maxScrollTop = scrollHeight - clientHeight
    
    console.log('🔽 Scrolling to bottom:', { 
      smooth, 
      scrollHeight, 
      clientHeight, 
      maxScrollTop,
      currentScrollTop: scrollElement.scrollTop 
    })
    
    if (smooth) {
      // Smooth scroll for better UX
      scrollElement.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth'
      })
    } else {
      // Instant scroll for initial load
      scrollElement.scrollTop = maxScrollTop
    }
    
    // Ensure we're really at the bottom after a short delay
    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        console.log('✅ Final scroll position:', messagesContainer.value.scrollTop)
      }
    }, 100)
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

// Watch for messages changes and auto-scroll
watch(
  () => messages.value.length,
  async () => {
    // Auto-scroll to bottom when new messages are added
    // This ensures the conversation flows naturally with focus on latest messages
    await scrollToBottom()
  },
  { flush: 'post' } // Execute after DOM updates
)

// Watch for typing indicator changes and adjust scroll
watch(
  () => isTyping.value,
  async (newIsTyping) => {
    if (newIsTyping) {
      // Small delay to let typing indicator render, then scroll
      setTimeout(() => scrollToBottom(), 50)
    }
  },
  { flush: 'post' }
)

// Removed SSE handling - now using simple request-response

// Lifecycle
onMounted(async () => {
  await loadCharacter()
  await loadMessages()
  messageInput.value?.focus()
})

// No cleanup needed - removed SSE connections
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

.msg-avatar-placeholder.user-avatar {
  background: #4caf50;
  border-color: rgba(76, 175, 80, 0.3);
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

/* 대기 중인 메시지 스타일 */
.pending-message {
  opacity: 0.7;
}

.pending-message .message-bubble {
  position: relative;
}

.pending-message .user-bubble::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 8px;
  width: 12px;
  height: 12px;
  border: 2px solid #4caf50;
  border-radius: 50%;
  border-top-color: transparent;
  animation: pendingSpin 0.8s linear infinite;
}

@keyframes pendingSpin {
  to { transform: rotate(360deg); }
}

/* 실패한 메시지 스타일 */
.failed-message .user-bubble {
  border-color: #ef4444;
  background: #fef2f2;
}

.failed-message .user-bubble::after {
  content: '⚠️';
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 12px;
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

.input-wrapper {
  flex: 1;
  position: relative;
}

.message-input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  padding-right: 3.5rem;
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

.character-counter {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.character-counter.warning {
  color: #f59e0b;
}

.character-counter.error {
  color: #ef4444;
  font-weight: 600;
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