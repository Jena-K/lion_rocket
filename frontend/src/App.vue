<template>
  <div id="app">
    <router-view />
    <NotificationSystem />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import NotificationSystem from './components/NotificationSystem.vue'

const authStore = useAuthStore()

onMounted(() => {
  // 앱 시작 시 인증 상태 초기화
  authStore.initializeAuth()
})
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #FAFAFA;
  color: #1F2937;
}

#app {
  min-height: 100vh;
}

/* Utility classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-primary {
  background: #5A8F47;
  color: white;
  box-shadow: 0 2px 8px rgba(90, 143, 71, 0.25);
}

.btn-primary:hover {
  background: #4A7C3C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(90, 143, 71, 0.35);
}

.btn-primary:focus {
  background: #3D6630;
  box-shadow: 0 0 0 3px rgba(184, 238, 162, 0.4);
}

.btn-secondary {
  background: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}

.btn-secondary:hover {
  background: #E5E7EB;
  color: #1F2937;
}

.btn-danger {
  background: #FEE2E2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

.btn-danger:hover {
  background: #FCA5A5;
  border-color: #F87171;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading spinner */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
}
</style>
