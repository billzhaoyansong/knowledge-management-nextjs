import React from 'react';
import { Card, CardContent, Button, Icon } from '@/components/ui';

export interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again.',
  showDetails = process.env.NODE_ENV === 'development',
}) => {
  return (
    <Card className="border-error-500">
      <CardContent className="text-center py-8">
        <div className="mb-4">
          <Icon name="close" size="xl" className="mx-auto text-error-500" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        
        {showDetails && error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">
              Error details (development only)
            </summary>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
              {error.stack}
            </pre>
          </details>
        )}
        
        {onRetry && (
          <Button onClick={onRetry}>
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export { ErrorFallback };