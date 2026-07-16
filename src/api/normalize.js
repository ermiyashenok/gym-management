// src/api/normalize.js
// Converts camelCase API responses to the snake_case shape the UI expects.
// This lets all existing pages work without modification.

function toSnake(str) {
  return str.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
}

function normalizeKeys(obj) {
  if (Array.isArray(obj))    return obj.map(normalizeKeys)
  if (obj === null || typeof obj !== 'object') return obj
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [toSnake(k), normalizeKeys(v)])
  )
}

export { normalizeKeys }
