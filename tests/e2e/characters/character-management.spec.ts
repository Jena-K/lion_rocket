import { test, expect } from '@playwright/test'
import { testCharacters, selectors, testTimeouts } from '../fixtures/test-data'
import { AuthHelper } from '../helpers/auth.helper'

test.describe('Character Management User Flows', () => {
  let authHelper: AuthHelper

  test.beforeEach(async ({ page, request, baseURL }) => {
    authHelper = new AuthHelper(page, request, baseURL!)
    // Login before each test
    await authHelper.authenticateUser()
    await page.goto('/characters')
  })

  test.describe('Character Creation', () => {
    test('should create a new public character', async ({ page }) => {
      // Click create character button
      await page.click(selectors.characters.createButton)
      await expect(page).toHaveURL('/characters/new')

      // Fill character form
      await page.fill(selectors.characters.nameInput, testCharacters.basic.name)
      await page.fill(selectors.characters.descriptionInput, testCharacters.basic.description)
      await page.fill(selectors.characters.promptInput, testCharacters.basic.system_prompt)
      await page.selectOption(selectors.characters.categorySelect, testCharacters.basic.category)
      
      // Add tags
      for (const tag of testCharacters.basic.tags) {
        await page.fill(selectors.characters.tagsInput, tag)
        await page.press(selectors.characters.tagsInput, 'Enter')
      }

      // Submit form
      await page.click('button[type="submit"]')

      // Verify creation
      await expect(page).toHaveURL(/\/characters\/\d+/, { timeout: testTimeouts.navigation })
      await expect(page.locator('h1')).toContainText(testCharacters.basic.name)
    })

    test('should create a private character', async ({ page }) => {
      await page.click(selectors.characters.createButton)

      // Fill form with private character data
      await page.fill(selectors.characters.nameInput, testCharacters.privateChar.name)
      await page.fill(selectors.characters.descriptionInput, testCharacters.privateChar.description)
      await page.fill(selectors.characters.promptInput, testCharacters.privateChar.system_prompt)
      
      // Check private checkbox
      await page.check(selectors.characters.privateCheckbox)

      await page.click('button[type="submit"]')

      // Verify private indicator
      await expect(page.locator('[data-testid="private-indicator"]')).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await page.click(selectors.characters.createButton)

      // Try to submit empty form
      await page.click('button[type="submit"]')

      // Check for validation errors
      await expect(page.locator('text=Name is required')).toBeVisible()
      await expect(page.locator('text=System prompt is required')).toBeVisible()
    })

    test('should upload character avatar', async ({ page }) => {
      await page.click(selectors.characters.createButton)

      // Fill basic info
      await page.fill(selectors.characters.nameInput, 'Avatar Test Character')
      await page.fill(selectors.characters.promptInput, 'Test prompt')

      // Upload avatar
      const fileInput = page.locator(selectors.characters.avatarUpload)
      await fileInput.setInputFiles('tests/fixtures/test-avatar.png')

      // Wait for upload preview
      await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible()

      await page.click('button[type="submit"]')

      // Verify avatar is displayed
      await expect(page.locator('[data-testid="character-avatar"]')).toBeVisible()
    })
  })

  test.describe('Character Listing and Search', () => {
    test('should display character list', async ({ page }) => {
      // Verify character list is visible
      await expect(page.locator(selectors.characters.list)).toBeVisible()
      
      // Should have at least one character card
      const cards = page.locator(selectors.characters.card)
      await expect(cards).toHaveCount(await cards.count())
    })

    test('should search characters by name', async ({ page }) => {
      // Create a unique character first
      const uniqueName = `Search Test ${Date.now()}`
      await page.click(selectors.characters.createButton)
      await page.fill(selectors.characters.nameInput, uniqueName)
      await page.fill(selectors.characters.promptInput, 'Test prompt')
      await page.click('button[type="submit"]')
      
      // Go back to characters list
      await page.goto('/characters')

      // Search for the character
      await page.fill('[data-testid="search-input"]', uniqueName)
      await page.press('[data-testid="search-input"]', 'Enter')

      // Verify search results
      await expect(page.locator(selectors.characters.card)).toHaveCount(1)
      await expect(page.locator(selectors.characters.card)).toContainText(uniqueName)
    })

    test('should filter characters by category', async ({ page }) => {
      // Select a category filter
      await page.selectOption('[data-testid="category-filter"]', 'Assistant')

      // Verify filtered results
      const cards = page.locator(selectors.characters.card)
      const count = await cards.count()
      
      for (let i = 0; i < count; i++) {
        await expect(cards.nth(i)).toContainText('Assistant')
      }
    })

    test('should toggle between public and my characters', async ({ page }) => {
      // View my characters
      await page.click('[data-testid="my-characters-tab"]')
      
      // Should only show characters created by current user
      await expect(page.locator('[data-testid="creator-badge"]')).toHaveText(/You|My Character/)
      
      // Switch back to all characters
      await page.click('[data-testid="all-characters-tab"]')
      await expect(page.locator(selectors.characters.card).first()).toBeVisible()
    })
  })

  test.describe('Character Editing', () => {
    test('should edit character details', async ({ page }) => {
      // Create a character first
      await page.click(selectors.characters.createButton)
      const originalName = `Edit Test ${Date.now()}`
      await page.fill(selectors.characters.nameInput, originalName)
      await page.fill(selectors.characters.promptInput, 'Original prompt')
      await page.click('button[type="submit"]')

      // Click edit button
      await page.click(selectors.characters.editButton)

      // Update character details
      const updatedName = `${originalName} Updated`
      await page.fill(selectors.characters.nameInput, updatedName)
      await page.fill(selectors.characters.descriptionInput, 'Updated description')
      
      // Save changes
      await page.click('button[type="submit"]')

      // Verify updates
      await expect(page.locator('h1')).toContainText(updatedName)
      await expect(page.locator('[data-testid="character-description"]')).toContainText('Updated description')
    })

    test('should not allow editing other users characters', async ({ page }) => {
      // Navigate to a public character not owned by current user
      await page.goto('/characters')
      
      // Find a character without "You" badge
      const otherUserCard = page.locator(selectors.characters.card).filter({
        hasNot: page.locator('[data-testid="creator-badge"]:has-text("You")')
      }).first()
      
      await otherUserCard.click()

      // Edit button should not be visible
      await expect(page.locator(selectors.characters.editButton)).not.toBeVisible()
    })
  })

  test.describe('Character Deletion', () => {
    test('should delete a character with confirmation', async ({ page }) => {
      // Create a character to delete
      await page.click(selectors.characters.createButton)
      const deleteName = `Delete Test ${Date.now()}`
      await page.fill(selectors.characters.nameInput, deleteName)
      await page.fill(selectors.characters.promptInput, 'To be deleted')
      await page.click('button[type="submit"]')

      // Click delete button
      await page.click(selectors.characters.deleteButton)

      // Confirm deletion in dialog
      await page.click('button:has-text("Confirm Delete")')

      // Verify deletion
      await expect(page).toHaveURL('/characters')
      await expect(page.locator(`text=${deleteName}`)).not.toBeVisible()
    })

    test('should cancel character deletion', async ({ page }) => {
      // Navigate to a character
      await page.goto('/characters')
      await page.locator(selectors.characters.card).first().click()
      
      const characterName = await page.locator('h1').textContent()

      // Click delete button
      await page.click(selectors.characters.deleteButton)

      // Cancel deletion
      await page.click('button:has-text("Cancel")')

      // Character should still exist
      await expect(page.locator('h1')).toContainText(characterName!)
    })
  })

  test.describe('Character Interaction', () => {
    test('should start a chat with a character', async ({ page }) => {
      // Navigate to a character
      await page.goto('/characters')
      await page.locator(selectors.characters.card).first().click()

      // Click start chat button
      await page.click('[data-testid="start-chat-button"]')

      // Should navigate to chat interface
      await expect(page).toHaveURL(/\/chats\/\d+/)
      await expect(page.locator(selectors.chat.container)).toBeVisible()
    })

    test('should show character details', async ({ page }) => {
      // Navigate to a character
      await page.goto('/characters')
      const card = page.locator(selectors.characters.card).first()
      const cardName = await card.locator('[data-testid="character-name"]').textContent()
      
      await card.click()

      // Verify character details page
      await expect(page.locator('h1')).toContainText(cardName!)
      await expect(page.locator('[data-testid="character-description"]')).toBeVisible()
      await expect(page.locator('[data-testid="character-stats"]')).toBeVisible()
    })
  })
})