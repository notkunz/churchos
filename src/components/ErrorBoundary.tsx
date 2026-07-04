'use client'
import { Component, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <h3 className="text-gray-800 font-semibold mb-1">Something went wrong</h3>
          <p className="text-gray-400 text-sm max-w-xs mb-4">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}