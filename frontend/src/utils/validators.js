export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const TIME_REGEX  = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const validateEmail  = (v) => EMAIL_REGEX.test(v);
export const validatePhone  = (v) => PHONE_REGEX.test(v);
export const validateTime   = (v) => TIME_REGEX.test(v);
export const validateMinLen = (v, n) => v && v.trim().length >= n;
export const validateMinNum = (v, n) => !isNaN(Number(v)) && Number(v) >= n;

/**
 * Get error message for a field value
 */
export const getFieldError = (field, value, extra = {}) => {
  switch (field) {
    case 'first_name':
    case 'last_name':
      return !validateMinLen(value, 2) ? 'Must be at least 2 characters' : null;
    case 'staff_id':
    case 'department':
      return !validateMinLen(value, 2) ? 'This field is required' : null;
    case 'college_email':
    case 'personal_email':
      return !validateEmail(value) ? 'Enter a valid email address' : null;
    case 'phone':
      return !validatePhone(value) ? 'Enter a valid 10-digit mobile number' : null;
    case 'password':
      return !value || value.length < 8 ? 'Password must be at least 8 characters' : null;
    case 'confirm_password':
      return value !== extra.password ? 'Passwords do not match' : null;
    case 'purpose':
      return !validateMinLen(value, 5) ? 'Purpose must be at least 5 characters' : null;
    case 'participants':
      return !validateMinNum(value, 1) ? 'Must be at least 1' : null;
    default:
      return null;
  }
};
