import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { characterService } from '@/services/character.service'
import { useNotificationStore } from './notification'
import { useAuthStore } from './auth'
import { router } from '@/router'
import type { Character, CharacterCreate, CharacterUpdate, Gender } from '@/types'

export const useCharacterStore = defineStore('character', () => {
  // State
  const characters = ref<Character[]>([])
  const activeCharacter = ref<Character | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)

  // Getters
  const hasCharacters = computed(() => characters.value.length > 0)
  const hasActiveCharacter = computed(() => activeCharacter.value !== null)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  // Actions
  const fetchCharacters = async (params?: { search?: string; page?: number }) => {
    loading.value = true
    error.value = null

    try {
      const skip = ((params?.page || currentPage.value) - 1) * pageSize.value
      const response = await characterService.getCharacters({
        skip,
        limit: pageSize.value,
        search: params?.search
      })

      characters.value = response.characters
      total.value = response.total
      if (params?.page) {
        currentPage.value = params.page
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || '캐릭터 목록을 불러오는데 실패했습니다.'
      const notificationStore = useNotificationStore()
      notificationStore.error('오류', error.value)
    } finally {
      loading.value = false
    }
  }

  const fetchActiveCharacter = async () => {
    try {
      const character = await characterService.getActiveCharacter()
      activeCharacter.value = character
      return character
    } catch (err: any) {
      // 404 에러는 활성 캐릭터가 없는 정상적인 상황
      if (err.response?.status !== 404) {
        const notificationStore = useNotificationStore()
        notificationStore.error('오류', '활성 캐릭터를 불러오는데 실패했습니다.')
      }
      activeCharacter.value = null
      return null
    }
  }

  const createCharacter = async (data: CharacterCreate) => {
    loading.value = true
    error.value = null

    try {
      const newCharacter = await characterService.createCharacter(data)
      
      // 목록에 추가
      characters.value.unshift(newCharacter)
      total.value += 1

      const notificationStore = useNotificationStore()
      notificationStore.success('성공', `${newCharacter.name} 캐릭터가 생성되었습니다.`)

      // 첫 번째 캐릭터인 경우 자동으로 선택
      if (characters.value.length === 1) {
        await selectCharacter(newCharacter.character_id)
      }

      return newCharacter
    } catch (err: any) {
      error.value = err.response?.data?.detail || '캐릭터 생성에 실패했습니다.'
      const notificationStore = useNotificationStore()
      notificationStore.error('오류', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const selectCharacter = async (characterId: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await characterService.selectCharacter(characterId)
      
      // 이전 활성 캐릭터의 is_active를 false로 변경
      characters.value.forEach(char => {
        char.is_active = char.character_id === characterId
      })

      // 활성 캐릭터 업데이트
      activeCharacter.value = response.character

      const notificationStore = useNotificationStore()
      notificationStore.success('성공', `${response.character.name}을(를) 선택했습니다.`)

      // 채팅 페이지로 이동
      router.push('/chat')

      return response.character
    } catch (err: any) {
      error.value = err.response?.data?.detail || '캐릭터 선택에 실패했습니다.'
      const notificationStore = useNotificationStore()
      notificationStore.error('오류', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCharacter = async (characterId: number, data: CharacterUpdate) => {
    loading.value = true
    error.value = null

    try {
      const updatedCharacter = await characterService.updateCharacter(characterId, data)
      
      // 목록에서 업데이트
      const index = characters.value.findIndex(char => char.character_id === characterId)
      if (index !== -1) {
        characters.value[index] = updatedCharacter
      }

      // 활성 캐릭터인 경우 업데이트
      if (activeCharacter.value?.character_id === characterId) {
        activeCharacter.value = updatedCharacter
      }

      const notificationStore = useNotificationStore()
      notificationStore.success('성공', '캐릭터가 수정되었습니다.')

      return updatedCharacter
    } catch (err: any) {
      error.value = err.response?.data?.detail || '캐릭터 수정에 실패했습니다.'
      const notificationStore = useNotificationStore()
      notificationStore.error('오류', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCharacter = async (characterId: number) => {
    loading.value = true
    error.value = null

    try {
      await characterService.deleteCharacter(characterId)
      
      // 목록에서 제거
      characters.value = characters.value.filter(char => char.character_id !== characterId)
      total.value -= 1

      // 활성 캐릭터인 경우 null로 설정
      if (activeCharacter.value?.character_id === characterId) {
        activeCharacter.value = null
      }

      const notificationStore = useNotificationStore()
      notificationStore.success('성공', '캐릭터가 삭제되었습니다.')
    } catch (err: any) {
      error.value = err.response?.data?.detail || '캐릭터 삭제에 실패했습니다.'
      const notificationStore = useNotificationStore()
      notificationStore.error('오류', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadAvatar = async (characterId: number, file: File) => {
    loading.value = true
    error.value = null

    try {
      const response = await characterService.uploadAvatar(characterId, file)
      
      // 목록에서 캐릭터 찾아서 avatar_url 업데이트
      const index = characters.value.findIndex(char => char.character_id === characterId)
      if (index !== -1) {
        characters.value[index].avatar_url = response.avatar_url
      }

      // 활성 캐릭터인 경우 업데이트
      if (activeCharacter.value?.character_id === characterId) {
        activeCharacter.value.avatar_url = response.avatar_url
      }

      const notificationStore = useNotificationStore()
      notificationStore.success('성공', '캐릭터 아바타가 업로드되었습니다.')

      return response
    } catch (err: any) {
      error.value = err.response?.data?.detail || '아바타 업로드에 실패했습니다.'
      const notificationStore = useNotificationStore()
      notificationStore.error('오류', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetStore = () => {
    characters.value = []
    activeCharacter.value = null
    loading.value = false
    error.value = null
    total.value = 0
    currentPage.value = 1
  }

  // 초기화 함수
  const initializeCharacters = async () => {
    const authStore = useAuthStore()
    
    if (authStore.isAuthenticated) {
      // 활성 캐릭터 먼저 확인
      await fetchActiveCharacter()
      // 캐릭터 목록 로드
      await fetchCharacters()
    }
  }

  return {
    // State
    characters,
    activeCharacter,
    loading,
    error,
    total,
    currentPage,
    pageSize,

    // Getters
    hasCharacters,
    hasActiveCharacter,
    totalPages,

    // Actions
    fetchCharacters,
    fetchActiveCharacter,
    createCharacter,
    selectCharacter,
    updateCharacter,
    deleteCharacter,
    uploadAvatar,
    resetStore,
    initializeCharacters
  }
})