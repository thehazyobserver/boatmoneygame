import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="terminal-bg rounded-xl p-8 max-w-lg mx-auto border-2 border-red-400 neon-glow text-center">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
              SYSTEM ERROR
            </h2>
            <p className="text-white mb-6" style={{ fontFamily: 'Rajdhani, monospace' }}>
              Something went wrong with the meme running operation.<br/>
              The authorities might have found us.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="vice-button px-6 py-3 rounded-lg font-bold"
            >
              RESTART OPERATION
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-yellow-400 font-bold">
                  Debug Info (Dev Only)
                </summary>
                <pre className="mt-2 text-xs text-gray-400 overflow-auto bg-black bg-opacity-50 p-2 rounded">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
