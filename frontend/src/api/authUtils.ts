/**
 * Utility functions for authentication
 */

// Check if a token exists in localStorage
export const hasToken = (): boolean => {
  return !!localStorage.getItem('bearerToken');
};

// Get the token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('bearerToken');
};

// Set a token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('bearerToken', token);
};

// Remove the token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('bearerToken');
};

// Get authorization header
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
