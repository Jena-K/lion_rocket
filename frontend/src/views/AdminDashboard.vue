<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-left">
        <h1>🚀 LionRocket 관리자</h1>
      </div>
      <div class="header-right">
        <span class="admin-info">
          <i class="user-icon">👤</i>
          {{ authStore.user?.username }}
        </span>
        <router-link to="/" class="back-btn"> <i>💬</i> 채팅으로 </router-link>
        <button @click="handleLogout" class="logout-btn"><i>🚪</i> 로그아웃</button>
      </div>
    </header>

    <div class="dashboard-layout">
      <aside class="sidebar">
        <nav class="admin-nav">
          <router-link
            :to="{ name: 'admin-overview' }"
            class="nav-link"
            :class="{ active: $route.name === 'admin-overview' }"
          >
            <i class="nav-icon">📊</i>
            <span>대시보드</span>
          </router-link>

          <router-link
            :to="{ name: 'admin-users' }"
            class="nav-link"
            :class="{ active: $route.name === 'admin-users' }"
          >
            <i class="nav-icon">👥</i>
            <span>사용자 관리</span>
          </router-link>

          <router-link
            :to="{ name: 'admin-characters' }"
            class="nav-link"
            :class="{ active: $route.name === 'admin-characters' }"
          >
            <i class="nav-icon">🤖</i>
            <span>캐릭터 관리</span>
          </router-link>

          <router-link
            :to="{ name: 'admin-prompts' }"
            class="nav-link"
            :class="{ active: $route.name === 'admin-prompts' }"
          >
            <i class="nav-icon">📝</i>
            <span>프롬프트 관리</span>
          </router-link>
        </nav>
      </aside>

      <main class="dashboard-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

/* Header Styles */
.dashboard-header {
  background: linear-gradient(135deg, #343a40 0%, #495057 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.user-icon {
  font-size: 1.2rem;
}

.back-btn,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.back-btn {
  background: #6c757d;
  color: white;
  text-decoration: none;
}

.back-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.logout-btn {
  background: #dc3545;
  color: white;
}

.logout-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* Layout */
.dashboard-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.admin-nav {
  padding: 1.5rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  color: #495057;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
  position: relative;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #343a40;
}

.nav-link.active {
  background: #e9ecef;
  color: #007bff;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #007bff;
}

.nav-icon {
  font-size: 1.25rem;
  width: 1.5rem;
  text-align: center;
}

/* Main Content */
.dashboard-main {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #f0f2f5;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-left h1 {
    font-size: 1.25rem;
  }

  .sidebar {
    position: fixed;
    left: -250px;
    top: 0;
    bottom: 0;
    z-index: 200;
    transition: left 0.3s;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .dashboard-main {
    padding: 1rem;
  }

  .nav-link span {
    font-size: 0.875rem;
  }
}
</style>
