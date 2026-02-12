import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8 max-w-2xl w-full text-center">
             <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
             <p className="text-slate-300 mb-6">We encountered an unexpected error while rendering this page.</p>
             <div className="bg-slate-950 p-4 rounded text-left overflow-auto max-h-48 mb-6 border border-slate-800">
                <code className="text-red-300 font-mono text-sm">{this.state.error?.message}</code>
             </div>
             <button 
               onClick={() => window.location.reload()}
               className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
             >
               Reload Page
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
