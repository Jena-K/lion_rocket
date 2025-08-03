import { Page, APIRequestContext } from '@playwright/test'
import { testUsers, apiEndpoints } from '../fixtures/test-data'

export class AuthHelper {
  constructor(
    private page: Page,
    private request: APIRequestContext,
    private baseURL: string
  ) {}

  /**
   * Register a new user via API
   */
  async registerUser(user = testUsers.newUser) {
    const response = await this.request.post(`${this.baseURL}${apiEndpoints.auth.register}`, {
      data: user
    })
    
    if (response.ok()) {
      const data = await response.json()
      return {
        token: data.access_token,
        user: data.user
      }
    }
    
    throw new Error(`Registration failed: ${response.status()}`)
  }

  /**
   * Login user via API
   */
  async loginUser(user = testUsers.regular) {
    const response = await this.request.post(`${this.baseURL}${apiEndpoints.auth.login}`, {
      form: {
        username: user.username,
        password: user.password
      }
    })
    
    if (response.ok()) {
      const data = await response.json()
      return {
        token: data.access_token,
        user: data.user
      }
    }
    
    throw new Error(`Login failed: ${response.status()}`)
  }

  /**
   * Set authentication token in browser context
   */
  async setAuthToken(token: string) {
    await this.page.evaluate((token) => {
      localStorage.setItem('auth_token', token)
    }, token)
  }

  /**
   * Login and set authentication
   */
  async authenticateUser(user = testUsers.regular) {
    try {
      // Try login first
      const { token, user: userData } = await this.loginUser(user)
      await this.setAuthToken(token)
      return { token, user: userData }
    } catch (error) {
      // If login fails, try to register
      if (user === testUsers.regular) {
        const { token, user: userData } = await this.registerUser(user)
        await this.setAuthToken(token)
        return { token, user: userData }
      }
      throw error
    }
  }

  /**
   * Logout user
   */
  async logout() {
    await this.page.evaluate(() => {
      localStorage.removeItem('auth_token')
    })
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.page.evaluate(() => {
      return localStorage.getItem('auth_token')
    })
    return !!token
  }

  /**
   * Get current user info via API
   */
  async getCurrentUser(token: string) {
    const response = await this.request.get(`${this.baseURL}${apiEndpoints.auth.me}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok()) {
      return await response.json()
    }
    
    return null
  }

  /**
   * Refresh token via API
   */
  async refreshToken(token: string) {
    const response = await this.request.post(`${this.baseURL}${apiEndpoints.auth.refresh}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok()) {
      const data = await response.json()
      return data.access_token
    }
    
    throw new Error(`Token refresh failed: ${response.status()}`)
  }
}