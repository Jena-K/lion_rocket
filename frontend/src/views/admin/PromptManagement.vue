<template>
  <div class="prompt-management">
    <div class="page-header">
      <h2>프롬프트 템플릿 관리</h2>
      <button @click="showCreateModal = true" class="create-btn"><i>➕</i> 새 프롬프트 추가</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !prompts.length" class="loading-state">
      <div class="spinner"></div>
      <p>프롬프트 목록을 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <button @click="fetchPrompts" class="retry-btn">다시 시도</button>
    </div>

    <!-- Prompts List -->
    <div v-else-if="prompts.length > 0" class="prompts-container">
      <div class="prompts-list">
        <div v-for="prompt in prompts" :key="prompt.id" class="prompt-item">
          <div class="prompt-header">
            <h4>{{ prompt.name }}</h4>
            <div class="prompt-actions">
              <button
                @click="copyToClipboard(prompt.prompt_text)"
                class="action-btn copy"
                title="복사"
              >
                📋
              </button>
              <button @click="editPrompt(prompt)" class="action-btn edit" title="수정">✏️</button>
              <button @click="confirmDelete(prompt)" class="action-btn delete" title="삭제">
                🗑️
              </button>
            </div>
          </div>

          <p class="prompt-text">{{ prompt.prompt_text }}</p>

          <div class="prompt-meta">
            <span class="meta-item"> <i>📅</i> 생성: {{ formatDate(prompt.created_at) }} </span>
            <span class="meta-item" v-if="prompt.updated_at !== prompt.created_at">
              <i>🔄</i> 수정: {{ formatDate(prompt.updated_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>📝 등록된 프롬프트가 없습니다.</p>
      <button @click="showCreateModal = true" class="create-btn">첫 프롬프트 추가하기</button>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal || editingPrompt" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>{{ editingPrompt ? '프롬프트 수정' : '새 프롬프트 추가' }}</h3>
            <button @click="closeModal" class="close-btn">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-group">
              <label for="name">프롬프트 이름</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="예: 코드 리뷰 요청"
                required
                maxlength="100"
              />
            </div>

            <div class="form-group">
              <label for="prompt_text">프롬프트 내용</label>
              <textarea
                id="prompt_text"
                v-model="formData.prompt_text"
                class="form-textarea"
                placeholder="사용자가 쉽게 사용할 수 있는 프롬프트 템플릿을 작성하세요..."
                rows="8"
                required
                maxlength="2000"
              ></textarea>
              <small class="char-count"> {{ formData.prompt_text.length }} / 2000 </small>
            </div>

            <div class="template-tips">
              <h5>💡 팁: 변수 사용하기</h5>
              <p>다음과 같은 변수를 사용할 수 있습니다:</p>
              <ul>
                <li><code>{code}</code> - 코드 블록 위치</li>
                <li><code>{language}</code> - 프로그래밍 언어</li>
                <li><code>{topic}</code> - 주제나 토픽</li>
                <li><code>{context}</code> - 추가 컨텍스트</li>
              </ul>
              <p class="example">예시: "다음 {language} 코드를 리뷰해주세요: {code}"</p>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn secondary">취소</button>
              <button type="submit" class="btn primary" :disabled="saving">
                {{ saving ? '저장 중...' : editingPrompt ? '수정' : '추가' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="promptToDelete" class="modal-overlay" @click="promptToDelete = null">
        <div class="modal confirm-modal" @click.stop>
          <div class="modal-header">
            <h3>프롬프트 삭제 확인</h3>
          </div>
          <div class="modal-body">
            <p class="confirm-message">
              정말로 <strong>{{ promptToDelete.name }}</strong> 프롬프트를 삭제하시겠습니까?
            </p>
            <p class="warning-message">⚠️ 이 작업은 되돌릴 수 없습니다.</p>
          </div>
          <div class="modal-footer">
            <button @click="promptToDelete = null" class="btn secondary">취소</button>
            <button @click="deletePrompt" class="btn danger">삭제</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast Notification -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  promptService,
  type Prompt,
  type PromptCreate,
  type PromptUpdate,
} from '../../services/prompt.service'

// State
const prompts = ref<Prompt[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const editingPrompt = ref<Prompt | null>(null)
const promptToDelete = ref<Prompt | null>(null)

// Toast notification
const toast = reactive({
  show: false,
  message: '',
  type: 'success', // 'success' | 'error'
})

// Form data
const formData = reactive<PromptCreate>({
  name: '',
  prompt_text: '',
})

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Show toast notification
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// Copy to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('프롬프트가 클립보드에 복사되었습니다!', 'success')
  } catch (err) {
    showToast('클립보드 복사에 실패했습니다.', 'error')
  }
}

// Fetch prompts
const fetchPrompts = async () => {
  loading.value = true
  error.value = ''

  try {
    prompts.value = await promptService.getPrompts()
  } catch (err: any) {
    error.value = err.response?.data?.detail || '프롬프트 목록을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// Create/Edit handlers
const editPrompt = (prompt: Prompt) => {
  editingPrompt.value = prompt
  formData.name = prompt.name
  formData.prompt_text = prompt.prompt_text
}

const closeModal = () => {
  showCreateModal.value = false
  editingPrompt.value = null
  formData.name = ''
  formData.prompt_text = ''
}

const handleSubmit = async () => {
  saving.value = true

  try {
    if (editingPrompt.value) {
      // Update existing prompt
      const updated = await promptService.updatePrompt(
        editingPrompt.value.id,
        formData as PromptUpdate
      )
      // Update in list
      const index = prompts.value.findIndex((p) => p.id === editingPrompt.value!.id)
      if (index !== -1) {
        prompts.value[index] = updated
      }
      showToast('프롬프트가 수정되었습니다!', 'success')
    } else {
      // Create new prompt
      const newPrompt = await promptService.createPrompt(formData)
      prompts.value.unshift(newPrompt)
      showToast('프롬프트가 추가되었습니다!', 'success')
    }

    closeModal()
  } catch (err: any) {
    showToast(err.response?.data?.detail || '저장 중 오류가 발생했습니다.', 'error')
  } finally {
    saving.value = false
  }
}

// Delete handlers
const confirmDelete = (prompt: Prompt) => {
  promptToDelete.value = prompt
}

const deletePrompt = async () => {
  if (!promptToDelete.value) return

  try {
    await promptService.deletePrompt(promptToDelete.value.id)
    prompts.value = prompts.value.filter((p) => p.id !== promptToDelete.value!.id)
    promptToDelete.value = null
    showToast('프롬프트가 삭제되었습니다!', 'success')
  } catch (err: any) {
    showToast(err.response?.data?.detail || '프롬프트 삭제 중 오류가 발생했습니다.', 'error')
  }
}

onMounted(() => {
  fetchPrompts()
})
</script>

<style scoped>
.prompt-management {
  max-width: 1000px;
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

/* Prompts List */
.prompts-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.prompts-list {
  padding: 1.5rem;
}

.prompt-item {
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.prompt-item:last-child {
  margin-bottom: 0;
}

.prompt-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.prompt-header h4 {
  margin: 0;
  font-size: 1.125rem;
  color: #2c3e50;
}

.prompt-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn.copy {
  background: #17a2b8;
  color: white;
}

.action-btn.copy:hover {
  background: #138496;
}

.action-btn.edit {
  background: #ffc107;
  color: #212529;
}

.action-btn.edit:hover {
  background: #e0a800;
}

.action-btn.delete {
  background: #dc3545;
  color: white;
}

.action-btn.delete:hover {
  background: #c82333;
}

.prompt-text {
  margin: 0 0 1rem 0;
  color: #495057;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
}

.prompt-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
  max-width: 700px;
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
  min-height: 150px;
  font-family: inherit;
}

.char-count {
  display: block;
  text-align: right;
  margin-top: 0.25rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.template-tips {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.template-tips h5 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.template-tips p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #495057;
}

.template-tips ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.template-tips code {
  background: #e9ecef;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.875rem;
}

.template-tips .example {
  font-style: italic;
  color: #6c757d;
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

/* Toast Notification */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 2000;
}

.toast.success {
  background: #28a745;
}

.toast.error {
  background: #dc3545;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
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

  .prompt-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .prompt-actions {
    align-self: flex-end;
  }

  .prompt-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
</style>
