# Frontend Component Architecture

## Vue 3 컴포넌트 구조

### 프로젝트 구조
```
frontend/src/
├── assets/           # 정적 리소스
├── components/       # 재사용 가능한 컴포넌트
│   ├── common/      # 공통 UI 컴포넌트
│   ├── chat/        # 채팅 관련 컴포넌트
│   └── admin/       # 관리자 전용 컴포넌트
├── views/           # 페이지 컴포넌트
├── stores/          # Pinia 상태 관리
├── composables/     # 재사용 가능한 로직
├── api/             # API 통신 모듈
├── router/          # 라우터 설정
├── utils/           # 유틸리티 함수
└── types/           # TypeScript 타입 정의
```

## 주요 컴포넌트 설계

### 1. 공통 컴포넌트 (components/common/)

#### BaseButton.vue
```vue
<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <LoadingSpinner v-if="loading" />
    <slot />
  </button>
</template>

Props:
- variant: 'primary' | 'secondary' | 'danger'
- size: 'sm' | 'md' | 'lg'
- loading: boolean
- disabled: boolean
```

#### BaseInput.vue
```vue
<template>
  <div class="input-wrapper">
    <label v-if="label">{{ label }}</label>
    <input 
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

Props:
- type: string
- label: string
- modelValue: string | number
- error: string
```

#### BaseModal.vue
```vue
<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay">
      <div class="modal-content">
        <header>
          <slot name="header" />
          <button @click="$emit('close')">×</button>
        </header>
        <main>
          <slot />
        </main>
        <footer>
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

Props:
- show: boolean
```

### 2. 채팅 컴포넌트 (components/chat/)

#### ChatList.vue
```vue
<template>
  <div class="chat-list">
    <ChatListItem 
      v-for="chat in chats" 
      :key="chat.id"
      :chat="chat"
      :active="chat.id === activeId"
      @select="$emit('select', chat.id)"
    />
  </div>
</template>

Props:
- chats: Array<Chat>
- activeId: number
```

#### ChatWindow.vue
```vue
<template>
  <div class="chat-window">
    <ChatHeader :character="character" />
    <MessageList :messages="messages" ref="messageList" />
    <MessageInput 
      @send="handleSend" 
      :disabled="isLoading"
      :maxLength="200"
    />
  </div>
</template>

Props:
- character: Character
- messages: Array<Message>
- isLoading: boolean
```

#### MessageList.vue
```vue
<template>
  <div class="message-list" ref="container">
    <MessageItem 
      v-for="message in messages"
      :key="message.id"
      :message="message"
    />
    <TypingIndicator v-if="isTyping" />
  </div>
</template>

Props:
- messages: Array<Message>
- isTyping: boolean

Features:
- 자동 스크롤
- 가상 스크롤링 (메시지 많을 때)
```

#### MessageInput.vue
```vue
<template>
  <form @submit.prevent="handleSubmit" class="message-input">
    <textarea 
      v-model="message"
      @keydown.enter.prevent="handleSubmit"
      :maxlength="maxLength"
      :disabled="disabled"
      placeholder="메시지를 입력하세요..."
    />
    <div class="input-footer">
      <span class="char-count">{{ message.length }}/{{ maxLength }}</span>
      <BaseButton 
        type="submit" 
        :disabled="!message.trim() || disabled"
      >
        전송
      </BaseButton>
    </div>
  </form>
</template>

Props:
- disabled: boolean
- maxLength: number (default: 200)
```

#### CharacterSelector.vue
```vue
<template>
  <div class="character-selector">
    <h3>캐릭터 선택</h3>
    <div class="character-grid">
      <CharacterCard
        v-for="character in characters"
        :key="character.id"
        :character="character"
        :selected="character.id === selectedId"
        @select="$emit('select', character.id)"
      />
    </div>
  </div>
</template>

Props:
- characters: Array<Character>
- selectedId: number
```

### 3. 관리자 컴포넌트 (components/admin/)

#### UserTable.vue
```vue
<template>
  <div class="user-table">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>사용자명</th>
          <th>이메일</th>
          <th>가입일</th>
          <th>액션</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ formatDate(user.created_at) }}</td>
          <td>
            <BaseButton @click="$emit('view-chats', user.id)">
              채팅 기록
            </BaseButton>
            <BaseButton @click="$emit('view-usage', user.id)">
              사용량
            </BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
    <Pagination 
      :total="total"
      :page="page"
      @change="$emit('page-change', $event)"
    />
  </div>
</template>

Props:
- users: Array<User>
- total: number
- page: number
```

#### UsageChart.vue
```vue
<template>
  <div class="usage-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

Props:
- data: Array<{date: string, chat_count: number, total_tokens: number}>
- type: 'line' | 'bar'

Features:
- Chart.js 사용
- 반응형 차트
- 툴팁 표시
```

#### ChatHistoryViewer.vue
```vue
<template>
  <div class="chat-history-viewer">
    <div class="chat-sessions">
      <ChatSessionCard
        v-for="chat in chats"
        :key="chat.id"
        :chat="chat"
        @select="selectedChatId = chat.id"
      />
    </div>
    <div class="chat-details" v-if="selectedChat">
      <MessageList :messages="selectedChat.messages" />
    </div>
  </div>
</template>

Props:
- chats: Array<ChatWithMessages>
```

### 4. 페이지 컴포넌트 (views/)

#### LoginView.vue
```vue
<template>
  <div class="login-page">
    <div class="login-container">
      <h1>AI Chat Service</h1>
      <form @submit.prevent="handleLogin">
        <BaseInput 
          v-model="credentials.username"
          label="사용자명"
          :error="errors.username"
        />
        <BaseInput 
          v-model="credentials.password"
          type="password"
          label="비밀번호"
          :error="errors.password"
        />
        <BaseButton type="submit" :loading="isLoading">
          로그인
        </BaseButton>
      </form>
      <p>
        계정이 없으신가요? 
        <router-link to="/register">회원가입</router-link>
      </p>
    </div>
  </div>
</template>
```

#### ChatView.vue
```vue
<template>
  <div class="chat-page">
    <aside class="sidebar">
      <CharacterSelector 
        :characters="characters"
        :selectedId="currentCharacterId"
        @select="selectCharacter"
      />
      <ChatList 
        :chats="chats"
        :activeId="currentChatId"
        @select="selectChat"
      />
    </aside>
    <main class="chat-main">
      <ChatWindow 
        v-if="currentChat"
        :character="currentCharacter"
        :messages="currentChat.messages"
        :isLoading="isLoading"
      />
      <EmptyState v-else />
    </main>
  </div>
</template>
```

#### AdminDashboard.vue
```vue
<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>관리자 대시보드</h1>
      <TabNav 
        :tabs="tabs"
        v-model="activeTab"
      />
    </header>
    <main class="dashboard-content">
      <KeepAlive>
        <component :is="currentTabComponent" />
      </KeepAlive>
    </main>
  </div>
</template>

Script:
- tabs: ['사용자 관리', '채팅 기록', '사용량 통계', '캐릭터 관리']
- 동적 컴포넌트 로딩
```

## Pinia Store 설계

### authStore.ts
```typescript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),
  
  actions: {
    async login(credentials: LoginCredentials) {
      const response = await authApi.login(credentials)
      this.setAuth(response.data)
    },
    
    async logout() {
      await authApi.logout()
      this.clearAuth()
    },
    
    setAuth(data: AuthResponse) {
      this.user = data.user
      this.token = data.access_token
      this.isAuthenticated = true
      localStorage.setItem('token', data.access_token)
    },
    
    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
    }
  }
})
```

### chatStore.ts
```typescript
export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [] as Chat[],
    currentChatId: null as number | null,
    messages: {} as Record<number, Message[]>,
    characters: [] as Character[],
    isLoading: false
  }),
  
  getters: {
    currentChat: (state) => 
      state.chats.find(c => c.id === state.currentChatId),
    
    currentMessages: (state) => 
      state.currentChatId ? state.messages[state.currentChatId] || [] : []
  },
  
  actions: {
    async loadChats() {
      const response = await chatApi.getChats()
      this.chats = response.data.items
    },
    
    async sendMessage(chatId: number, content: string) {
      this.isLoading = true
      try {
        const response = await chatApi.sendMessage(chatId, { content })
        this.messages[chatId].push(
          response.data.user_message,
          response.data.assistant_message
        )
      } finally {
        this.isLoading = false
      }
    }
  }
})
```

### adminStore.ts
```typescript
export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as User[],
    selectedUserId: null as number | null,
    userChats: [] as ChatWithStats[],
    usageStats: [] as UsageStat[],
    systemStats: null as SystemStats | null
  }),
  
  actions: {
    async loadUsers(page = 1) {
      const response = await adminApi.getUsers({ page })
      this.users = response.data.items
      return response.data
    },
    
    async loadUserChats(userId: number) {
      const response = await adminApi.getUserChats(userId)
      this.userChats = response.data.chats
    },
    
    async loadUsageStats(userId: number, dateRange: DateRange) {
      const response = await adminApi.getUserUsage(userId, dateRange)
      this.usageStats = response.data.usage_stats
    }
  }
})
```

## Composables

### useChat.ts
```typescript
export function useChat() {
  const chatStore = useChatStore()
  const router = useRouter()
  
  const createNewChat = async (characterId: number) => {
    const response = await chatApi.createChat({ character_id: characterId })
    await chatStore.loadChats()
    router.push(`/chat/${response.data.id}`)
  }
  
  const sendMessage = async (content: string) => {
    if (!chatStore.currentChatId) return
    await chatStore.sendMessage(chatStore.currentChatId, content)
  }
  
  return {
    createNewChat,
    sendMessage,
    currentChat: computed(() => chatStore.currentChat),
    isLoading: computed(() => chatStore.isLoading)
  }
}
```

### useAuth.ts
```typescript
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  
  const requireAuth = () => {
    if (!authStore.isAuthenticated) {
      router.push('/login')
      return false
    }
    return true
  }
  
  const requireAdmin = () => {
    if (!authStore.user?.is_admin) {
      router.push('/')
      return false
    }
    return true
  }
  
  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.user?.is_admin || false),
    requireAuth,
    requireAdmin
  }
}
```

## Router 설정

### index.ts
```typescript
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'chat',
    component: () => import('@/views/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:id',
    name: 'chat-detail',
    component: () => import('@/views/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin && !authStore.user?.is_admin) {
    next('/')
  } else {
    next()
  }
})
```