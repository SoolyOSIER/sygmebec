import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    this.setState({ error, info })
    // Optionally log to an external service
    // console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-bold mb-2 text-red-600">Une erreur est survenue</h2>
          <p className="text-sm text-secondary-600 mb-4">La page n'a pas pu s'afficher correctement. Détails ci-dessous :</p>
          <pre className="text-xs whitespace-pre-wrap bg-gray-100 p-3 rounded max-h-60 overflow-auto">{String(this.state.error && this.state.error.toString())}{this.state.info?.componentStack}</pre>
        </div>
      </div>
    )
  }
}
