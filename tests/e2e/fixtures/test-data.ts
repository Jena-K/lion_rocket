/**
 * Test data fixtures for E2E tests
 */

export const testUsers = {
  regular: {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'TestPass123!'
  },
  admin: {
    username: 'admin',
    email: 'admin@lionrocket.com',
    password: 'admin123'
  },
  newUser: {
    username: `user_${Date.now()}`,
    email: `user_${Date.now()}@example.com`,
    password: 'NewUser123!'
  }
}

export const testCharacters = {
  basic: {
    name: 'Test Assistant',
    description: 'A helpful AI assistant for testing',
    system_prompt: 'You are a helpful assistant created for testing purposes.',
    category: 'Assistant',
    tags: ['test', 'assistant', 'helpful'],
    is_private: false
  },
  creative: {
    name: 'Creative Writer',
    description: 'An AI that helps with creative writing',
    system_prompt: 'You are a creative writing assistant. Help users with storytelling and creative content.',
    category: 'Creative',
    tags: ['creative', 'writing', 'storytelling'],
    is_private: false
  },
  privateChar: {
    name: 'Private Assistant',
    description: 'A private AI assistant',
    system_prompt: 'You are a private assistant available only to the creator.',
    category: 'Private',
    tags: ['private', 'personal'],
    is_private: true
  }
}

export const testMessages = {
  greeting: 'Hello! How are you today?',
  question: 'Can you explain what quantum computing is?',
  creative: 'Write a short story about a robot learning to paint.',
  coding: 'How do I implement a binary search tree in Python?',
  longMessage: 'This is a very long message that tests the system\'s ability to handle extended content. '.repeat(50)
}

export const apiEndpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me'
  },
  characters: {
    list: '/api/characters/',
    create: '/api/characters/',
    get: (id: number) => `/api/characters/${id}`,
    update: (id: number) => `/api/characters/${id}`,
    delete: (id: number) => `/api/characters/${id}`,
    my: '/api/characters/my',
    avatar: (id: number) => `/api/characters/${id}/avatar`
  },
  chats: {
    list: '/api/chats/',
    create: '/api/chats/',
    get: (id: number) => `/api/chats/${id}`,
    delete: (id: number) => `/api/chats/${id}`,
    messages: (id: number) => `/api/chats/${id}/messages`,
    stream: (id: number) => `/api/chats/${id}/stream`
  },
  admin: {
    users: '/admin/users',
    stats: '/admin/stats',
    settings: '/admin/settings'
  }
}

export const testTimeouts = {
  navigation: 30000,
  api: 10000,
  sse: 60000,
  animation: 500
}

export const selectors = {
  auth: {
    loginForm: '[data-testid="login-form"]',
    registerForm: '[data-testid="register-form"]',
    usernameInput: 'input[name="username"]',
    emailInput: 'input[name="email"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]'
  },
  navigation: {
    navbar: '[data-testid="navbar"]',
    userMenu: '[data-testid="user-menu"]',
    logoutButton: '[data-testid="logout-button"]',
    homeLink: 'a[href="/"]',
    charactersLink: 'a[href="/characters"]',
    chatsLink: 'a[href="/chats"]',
    adminLink: 'a[href="/admin"]'
  },
  characters: {
    list: '[data-testid="character-list"]',
    card: '[data-testid="character-card"]',
    createButton: '[data-testid="create-character-button"]',
    editButton: '[data-testid="edit-character-button"]',
    deleteButton: '[data-testid="delete-character-button"]',
    nameInput: 'input[name="name"]',
    descriptionInput: 'textarea[name="description"]',
    promptInput: 'textarea[name="system_prompt"]',
    categorySelect: 'select[name="category"]',
    tagsInput: 'input[name="tags"]',
    privateCheckbox: 'input[name="is_private"]',
    avatarUpload: 'input[type="file"]'
  },
  chat: {
    container: '[data-testid="chat-container"]',
    messageList: '[data-testid="message-list"]',
    message: '[data-testid="chat-message"]',
    userMessage: '[data-testid="user-message"]',
    aiMessage: '[data-testid="ai-message"]',
    inputBox: '[data-testid="message-input"]',
    sendButton: '[data-testid="send-button"]',
    typingIndicator: '[data-testid="typing-indicator"]',
    newChatButton: '[data-testid="new-chat-button"]',
    chatHistory: '[data-testid="chat-history"]',
    chatItem: '[data-testid="chat-item"]'
  }
}