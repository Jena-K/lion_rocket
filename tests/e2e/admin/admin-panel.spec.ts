import { test, expect } from '@playwright/test'
import { testUsers, selectors, apiEndpoints } from '../fixtures/test-data'
import { AuthHelper } from '../helpers/auth.helper'

test.describe('Admin Panel User Flows', () => {
  let authHelper: AuthHelper

  test.beforeEach(async ({ page, request, baseURL }) => {
    authHelper = new AuthHelper(page, request, baseURL!)
    
    // Login as admin
    await authHelper.authenticateUser(testUsers.admin)
    await page.goto('/admin')
  })

  test.describe('Admin Dashboard', () => {
    test('should display admin dashboard with statistics', async ({ page }) => {
      // Verify admin dashboard loads
      await expect(page).toHaveURL('/admin')
      await expect(page.locator('h1')).toContainText('Admin Dashboard')

      // Check for statistics cards
      await expect(page.locator('[data-testid="stat-total-users"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-total-characters"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-total-chats"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-active-users"]')).toBeVisible()

      // Verify charts/graphs load
      await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible()
      await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible()
    })

    test('should refresh statistics', async ({ page }) => {
      // Get initial user count
      const initialCount = await page.locator('[data-testid="stat-total-users"] .value').textContent()

      // Click refresh button
      await page.click('[data-testid="refresh-stats-button"]')

      // Wait for loading state
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible()

      // Stats should be updated (at minimum, timestamp should change)
      await expect(page.locator('[data-testid="last-updated"]')).toContainText(/just now|seconds ago/)
    })
  })

  test.describe('User Management', () => {
    test('should display user list with pagination', async ({ page }) => {
      // Navigate to users section
      await page.click('[data-testid="admin-nav-users"]')
      await expect(page).toHaveURL('/admin/users')

      // Verify user table
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible()
      
      // Should have header row and at least one user
      const rows = page.locator('[data-testid="user-row"]')
      await expect(rows).toHaveCount(await rows.count())

      // Check pagination controls
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible()
    })

    test('should search users', async ({ page }) => {
      await page.click('[data-testid="admin-nav-users"]')

      // Search for admin user
      await page.fill('[data-testid="user-search"]', testUsers.admin.username)
      await page.press('[data-testid="user-search"]', 'Enter')

      // Should filter results
      await expect(page.locator('[data-testid="user-row"]')).toHaveCount(1)
      await expect(page.locator('[data-testid="user-row"]')).toContainText(testUsers.admin.username)
    })

    test('should view user details', async ({ page }) => {
      await page.click('[data-testid="admin-nav-users"]')

      // Click on a user row
      await page.locator('[data-testid="user-row"]').first().click()

      // Should show user details modal/page
      await expect(page.locator('[data-testid="user-details"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-activity"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-characters"]')).toBeVisible()
    })

    test('should toggle user admin status', async ({ page }) => {
      await page.click('[data-testid="admin-nav-users"]')

      // Find a non-admin user
      const regularUserRow = page.locator('[data-testid="user-row"]').filter({
        has: page.locator('[data-testid="admin-badge"]', { hasText: 'User' })
      }).first()

      // Click admin toggle
      await regularUserRow.locator('[data-testid="toggle-admin"]').click()

      // Confirm action
      await page.click('button:has-text("Confirm")')

      // Verify status changed
      await expect(regularUserRow.locator('[data-testid="admin-badge"]')).toContainText('Admin')
    })

    test('should ban/unban user', async ({ page }) => {
      await page.click('[data-testid="admin-nav-users"]')

      // Find an active user
      const activeUserRow = page.locator('[data-testid="user-row"]').filter({
        has: page.locator('[data-testid="status-badge"]', { hasText: 'Active' })
      }).first()

      // Click ban button
      await activeUserRow.locator('[data-testid="ban-user-button"]').click()

      // Enter ban reason
      await page.fill('[data-testid="ban-reason"]', 'Test ban for E2E testing')
      await page.click('button:has-text("Ban User")')

      // Verify user is banned
      await expect(activeUserRow.locator('[data-testid="status-badge"]')).toContainText('Banned')

      // Unban user
      await activeUserRow.locator('[data-testid="unban-user-button"]').click()
      await page.click('button:has-text("Unban")')

      // Verify user is active again
      await expect(activeUserRow.locator('[data-testid="status-badge"]')).toContainText('Active')
    })
  })

  test.describe('Character Management', () => {
    test('should list all characters with creator info', async ({ page }) => {
      await page.click('[data-testid="admin-nav-characters"]')
      await expect(page).toHaveURL('/admin/characters')

      // Should show character table with additional admin columns
      await expect(page.locator('[data-testid="characters-admin-table"]')).toBeVisible()
      
      // Verify admin-specific columns
      await expect(page.locator('th:has-text("Creator")')).toBeVisible()
      await expect(page.locator('th:has-text("Created Date")')).toBeVisible()
      await expect(page.locator('th:has-text("Total Chats")')).toBeVisible()
      await expect(page.locator('th:has-text("Status")')).toBeVisible()
    })

    test('should toggle character visibility', async ({ page }) => {
      await page.click('[data-testid="admin-nav-characters"]')

      // Find a visible character
      const characterRow = page.locator('[data-testid="character-admin-row"]').first()
      
      // Toggle visibility
      await characterRow.locator('[data-testid="toggle-visibility"]').click()
      
      // Confirm action
      await page.click('button:has-text("Hide Character")')

      // Verify status changed
      await expect(characterRow.locator('[data-testid="visibility-badge"]')).toContainText('Hidden')
    })

    test('should delete inappropriate character', async ({ page }) => {
      await page.click('[data-testid="admin-nav-characters"]')

      // Find a character to delete
      const characterRow = page.locator('[data-testid="character-admin-row"]').first()
      const characterName = await characterRow.locator('[data-testid="character-name"]').textContent()

      // Click delete button
      await characterRow.locator('[data-testid="admin-delete-character"]').click()

      // Provide reason
      await page.fill('[data-testid="delete-reason"]', 'Inappropriate content - E2E test')
      await page.click('button:has-text("Delete Character")')

      // Verify deletion
      await expect(page.locator(`text=${characterName}`)).not.toBeVisible()
    })
  })

  test.describe('System Settings', () => {
    test('should view and update system settings', async ({ page }) => {
      await page.click('[data-testid="admin-nav-settings"]')
      await expect(page).toHaveURL('/admin/settings')

      // Check settings sections
      await expect(page.locator('[data-testid="general-settings"]')).toBeVisible()
      await expect(page.locator('[data-testid="api-settings"]')).toBeVisible()
      await expect(page.locator('[data-testid="security-settings"]')).toBeVisible()

      // Update a setting
      await page.fill('[data-testid="site-name-input"]', 'Lion Rocket Test')
      await page.click('[data-testid="save-general-settings"]')

      // Verify save confirmation
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Settings saved')
    })

    test('should manage API keys', async ({ page }) => {
      await page.click('[data-testid="admin-nav-settings"]')
      await page.click('[data-testid="api-settings-tab"]')

      // View current API key (masked)
      await expect(page.locator('[data-testid="claude-api-key"]')).toHaveValue(/\*{10,}/)

      // Generate new API key
      await page.click('[data-testid="rotate-api-key"]')
      await page.click('button:has-text("Confirm Rotation")')

      // Verify new key generated
      await expect(page.locator('[data-testid="new-api-key-modal"]')).toBeVisible()
    })
  })

  test.describe('Activity Monitoring', () => {
    test('should view system logs', async ({ page }) => {
      await page.click('[data-testid="admin-nav-logs"]')
      await expect(page).toHaveURL('/admin/logs')

      // Should display log entries
      await expect(page.locator('[data-testid="log-entries"]')).toBeVisible()
      
      // Filter logs by level
      await page.selectOption('[data-testid="log-level-filter"]', 'error')
      
      // Should only show error logs
      const logEntries = page.locator('[data-testid="log-entry"]')
      const count = await logEntries.count()
      
      for (let i = 0; i < count; i++) {
        await expect(logEntries.nth(i)).toContainText(/ERROR|Error/)
      }
    })

    test('should export usage reports', async ({ page }) => {
      await page.click('[data-testid="admin-nav-reports"]')

      // Select date range
      await page.fill('[data-testid="report-start-date"]', '2024-01-01')
      await page.fill('[data-testid="report-end-date"]', '2024-01-31')

      // Select report type
      await page.selectOption('[data-testid="report-type"]', 'usage-summary')

      // Generate report
      const downloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="generate-report"]')
      
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('usage-report')
    })
  })

  test.describe('Content Moderation', () => {
    test('should review flagged content', async ({ page }) => {
      await page.click('[data-testid="admin-nav-moderation"]')
      await expect(page).toHaveURL('/admin/moderation')

      // Check for flagged items
      const flaggedItems = page.locator('[data-testid="flagged-item"]')
      const itemCount = await flaggedItems.count()

      if (itemCount > 0) {
        // Review first item
        await flaggedItems.first().click()

        // Should show moderation options
        await expect(page.locator('[data-testid="moderation-modal"]')).toBeVisible()
        await expect(page.locator('[data-testid="approve-button"]')).toBeVisible()
        await expect(page.locator('[data-testid="reject-button"]')).toBeVisible()
        await expect(page.locator('[data-testid="ban-user-button"]')).toBeVisible()
      }
    })

    test('should bulk moderate content', async ({ page }) => {
      await page.click('[data-testid="admin-nav-moderation"]')

      // Select multiple items
      await page.check('[data-testid="select-all-flagged"]')

      // Bulk approve
      await page.click('[data-testid="bulk-actions"]')
      await page.click('[data-testid="bulk-approve"]')

      // Confirm action
      await page.click('button:has-text("Approve All")')

      // Verify items removed from queue
      await expect(page.locator('[data-testid="moderation-empty"]')).toBeVisible()
    })
  })
})