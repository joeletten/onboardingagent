// ── Shared validation helpers ─────────────────────────────────────────────────

export function validateFullName(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return 'Full name is required'
  if (trimmed.length < 2) return 'Name is too short'
  if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(trimmed)) return 'Name contains invalid characters'
  if (trimmed.split(/\s+/).length < 2) return 'Please enter your first and last name'
  return null
}

export function validateEmail(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address'
  return null
}

export function validatePhone(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return null // phone is optional
  const digits = trimmed.replace(/[\s\-().+]/g, '')
  if (digits.length < 7) return 'Phone number is too short'
  if (digits.length > 15) return 'Phone number is too long'
  if (!/^[0-9\s\-().+]+$/.test(trimmed)) return 'Phone number contains invalid characters'
  return null
}

export function validateWebsite(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return null // website is optional
  if (!/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return 'Please enter a valid website URL'
  return null
}

export function validateVatRate(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return null // optional
  const num = parseFloat(trimmed)
  if (isNaN(num)) return 'Must be a number'
  if (num < 0 || num > 100) return 'VAT rate must be between 0% and 100%'
  return null
}

export function validateRequired(value, fieldName) {
  const trimmed = (value || '').trim()
  if (!trimmed) return `${fieldName} is required`
  return null
}

export function validateMinLength(value, min, fieldName) {
  const trimmed = (value || '').trim()
  if (trimmed && trimmed.length < min) return `${fieldName} must be at least ${min} characters`
  return null
}

export function validateNumberRange(value, min, max, fieldName) {
  if (value === '' || value === undefined || value === null) return null
  const num = parseFloat(value)
  if (isNaN(num)) return `${fieldName} must be a number`
  if (min !== null && num < min) return `${fieldName} must be at least ${min}`
  if (max !== null && num > max) return `${fieldName} must be at most ${max}`
  return null
}

export function validateContactName(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return 'Contact name is required'
  if (trimmed.length < 2) return 'Name is too short'
  if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(trimmed)) return 'Name contains invalid characters'
  return null
}
