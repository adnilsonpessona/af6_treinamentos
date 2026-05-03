// src/components/ErrorBoundary.tsx
// Error Boundary para proteção contra crashes

'use client'
import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="mx-4 my-8 flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-8">
            <AlertCircle className="mb-3 text-red-600" size={40} />
            <h2 className="mb-2 text-lg font-semibold text-red-900">
              Algo deu errado
            </h2>
            <p className="mb-6 max-w-md text-center text-sm text-red-700">
              Por favor, recarregue a página ou tente novamente. Se o problema
              persistir, entre em contato com o suporte.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 max-w-2xl text-left">
                <summary className="cursor-pointer font-mono text-xs text-red-600">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-red-100 p-3 font-mono text-xs">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="mt-6 rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
