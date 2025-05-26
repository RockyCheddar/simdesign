import { User, LoginCredentials } from '@/types';

// Storage keys
const AUTH_STORAGE_KEY = 'healthcare_sim_auth';
const USER_STORAGE_KEY = 'healthcare_sim_user';

// Mock user database
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'demo@simcase.ai': {
    password: 'demo123',
    user: {
      id: '1',
      email: 'demo@simcase.ai',
      name: 'Demo User',
      role: 'instructor',
    },
  },
};

/**
 * Mock authentication function
 */
export const authenticateUser = async (
  credentials: LoginCredentials
): Promise<User | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const userRecord = MOCK_USERS[credentials.email];
  if (userRecord && userRecord.password === credentials.password) {
    return userRecord.user;
  }

  return null;
};

/**
 * Save auth state to localStorage
 */
export const saveAuthState = (user: User): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save auth state:', error);
  }
};

/**
 * Load auth state from localStorage
 */
export const loadAuthState = (): { isAuthenticated: boolean; user: User | null } => {
  try {
    const isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    const user = userJson ? JSON.parse(userJson) : null;

    return { isAuthenticated, user };
  } catch (error) {
    console.error('Failed to load auth state:', error);
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Clear auth state from localStorage
 */
export const clearAuthState = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth state:', error);
  }
};

/**
 * Check if code is running in browser
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
}; 