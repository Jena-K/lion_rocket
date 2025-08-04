export interface AppError {
    code: string;
    message: string;
    details?: any;
    statusCode?: number;
}
export declare class ErrorHandler {
    private static notificationStore;
    static handleApiError(error: any): void;
    private static handleBadRequest;
    private static handleUnauthorized;
    private static handleForbidden;
    private static handleNotFound;
    private static handleValidationError;
    private static handleRateLimit;
    private static handleServerError;
    private static handleGenericError;
    static handleAppError(error: AppError): void;
    static handleUncaughtError(error: Error): void;
    static initialize(): void;
}
export default ErrorHandler;
