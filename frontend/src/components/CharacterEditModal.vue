<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">캐릭터 수정</h2>
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

        <!-- System Prompt Field -->
        <div class="form-group">
          <label for="systemPrompt" class="form-label">시스템 프롬프트</label>
          <textarea
            id="systemPrompt"
            v-model="formData.system_prompt"
            class="form-textarea"
            placeholder="캐릭터의 성격, 말투, 역할 등을 설명해주세요..."
            rows="4"
            required
          ></textarea>
          <p class="form-hint">캐릭터가 어떻게 대화해야 하는지 설명해주세요</p>
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label for="description" class="form-label">설명 (선택사항)</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-textarea"
            placeholder="캐릭터에 대한 추가 설명..."
            rows="3"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="modal-footer">
          <button type="button" class="cancel-button" @click="handleClose">
            취소
          </button>
          <button type="submit" class="submit-button" :disabled="loading">
            <span v-if="loading" class="loading-text">수정 중...</span>
            <span v-else>수정 완료</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/character'
import type { Character, CharacterUpdate, Gender } from '@/types'

const props = defineProps<{
  character: Character
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const characterStore = useCharacterStore()
const loading = ref(false)

const formData = reactive<CharacterUpdate>({
  name: '',
  gender: 'male' as Gender,
  system_prompt: '',
  description: ''
})

onMounted(() => {
  // Initialize form with character data
  formData.name = props.character.name
  formData.gender = props.character.gender
  formData.system_prompt = props.character.system_prompt
  formData.description = props.character.description || ''
})

const handleClose = () => {
  if (!loading.value) {
    emit('close')
  }
}

const handleSubmit = async () => {
  if (loading.value) return

  loading.value = true
  try {
    await characterStore.updateCharacter(props.character.id, formData)
    emit('updated')
  } catch (error) {
    console.error('Failed to update character:', error)
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