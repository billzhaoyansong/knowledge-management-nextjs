'use client'

import React, { Suspense, ErrorInfo } from 'react';
import ErrorBoundary from './error-boundary';
import { Spinner } from '@/components/ui';

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | undefined;
  errorFallback?: React.ReactNode | undefined;
  onError?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined;
}

const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  fallback,
  errorFallback,
  onError,
}) => {
  const errorBoundaryProps = {
    fallback: errorFallback,
    ...(onError && { onError }),
  };

  return (
    <ErrorBoundary {...errorBoundaryProps}>
      <Suspense fallback={fallback || <Spinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export { AsyncErrorBoundary };