/**
 * Structured frontend logger for production diagnostics.
 * All logs include ISO timestamps, severity, and structured context.
 *
 * Usage:
 *   import logger from '../utils/logger'
 *   logger.error('API', 'Search failed', { source, destination, status: 500 })
 *   logger.warn('Cache', 'Stale entry evicted', { key })
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }

// In production, suppress debug logs
const MIN_LEVEL = import.meta.env.PROD ? LOG_LEVELS.info : LOG_LEVELS.debug

function formatEntry(level, category, message, context) {
  return {
    ts: new Date().toISOString(),
    level,
    category,
    message,
    ...(context && Object.keys(context).length > 0 ? { ctx: context } : {}),
  }
}

function emit(level, category, message, context) {
  if (LOG_LEVELS[level] < MIN_LEVEL) return

  const entry = formatEntry(level, category, message, context)
  const prefix = `[${entry.ts}] [${level.toUpperCase()}] [${category}]`

  switch (level) {
    case 'error':
      console.error(prefix, message, context || '')
      break
    case 'warn':
      console.warn(prefix, message, context || '')
      break
    case 'info':
      console.info(prefix, message, context || '')
      break
    default:
      console.debug(prefix, message, context || '')
  }

  return entry
}

const logger = {
  debug: (category, message, context) => emit('debug', category, message, context),
  info:  (category, message, context) => emit('info', category, message, context),
  warn:  (category, message, context) => emit('warn', category, message, context),
  error: (category, message, context) => emit('error', category, message, context),
}

export default logger
