import { test, expect } from '@playwright/test'
import { testMessages, selectors, testTimeouts, apiEndpoints } from '../fixtures/test-data'
import { AuthHelper } from '../helpers/auth.helper'

test.describe('Chat Conversation User Flows', () => {
  let authHelper: AuthHelper
  let characterId: number

  test.beforeEach(async ({ page, request, baseURL }) => {
    authHelper = new AuthHelper(page, request, baseURL!)
    
    // Login and create a test character
    const { token } = await authHelper.authenticateUser()
    
    // Create a character via API for testing
    const charResponse = await request.post(`${baseURL}${apiEndpoints.characters.create}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      data: {
        name: 'Test Chat Bot',
        system_prompt: 'You are a helpful test assistant. Keep responses brief.',
        description: 'A bot for testing chat functionality'
      }
    })
    
    const character = await charResponse.json()
    characterId = character.id
    
    await page.goto(`/characters/${characterId}`)
  })

  test.describe('Chat Creation and Basic Messaging', () => {
    test('should create a new chat and send messages', async ({ page }) => {
      // Start a new chat
      await page.click('[data-testid="start-chat-button"]')
      await expect(page).toHaveURL(/\/chats\/\d+/)

      // Verify chat interface is loaded
      await expect(page.locator(selectors.chat.container)).toBeVisible()
      await expect(page.locator(selectors.chat.inputBox)).toBeVisible()

      // Send a message
      await page.fill(selectors.chat.inputBox, testMessages.greeting)
      await page.click(selectors.chat.sendButton)

      // Verify user message appears
      const userMessage = page.locator(selectors.chat.userMessage).last()
      await expect(userMessage).toContainText(testMessages.greeting)

      // Wait for AI response
      await expect(page.locator(selectors.chat.typingIndicator)).toBeVisible()
      await expect(page.locator(selectors.chat.aiMessage).last()).toBeVisible({ 
        timeout: testTimeouts.api * 3 
      })

      // Verify AI response
      const aiMessage = page.locator(selectors.chat.aiMessage).last()
      await expect(aiMessage).not.toBeEmpty()
    })

    test('should handle rapid message sending', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Send multiple messages quickly
      const messages = ['First message', 'Second message', 'Third message']
      
      for (const msg of messages) {
        await page.fill(selectors.chat.inputBox, msg)
        await page.click(selectors.chat.sendButton)
        // Small delay to ensure messages are processed
        await page.waitForTimeout(100)
      }

      // Verify all messages appear
      const userMessages = page.locator(selectors.chat.userMessage)
      await expect(userMessages).toHaveCount(messages.length)

      // Verify AI responds to each message
      await expect(page.locator(selectors.chat.aiMessage)).toHaveCount(messages.length, {
        timeout: testTimeouts.api * 5
      })
    })

    test('should show typing indicator during AI response', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Send a message
      await page.fill(selectors.chat.inputBox, testMessages.question)
      await page.click(selectors.chat.sendButton)

      // Typing indicator should appear
      await expect(page.locator(selectors.chat.typingIndicator)).toBeVisible()

      // Typing indicator should disappear when response is complete
      await expect(page.locator(selectors.chat.aiMessage).last()).toBeVisible()
      await expect(page.locator(selectors.chat.typingIndicator)).not.toBeVisible()
    })
  })

  test.describe('Chat History and Navigation', () => {
    test('should display chat history sidebar', async ({ page }) => {
      // Create multiple chats
      for (let i = 0; i < 3; i++) {
        await page.goto(`/characters/${characterId}`)
        await page.click('[data-testid="start-chat-button"]')
        await page.fill(selectors.chat.inputBox, `Chat ${i + 1} first message`)
        await page.click(selectors.chat.sendButton)
        await page.waitForTimeout(500)
      }

      // Verify chat history is visible
      await expect(page.locator(selectors.chat.chatHistory)).toBeVisible()
      
      // Should have 3 chat items
      const chatItems = page.locator(selectors.chat.chatItem)
      await expect(chatItems).toHaveCount(3)
    })

    test('should switch between chats', async ({ page, request, baseURL }) => {
      // Create two chats via UI
      await page.click('[data-testid="start-chat-button"]')
      await page.fill(selectors.chat.inputBox, 'First chat message')
      await page.click(selectors.chat.sendButton)
      
      const firstChatUrl = page.url()
      
      await page.goto(`/characters/${characterId}`)
      await page.click('[data-testid="start-chat-button"]')
      await page.fill(selectors.chat.inputBox, 'Second chat message')
      await page.click(selectors.chat.sendButton)

      // Click on first chat in history
      await page.click(selectors.chat.chatItem + ':has-text("First chat")')

      // Verify switched to first chat
      await expect(page).toHaveURL(firstChatUrl)
      await expect(page.locator(selectors.chat.userMessage)).toContainText('First chat message')
    })

    test('should delete a chat', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')
      await page.fill(selectors.chat.inputBox, 'Chat to be deleted')
      await page.click(selectors.chat.sendButton)

      // Open chat menu
      await page.click('[data-testid="chat-menu-button"]')
      await page.click('[data-testid="delete-chat-button"]')

      // Confirm deletion
      await page.click('button:has-text("Delete")')

      // Should redirect to characters page
      await expect(page).toHaveURL(/\/characters/)
    })
  })

  test.describe('Message Interaction', () => {
    test('should copy message content', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')
      
      // Send a message
      const testMessage = 'This is a message to copy'
      await page.fill(selectors.chat.inputBox, testMessage)
      await page.click(selectors.chat.sendButton)

      // Wait for response
      await expect(page.locator(selectors.chat.aiMessage).last()).toBeVisible()

      // Copy user message
      await page.hover(selectors.chat.userMessage)
      await page.click('[data-testid="copy-message-button"]')

      // Verify clipboard content (this might need browser permissions)
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
      expect(clipboardText).toBe(testMessage)
    })

    test('should handle long messages with scrolling', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Send a long message
      await page.fill(selectors.chat.inputBox, testMessages.longMessage)
      await page.click(selectors.chat.sendButton)

      // Verify message list scrolls
      const messageList = page.locator(selectors.chat.messageList)
      const scrollHeight = await messageList.evaluate(el => el.scrollHeight)
      const clientHeight = await messageList.evaluate(el => el.clientHeight)
      
      expect(scrollHeight).toBeGreaterThan(clientHeight)
    })

    test('should format code blocks in messages', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Send a message asking for code
      await page.fill(selectors.chat.inputBox, testMessages.coding)
      await page.click(selectors.chat.sendButton)

      // Wait for AI response with code
      await expect(page.locator(selectors.chat.aiMessage).last()).toBeVisible({
        timeout: testTimeouts.api * 3
      })

      // Verify code formatting
      const codeBlock = page.locator(selectors.chat.aiMessage).last().locator('pre code')
      await expect(codeBlock).toBeVisible()
    })
  })

  test.describe('Real-time Features with SSE', () => {
    test('should receive streaming responses', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Send a message that triggers streaming
      await page.fill(selectors.chat.inputBox, testMessages.creative)
      await page.click(selectors.chat.sendButton)

      // Watch for streaming chunks
      const aiMessage = page.locator(selectors.chat.aiMessage).last()
      
      // Get initial content
      let previousContent = ''
      let chunkCount = 0
      
      // Monitor content changes
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(200)
        const currentContent = await aiMessage.textContent() || ''
        
        if (currentContent.length > previousContent.length) {
          chunkCount++
          previousContent = currentContent
        }
      }

      // Should have received multiple chunks
      expect(chunkCount).toBeGreaterThan(2)
    })

    test('should maintain SSE connection across messages', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Send first message
      await page.fill(selectors.chat.inputBox, 'First message')
      await page.click(selectors.chat.sendButton)
      await expect(page.locator(selectors.chat.aiMessage)).toHaveCount(1, {
        timeout: testTimeouts.api * 2
      })

      // Send second message
      await page.fill(selectors.chat.inputBox, 'Second message')
      await page.click(selectors.chat.sendButton)
      await expect(page.locator(selectors.chat.aiMessage)).toHaveCount(2, {
        timeout: testTimeouts.api * 2
      })

      // Connection indicator should remain stable
      await expect(page.locator('[data-testid="connection-status"]')).toHaveText('Connected')
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page, context }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Simulate network offline
      await context.setOffline(true)

      // Try to send a message
      await page.fill(selectors.chat.inputBox, 'Message during offline')
      await page.click(selectors.chat.sendButton)

      // Should show error message
      await expect(page.locator('[data-testid="error-toast"]')).toContainText(/network|offline|connection/i)

      // Restore network
      await context.setOffline(false)

      // Should be able to send messages again
      await page.fill(selectors.chat.inputBox, 'Message after reconnect')
      await page.click(selectors.chat.sendButton)
      await expect(page.locator(selectors.chat.userMessage).last()).toContainText('Message after reconnect')
    })

    test('should handle API errors', async ({ page, route }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Mock API error
      await route('**/api/chats/*/messages', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Internal server error' })
        })
      })

      // Try to send a message
      await page.fill(selectors.chat.inputBox, 'This will fail')
      await page.click(selectors.chat.sendButton)

      // Should show error
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/error|failed/i)
    })
  })

  test.describe('Keyboard Shortcuts', () => {
    test('should send message with Enter key', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Type and press Enter
      await page.fill(selectors.chat.inputBox, 'Message sent with Enter')
      await page.press(selectors.chat.inputBox, 'Enter')

      // Message should be sent
      await expect(page.locator(selectors.chat.userMessage)).toContainText('Message sent with Enter')
    })

    test('should create new line with Shift+Enter', async ({ page }) => {
      await page.click('[data-testid="start-chat-button"]')

      // Type multiline message
      await page.type(selectors.chat.inputBox, 'Line 1')
      await page.press(selectors.chat.inputBox, 'Shift+Enter')
      await page.type(selectors.chat.inputBox, 'Line 2')
      
      // Verify multiline input
      const inputValue = await page.locator(selectors.chat.inputBox).inputValue()
      expect(inputValue).toContain('Line 1\nLine 2')
    })
  })
})