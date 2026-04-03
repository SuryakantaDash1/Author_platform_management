/**
 * Password Validation Utilities
 * Implements BRD requirements for author password validation
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: {
    insufficientNumbers?: boolean;
    tooShort?: boolean;
  };
}

/**
 * Validate Author Password
 * - Must include at least 3 numbers
 * - Minimum 4 characters total
 */
export const validateAuthorPassword = (
  password: string,
  _firstName?: string
): PasswordValidationResult => {
  const errors: PasswordValidationResult['errors'] = {};

  // Count numbers in password
  const numbers = password.match(/\d/g);
  const numberCount = numbers ? numbers.length : 0;
  if (numberCount < 3) {
    errors.insufficientNumbers = true;
  }

  // Check minimum length
  const minLength = password.length >= 4;
  if (!minLength) {
    errors.tooShort = true;
  }

  return {
    valid: numberCount >= 3 && minLength,
    errors,
  };
};

/**
 * Generate suggested password for author
 * Format: FirstName + 3 random numbers
 */
export const generateAuthorPassword = (firstName: string): string => {
  const randomNumbers = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `${firstName}${randomNumbers}`;
};

/**
 * Admin/Sub-Admin password validation
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validateAdminPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true };
};
