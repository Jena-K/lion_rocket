import { test, expect } from '@playwright/test'
import { testUsers } from '../fixtures/test-data'
import { AuthHelper } from '../helpers/auth.helper'

test.describe('Visual Regression Tests', () => {
  let authHelper: AuthHelper

  test.beforeEach(async ({ page, request, baseURL }) => {
    authHelper = new AuthHelper(page, request, baseURL!)
  })

  test.describe('Landing Page Visual Tests', () => {
    test('should match landing page screenshot', async ({ page }) => {
      await page.goto('/')
      
      // Wait for animations to complete
      await page.waitForTimeout(500)

      // Take screenshot and compare
      await expect(page).toHaveScreenshot('landing-page.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test('should match landing page mobile view', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('landing-page-mobile.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })
  })

  test.describe('Authentication Pages Visual Tests', () => {
    test('should match login page screenshot', async ({ page }) => {
      await page.goto('/login')
      await page.waitForTimeout(300)

      await expect(page).toHaveScreenshot('login-page.png', {
        animations: 'disabled'
      })
    })

    test('should match registration page screenshot', async ({ page }) => {
      await page.goto('/register')
      await page.waitForTimeout(300)

      await expect(page).toHaveScreenshot('register-page.png', {
        animations: 'disabled'
      })
    })

    test('should match login form with errors', async ({ page }) => {
      await page.goto('/login')
      
      // Trigger validation errors
      await page.click('button[type="submit"]')
      await page.waitForTimeout(300)

      await expect(page).toHaveScreenshot('login-form-errors.png', {
        animations: 'disabled'
      })
    })
  })

  test.describe('Dashboard Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      await authHelper.authenticateUser()
    })

    test('should match dashboard screenshot', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('dashboard.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test('should match dashboard dark mode', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Toggle dark mode
      await page.click('[data-testid="theme-toggle"]')
      await page.waitForTimeout(300)

      await expect(page).toHaveScreenshot('dashboard-dark.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })
  })

  test.describe('Character Pages Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      await authHelper.authenticateUser()
    })

    test('should match character list screenshot', async ({ page }) => {
      await page.goto('/characters')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('character-list.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test('should match character detail page', async ({ page }) => {
      await page.goto('/characters')
      await page.locator('[data-testid="character-card"]').first().click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('character-detail.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test('should match character creation form', async ({ page }) => {
      await page.goto('/characters/new')
      await page.waitForTimeout(300)

      await expect(page).toHaveScreenshot('character-create-form.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })
  })

  test.describe('Chat Interface Visual Tests', () => {
    test.beforeEach(async ({ page, request, baseURL }) => {
      const { token } = await authHelper.authenticateUser()
      
      // Create a character and chat for testing
      const charResponse = await request.post(`${baseURL}/api/characters/`, {
        headers: { 'Authorization': `Bearer ${token}` },
        data: {
          name: 'Visual Test Bot',
          system_prompt: 'Test bot for visual regression',
          description: 'Visual testing character'
        }
      })
      
      const character = await charResponse.json()
      
      const chatResponse = await request.post(`${baseURL}/api/chats/`, {
        headers: { 'Authorization': `Bearer ${token}` },
        data: {
          character_id: character.id,
          title: 'Visual Test Chat'
        }
      })
      
      const chat = await chatResponse.json()
      await page.goto(`/chats/${chat.id}`)
    })

    test('should match empty chat interface', async ({ page }) => {
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('chat-empty.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test('should match chat with messages', async ({ page }) => {
      // Send a message
      await page.fill('[data-testid="message-input"]', 'Hello, this is a test message!')
      await page.click('[data-testid="send-button"]')
      
      // Wait for response
      await page.waitForSelector('[data-testid="ai-message"]')
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('chat-with-messages.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test('should match chat with typing indicator', async ({ page }) => {
      // Send a message
      await page.fill('[data-testid="message-input"]', 'Test message')
      await page.click('[data-testid="send-button"]')
      
      // Capture while typing indicator is visible
      await page.waitForSelector('[data-testid="typing-indicator"]')

      await expect(page).toHaveScreenshot('chat-typing.png', {
        animations: 'disabled'
      })
    })
  })

  test.describe('Admin Panel Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      await authHelper.authenticateUser(testUsers.admin)
    })

    test('should match admin dashboard screenshot', async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('admin-dashboard.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test('should match user management page', async ({ page }) => {
      await page.goto('/admin/users')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('admin-users.png', {
        fullPage: true,
        animations: 'disabled'
      })
    })
  })

  test.describe('Component Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      await authHelper.authenticateUser()
    })

    test('should match button states', async ({ page }) => {
      await page.goto('/styleguide')
      
      // Normal state
      await expect(page.locator('[data-testid="button-showcase"]')).toHaveScreenshot('buttons-normal.png')
      
      // Hover state
      await page.hover('[data-testid="primary-button"]')
      await expect(page.locator('[data-testid="button-showcase"]')).toHaveScreenshot('buttons-hover.png')
      
      // Disabled state
      await page.click('[data-testid="toggle-disabled"]')
      await expect(page.locator('[data-testid="button-showcase"]')).toHaveScreenshot('buttons-disabled.png')
    })

    test('should match form components', async ({ page }) => {
      await page.goto('/styleguide')
      
      await expect(page.locator('[data-testid="form-showcase"]')).toHaveScreenshot('forms.png')
      
      // With focus
      await page.focus('[data-testid="sample-input"]')
      await expect(page.locator('[data-testid="form-showcase"]')).toHaveScreenshot('forms-focused.png')
    })

    test('should match notification styles', async ({ page }) => {
      await page.goto('/styleguide')
      
      // Trigger different notification types
      await page.click('[data-testid="show-success-notification"]')
      await page.click('[data-testid="show-error-notification"]')
      await page.click('[data-testid="show-warning-notification"]')
      await page.click('[data-testid="show-info-notification"]')
      
      await page.waitForTimeout(300)

      await expect(page.locator('[data-testid="notifications-container"]')).toHaveScreenshot('notifications.png')
    })
  })

  test.describe('Responsive Visual Tests', () => {
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'laptop', width: 1366, height: 768 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ]

    test.beforeEach(async ({ page }) => {
      await authHelper.authenticateUser()
    })

    for (const viewport of viewports) {
      test(`should match dashboard at ${viewport.name} size`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)

        await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled'
        })
      })
    }
  })
})