// src/lib/hooks/useApi.ts
// Hook para fetch de dados com estado

'use client'
import { useState, useCallback, useEffect } from 'react'
import { ApiError } from '@/lib/api/client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetch = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        const result = await fetcher()
        if (isMounted) {
          setState({ data: result, loading: false, error: null })
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof ApiError ? err : new ApiError(500, 'UNKNOWN', 'Erro ao buscar dados')
          setState({ data: null, loading: false, error })
        }
      }
    }

    fetch()

    return () => {
      isMounted = false
    }
  }, deps)

  return state
}

interface UseApiMutationState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

export function useApiMutation<T>(
  fetcher: (data: any) => Promise<T>,
) {
  const [state, setState] = useState<UseApiMutationState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const mutate = useCallback(
    async (data: any) => {
      try {
        setState({ data: null, loading: true, error: null })
        const result = await fetcher(data)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (err) {
        const error = err instanceof ApiError ? err : new ApiError(500, 'UNKNOWN', 'Erro')
        setState({ data: null, loading: false, error })
        throw error
      }
    },
    [fetcher],
  )

  return { ...state, mutate }
}
