import { test, expect } from '@playwright/test'
import { testUsers, selectors, testTimeouts } from '../fixtures/test-data'
import { AuthHelper } from '../helpers/auth.helper'

test.describe('Authentication User Flows', () => {
  let authHelper: AuthHelper

  test.beforeEach(async ({ page, request, baseURL }) => {
    authHelper = new AuthHelper(page, request, baseURL!)
    await page.goto('/')
  })

  test.describe('User Registration', () => {
    test('should successfully register a new user', async ({ page }) => {
      // Navigate to registration page
      await page.click('text=Sign Up')
      await expect(page).toHaveURL('/register')

      // Fill registration form
      const newUser = {
        username: `user_${Date.now()}`,
        email: `user_${Date.now()}@example.com`,
        password: 'SecurePass123!'
      }

      await page.fill(selectors.auth.usernameInput, newUser.username)
      await page.fill(selectors.auth.emailInput, newUser.email)
      await page.fill(selectors.auth.passwordInput, newUser.password)

      // Submit form
      await page.click(selectors.auth.submitButton)

      // Verify successful registration
      await expect(page).toHaveURL('/dashboard', { timeout: testTimeouts.navigation })
      await expect(page.locator(selectors.navigation.userMenu)).toContainText(newUser.username)
    })

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.click('text=Sign Up')

      // Try to submit empty form
      await page.click(selectors.auth.submitButton)
      await expect(page.locator(selectors.auth.errorMessage)).toBeVisible()

      // Invalid email
      await page.fill(selectors.auth.usernameInput, 'testuser')
      await page.fill(selectors.auth.emailInput, 'invalid-email')
      await page.fill(selectors.auth.passwordInput, 'pass')
      await page.click(selectors.auth.submitButton)

      await expect(page.locator(selectors.auth.errorMessage)).toContainText(/email|password/)
    })

    test('should prevent duplicate registration', async ({ page }) => {
      await page.click('text=Sign Up')

      // Try to register with existing user
      await page.fill(selectors.auth.usernameInput, testUsers.regular.username)
      await page.fill(selectors.auth.emailInput, testUsers.regular.email)
      await page.fill(selectors.auth.passwordInput, testUsers.regular.password)
      await page.click(selectors.auth.submitButton)

      await expect(page.locator(selectors.auth.errorMessage)).toContainText(/already exists|already registered/)
    })
  })

  test.describe('User Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      // Ensure user exists
      await authHelper.authenticateUser(testUsers.regular)
      await authHelper.logout()

      // Navigate to login page
      await page.click('text=Login')
      await expect(page).toHaveURL('/login')

      // Fill login form
      await page.fill(selectors.auth.usernameInput, testUsers.regular.username)
      await page.fill(selectors.auth.passwordInput, testUsers.regular.password)

      // Submit form
      await page.click(selectors.auth.submitButton)

      // Verify successful login
      await expect(page).toHaveURL('/dashboard', { timeout: testTimeouts.navigation })
      await expect(page.locator(selectors.navigation.userMenu)).toContainText(testUsers.regular.username)
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.click('text=Login')

      // Try invalid credentials
      await page.fill(selectors.auth.usernameInput, 'nonexistent')
      await page.fill(selectors.auth.passwordInput, 'wrongpassword')
      await page.click(selectors.auth.submitButton)

      await expect(page.locator(selectors.auth.errorMessage)).toContainText(/Invalid|incorrect|wrong/)
    })

    test('should redirect to login when accessing protected routes', async ({ page }) => {
      // Try to access protected route without authentication
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/login')

      await page.goto('/characters')
      await expect(page).toHaveURL('/login')

      await page.goto('/chats')
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('User Logout', () => {
    test('should successfully logout user', async ({ page }) => {
      // Login first
      await authHelper.authenticateUser(testUsers.regular)
      await page.goto('/dashboard')

      // Open user menu and logout
      await page.click(selectors.navigation.userMenu)
      await page.click(selectors.navigation.logoutButton)

      // Verify logout
      await expect(page).toHaveURL('/')
      await expect(page.locator('text=Login')).toBeVisible()
      
      // Verify cannot access protected routes
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Session Management', () => {
    test('should persist session across page reloads', async ({ page }) => {
      // Login
      const { token } = await authHelper.authenticateUser(testUsers.regular)
      await page.goto('/dashboard')

      // Reload page
      await page.reload()

      // Should still be logged in
      await expect(page).toHaveURL('/dashboard')
      await expect(page.locator(selectors.navigation.userMenu)).toBeVisible()
    })

    test('should handle expired token gracefully', async ({ page }) => {
      // Login with a token that will expire
      await authHelper.authenticateUser(testUsers.regular)
      await page.goto('/dashboard')

      // Simulate expired token
      await page.evaluate(() => {
        // Set an invalid token
        localStorage.setItem('auth_token', 'invalid-expired-token')
      })

      // Try to access protected resource
      await page.goto('/characters')

      // Should redirect to login
      await expect(page).toHaveURL('/login')
      await expect(page.locator(selectors.auth.errorMessage)).toContainText(/expired|invalid/)
    })
  })

  test.describe('Password Reset Flow', () => {
    test.skip('should request password reset', async ({ page }) => {
      // This test is skipped as password reset might not be implemented yet
      await page.click('text=Login')
      await page.click('text=Forgot Password?')
      
      await expect(page).toHaveURL('/reset-password')
      
      // Fill email
      await page.fill(selectors.auth.emailInput, testUsers.regular.email)
      await page.click('text=Send Reset Link')
      
      await expect(page.locator(selectors.auth.successMessage)).toContainText(/email sent|check your email/)
    })
  })

  test.describe('Admin Authentication', () => {
    test('should show admin menu for admin users', async ({ page }) => {
      // Login as admin
      await authHelper.authenticateUser(testUsers.admin)
      await page.goto('/dashboard')

      // Verify admin menu is visible
      await expect(page.locator(selectors.navigation.adminLink)).toBeVisible()
      
      // Navigate to admin panel
      await page.click(selectors.navigation.adminLink)
      await expect(page).toHaveURL('/admin')
    })

    test('should restrict admin access for regular users', async ({ page }) => {
      // Login as regular user
      await authHelper.authenticateUser(testUsers.regular)
      await page.goto('/dashboard')

      // Admin menu should not be visible
      await expect(page.locator(selectors.navigation.adminLink)).not.toBeVisible()
      
      // Direct navigation should be blocked
      await page.goto('/admin')
      await expect(page).toHaveURL('/unauthorized')
    })
  })
})