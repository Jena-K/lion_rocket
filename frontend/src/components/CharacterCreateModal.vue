<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">새 캐릭터 만들기</h2>
        <button class="close-button" @click="handleClose">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Name Field -->
        <div class="form-group">
          <label for="name" class="form-label">캐릭터 이름</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="예: 친절한 도우미"
            required
            maxlength="100"
          />
          <p class="form-hint">캐릭터의 이름을 입력해주세요 (최대 100자)</p>
        </div>

        <!-- Gender Field -->
        <div class="form-group">
          <label class="form-label">성별</label>
          <div class="gender-options">
            <label class="gender-option">
              <input
                v-model="formData.gender"
                type="radio"
                value="male"
                class="gender-radio"
                required
              />
              <span class="gender-label">
                <svg class="gender-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                남성
              </span>
            </label>
            <label class="gender-option">
              <input
                v-model="formData.gender"
                type="radio"
                value="female"
                class="gender-radio"
                required
              />
              <span class="gender-label">
                <svg class="gender-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                여성
              </span>
            </label>
          </div>
        </div>

        <!-- Intro Field -->
        <div class="form-group">
          <label for="intro" class="form-label">간단 소개</label>
          <textarea
            id="intro"
            v-model="formData.intro"
            class="form-textarea"
            placeholder="캐릭터의 간단한 소개글을 입력해주세요..."
            rows="3"
            required
          ></textarea>
          <p class="form-hint">캐릭터를 소개하는 짧은 글을 작성해주세요</p>
        </div>

        <!-- Personality Tags -->
        <div class="form-group">
          <label for="personalityTags" class="form-label">성격 태그</label>
          <input
            id="personalityTags"
            v-model="personalityTagsInput"
            type="text"
            class="form-input"
            placeholder="성격 태그를 쉼표로 구분해서 입력하세요 (예: 친근함, 유머러스, 창의적)"
            required
          />
          <p class="form-hint">성격을 나타내는 태그들을 쉼표로 구분해서 입력하세요</p>
        </div>

        <!-- Interest Tags -->
        <div class="form-group">
          <label for="interestTags" class="form-label">관심사 태그</label>
          <input
            id="interestTags"
            v-model="interestTagsInput"
            type="text"
            class="form-input"
            placeholder="관심사 태그를 쉼표로 구분해서 입력하세요 (예: 음악, 영화, 게임)"
            required
          />
          <p class="form-hint">관심사를 나타내는 태그들을 쉼표로 구분해서 입력하세요</p>
        </div>

        <!-- System Prompt Field -->
        <div class="form-group">
          <label for="prompt" class="form-label">시스템 프롬프트</label>
          <textarea
            id="prompt"
            v-model="formData.prompt"
            class="form-textarea"
            placeholder="캐릭터의 성격, 말투, 역할 등을 설명해주세요..."
            rows="4"
            required
          ></textarea>
          <p class="form-hint">캐릭터가 어떻게 대화해야 하는지 설명해주세요</p>
        </div>

        <!-- Avatar Upload Field -->
        <div class="form-group">
          <label for="avatar" class="form-label">캐릭터 아바타 (선택사항)</label>
          <input
            id="avatar"
            ref="avatarInput"
            type="file"
            class="form-input-file"
            accept="image/*"
            @change="handleAvatarChange"
          />
          <p class="form-hint">아바타 이미지를 선택해주세요 (PNG, JPG, GIF, WebP 지원)</p>
          <!-- Avatar Preview -->
          <div v-if="avatarPreview" class="avatar-preview">
            <img :src="avatarPreview" alt="Avatar Preview" class="avatar-preview-image" />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-footer">
          <button type="button" class="cancel-button" @click="handleClose">
            취소
          </button>
          <button type="submit" class="submit-button" :disabled="loading">
            <span v-if="loading" class="loading-text">생성 중...</span>
            <span v-else>캐릭터 생성</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useCharacterStore } from '@/stores/character'
import type { CharacterCreate, Gender } from '@/types'

const emit = defineEmits<{
  close: []
  created: []
}>()

const characterStore = useCharacterStore()
const loading = ref(false)

const avatarInput = ref<HTMLInputElement>()
const selectedAvatar = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

const personalityTagsInput = ref('')
const interestTagsInput = ref('')

const formData = reactive<CharacterCreate>({
  name: '',
  gender: 'male' as Gender,
  intro: '',
  personality_tags: [],
  interest_tags: [],
  prompt: ''
})

const handleClose = () => {
  if (!loading.value) {
    emit('close')
  }
}

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    selectedAvatar.value = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    selectedAvatar.value = null
    avatarPreview.value = null
  }
}

const parseTagsInput = (input: string): string[] => {
  return input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
}

const handleSubmit = async () => {
  if (loading.value) return

  loading.value = true
  try {
    // Parse tags from input strings
    formData.personality_tags = parseTagsInput(personalityTagsInput.value)
    formData.interest_tags = parseTagsInput(interestTagsInput.value)

    // Create character
    const newCharacter = await characterStore.createCharacter(formData)
    
    // Upload avatar if selected
    if (selectedAvatar.value && newCharacter.id) {
      await characterStore.uploadAvatar(newCharacter.id, selectedAvatar.value)
    }
    
    emit('created')
  } catch (error) {
    console.error('Failed to create character:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Gender Options */
.gender-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.gender-option {
  position: relative;
  cursor: pointer;
}

.gender-radio {
  position: absolute;
  opacity: 0;
}

.gender-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.gender-radio:checked + .gender-label {
  border-color: #6366f1;
  background: #f5f3ff;
  color: #6366f1;
}

.gender-option:hover .gender-label {
  border-color: #d1d5db;
  background: #f9fafb;
}

.gender-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.cancel-button,
.submit-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-button {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.cancel-button:hover {
  background: #f9fafb;
  color: #374151;
}

.submit-button {
  background: #6366f1;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #5558e3;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Avatar Upload Styles */
.form-input-file {
  padding: 0.75rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-input-file:hover {
  border-color: #6366f1;
  background: #f0f0ff;
}

.avatar-preview {
  margin-top: 1rem;
  text-align: center;
}

.avatar-preview-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .gender-options {
    grid-template-columns: 1fr;
  }
}
</style>