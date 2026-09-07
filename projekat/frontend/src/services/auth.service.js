// frontend/src/services/auth.service.js

import { apiRequest } from './api.js';

/**
 * Sends login credentials to the backend.
 */
export function loginUser(identifier, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

/**
 * Clears the session.
 */
export function logoutUser() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

/**
 * Forgot password.
 */
export function requestPasswordReset(email) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password.
 */
export function resetPassword(token, password) {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

/**
 * Public faculties list.
 */
export function getPublicFaculties() {
  return apiRequest('/auth/faculties');
}

/**
 * Username/email availability check.
 */
export function checkAvailability(type, value) {
  return apiRequest(
    `/auth/check?type=${encodeURIComponent(type)}&value=${encodeURIComponent(value)}`
  );
}

/**
 * Register user.
 */
export function register(data) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getPublicOdsjeci(fakultetID) {
  return apiRequest(`/auth/faculties/${fakultetID}/odsjeci`);
}

export function verifyEmailToken(token) {
  return apiRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export function resendVerificationEmail(email) {
  return apiRequest('/auth/resend-verification-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}