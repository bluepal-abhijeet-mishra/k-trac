import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Shield } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
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
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-gray-200">
            <div className="bg-red-100 text-red-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6 text-sm">
              An unexpected error occurred in the application. Please try refreshing the page or contact support if the issue persists.
            </p>
            {this.state.error && (
              <div className="bg-gray-50 p-4 rounded text-left mb-6 overflow-auto max-h-32 border border-gray-200">
                <p className="text-xs font-mono text-red-600 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800 transition-colors w-full"
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
