import { API } from '../../api/api';
import { LoginCredentials, RegisterCredentials, AuthResponse, AuthError } from './types';

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API.BASEURL;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const url = `${this.baseURL}${API.LogIn}`;
      console.log('🔗 Attempting to connect to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          // NestJS error format: { message: string | string[], statusCode: number, error: string }
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ');
          } else {
            errorMessage = errorData.message || errorData.error || 'Login failed';
          }
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || 'Login failed';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Store token if provided (backend returns accessToken)
      const token = data.accessToken || data.token;
      if (token) {
        this.setToken(token);
      }

      return {
        success: true,
        message: data.message || 'Login successful',
        token: token,
        user: data.user,
      };
    } catch (error) {
      // Handle network errors (backend not running, CORS issues, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ Network error:', error);
        console.error('💡 Make sure:');
        console.error('   1. Backend is running on http://localhost:3001');
        console.error('   2. Run: cd ecommerce-server && npm run start:dev');
        console.error('   3. Check if the API URL is correct:', this.baseURL);
        return {
          success: false,
          message: `Unable to connect to server at ${this.baseURL}. Please make sure the backend is running on port 3001.`,
        };
      }
      
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  /**
   * Register a new user with email and password
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Validate password confirmation if provided
      if (credentials.confirmPassword && credentials.password !== credentials.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match',
        };
      }

      const response = await fetch(`${this.baseURL}${API.Register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          // NestJS error format: { message: string | string[], statusCode: number, error: string }
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ');
          } else {
            errorMessage = errorData.message || errorData.error || 'Registration failed';
          }
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || 'Registration failed';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Store token if provided (backend returns accessToken)
      const token = data.accessToken || data.token;
      if (token) {
        this.setToken(token);
      }

      return {
        success: true,
        message: data.message || 'Registration successful',
        token: token,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch(`${this.baseURL}auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      this.clearToken();
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }

      return {
        success: true,
        message: data.message || 'Password reset email sent',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return {
        success: true,
        message: data.message || 'Password reset successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return {
          success: false,
          message: 'Authentication required',
        };
      }

      const response = await fetch(`${this.baseURL}auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return {
        success: true,
        message: data.message || 'Password changed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  /**
   * Verify if user is authenticated
   */
  async verifyAuth(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No token found',
        };
      }

      const response = await fetch(`${this.baseURL}auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        this.clearToken();
        throw new Error(data.message || 'Token verification failed');
      }

      return {
        success: true,
        user: data.user,
        token: token,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Authentication verification failed',
      };
    }
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  private clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
export default authService;

