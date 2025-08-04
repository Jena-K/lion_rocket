<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-left">
        <div class="logo-title">
          <img src="/lion_rocket_logo.png" alt="LionRocket" class="logo" />
          <h1>LionRocket Admin</h1>
        </div>
      </div>
      <div class="header-right">
        <span class="admin-info">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {{ authStore.user?.username }}
        </span>
        <router-link to="/" class="back-btn">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          채팅으로
        </router-link>
        <button @click="handleLogout" class="logout-btn">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          로그아웃
        </button>
      </div>
    </header>

    <div class="dashboard-layout">
      <aside class="sidebar">
        <nav class="admin-nav">
          <router-link
            :to="{ name: 'admin-users' }"
            class="nav-link"
            :class="{ active: $route.name === 'admin-users' }"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>사용자 관리</span>
          </router-link>

          <router-link
            :to="{ name: 'admin-chat-history' }"
            class="nav-link"
            :class="{ active: $route.name === 'admin-chat-history' }"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>채팅 기록</span>
          </router-link>

          <router-link
            :to="{ name: 'admin-characters' }"
            class="nav-link"
            :class="{ active: $route.name === 'admin-characters' }"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
            </svg>
            <span>캐릭터 관리</span>
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
  background: #f5f7fa;
}

/* Header Styles */
.dashboard-header {
  background: #1e293b;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  height: 36px;
  width: auto;
}

.header-left h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.025em;
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
  font-weight: 400;
  color: #cbd5e1;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.back-btn,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 400;
  transition: all 0.15s;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.back-btn {
  background: transparent;
  border: 1px solid #475569;
  color: #cbd5e1;
  text-decoration: none;
}

.back-btn:hover {
  background: #334155;
  border-color: #334155;
}

.logout-btn {
  background: transparent;
  border: 1px solid #ef4444;
  color: #fca5a5;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
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
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.admin-nav {
  padding: 1.5rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #64748b;
  text-decoration: none;
  transition: all 0.15s;
  font-weight: 400;
  font-size: 0.875rem;
  position: relative;
}

.nav-link:hover {
  background: #f8fafc;
  color: #334155;
}

.nav-link.active {
  background: #f1f5f9;
  color: #1e293b;
  font-weight: 500;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #3b82f6;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

/* Main Content */
.dashboard-main {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #f5f7fa;
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
