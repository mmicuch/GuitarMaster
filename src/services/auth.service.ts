import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private static instance: AuthService;
  private readonly API_URL = 'https://api.guitarmaster.com'; // Replace with actual API URL

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const mockUser: User = {
        id: user.uid,
        email: user.email || '',
        username: user.email?.split('@')[0] || '',
      };
      const mockToken = 'mock-jwt-token';

      // Store auth data
      await this.setAuthData({ user: mockUser, token: mockToken });

      return { user: mockUser, token: mockToken };
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const mockUser: User = {
        id: user.uid,
        email: user.email || '',
        username,
      };
      const mockToken = 'mock-jwt-token';

      // Send email verification
      await user?.sendEmailVerification();

      // Store auth data
      await this.setAuthData({ user: mockUser, token: mockToken });

      return { user: mockUser, token: mockToken };
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('auth');
      // TODO: Add any additional cleanup needed
    } catch (error) {
      console.error('Logout error:', error);
      throw this.handleAuthError(error);
    }
  }

  async checkAuth(): Promise<AuthResponse | null> {
    try {
      const authData = await AsyncStorage.getItem('auth');
      if (!authData) return null;

      const parsedData = JSON.parse(authData);
      // TODO: Validate token with backend
      return parsedData;
    } catch (error) {
      console.error('Check auth error:', error);
      return null;
    }
  }

  private async setAuthData(authData: AuthResponse): Promise<void> {
    try {
      await AsyncStorage.setItem('auth', JSON.stringify(authData));
    } catch (error) {
      console.error('Set auth data error:', error);
      throw error;
    }
  }

  getAuthHeader(): { Authorization: string } | undefined {
    // TODO: Implement proper token management
    return { Authorization: 'Bearer mock-token' };
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // TODO: Replace with actual API call
      const authData = await this.checkAuth();
      if (!authData) throw new Error('Not authenticated');

      const updatedUser = {
        ...authData.user,
        ...updates,
      };

      await this.setAuthData({
        user: updatedUser,
        token: authData.token,
      });

      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw this.handleAuthError(error);
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user || !user.email) throw new Error('No user logged in');

      // Reauthenticate user before password change
      const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);

      // Update password
      await user.updatePassword(newPassword);
    } catch (error) {
      console.error('Update password error:', error);
      throw this.handleAuthError(error);
    }
  }

  async verifyPasswordResetCode(code: string): Promise<boolean> {
    try {
      await auth().verifyPasswordResetCode(code);
      return true;
    } catch (error) {
      console.error('Verify password reset code error:', error);
      throw this.handleAuthError(error);
    }
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await auth().confirmPasswordReset(code, newPassword);
    } catch (error) {
      console.error('Confirm password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  private handleAuthError(error: any): Error {
    console.error('Auth error:', error);

    if (error.code === 'auth/user-not-found') {
      return new Error('No user found with this email address');
    }
    if (error.code === 'auth/wrong-password') {
      return new Error('Invalid password');
    }
    if (error.code === 'auth/email-already-in-use') {
      return new Error('Email address is already registered');
    }
    if (error.code === 'auth/invalid-email') {
      return new Error('Invalid email address format');
    }
    if (error.code === 'auth/weak-password') {
      return new Error('Password is too weak');
    }

    return new Error('Authentication failed. Please try again.');
  }

  getCurrentUser() {
    return auth().currentUser;
  }
}