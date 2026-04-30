/**
 * Sanitize user input to prevent prompt injection
 * - Strips control characters
 * - Removes excessive whitespace
 * - Truncates to max length
 * - Strips potential markdown/code injection patterns
 */

export function sanitizeInput(input: string, maxLength: number = 5000): string {
  if (!input || typeof input !== 'string') return ''
  
  let sanitized = input
  
  // Remove null bytes and other control characters (allow newlines/tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Normalize multiple whitespace to single space (but preserve newlines for paragraphs)
  sanitized = sanitized.replace(/[ \t]+/g, ' ')
  
  // Remove potential prompt injection patterns (case-insensitive)
  const injectionPatterns = [
    /system\s*:/gi,
    /role\s*:/gi,
    /instruction\s*:/gi,
    /you\s+are/gi,
    /ignore\s+(previous|above|all)/gi,
    /disregard/gi,
    /\[\s*(system|prompt|instruct)/gi,
  ]
  
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '')
  }
  
  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  // Trim external whitespace
  return sanitized.trim()
}

/**
 * Validate that input is safe for AI processing
 */
export function validateAIInput(input: string): { valid: boolean; reason?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, reason: 'Input must be a non-empty string' }
  }
  
  if (input.length < 2) {
    return { valid: false, reason: 'Input too short (minimum 2 characters)' }
  }
  
  if (input.length > 5000) {
    return { valid: false, reason: 'Input too long (maximum 5000 characters)' }
  }
  
  return { valid: true }
}