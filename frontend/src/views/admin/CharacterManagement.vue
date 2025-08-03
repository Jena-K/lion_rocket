<template>
  <div class="character-management">
    <div class="page-header">
      <h2>캐릭터 관리</h2>
      <button @click="showCreateModal = true" class="create-btn"><i>➕</i> 새 캐릭터 추가</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !characters.length" class="loading-state">
      <div class="spinner"></div>
      <p>캐릭터 목록을 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <button @click="fetchCharacters" class="retry-btn">다시 시도</button>
    </div>

    <!-- Characters Grid -->
    <div v-else-if="characters.length > 0" class="characters-grid">
      <div v-for="character in characters" :key="character.id" class="character-card">
        <div class="card-header">
          <h3>{{ character.name }}</h3>
          <div class="card-actions">
            <button @click="editCharacter(character)" class="icon-btn edit" title="수정">✏️</button>
            <button @click="confirmDelete(character)" class="icon-btn delete" title="삭제">
              🗑️
            </button>
          </div>
        </div>

        <div class="card-body">
          <p class="system-prompt">{{ character.system_prompt }}</p>
        </div>

        <div class="card-footer">
          <div class="stat">
            <span class="stat-label">채팅 수:</span>
            <span class="stat-value">{{ character.chat_count || 0 }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">메시지 수:</span>
            <span class="stat-value">{{ character.total_messages || 0 }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">생성일:</span>
            <span class="stat-value">{{ formatDate(character.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>🤖 등록된 캐릭터가 없습니다.</p>
      <button @click="showCreateModal = true" class="create-btn">첫 캐릭터 추가하기</button>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal || editingCharacter" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>{{ editingCharacter ? '캐릭터 수정' : '새 캐릭터 추가' }}</h3>
            <button @click="closeModal" class="close-btn">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-group">
              <label for="name">캐릭터 이름</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="예: 코딩 도우미"
                required
                maxlength="50"
              />
            </div>

            <div class="form-group">
              <label for="system_prompt">시스템 프롬프트</label>
              <textarea
                id="system_prompt"
                v-model="formData.system_prompt"
                class="form-textarea"
                placeholder="이 캐릭터의 성격, 역할, 행동 방식을 정의하세요..."
                rows="6"
                required
                maxlength="1000"
              ></textarea>
              <small class="char-count"> {{ formData.system_prompt.length }} / 1000 </small>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn secondary">취소</button>
              <button type="submit" class="btn primary" :disabled="saving">
                {{ saving ? '저장 중...' : editingCharacter ? '수정' : '추가' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="characterToDelete" class="modal-overlay" @click="characterToDelete = null">
        <div class="modal confirm-modal" @click.stop>
          <div class="modal-header">
            <h3>캐릭터 삭제 확인</h3>
          </div>
          <div class="modal-body">
            <p class="confirm-message">
              정말로 <strong>{{ characterToDelete.name }}</strong> 캐릭터를 삭제하시겠습니까?
            </p>
            <p
              class="warning-message"
              v-if="characterToDelete.chat_count && characterToDelete.chat_count > 0"
            >
              ⚠️ 이 캐릭터는 {{ characterToDelete.chat_count }}개의 채팅에서 사용 중입니다.
            </p>
          </div>
          <div class="modal-footer">
            <button @click="characterToDelete = null" class="btn secondary">취소</button>
            <button @click="deleteCharacter" class="btn danger">삭제</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  characterService,
  type Character,
  type CharacterCreate,
  type CharacterUpdate,
} from '../../services/character.service'

// State
const characters = ref<Character[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const editingCharacter = ref<Character | null>(null)
const characterToDelete = ref<Character | null>(null)

// Form data
const formData = reactive<CharacterCreate>({
  name: '',
  system_prompt: '',
})

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Fetch characters
const fetchCharacters = async () => {
  loading.value = true
  error.value = ''

  try {
    characters.value = await characterService.getCharacters()
  } catch (err: any) {
    error.value = err.response?.data?.detail || '캐릭터 목록을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// Create/Edit handlers
const editCharacter = (character: Character) => {
  editingCharacter.value = character
  formData.name = character.name
  formData.system_prompt = character.system_prompt
}

const closeModal = () => {
  showCreateModal.value = false
  editingCharacter.value = null
  formData.name = ''
  formData.system_prompt = ''
}

const handleSubmit = async () => {
  saving.value = true

  try {
    if (editingCharacter.value) {
      // Update existing character
      const updated = await characterService.updateCharacter(
        editingCharacter.value.id,
        formData as CharacterUpdate
      )
      // Update in list
      const index = characters.value.findIndex((c) => c.id === editingCharacter.value!.id)
      if (index !== -1) {
        characters.value[index] = { ...characters.value[index], ...updated }
      }
    } else {
      // Create new character
      const newCharacter = await characterService.createCharacter(formData)
      characters.value.push(newCharacter)
    }

    closeModal()
  } catch (err: any) {
    alert(err.response?.data?.detail || '저장 중 오류가 발생했습니다.')
  } finally {
    saving.value = false
  }
}

// Delete handlers
const confirmDelete = (character: Character) => {
  characterToDelete.value = character
}

const deleteCharacter = async () => {
  if (!characterToDelete.value) return

  try {
    await characterService.deleteCharacter(characterToDelete.value.id)
    characters.value = characters.value.filter((c) => c.id !== characterToDelete.value!.id)
    characterToDelete.value = null
  } catch (err: any) {
    alert(err.response?.data?.detail || '캐릭터 삭제 중 오류가 발생했습니다.')
  }
}

onMounted(() => {
  fetchCharacters()
})
</script>

<style scoped>
.character-management {
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h2 {
  margin: 0;
  font-size: 1.75rem;
  color: #2c3e50;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

/* Loading & Error States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
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

.retry-btn {
  padding: 0.5rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

/* Characters Grid */
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.character-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn.edit {
  background: #ffc107;
  color: #212529;
}

.icon-btn.edit:hover {
  background: #e0a800;
}

.icon-btn.delete {
  background: #dc3545;
  color: white;
}

.icon-btn.delete:hover {
  background: #c82333;
}

.card-body {
  padding: 1.25rem;
  flex: 1;
}

.system-prompt {
  margin: 0;
  color: #495057;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-footer {
  padding: 1.25rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
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
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.char-count {
  display: block;
  text-align: right;
  margin-top: 0.25rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Buttons */
.btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover {
  background: #5a6268;
}

.btn.danger {
  background: #dc3545;
  color: white;
}

.btn.danger:hover {
  background: #c82333;
}

/* Confirm Modal */
.confirm-modal {
  max-width: 400px;
}

.confirm-message {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.warning-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .characters-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
