/**
 * Centralized input validation for search and forms.
 *
 * Each validator returns { valid: boolean, error?: string }.
 */

/**
 * Validate search input (origin + destination pair).
 */
export function validateSearchInput(origin, destination) {
  const trimmedOrigin = (origin || '').trim()
  const trimmedDest = (destination || '').trim()

  if (!trimmedOrigin) {
    return { valid: false, error: 'Please enter a departure stop', field: 'origin' }
  }
  if (!trimmedDest) {
    return { valid: false, error: 'Please enter a destination stop', field: 'destination' }
  }
  if (trimmedOrigin.length < 2) {
    return { valid: false, error: 'Departure stop must be at least 2 characters', field: 'origin' }
  }
  if (trimmedDest.length < 2) {
    return { valid: false, error: 'Destination stop must be at least 2 characters', field: 'destination' }
  }
  if (trimmedOrigin.toLowerCase() === trimmedDest.toLowerCase()) {
    return { valid: false, error: 'Origin and destination cannot be the same', field: 'destination' }
  }

  return { valid: true, origin: trimmedOrigin, destination: trimmedDest }
}

/**
 * Validate travel date — must not be in the past.
 */
export function validateTravelDate(dateStr) {
  if (!dateStr) {
    return { valid: false, error: 'Please select a travel date' }
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selected = new Date(dateStr + 'T00:00:00')
  if (selected < today) {
    return { valid: false, error: 'Travel date cannot be in the past' }
  }
  return { valid: true }
}

/**
 * Classify error type for user-friendly messaging.
 */
export function classifyError(error) {
  if (!error) return { type: 'unknown', message: 'An unexpected error occurred' }

  const msg = error.message || String(error)

  // Network / connectivity
  if (msg.includes('Network Error') || msg.includes('ERR_NETWORK') || msg.includes('Failed to fetch')) {
    return {
      type: 'network',
      message: 'Unable to connect. Please check your internet connection and try again.',
      retryable: true,
    }
  }

  // Timeout
  if (msg.includes('timeout') || msg.includes('ECONNABORTED') || error.code === 'ECONNABORTED') {
    return {
      type: 'timeout',
      message: 'The request took too long. The server may be starting up — please try again.',
      retryable: true,
    }
  }

  // No response from server (likely cold start or CORS)
  if (msg.includes('No response from server')) {
    return {
      type: 'server_unavailable',
      message: 'Server is not responding. It may be waking up — please retry in a few seconds.',
      retryable: true,
    }
  }

  // HTTP 4xx
  if (msg.includes('HTTP 4') || msg.includes('400') || msg.includes('404')) {
    return {
      type: 'client_error',
      message: msg,
      retryable: false,
    }
  }

  // HTTP 5xx
  if (msg.includes('HTTP 5') || msg.includes('500') || msg.includes('502') || msg.includes('503')) {
    return {
      type: 'server_error',
      message: 'Server error. Our team has been notified. Please try again later.',
      retryable: true,
    }
  }

  return { type: 'unknown', message: msg, retryable: true }
}
