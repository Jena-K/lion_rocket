import { test, expect } from '@playwright/test'
import { testUsers, testCharacters, testMessages, apiEndpoints } from '../fixtures/test-data'

test.describe('API Integration Tests', () => {
  let authToken: string
  let userId: number

  test.beforeAll(async ({ request, baseURL }) => {
    // Register or login to get auth token
    try {
      const registerResponse = await request.post(`${baseURL}${apiEndpoints.auth.register}`, {
        data: testUsers.newUser
      })
      
      if (registerResponse.ok()) {
        const data = await registerResponse.json()
        authToken = data.access_token
        userId = data.user.id
      }
    } catch {
      // Try login if registration fails
      const loginResponse = await request.post(`${baseURL}${apiEndpoints.auth.login}`, {
        form: {
          username: testUsers.newUser.username,
          password: testUsers.newUser.password
        }
      })
      
      const data = await loginResponse.json()
      authToken = data.access_token
      userId = data.user.id
    }
  })

  test.describe('Authentication API', () => {
    test('POST /auth/register - should register new user', async ({ request, baseURL }) => {
      const newUser = {
        username: `apitest_${Date.now()}`,
        email: `apitest_${Date.now()}@example.com`,
        password: 'TestPass123!'
      }

      const response = await request.post(`${baseURL}${apiEndpoints.auth.register}`, {
        data: newUser
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('access_token')
      expect(data).toHaveProperty('token_type', 'bearer')
      expect(data.user).toMatchObject({
        username: newUser.username,
        email: newUser.email,
        is_admin: false
      })
    })

    test('POST /auth/login - should login with valid credentials', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${apiEndpoints.auth.login}`, {
        form: {
          username: testUsers.regular.username,
          password: testUsers.regular.password
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('access_token')
      expect(data).toHaveProperty('token_type', 'bearer')
    })

    test('GET /auth/me - should return current user info', async ({ request, baseURL }) => {
      const response = await request.get(`${baseURL}${apiEndpoints.auth.me}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('id', userId)
      expect(data).toHaveProperty('username')
      expect(data).toHaveProperty('email')
    })

    test('POST /auth/refresh - should refresh access token', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${apiEndpoints.auth.refresh}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('access_token')
      expect(data.access_token).not.toBe(authToken)
    })
  })

  test.describe('Character API', () => {
    let characterId: number

    test('POST /api/characters/ - should create character', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${apiEndpoints.characters.create}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: testCharacters.basic
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      characterId = data.id
      
      expect(data).toMatchObject({
        name: testCharacters.basic.name,
        description: testCharacters.basic.description,
        system_prompt: testCharacters.basic.system_prompt,
        creator_id: userId
      })
    })

    test('GET /api/characters/ - should list characters', async ({ request, baseURL }) => {
      const response = await request.get(`${baseURL}${apiEndpoints.characters.list}`, {
        params: {
          skip: 0,
          limit: 10
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('characters')
      expect(data).toHaveProperty('total')
      expect(Array.isArray(data.characters)).toBe(true)
    })

    test('GET /api/characters/{id} - should get character details', async ({ request, baseURL }) => {
      const response = await request.get(`${baseURL}${apiEndpoints.characters.get(characterId)}`)

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('id', characterId)
      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('system_prompt')
    })

    test('PUT /api/characters/{id} - should update character', async ({ request, baseURL }) => {
      const updateData = {
        description: 'Updated description for API test'
      }

      const response = await request.put(`${baseURL}${apiEndpoints.characters.update(characterId)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: updateData
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('description', updateData.description)
    })

    test('DELETE /api/characters/{id} - should delete character', async ({ request, baseURL }) => {
      // Create a character to delete
      const createResponse = await request.post(`${baseURL}${apiEndpoints.characters.create}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          name: 'To Delete',
          system_prompt: 'Delete me',
          description: 'Character to be deleted'
        }
      })

      const toDelete = await createResponse.json()

      const response = await request.delete(`${baseURL}${apiEndpoints.characters.delete(toDelete.id)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      // Verify deletion
      const getResponse = await request.get(`${baseURL}${apiEndpoints.characters.get(toDelete.id)}`)
      expect(getResponse.status()).toBe(404)
    })
  })

  test.describe('Chat API', () => {
    let characterId: number
    let chatId: number

    test.beforeAll(async ({ request, baseURL }) => {
      // Create a character for chat tests
      const charResponse = await request.post(`${baseURL}${apiEndpoints.characters.create}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          name: 'Chat Test Bot',
          system_prompt: 'You are a test bot. Keep responses very brief.',
          description: 'Bot for API chat tests'
        }
      })

      const character = await charResponse.json()
      characterId = character.id
    })

    test('POST /api/chats/ - should create chat', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${apiEndpoints.chats.create}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          character_id: characterId,
          title: 'API Test Chat'
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      chatId = data.id
      
      expect(data).toMatchObject({
        character_id: characterId,
        user_id: userId,
        title: 'API Test Chat'
      })
    })

    test('GET /api/chats/ - should list user chats', async ({ request, baseURL }) => {
      const response = await request.get(`${baseURL}${apiEndpoints.chats.list}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          skip: 0,
          limit: 10
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('chats')
      expect(data).toHaveProperty('total')
      expect(data.chats.some((chat: any) => chat.id === chatId)).toBe(true)
    })

    test('POST /api/chats/{id}/messages - should send message', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${apiEndpoints.chats.messages(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          content: testMessages.greeting
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toMatchObject({
        chat_id: chatId,
        content: testMessages.greeting
      })
    })

    test('GET /api/chats/{id}/messages - should get chat messages', async ({ request, baseURL }) => {
      // Wait a bit for AI response
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await request.get(`${baseURL}${apiEndpoints.chats.messages(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)
      const messages = await response.json()
      expect(Array.isArray(messages)).toBe(true)
      expect(messages.length).toBeGreaterThanOrEqual(1)
      expect(messages[0]).toHaveProperty('content', testMessages.greeting)
    })

    test('DELETE /api/chats/{id} - should delete chat', async ({ request, baseURL }) => {
      const response = await request.delete(`${baseURL}${apiEndpoints.chats.delete(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      // Verify deletion
      const getResponse = await request.get(`${baseURL}${apiEndpoints.chats.get(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      expect(getResponse.status()).toBe(404)
    })
  })

  test.describe('SSE Streaming', () => {
    test('GET /api/chats/{id}/stream - should establish SSE connection', async ({ request, baseURL }) => {
      // Create a chat for SSE test
      const charResponse = await request.post(`${baseURL}${apiEndpoints.characters.create}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          name: 'SSE Test Bot',
          system_prompt: 'Test bot for SSE',
          description: 'SSE testing'
        }
      })

      const character = await charResponse.json()

      const chatResponse = await request.post(`${baseURL}${apiEndpoints.chats.create}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          character_id: character.id,
          title: 'SSE Test'
        }
      })

      const chat = await chatResponse.json()

      // Test SSE endpoint
      const response = await request.get(`${baseURL}${apiEndpoints.chats.stream(chat.id)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'text/event-stream'
        }
      })

      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toContain('text/event-stream')
    })
  })

  test.describe('Error Handling', () => {
    test('should return 401 for unauthorized requests', async ({ request, baseURL }) => {
      const response = await request.get(`${baseURL}${apiEndpoints.auth.me}`)
      expect(response.status()).toBe(401)
    })

    test('should return 404 for non-existent resources', async ({ request, baseURL }) => {
      const response = await request.get(`${baseURL}${apiEndpoints.characters.get(999999)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      expect(response.status()).toBe(404)
    })

    test('should return 400 for invalid data', async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}${apiEndpoints.characters.create}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          // Missing required fields
          description: 'Invalid character'
        }
      })
      expect(response.status()).toBe(422)
    })

    test('should handle rate limiting', async ({ request, baseURL }) => {
      // Send many requests quickly
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(
          request.get(`${baseURL}${apiEndpoints.auth.me}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
        )
      }

      const responses = await Promise.all(promises)
      const rateLimited = responses.some(r => r.status() === 429)
      
      // Should eventually hit rate limit
      expect(rateLimited).toBe(true)
    })
  })
})