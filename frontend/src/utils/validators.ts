export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

export const validateMobile = (mobile: string): string | null => {
  if (!mobile) return 'Mobile number is required';
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile)) return 'Invalid mobile number (10 digits starting with 6-9)';
  return null;
};

export const validateName = (name: string, fieldName: string = 'Name'): string | null => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.length > 50) return `${fieldName} cannot exceed 50 characters`;
  return null;
};

export const validateOTP = (otp: string): string | null => {
  if (!otp) return 'OTP is required';
  if (!/^\d{6}$/.test(otp)) return 'OTP must be 6 digits';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character';
  return null;
};

export const validatePinCode = (pinCode: string): string | null => {
  if (!pinCode) return 'Pin code is required';
  if (!/^\d{6}$/.test(pinCode)) return 'Pin code must be 6 digits';
  return null;
};

export const validateIFSC = (ifsc: string): string | null => {
  if (!ifsc) return 'IFSC code is required';
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(ifsc.toUpperCase())) return 'Invalid IFSC code format';
  return null;
};

export const validateAccountNumber = (accountNumber: string): string | null => {
  if (!accountNumber) return 'Account number is required';
  if (!/^\d{9,18}$/.test(accountNumber)) return 'Account number must be 9-18 digits';
  return null;
};

export const validateBookName = (name: string): string | null => {
  if (!name) return 'Book name is required';
  if (name.length < 2) return 'Book name must be at least 2 characters';
  if (name.length > 200) return 'Book name cannot exceed 200 characters';
  return null;
};

export const validateRoyaltyPercentage = (percentage: number): string | null => {
  if (percentage === undefined || percentage === null) return 'Royalty percentage is required';
  if (percentage < 0) return 'Royalty percentage cannot be negative';
  if (percentage > 100) return 'Royalty percentage cannot exceed 100';
  return null;
};

export const validateFileSize = (file: File, maxSizeInMB: number): string | null => {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size must not exceed ${maxSizeInMB}MB`;
  }
  return null;
};

export const validateFileType = (
  file: File,
  allowedTypes: string[]
): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }
  return null;
};

export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const typeError = validateFileType(file, allowedTypes);
  if (typeError) return typeError;

  const sizeError = validateFileSize(file, 5);
  if (sizeError) return sizeError;

  return null;
};

export const validateDocumentFile = (file: File): string | null => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  const typeError = validateFileType(file, allowedTypes);
  if (typeError) return typeError;

  const sizeError = validateFileSize(file, 50);
  if (sizeError) return sizeError;

  return null;
};

export const validateURL = (url: string): string | null => {
  if (!url) return null; // URL is optional
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL format';
  }
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  return null;
};

export const validateNumber = (
  value: number,
  fieldName: string,
  min?: number,
  max?: number
): string | null => {
  if (isNaN(value)) return `${fieldName} must be a number`;
  if (min !== undefined && value < min) return `${fieldName} must be at least ${min}`;
  if (max !== undefined && value > max) return `${fieldName} cannot exceed ${max}`;
  return null;
};

export const validateDate = (
  date: Date | string,
  fieldName: string,
  minDate?: Date,
  maxDate?: Date
): string | null => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return `${fieldName} must be a valid date`;

  if (minDate && dateObj < minDate) {
    return `${fieldName} must be after ${minDate.toLocaleDateString()}`;
  }

  if (maxDate && dateObj > maxDate) {
    return `${fieldName} must be before ${maxDate.toLocaleDateString()}`;
  }

  return null;
};
