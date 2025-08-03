import { useNotificationStore } from '../stores/notification'
import router from '../router'

export interface AppError {
  code: string
  message: string
  details?: any
  statusCode?: number
}

export class ErrorHandler {
  private static notificationStore = useNotificationStore()

  // Handle API errors
  static handleApiError(error: any): void {
    const statusCode = error.response?.status
    const message = error.response?.data?.detail || error.message

    switch (statusCode) {
      case 400:
        this.handleBadRequest(error)
        break
      case 401:
        this.handleUnauthorized(error)
        break
      case 403:
        this.handleForbidden(error)
        break
      case 404:
        this.handleNotFound(error)
        break
      case 422:
        this.handleValidationError(error)
        break
      case 429:
        this.handleRateLimit(error)
        break
      case 500:
        this.handleServerError(error)
        break
      default:
        this.handleGenericError(error)
    }
  }

  // Handle specific error types
  private static handleBadRequest(error: any): void {
    const message = error.response?.data?.detail || '잘못된 요청입니다.'
    this.notificationStore.error(message, '요청 오류')
  }

  private static handleUnauthorized(error: any): void {
    this.notificationStore.error('인증이 필요합니다. 다시 로그인해주세요.', '인증 오류')
    // Router will handle redirect via interceptor
  }

  private static handleForbidden(error: any): void {
    this.notificationStore.error('이 작업을 수행할 권한이 없습니다.', '권한 오류')
  }

  private static handleNotFound(error: any): void {
    const resource = error.response?.data?.resource || '리소스'
    this.notificationStore.error(`${resource}를 찾을 수 없습니다.`, '찾을 수 없음')
  }

  private static handleValidationError(error: any): void {
    const errors = error.response?.data?.detail

    if (Array.isArray(errors)) {
      errors.forEach((err: any) => {
        const field = err.loc?.join('.') || '알 수 없는 필드'
        const message = `${field}: ${err.msg}`
        this.notificationStore.error(message, '입력 검증 오류')
      })
    } else {
      this.notificationStore.error('입력값을 확인해주세요.', '검증 오류')
    }
  }

  private static handleRateLimit(error: any): void {
    const retryAfter = error.response?.headers?.['retry-after']
    const message = retryAfter
      ? `${retryAfter}초 후에 다시 시도해주세요.`
      : '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.'

    this.notificationStore.warning(message, '요청 제한')
  }

  private static handleServerError(error: any): void {
    this.notificationStore.error(
      '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      '서버 오류'
    )

    // Log error for debugging
    console.error('Server error:', error)
  }

  private static handleGenericError(error: any): void {
    if (!error.response) {
      this.notificationStore.error('네트워크 연결을 확인해주세요.', '연결 오류')
    } else {
      const message =
        error.response?.data?.detail || error.message || '알 수 없는 오류가 발생했습니다.'
      this.notificationStore.error(message, '오류')
    }
  }

  // Handle application errors
  static handleAppError(error: AppError): void {
    this.notificationStore.error(error.message, '애플리케이션 오류')

    // Log for debugging
    console.error('App error:', error)
  }

  // Handle uncaught errors
  static handleUncaughtError(error: Error): void {
    this.notificationStore.error('예기치 않은 오류가 발생했습니다.', '시스템 오류')

    // Log for debugging
    console.error('Uncaught error:', error)
  }

  // Initialize global error handlers
  static initialize(): void {
    // Handle Vue errors
    window.addEventListener('error', (event) => {
      this.handleUncaughtError(event.error)
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUncaughtError(new Error(event.reason))
    })
  }
}

export default ErrorHandler
