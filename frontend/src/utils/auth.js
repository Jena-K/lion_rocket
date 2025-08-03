/**
 * JWT 토큰 관리 유틸리티
 */
export class TokenManager {
    static TOKEN_KEY = 'auth_token';
    static USER_KEY = 'auth_user';
    static EXPIRY_KEY = 'token_expiry';
    /**
     * 토큰 저장
     */
    static setToken(token, expiryHours = 24) {
        localStorage.setItem(this.TOKEN_KEY, token);
        // 토큰 만료 시간 계산 및 저장
        const expiry = new Date().getTime() + expiryHours * 60 * 60 * 1000;
        localStorage.setItem(this.EXPIRY_KEY, expiry.toString());
    }
    /**
     * 토큰 가져오기 (만료 확인 포함)
     */
    static getToken() {
        const expiry = localStorage.getItem(this.EXPIRY_KEY);
        // 토큰 만료 확인
        if (expiry && new Date().getTime() > parseInt(expiry)) {
            this.removeToken();
            return null;
        }
        return localStorage.getItem(this.TOKEN_KEY);
    }
    /**
     * 토큰 제거
     */
    static removeToken() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.EXPIRY_KEY);
    }
    /**
     * 사용자 정보 저장
     */
    static setUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    /**
     * 사용자 정보 가져오기
     */
    static getUser() {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr)
            return null;
        try {
            return JSON.parse(userStr);
        }
        catch (error) {
            console.error('Failed to parse user data:', error);
            return null;
        }
    }
    /**
     * 토큰 유효성 검사
     */
    static isTokenValid() {
        const token = this.getToken();
        return !!token;
    }
    /**
     * 토큰 만료까지 남은 시간 (밀리초)
     */
    static getTimeToExpiry() {
        const expiry = localStorage.getItem(this.EXPIRY_KEY);
        if (!expiry)
            return 0;
        const expiryTime = parseInt(expiry);
        const currentTime = new Date().getTime();
        return Math.max(0, expiryTime - currentTime);
    }
    /**
     * 토큰 자동 갱신 필요 여부 확인 (만료 1시간 전)
     */
    static shouldRefreshToken() {
        const timeToExpiry = this.getTimeToExpiry();
        const oneHour = 60 * 60 * 1000;
        return timeToExpiry > 0 && timeToExpiry < oneHour;
    }
}
/**
 * JWT 토큰에서 페이로드 추출
 */
export function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''));
        return JSON.parse(jsonPayload);
    }
    catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}
/**
 * 토큰 만료 시간 확인
 */
export function isTokenExpired(token) {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp)
        return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
}
