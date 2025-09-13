'use server';

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
