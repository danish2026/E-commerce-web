/**
 * JWT Utility Functions
 * Helper functions to decode and extract data from JWT tokens
 */

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification
 * Note: This only decodes the token, it doesn't verify the signature
 * For production, always verify tokens on the backend
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Get role from JWT token
 */
export const getRoleFromToken = (token: string | null): string | null => {
  if (!token) {
    return null;
  }
  const decoded = decodeJwt(token);
  return decoded?.role || null;
};

/**
 * Get user ID from JWT token
 */
export const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) {
    return null;
  }
  const decoded = decodeJwt(token);
  return decoded?.sub || null;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};



