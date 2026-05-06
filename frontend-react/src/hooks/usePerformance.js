import { useCallback, useRef } from 'react'
import logger from '../utils/logger'

/**
 * Generic debounce hook that returns a stable debounced function.
 * Cancels any pending invocation when a new one arrives.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced function with .cancel() method
 */
export function useDebounce(fn, delay = 300) {
  const timerRef = useRef(null)
  const fnRef = useRef(fn)
  fnRef.current = fn

  const debounced = useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      fnRef.current(...args)
    }, delay)
  }, [delay])

  debounced.cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return debounced
}

/**
 * Custom hook that manages an AbortController for API calls.
 * Each new call automatically aborts the previous one.
 */
export function useAbortController() {
  const controllerRef = useRef(null)

  const getSignal = useCallback(() => {
    // Abort any in-flight request
    if (controllerRef.current) {
      controllerRef.current.abort()
      logger.debug('AbortController', 'Previous request aborted')
    }
    controllerRef.current = new AbortController()
    return controllerRef.current.signal
  }, [])

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort()
      controllerRef.current = null
    }
  }, [])

  return { getSignal, abort }
}
