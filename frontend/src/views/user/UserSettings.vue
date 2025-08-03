<template>
  <div class="user-settings">
    <div class="page-header">
      <h2>설정</h2>
      <p class="subtitle">앱 환경설정을 관리하세요</p>
    </div>

    <!-- Settings Sections -->
    <div class="settings-container">
      <!-- Appearance Settings -->
      <section class="settings-section">
        <h3>
          <i>🎨</i>
          <span>외관</span>
        </h3>

        <div class="setting-item">
          <div class="setting-info">
            <h4>테마</h4>
            <p>앱의 색상 테마를 선택하세요</p>
          </div>
          <div class="setting-control">
            <div class="theme-selector">
              <button
                v-for="theme in themes"
                :key="theme.value"
                @click="settings.theme = theme.value"
                class="theme-option"
                :class="{ active: settings.theme === theme.value }"
              >
                <i>{{ theme.icon }}</i>
                <span>{{ theme.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>언어</h4>
            <p>앱 인터페이스 언어</p>
          </div>
          <div class="setting-control">
            <select v-model="settings.language" class="select-input">
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Notification Settings -->
      <section class="settings-section">
        <h3>
          <i>🔔</i>
          <span>알림</span>
        </h3>

        <div class="setting-item">
          <div class="setting-info">
            <h4>브라우저 알림</h4>
            <p>새 메시지 도착 시 알림 받기</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.notifications" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>이메일 업데이트</h4>
            <p>중요한 업데이트와 공지를 이메일로 받기</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.email_updates" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      <!-- Chat Settings -->
      <section class="settings-section">
        <h3>
          <i>💬</i>
          <span>채팅</span>
        </h3>

        <div class="setting-item">
          <div class="setting-info">
            <h4>채팅 기록 표시 개수</h4>
            <p>한 번에 불러올 메시지 개수</p>
          </div>
          <div class="setting-control">
            <div class="number-input-wrapper">
              <input
                type="number"
                v-model.number="settings.chat_history_limit"
                min="10"
                max="100"
                step="10"
                class="number-input"
              />
              <span class="input-suffix">개</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Privacy Settings -->
      <section class="settings-section">
        <h3>
          <i>🔐</i>
          <span>개인정보 보호</span>
        </h3>

        <div class="setting-item">
          <div class="setting-info">
            <h4>채팅 기록 삭제</h4>
            <p>모든 채팅 기록을 영구적으로 삭제합니다</p>
          </div>
          <div class="setting-control">
            <button @click="showDeleteModal = true" class="btn danger">모든 채팅 삭제</button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>계정 삭제</h4>
            <p>계정과 모든 데이터를 영구적으로 삭제합니다</p>
          </div>
          <div class="setting-control">
            <button @click="showAccountDeleteModal = true" class="btn danger">계정 삭제</button>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="settings-section">
        <h3>
          <i>ℹ️</i>
          <span>정보</span>
        </h3>

        <div class="about-content">
          <div class="about-item">
            <label>버전</label>
            <span>1.0.0</span>
          </div>
          <div class="about-item">
            <label>개발</label>
            <span>LionRocket Team</span>
          </div>
          <div class="about-item">
            <label>지원</label>
            <a href="mailto:support@lionrocket.com">support@lionrocket.com</a>
          </div>
        </div>
      </section>
    </div>

    <!-- Save Button -->
    <div class="settings-footer">
      <button @click="saveSettings" class="save-btn" :disabled="!hasChanges">
        {{ saving ? '저장 중...' : '설정 저장' }}
      </button>
    </div>

    <!-- Delete Chats Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>모든 채팅 삭제</h3>
          </div>
          <div class="modal-body">
            <p>정말로 모든 채팅 기록을 삭제하시겠습니까?</p>
            <p class="warning">⚠️ 이 작업은 되돌릴 수 없습니다.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="btn secondary">취소</button>
            <button @click="deleteAllChats" class="btn danger">모두 삭제</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Account Modal -->
    <Teleport to="body">
      <div
        v-if="showAccountDeleteModal"
        class="modal-overlay"
        @click="showAccountDeleteModal = false"
      >
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>계정 삭제</h3>
          </div>
          <div class="modal-body">
            <p>정말로 계정을 삭제하시겠습니까?</p>
            <p class="warning">⚠️ 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.</p>
            <div class="confirm-input">
              <label>확인을 위해 "DELETE"를 입력하세요:</label>
              <input
                v-model="deleteConfirmText"
                type="text"
                placeholder="DELETE"
                class="form-input"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeAccountDeleteModal" class="btn secondary">취소</button>
            <button
              @click="deleteAccount"
              class="btn danger"
              :disabled="deleteConfirmText !== 'DELETE'"
            >
              계정 삭제
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { userService } from '../../services/user.service'
import type { UserSettings } from '../../services/user.service'

// State
const settings = reactive<UserSettings>({
  theme: 'light',
  language: 'ko',
  notifications: true,
  email_updates: false,
  chat_history_limit: 50,
})

const originalSettings = ref<UserSettings | null>(null)
const saving = ref(false)
const showDeleteModal = ref(false)
const showAccountDeleteModal = ref(false)
const deleteConfirmText = ref('')

// Toast
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

// Theme options
const themes = [
  { value: 'light', label: '라이트', icon: '☀️' },
  { value: 'dark', label: '다크', icon: '🌙' },
  { value: 'auto', label: '자동', icon: '🌓' },
]

// Computed
const hasChanges = computed(() => {
  if (!originalSettings.value) return false
  return JSON.stringify(settings) !== JSON.stringify(originalSettings.value)
})

// Methods
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const loadSettings = () => {
  const saved = userService.getSettings()
  Object.assign(settings, saved)
  originalSettings.value = { ...saved }
}

const saveSettings = () => {
  if (!hasChanges.value) return

  saving.value = true

  try {
    userService.saveSettings(settings)
    originalSettings.value = { ...settings }
    showToast('설정이 저장되었습니다!', 'success')
  } catch (error) {
    showToast('설정 저장에 실패했습니다', 'error')
  } finally {
    saving.value = false
  }
}

const deleteAllChats = async () => {
  try {
    // In a real app, you'd call an API endpoint to delete all chats
    showToast('모든 채팅이 삭제되었습니다', 'success')
    showDeleteModal.value = false
  } catch (error) {
    showToast('채팅 삭제에 실패했습니다', 'error')
  }
}

const closeAccountDeleteModal = () => {
  showAccountDeleteModal.value = false
  deleteConfirmText.value = ''
}

const deleteAccount = async () => {
  if (deleteConfirmText.value !== 'DELETE') return

  try {
    // In a real app, you'd call an API endpoint to delete the account
    showToast('계정이 삭제되었습니다', 'success')
    // Logout and redirect to home
  } catch (error) {
    showToast('계정 삭제에 실패했습니다', 'error')
  }
}

// Watch theme changes
watch(
  () => settings.theme,
  (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
)

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.user-settings {
  max-width: 800px;
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

/* Settings Container */
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Settings Section */
.settings-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.settings-section h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.settings-section h3 i {
  font-size: 1.5rem;
}

/* Setting Item */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-info {
  flex: 1;
  padding-right: 2rem;
}

.setting-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #2d3748;
}

.setting-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #718096;
}

.setting-control {
  flex-shrink: 0;
}

/* Theme Selector */
.theme-selector {
  display: flex;
  gap: 0.5rem;
}

.theme-option {
  padding: 0.75rem 1.25rem;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-option:hover {
  border-color: #cbd5e0;
  background: #edf2f7;
}

.theme-option.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  border-radius: 34px;
  transition: all 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s;
}

input:checked + .toggle-slider {
  background-color: #667eea;
}

input:checked + .toggle-slider:before {
  transform: translateX(28px);
}

/* Form Inputs */
.select-input,
.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.select-input:focus,
.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.number-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.number-input {
  width: 80px;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  transition: all 0.2s;
}

.number-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-suffix {
  color: #718096;
}

/* About Content */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.about-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.about-item label {
  font-weight: 500;
  color: #718096;
}

.about-item span,
.about-item a {
  color: #2d3748;
  text-decoration: none;
}

.about-item a:hover {
  color: #667eea;
  text-decoration: underline;
}

/* Settings Footer */
.settings-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.save-btn {
  padding: 0.875rem 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.danger {
  background: #f56565;
  color: white;
}

.btn.danger:hover {
  background: #e53e3e;
}

.btn.secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn.secondary:hover {
  background: #cbd5e0;
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
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem 0;
  color: #4a5568;
}

.warning {
  color: #e53e3e;
  font-weight: 500;
}

.confirm-input {
  margin-top: 1.5rem;
}

.confirm-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 2000;
}

.toast.success {
  background: #48bb78;
}

.toast.error {
  background: #f56565;
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
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .setting-info {
    padding-right: 0;
  }

  .setting-control {
    width: 100%;
  }

  .theme-selector {
    width: 100%;
  }

  .theme-option {
    flex: 1;
    justify-content: center;
  }

  .toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
</style>
