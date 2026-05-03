// src/lib/api/client.ts
// Cliente HTTP centralizado para todas as requisições

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? 'http://api:5000'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  token?: string
  timeout?: number
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, timeout = 30000, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = typeof window === 'undefined' ? INTERNAL_API_URL : PUBLIC_API_URL

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${url}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
        code: `HTTP_${response.status}`,
      }))

      throw new ApiError(
        response.status,
        error.code ?? `ERROR_${response.status}`,
        error.message ?? response.statusText,
      )
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'TIMEOUT', 'Requisição expirou')
    }

    throw new ApiError(500, 'UNKNOWN', 'Erro desconhecido')
  }
}

export const apiClient = {
  get: <T,>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T,>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T,>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T,>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T,>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
