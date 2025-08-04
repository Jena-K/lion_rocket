/**
 * JWT 토큰 관리 유틸리티
 */
export declare class TokenManager {
    private static TOKEN_KEY;
    private static USER_KEY;
    private static EXPIRY_KEY;
    /**
     * 토큰 저장
     */
    static setToken(token: string, expiryHours?: number): void;
    /**
     * 토큰 가져오기 (만료 확인 포함)
     */
    static getToken(): string | null;
    /**
     * 토큰 제거
     */
    static removeToken(): void;
    /**
     * 사용자 정보 저장
     */
    static setUser(user: any): void;
    /**
     * 사용자 정보 가져오기
     */
    static getUser(): any | null;
    /**
     * 토큰 유효성 검사
     */
    static isTokenValid(): boolean;
    /**
     * 토큰 만료까지 남은 시간 (밀리초)
     */
    static getTimeToExpiry(): number;
    /**
     * 토큰 자동 갱신 필요 여부 확인 (만료 1시간 전)
     */
    static shouldRefreshToken(): boolean;
}
/**
 * JWT 토큰에서 페이로드 추출
 */
export declare function decodeJWT(token: string): any;
/**
 * 토큰 만료 시간 확인
 */
export declare function isTokenExpired(token: string): boolean;
