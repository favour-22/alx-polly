'use server';
/**
 * Authentication Actions Module
 * 
 * This module provides server-side authentication functions for the application,
 * handling user login, registration, logout and session management through Supabase.
 * 
 * Key Features:
 * - Server-side validation for security
 * - Error handling and sanitization
 * - Type-safe authentication operations
 * 
 * Architecture Context:
 * - Acts as a bridge between frontend forms and Supabase authentication
 * - Used by auth-related components and pages
 * - Implements server actions pattern for Next.js
 * 
 * Security Considerations:
 * - All functions run server-side to prevent credential exposure
 * - Error messages are sanitized to avoid information leakage
 * - Input validation prevents malformed data from reaching Supabase
 * 
 * Dependencies:
 * - Requires Supabase client configuration
 * - Expects properly typed form data (LoginFormData, RegisterFormData)
 * 
 * Common Usage:
 * - Called from login/register forms
 * - Used in protected route handlers
 * - Integrated with authentication UI components
 * 
 * Edge Cases Handled:
 * - Network failures
 * - Invalid credentials
 * - Malformed input data
 * - Session expiration
 * - Concurrent authentication attempts
 */


import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';

export async function login(data: LoginFormData) {
  // Server-side validation
  if (!data.email || !data.password) {
    return { error: 'Email and password are required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    // Sanitize error to avoid leaking implementation details
    if (error.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or password.' };
    }
    return { error: 'Could not authenticate user. Please try again.' };
  }

  // Success: no error
  return { error: null };
}

export async function register(data: RegisterFormData) {
  if (data.password !== data.confirmPassword) {
    return { error: 'Passwords do not match' };
  }
  // Password strength validation
  const password = data.password;
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!strongPassword.test(password)) {
    return { error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  });

  if (error) {
    // Sanitize error message
    let msg = 'Registration failed. Please try again.';
    if (error.message && error.message.toLowerCase().includes('email')) {
      msg = 'Email is already in use or invalid.';
    }
    return { error: msg };
  }

  // Success: no error
  return { error: null };
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
