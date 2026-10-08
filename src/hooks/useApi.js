import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'

/**
 * GETs `path` and returns { data, error, loading, reload }.
 * Pass `null` as the path to skip fetching.
 */
export function useApi(path, options) {
  const [result, setResult] = useState({ path: null, tick: -1, data: null, error: null })
  const [tick, setTick] = useState(0)
  const auth = options?.auth ?? true

  useEffect(() => {
    if (path === null) return undefined
    let cancelled = false
    api
      .get(path, { auth })
      .then((data) => !cancelled && setResult({ path, tick, data, error: null }))
      .catch((error) => !cancelled && setResult({ path, tick, data: null, error }))
    return () => {
      cancelled = true
    }
  }, [path, tick, auth])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const loading = path !== null && (result.path !== path || result.tick !== tick)
  return { data: result.data, error: result.error, loading, reload }
}
