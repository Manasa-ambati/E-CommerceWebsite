// Validation utilities for signup and login forms

export interface ValidationErrors {
  [key: string]: string;
}

// Email validation regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (allows +, -, spaces, parentheses)
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,}$/;

// Password strength requirements
interface PasswordStrength {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): string => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return '';
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): PasswordStrength => {
  const errors: string[] = [];
  
  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (password.length > 50) {
    errors.push('Password must be less than 50 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate first name
 */
export const validateFirstName = (firstName: string): string => {
  if (!firstName || !firstName.trim()) {
    return 'First name is required';
  }
  
  if (firstName.trim().length < 2) {
    return 'First name must be at least 2 characters';
  }
  
  if (!/^[a-zA-Z\s\-']+$/.test(firstName.trim())) {
    return 'First name can only contain letters, hyphens, apostrophes, and spaces';
  }
  
  return '';
};

/**
 * Validate last name
 */
export const validateLastName = (lastName: string): string => {
  if (!lastName || !lastName.trim()) {
    return 'Last name is required';
  }
  
  if (lastName.trim().length < 2) {
    return 'Last name must be at least 2 characters';
  }
  
  if (!/^[a-zA-Z\s\-']+$/.test(lastName.trim())) {
    return 'Last name can only contain letters, hyphens, apostrophes, and spaces';
  }
  
  return '';
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): string => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required';
  }
  
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  
  if (!/^\d{10,}$/.test(cleaned)) {
    return 'Please enter a valid phone number (at least 10 digits)';
  }
  
  if (!PHONE_REGEX.test(phone)) {
    return 'Please enter a valid phone number';
  }
  
  return '';
};

/**
 * Validate OTP
 */
export const validateOtp = (otp: string): string => {
  if (!otp) {
    return 'OTP is required';
  }
  
  if (!/^\d{6}$/.test(otp)) {
    return 'OTP must be exactly 6 digits';
  }
  
  return '';
};

/**
 * Validate login form
 */
export const validateLoginForm = (email: string, password: string): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Email validation
  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }
  
  // Password validation (basic for login)
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 1) {
    errors.password = 'Password cannot be empty';
  }
  
  return errors;
};

/**
 * Validate signup form
 */
export const validateSignupForm = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // First name validation
  const firstNameError = validateFirstName(formData.firstName);
  if (firstNameError) {
    errors.firstName = firstNameError;
  }
  
  // Last name validation
  const lastNameError = validateLastName(formData.lastName);
  if (lastNameError) {
    errors.lastName = lastNameError;
  }
  
  // Email validation
  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  // Password validation
  const passwordResult = validatePassword(formData.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.errors[0]; // Show first error
  }
  
  // Phone validation
  const phoneError = validatePhone(formData.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }
  
  return errors;
};

/**
 * Get password strength score (for visual indicator)
 */
export const getPasswordStrength = (password: string): number => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  return Math.min(score, 5); // Return score out of 5
};
