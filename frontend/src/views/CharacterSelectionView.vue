<template>
  <div class="character-selection-container">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo-title">
          <img src="/lion_rocket_logo.png" alt="LionRocket" class="logo" />
          <h1>LionRocket AI Chat</h1>
        </div>
      </div>
      <div class="header-right">
        <span class="user-info">{{ authStore.user?.username }}</span>
        <button @click="handleLogout" class="logout-btn">로그아웃</button>
      </div>
    </header>

    <div class="content-wrapper">
      <div class="page-header">
        <h2 class="title">캐릭터 선택</h2>
        <p class="subtitle">대화할 캐릭터를 선택해주세요</p>
        
      </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>캐릭터를 불러오는 중...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasCharacters && !loading" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v12l8-4V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v4l8 4z"></path>
        </svg>
      </div>
      <h3 class="empty-title">등록된 캐릭터가 없습니다</h3>
      <p class="empty-description">관리자가 캐릭터를 추가할 때까지 기다려주세요.</p>
      <button @click="fetchCharacters" class="retry-button">
        다시 시도
      </button>
    </div>

    <!-- Character Grid -->
    <div v-else-if="hasCharacters" class="characters-grid">
      <div
        v-for="character in characters"
        :key="character.id"
        class="character-card"
        @click="handleSelectCharacter(character)"
      >
        <div class="character-avatar">
          <img 
            v-if="getAvatarUrl(character.avatar_url)" 
            :src="getAvatarUrl(character.avatar_url)!" 
            :alt="character.name" 
            class="avatar-image"
            @error="handleAvatarError"
          />
          <div v-else class="avatar-placeholder">
            {{ character.name.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="character-info">
          <h3 class="character-name">{{ character.name }}</h3>
          <p class="character-gender">{{ getGenderLabel(character.gender) }}</p>
          <p class="character-introduction">{{ character.intro }}</p>
        </div>
      </div>

    </div>

    </div>

    <!-- Character Detail Modal -->
    <div v-if="showCharacterModal && selectedCharacter" class="modal-backdrop" @click="closeModal">
      <div class="character-modal" @click.stop>
        <button class="modal-close" @click="closeModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div class="modal-avatar">
          <img 
            v-if="getAvatarUrl(selectedCharacter.avatar_url)" 
            :src="getAvatarUrl(selectedCharacter.avatar_url)!" 
            :alt="selectedCharacter.name" 
            class="avatar-large-image"
            @error="handleAvatarError"
          />
          <div v-else class="avatar-large">
            {{ selectedCharacter.name.charAt(0).toUpperCase() }}
          </div>
        </div>
        
        <div class="modal-header">
          <h2 class="modal-name">{{ selectedCharacter.name }}</h2>
          <p class="modal-gender">{{ getGenderLabel(selectedCharacter.gender) }}</p>
        </div>
        
        <div class="modal-introduction">
          <p>{{ selectedCharacter.intro }}</p>
        </div>
        
        <div class="modal-tags">
          <div class="tag-section">
            <h3 class="tag-title">성격</h3>
            <div class="tag-list">
              <span v-for="tag in selectedCharacter.personality_tags" :key="tag" class="tag personality-tag">
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="tag-section">
            <h3 class="tag-title">관심사</h3>
            <div class="tag-list">
              <span v-for="tag in selectedCharacter.interest_tags" :key="tag" class="tag interest-tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
        
        <button class="start-chat-button" @click="handleStartChat">
          대화 시작하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { characterService } from '@/services/character.service'
import type { Character, Gender } from '@/types'
import { Gender as GenderEnum } from '@/types'
import { getAvatarUrl, handleAvatarError } from '@/services/avatar.service'

const authStore = useAuthStore()
const router = useRouter()
const notificationStore = useNotificationStore()

// Extended character interface with new fields
interface ExtendedCharacter extends Character {
  introduction: string // 간단 자기소개
  personalityTags: string[] // 성격 태그
  interestTags: string[] // 관심사 태그
  description?: string // 기존 description 필드 (호환성)
}


const loading = ref(false)
const characters = ref<ExtendedCharacter[]>([])
const selectedCharacter = ref<ExtendedCharacter | null>(null)
const showCharacterModal = ref(false)

// Computed
const hasCharacters = computed(() => characters.value.length > 0)

// Methods
const getGenderLabel = (gender: Gender): string => {
  const labels = {
    male: '남성',
    female: '여성'
  }
  return labels[gender] || gender
}

const handleSelectCharacter = (character: ExtendedCharacter) => {
  selectedCharacter.value = character
  showCharacterModal.value = true
  console.log('Selected character:', character.name)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const handleStartChat = async () => {
  console.log('handleStartChat called')
  console.log('selectedCharacter:', selectedCharacter.value)
  
  if (selectedCharacter.value) {
    try {
      console.log('Starting chat with:', selectedCharacter.value.name)
      
      // Navigate directly to the chat page with character ID
      router.push({
        name: 'chat',
        params: { characterId: selectedCharacter.value.id }
      })
    } catch (error) {
      console.error('Failed to start chat:', error)
      notificationStore.error('채팅을 시작할 수 없습니다. 다시 시도해주세요.')
    }
  } else {
    console.log('No character selected')
    notificationStore.warning('먼저 캐릭터를 선택해주세요.')
  }
}

const closeModal = () => {
  showCharacterModal.value = false
  selectedCharacter.value = null
}

// Note: handleImageError is now imported from avatar.service

// Transform API character to Extended character
const transformCharacter = (char: Character): ExtendedCharacter => {
  return {
    ...char,
    introduction: char.intro,
    personalityTags: char.personality_tags || [],
    interestTags: char.interest_tags || [],
    description: char.intro
  }
}

// Fetch characters from API with improved error handling
const fetchCharacters = async () => {
  loading.value = true
  try {
    console.log('🔄 Fetching characters from API...')
    
    // Try to fetch available characters for selection
    const response = await characterService.getAvailableCharacters({
      skip: 0,
      limit: 100
    })
    
    if (response && response.characters && response.characters.length > 0) {
      characters.value = response.characters.map(transformCharacter)
      console.log('✅ Successfully loaded real characters from API:', characters.value.length)
    } else {
      // API responded but no characters found
      console.log('📋 API responded but no characters found')
      handleNoCharactersFound()
    }
  } catch (error: any) {
    console.error('❌ Failed to fetch characters from API:', error)
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

// Handle the case when API responds but no characters are found
const handleNoCharactersFound = () => {
  characters.value = []
  notificationStore.info('등록된 캐릭터가 없습니다. 관리자가 캐릭터를 추가할 때까지 기다려주세요.')
}

// Handle API errors with specific messaging
const handleApiError = (error: any) => {
  // Clear characters array for all error cases
  characters.value = []
  
  if (error.code === 'ERR_NETWORK' || !error.response) {
    // Network/connection error
    console.log('🔌 Network error - backend server may not be running')
    notificationStore.error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하고 다시 시도해주세요.')
  } else if (error.response?.status === 401 || error.response?.status === 403) {
    // Authentication/authorization error
    console.log('🔐 Authentication error')
    notificationStore.error('인증이 필요합니다. 다시 로그인해주세요.')
    // Could redirect to login here if needed
  } else if (error.response?.status === 404) {
    // Endpoint not found (might be URL mismatch)
    console.log('🔍 Endpoint not found - might be URL mismatch')
    notificationStore.error('캐릭터 정보를 가져올 수 없습니다. 시스템 설정을 확인해주세요.')
  } else if (error.response?.status >= 500) {
    // Server error
    console.log('🚨 Server error')
    notificationStore.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
  } else {
    // Other errors
    console.log('❓ Unknown error')
    notificationStore.error('알 수 없는 오류가 발생했습니다. 관리자에게 문의해주세요.')
  }
}

// Lifecycle
onMounted(() => {
  fetchCharacters()
})
</script>

<style scoped>
.character-selection-container {
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
  padding-bottom: 120px; /* Account for fixed selection status */
  min-height: calc(100vh - 70px); /* Account for header */
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.125rem;
  color: #666;
}


/* Loading State */
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

/* Character Grid */
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.character-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 2px solid transparent;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.character-card.active {
  border-color: #B8EEA2;
  background: #F0FDF4;
}

.character-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #B8EEA2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(184, 238, 162, 0.3);
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(184, 238, 162, 0.3);
}

.character-info {
  text-align: center;
  margin-bottom: 1rem;
}

.character-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.character-gender {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.character-introduction {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
  margin-top: 0.5rem;
}



/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.modal-description {
  color: #666;
  margin-bottom: 1.5rem;
}

.modal-close-button {
  padding: 0.5rem 1.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.modal-close-button:hover {
  background: #5558e3;
}

/* Character Detail Modal */
.character-modal {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #666;
}

.modal-close:hover {
  background: #e5e5e5;
  color: #333;
}

.modal-close svg {
  width: 16px;
  height: 16px;
}

.modal-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #B8EEA2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(184, 238, 162, 0.35);
}

.avatar-large-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 20px rgba(184, 238, 162, 0.35);
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.modal-gender {
  font-size: 0.875rem;
  color: #666;
}

.modal-introduction {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.modal-introduction p {
  margin: 0;
  color: #333;
  line-height: 1.5;
}

.modal-tags {
  margin-bottom: 2rem;
}

.tag-section {
  margin-bottom: 1.5rem;
}

.tag-section:last-child {
  margin-bottom: 0;
}

.tag-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.personality-tag {
  background: #E7F7E1;
  color: #5A8F47;
}

.interest-tag {
  background: #FEF3C7;
  color: #92400E;
}

.start-chat-button {
  width: 100%;
  padding: 1rem;
  background: #5A8F47;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(90, 143, 71, 0.25);
}

.start-chat-button:hover {
  background: #4A7C3C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(90, 143, 71, 0.35);
}

.start-chat-button:focus {
  background: #3D6630;
  box-shadow: 0 0 0 3px rgba(184, 238, 162, 0.4);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #666;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  color: #B8EEA2;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.empty-description {
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

.retry-button:focus {
  background: #3D6630;
  box-shadow: 0 0 0 3px rgba(184, 238, 162, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }
  
  .logo {
    height: 28px;
  }
  
  .header-left h1 {
    font-size: 1.25rem;
  }
  
  .content-wrapper {
    padding: 1rem;
    padding-bottom: 100px; /* Account for fixed selection status */
  }

  .title {
    font-size: 1.75rem;
  }

  .characters-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  
  .character-modal {
    padding: 2rem;
    margin: 1rem;
  }
  
  .modal-close {
    top: 1rem;
    right: 1rem;
  }
}
</style>