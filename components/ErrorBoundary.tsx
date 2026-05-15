import React from 'react';

// Wrap children in a simple error-catching div
// Uses onError DOM event instead of React error boundary
const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    const handler = (event: ErrorEvent) => {
      event.preventDefault();
      setHasError(true);
      setErrorMessage(event.message || 'An unexpected error occurred');
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  if (hasError) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-8">
        <div className="erp-card p-12 flex flex-col items-center max-w-lg text-center">
          <h2 className="mb-2">Something went wrong</h2>
          <p className="text-text-secondary mb-8 text-[13px]">{errorMessage}</p>
          <button onClick={() => { setHasError(false); setErrorMessage(''); window.location.reload(); }} className="erp-btn erp-btn-primary px-8">
            Reload
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
