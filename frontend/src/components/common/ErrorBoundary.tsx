/**
 * ErrorBoundary — catches render errors and shows a friendly fallback
 * instead of a blank white screen.
 */
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400" />
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          {error?.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // In production, send to Sentry
        console.error('[ErrorBoundary]', error, info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default AppErrorBoundary;
