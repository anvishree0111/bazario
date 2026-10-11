// Shared, dependency-free validation helpers used by the registration
// endpoints. Kept intentionally simple — no external validation library
// is introduced, consistent with the rest of the existing backend.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim())
}

// Minimum bar for a password: at least 8 characters. This intentionally
// stays simple/readable rather than imposing an opinionated complexity
// policy that isn't part of the existing product.
export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8
}

export function normalizeEmail(email) {
  return String(email).trim().toLowerCase()
}
