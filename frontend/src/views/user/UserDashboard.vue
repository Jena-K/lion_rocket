<template>
  <div class="user-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="logo">
            <span class="logo-icon">🚀</span>
            <span class="logo-text">LionRocket</span>
          </h1>
        </div>

        <div class="header-right">
          <div class="user-menu">
            <div class="user-avatar">
              <span>{{ userInitial }}</span>
            </div>
            <span class="user-name">{{ authStore.user?.username }}</span>
            <div class="dropdown-menu">
              <router-link to="/" class="menu-item"> <i>💬</i> 채팅으로 돌아가기 </router-link>
              <router-link to="/admin" v-if="authStore.isAdmin" class="menu-item">
                <i>⚙️</i> 관리자 페이지
              </router-link>
              <button @click="handleLogout" class="menu-item logout"><i>🚪</i> 로그아웃</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'mobile-open': mobileMenuOpen }">
        <nav class="nav-menu">
          <router-link
            :to="{ name: 'user-profile' }"
            class="nav-item"
            :class="{ active: $route.name === 'user-profile' }"
            @click="mobileMenuOpen = false"
          >
            <div class="nav-icon">
              <i>👤</i>
            </div>
            <span class="nav-label">내 프로필</span>
          </router-link>

          <router-link
            :to="{ name: 'user-chats' }"
            class="nav-item"
            :class="{ active: $route.name === 'user-chats' }"
            @click="mobileMenuOpen = false"
          >
            <div class="nav-icon">
              <i>💬</i>
            </div>
            <span class="nav-label">채팅 기록</span>
          </router-link>

          <router-link
            :to="{ name: 'user-stats' }"
            class="nav-item"
            :class="{ active: $route.name === 'user-stats' }"
            @click="mobileMenuOpen = false"
          >
            <div class="nav-icon">
              <i>📊</i>
            </div>
            <span class="nav-label">사용 통계</span>
          </router-link>

          <router-link
            :to="{ name: 'user-settings' }"
            class="nav-item"
            :class="{ active: $route.name === 'user-settings' }"
            @click="mobileMenuOpen = false"
          >
            <div class="nav-icon">
              <i>⚙️</i>
            </div>
            <span class="nav-label">설정</span>
          </router-link>
        </nav>
      </aside>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Main Content -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const mobileMenuOpen = ref(false)

const userInitial = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || '?'
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* Header */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.logo-icon {
  font-size: 1.75rem;
}

/* User Menu */
.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-menu:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.user-name {
  font-weight: 500;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s;
  overflow: hidden;
}

.user-menu:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  background: none;
  width: 100%;
  font-size: 0.95rem;
  cursor: pointer;
}

.menu-item:hover {
  background: #f7fafc;
  color: #667eea;
}

.menu-item.logout {
  color: #e53e3e;
}

.menu-item.logout:hover {
  background: #fff5f5;
  color: #c53030;
}

/* Layout */
.dashboard-layout {
  display: flex;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  padding: 2rem 0;
  height: calc(100vh - 72px);
  position: sticky;
  top: 72px;
  overflow-y: auto;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: #667eea;
  transition: height 0.2s;
  border-radius: 0 4px 4px 0;
}

.nav-item:hover {
  background: #f7fafc;
  color: #667eea;
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  color: #667eea;
  font-weight: 600;
}

.nav-item.active::before {
  height: 70%;
}

.nav-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.nav-item.active .nav-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-label {
  flex: 1;
  font-size: 0.95rem;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  z-index: 101;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.mobile-menu-toggle span {
  width: 20px;
  height: 2px;
  background: white;
  transition: all 0.3s;
}

.mobile-menu-toggle:hover {
  transform: scale(1.1);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    z-index: 200;
    transition: left 0.3s;
    padding-top: 5rem;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .main-content {
    padding: 1.5rem;
  }
}

@media (max-width: 640px) {
  .header-content {
    padding: 1rem;
  }

  .logo-text {
    display: none;
  }

  .user-name {
    display: none;
  }

  .main-content {
    padding: 1rem;
  }
}

/* Scrollbar Styling */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f7fafc;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
